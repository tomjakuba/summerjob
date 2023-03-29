import { Allergy, Area, Car, Worker } from "../../prisma/client";
import {
  DataSource,
  JobToBePlanned,
  ProposedJobComplete,
  ProposedJobNoActive,
  WorkerComplete,
} from "../datasources/DataSource";
import { Planner } from "./Planner";

export class BasicPlanner implements Planner {
  datasource: DataSource;

  constructor(datasource: DataSource) {
    this.datasource = datasource;
  }

  async start(planId: string) {
    console.log("BasicPlanner: Starting plan %s", planId);
    const plan = await this.datasource.getPlan(planId);
    if (!plan) {
      console.log("BasicPlanner: Plan not found");
      return { success: false, jobs: [] };
    }
    const workersWithoutJob = await this.datasource.getWorkersWithoutJob(plan);
    const proposedJobsAll = await this.datasource.getProposedJobs(
      plan.summerJobEventId,
      plan.day
    );
    const plannedProposedJobIds = plan.jobs.map((job) => job.proposedJobId);
    const proposedJobs = proposedJobsAll.filter(
      (j) => !plannedProposedJobIds.includes(j.id)
    );
    const categorizedWorkers = this.categorizeWorkers(workersWithoutJob);
    // let planned = this.planJobRecursive(
    //   plan.jobs.map((job) => ({
    //     ...job,
    //     job: job.proposedJob,
    //     responsibleWorker: job.responsibleWorker || job.workers[0],
    //     privateDescription: job.privateDescription || "",
    //     publicDescription: job.publicDescription || "",
    //   })),
    //   categorizedWorkers,
    //   new Array(...proposedJobs)
    // );
    const jobsInPlan: PlannedJob[] = plan.jobs.map((job) => ({
      job: job.proposedJob,
      responsibleWorker: job.responsibleWorker || undefined,
      privateDescription: job.privateDescription || "",
      publicDescription: job.publicDescription || "",
      workers: job.workers,
      rides: job.rides.map((ride) => ({
        driver: ride.driver,
        car: ride.car,
        passengers: ride.passengers,
      })),
    }));

    const result = this.planJobsRecursive(
      jobsInPlan.map((job) => ({ attemptsLeft: 2, plannedJob: job })),
      categorizedWorkers
    );

    const filledPlan = this.planFillJobs(
      result.plannedJobs,
      this.decategorizeWorkers(result.remainingWorkers)
    );
    result.plannedJobs.forEach((element) => {
      this.logPlannedJob(element);
    });
    console.log("Zbylo pracantů: %d", filledPlan.remainingWorkers.length);
    // console.log(
    //   "Zbylo jobů: %d",
    //   proposedJobsAll.length - filledPlan.plannedJobs.length
    // );

    return {
      success: true,
      jobs: filledPlan.plannedJobs.map(this.plannedJobToDatabaseJob),
    };
    // return {
    //   success: true,
    //   jobs: [],
    // };
  }

  /**
   * After planning, put remaining workers into planned jobs if they have seats in rides
   * @param plannedJobs Planned jobs
   * @param workersWithoutJob Workers without job
   */
  planFillJobs(
    plannedJobs: PlannedJob[],
    workersWithoutJob: WorkerComplete[]
  ): FillPlanningResult {
    for (const plannedJob of plannedJobs) {
      if (workersWithoutJob.length === 0) {
        break;
      }
      let workersNeeded = plannedJob.job.maxWorkers - plannedJob.workers.length;
      if (plannedJob.rides.length === 0) {
        continue;
      }
      if (workersNeeded <= 0) {
        continue;
      }
      // Fill workers into existing rides
      for (const ride of plannedJob.rides) {
        const seats = ride.car.seats - ride.passengers.length - 1;
        if (seats <= 0) {
          continue;
        }
        if (workersNeeded <= 0) {
          break;
        }
        const availableWorker = workersWithoutJob.find(
          (w) => !this.isAllergicTo(w, plannedJob.job.allergens)
        );
        // If every worker is allergic to this job, we can't fill it
        if (!availableWorker) {
          break;
        }
        workersWithoutJob = workersWithoutJob.filter(
          (w) => w.id !== availableWorker.id
        );
        ride.passengers.push(availableWorker);
        plannedJob.workers.push(availableWorker);
        workersNeeded--;
      }
    }

    return { plannedJobs, remainingWorkers: workersWithoutJob };
  }

  planJobsRecursive(
    jobsToPlan: JobPlanningAttempt[],
    workersWithoutJob: CategorizedWorkers
  ): RecPlanningResult {
    if (jobsToPlan.length === 0) {
      return {
        plannedJobs: jobsToPlan.map((a) => a.plannedJob),
        remainingWorkers: workersWithoutJob,
      };
    }
    if (this.numWorkers(workersWithoutJob) === 0) {
      console.log("BasicPlanner: No more workers without job");
      return {
        plannedJobs: jobsToPlan.map((a) => a.plannedJob),
        remainingWorkers: workersWithoutJob,
      };
    }

    const { attemptsLeft, plannedJob } = jobsToPlan.shift()!;

    if (attemptsLeft === 0) {
      console.log("BasicPlanner: No more attempts left");
      return {
        plannedJobs: [plannedJob, ...jobsToPlan.map((a) => a.plannedJob)],
        remainingWorkers: workersWithoutJob,
      };
    }

    // Remember the original state of workers in case we need to throw a worker away and replace them with a driver
    const workersAddedByPlanner = [];

    // Fill in strong workers without job
    const assignedStrongWorkers = plannedJob.workers.filter((w) => w.isStrong);
    if (assignedStrongWorkers.length < plannedJob.job.strongWorkers) {
      const required = plannedJob.job.minWorkers - plannedJob.workers.length;
      for (let i = 0; i < required; i++) {
        const findResult = this.findStrongWorker(
          workersWithoutJob,
          plannedJob.job.allergens
        );
        if (!findResult.worker) {
          break;
        }
        plannedJob.workers.push(findResult.worker);
        workersAddedByPlanner.push(findResult.worker);
        workersWithoutJob = findResult.remainingWorkers;
      }
    }

    // Fill in other workers until the minimum is reached
    if (plannedJob.workers.length < plannedJob.job.minWorkers) {
      const required = plannedJob.job.minWorkers - plannedJob.workers.length;
      for (let i = 0; i < required; i++) {
        const findResult = this.findWorker(
          workersWithoutJob,
          plannedJob.job.allergens
        );
        if (!findResult.worker) {
          break;
        }
        plannedJob.workers.push(findResult.worker);
        workersAddedByPlanner.push(findResult.worker);
        workersWithoutJob = findResult.remainingWorkers;
      }
    }

    if (plannedJob.job.area.requiresCar) {
      // Check that everyone has transport
      let workersWithoutTransport = plannedJob.workers;
      for (const ride of plannedJob.rides) {
        workersWithoutTransport = workersWithoutTransport.filter(
          (w) =>
            !(
              w.id === ride.driver.id ||
              ride.passengers.map((p) => p.id).includes(w.id)
            )
        );
      }
      if (workersWithoutTransport.length > 0) {
        // Not all workers have ride on this job, find if they already have ride from other jobs
        workersWithoutTransport = this.getWorkersNotInRides(
          workersWithoutTransport,
          jobsToPlan.map((j) => j.plannedJob.rides).flat()
        );
        if (workersWithoutTransport.length > 0) {
          // Plan rides for workers without transport
          // If there is already a driver without transport, create a ride with them
          const drivers = workersWithoutTransport.filter(
            (w) => w.cars.length > 0
          );
          workersWithoutTransport = workersWithoutTransport.filter(
            (w) => !drivers.map((d) => d.id).includes(w.id)
          );
          for (const driver of drivers) {
            const car = driver.cars[0];
            plannedJob.rides.push({
              driver,
              car,
              passengers: workersWithoutTransport.slice(0, car.seats - 1),
            });
            workersWithoutTransport = workersWithoutTransport.slice(
              car.seats - 1
            );
          }

          if (workersWithoutTransport.length > 0) {
            // TODO: Plan rides for workers without transport
            // This can be done either by assigning them to a shared ride with another job (preferred)
            // or by finding a new driver for this job
            const sharedRidesInfo = this.findSharedRides(
              plannedJob.job.area,
              workersWithoutTransport.length,
              jobsToPlan.map((j) => j.plannedJob)
            );
            if (sharedRidesInfo.success) {
              // We can divide the workers into shared rides
              for (const sharedRideInfo of sharedRidesInfo.availableRides) {
                const sharedRide = sharedRideInfo.ride;
                const seats =
                  sharedRide.car.seats - sharedRide.passengers.length - 1;
                const passengers = workersWithoutTransport.slice(0, seats);
                workersWithoutTransport = workersWithoutTransport.slice(seats);
                const originalRide = jobsToPlan
                  .map((j) => j.plannedJob)
                  .find((j) => j.job.id === sharedRideInfo.proposedJobId)!
                  .rides.find((r) => r.driver.id === sharedRide.driver.id)!;
                originalRide.passengers = [
                  ...originalRide.passengers,
                  ...passengers,
                ];
              }
              // Everything is planned, proceed to next job
              return this.planJobsRecursive(
                [
                  ...jobsToPlan,
                  { attemptsLeft: attemptsLeft - 1, plannedJob: plannedJob },
                ],
                workersWithoutJob
              );
            }
            // We can't find shared rides, find a new driver
            const findResult = this.findDriver(
              workersWithoutJob,
              plannedJob.job.allergens
            );
            if (!findResult.worker) {
              // No driver found, just shuffle the current state of the job and try again later
              return this.planJobsRecursive(
                [
                  ...jobsToPlan,
                  { attemptsLeft: attemptsLeft - 1, plannedJob: plannedJob },
                ],
                workersWithoutJob
              );
            }

            const driver = findResult.worker;
            workersWithoutJob = findResult.remainingWorkers;
            const car = driver.cars[0];
            plannedJob.rides.push({
              driver,
              car,
              passengers: workersWithoutTransport.slice(0, car.seats - 1),
            });
            workersWithoutTransport = workersWithoutTransport.slice(
              car.seats - 1
            );
            plannedJob.workers.push(driver);
          }
        } else {
          // All workers have rides, proceed to next job
          return this.planJobsRecursive(
            [
              ...jobsToPlan,
              { attemptsLeft: attemptsLeft - 1, plannedJob: plannedJob },
            ],
            workersWithoutJob
          );
        }
      }
    }

    return this.planJobsRecursive(
      [
        ...jobsToPlan,
        { attemptsLeft: attemptsLeft - 1, plannedJob: plannedJob },
      ],
      workersWithoutJob
    );
  }

  getWorkersNotInRides(
    workers: WorkerComplete[],
    rides: RideWithPassengers[]
  ): WorkerComplete[] {
    const workersInRides = rides
      .map((ride) => [ride.driver, ...ride.passengers])
      .flat();
    return workers.filter((w) => !workersInRides.includes(w));
  }

  // planJobRecursive(
  //   plannedJobs: PlannedJob[],
  //   workersWithoutJob: CategorizedWorkers,
  //   proposedJobs: ProposedJobComplete[]
  // ): RecPlanningResult {
  //   if (proposedJobs.length === 0) {
  //     console.log("BasicPlanner: No more proposed jobs");
  //     return { plannedJobs, remainingWorkers: workersWithoutJob };
  //   }
  //   if (this.numWorkers(workersWithoutJob) === 0) {
  //     console.log("BasicPlanner: No more workers without job");
  //     return { plannedJobs, remainingWorkers: workersWithoutJob };
  //   }

  //   const beforeWorkersWithoutJob: CategorizedWorkers = {
  //     drivers: [...workersWithoutJob.drivers],
  //     strong: [...workersWithoutJob.strong],
  //     others: [...workersWithoutJob.others],
  //   };

  //   const proposedJob = proposedJobs[0];
  //   if (proposedJob.minWorkers > this.numWorkers(workersWithoutJob)) {
  //     console.log("BasicPlanner: Not enough workers for job");
  //     return this.planJobRecursive(
  //       plannedJobs,
  //       beforeWorkersWithoutJob,
  //       proposedJobs.slice(1)
  //     );
  //   }

  //   const needsDriver = proposedJob.area.requiresCar;
  //   const drivers: WorkerComplete[] = [];
  //   const sharedRides: JobRide[] = [];
  //   const workers: WorkerComplete[] = [];
  //   // Find a driver if needed
  //   if (needsDriver) {
  //     // Find if we can put all workers in a shared ride with another job
  //     const sharedRide = this.findSharedRides(
  //       proposedJob.area,
  //       proposedJob.minWorkers,
  //       plannedJobs
  //     );
  //     if (sharedRide.success) {
  //       sharedRides.push(...sharedRide.availableRides);
  //     } else {
  //       const { worker, remainingWorkers } = this.findDriver(
  //         workersWithoutJob,
  //         proposedJob.allergens
  //       );
  //       if (!worker) {
  //         // Workers can't be put in a shared ride and no driver is free, so we can't plan this job
  //         console.log("BasicPlanner: No driver found for this job");
  //         return this.planJobRecursive(
  //           plannedJobs,
  //           beforeWorkersWithoutJob,
  //           proposedJobs.slice(1)
  //         );
  //       }

  //       if (worker.cars[0].seats < proposedJob.minWorkers) {
  //         // Driver has not enough seats, so we attempt to find a shared ride for the rest
  //         const sharedRideForOthers = this.findSharedRides(
  //           proposedJob.area,
  //           proposedJob.minWorkers - worker.cars[0].seats - 1,
  //           plannedJobs
  //         );
  //         if (sharedRideForOthers.success) {
  //           sharedRides.push(...sharedRideForOthers.availableRides);
  //         } else {
  //           // No shared ride found, so we can't plan this job
  //           console.log("BasicPlanner: Not enough rides for job");
  //           // However, since we still have a driver, we can try to plan the rest of the jobs
  //           return this.planJobRecursive(
  //             plannedJobs,
  //             beforeWorkersWithoutJob,
  //             proposedJobs.slice(1)
  //           );
  //         }
  //       }
  //       drivers.push(worker);
  //       workersWithoutJob = remainingWorkers;
  //     }
  //   }
  //   // Find strong workers
  //   for (let i = 0; i < proposedJob.strongWorkers; i++) {
  //     const { worker, remainingWorkers } = this.findStrongWorker(
  //       workersWithoutJob,
  //       proposedJob.allergens
  //     );
  //     if (!worker) {
  //       console.log("BasicPlanner: No strong worker found");
  //       return this.planJobRecursive(
  //         plannedJobs,
  //         beforeWorkersWithoutJob,
  //         proposedJobs.slice(1)
  //       );
  //     }
  //     workers.push(worker);
  //     workersWithoutJob = remainingWorkers;
  //   }

  //   // Fill with other workers
  //   const remainingWorkers = proposedJob.minWorkers - workers.length;
  //   for (let i = 0; i < remainingWorkers; i++) {
  //     const worker = this.findWorker(workersWithoutJob, proposedJob.allergens);
  //     if (!worker.worker) {
  //       console.log("BasicPlanner: No worker found");
  //       return this.planJobRecursive(
  //         plannedJobs,
  //         beforeWorkersWithoutJob,
  //         proposedJobs.slice(1)
  //       );
  //     }
  //     workers.push(worker.worker);
  //     workersWithoutJob = worker.remainingWorkers;
  //   }
  //   const plannedJobResult = this.createJob(
  //     proposedJob,
  //     workers,
  //     drivers,
  //     sharedRides,
  //     plannedJobs
  //   );
  //   plannedJobs = plannedJobResult;

  //   return this.planJobRecursive(
  //     plannedJobs,
  //     workersWithoutJob,
  //     proposedJobs.slice(1)
  //   );
  // }

  findSharedRides(
    area: Area,
    passengers_count: number,
    plannedJobs: PlannedJob[]
  ): FindSharedRidesResult {
    const freeSeats = (ride: RideWithPassengers) => {
      return ride.car.seats - ride.passengers.length - 1;
    };

    const jobsInArea = plannedJobs.filter((job) => job.job.areaId === area.id);
    const ridesByJob = jobsInArea
      .flatMap((job) =>
        job.rides.map<JobRide>((r) => ({ proposedJobId: job.job.id, ride: r }))
      )
      .filter((r) => freeSeats(r.ride) > 0);
    if (ridesByJob.length === 0) {
      return { success: false, availableRides: [] };
    }

    // Sort by free seats descending
    ridesByJob.sort((a, b) => freeSeats(b.ride) - freeSeats(a.ride));
    if (freeSeats(ridesByJob[0].ride) >= passengers_count) {
      // We can fit passengers in one ride, find the ride where free seats == passengers_count or a bit higher
      // If all rides have free seats < passengers_count, we will use the ride with the least free seats (last one)
      for (let i = 1; i < ridesByJob.length; i++) {
        const r = ridesByJob[i];
        if (freeSeats(r.ride) < passengers_count) {
          return { success: true, availableRides: [ridesByJob[i - 1]] };
        }
      }
      return { success: true, availableRides: [ridesByJob.slice(-1)[0]] };
    }

    // We can't fit passengers in one ride, find two rides where free seats 1 + free seats 2 >= passengers_count
    // Start from the lowest free seats (end of array) and go up to ensure we use the rides with the least free seats
    // This could be further optimized to find any two rides that fit the passengers_count
    for (let i = ridesByJob.length - 2; i > 0; i--) {
      const r1 = ridesByJob[i + 1];
      const r2 = ridesByJob[i];
      if (freeSeats(r1.ride) + freeSeats(r2.ride) >= passengers_count) {
        return { success: true, availableRides: [r1, r2] };
      }
    }

    return { success: false, availableRides: [] };
  }

  logPlannedJob(job: PlannedJob) {
    console.log("------" + job.job.name + " [", job.job.area.name, "] ------");
    console.log(
      "Workers:",
      job.workers.map((w) => w.firstName + " " + w.lastName).join(", ")
    );
    if (!job.job.area.requiresCar) {
      console.log("No car needed");
    }
    console.log("Rides:");
    for (const ride of job.rides) {
      console.log(
        "  " + ride.driver.firstName + " " + ride.driver.lastName,
        "-",
        ride.passengers.map((p) => p.firstName + " " + p.lastName).join(", "),
        "- Free seats:",
        ride.car.seats - ride.passengers.length - 1
      );
    }
  }

  findDriver(
    workers: CategorizedWorkers,
    jobAllergens: Allergy[]
  ): FindWorkerResult {
    const driver = workers.drivers.find(
      (w) => !this.isAllergicTo(w, jobAllergens)
    );
    if (!driver) {
      return { worker: null, remainingWorkers: workers };
    }
    return {
      worker: driver,
      remainingWorkers: {
        others: workers.others,
        strong: workers.strong,
        drivers: workers.drivers.filter((w) => w.id !== driver.id),
      },
    };
  }

  findStrongWorker(
    workers: CategorizedWorkers,
    jobAllergens: Allergy[]
  ): FindWorkerResult {
    const worker = workers.strong.find(
      (worker) => !this.isAllergicTo(worker, jobAllergens)
    );
    if (!worker) {
      return { worker: null, remainingWorkers: workers };
    }
    return {
      worker: worker,
      remainingWorkers: {
        others: workers.others,
        strong: workers.strong.filter((w) => w.id !== worker.id),
        drivers: workers.drivers,
      },
    };
  }

  findWorker(
    workers: CategorizedWorkers,
    jobAllergens: Allergy[]
  ): FindWorkerResult {
    let worker = workers.others.find(
      (w) => !this.isAllergicTo(w, jobAllergens)
    );
    if (worker) {
      return {
        worker: worker,
        remainingWorkers: {
          others: workers.others.filter((w) => w.id !== worker!.id),
          strong: workers.strong,
          drivers: workers.drivers,
        },
      };
    }

    worker = workers.strong.find((w) => !this.isAllergicTo(w, jobAllergens));
    if (worker) {
      return {
        worker: worker,
        remainingWorkers: {
          others: workers.others,
          strong: workers.strong.filter((w) => w.id !== worker!.id),
          drivers: workers.drivers,
        },
      };
    }
    worker = workers.drivers.find((w) => !this.isAllergicTo(w, jobAllergens));
    if (worker) {
      return {
        worker: worker,
        remainingWorkers: {
          others: workers.others,
          strong: workers.strong,
          drivers: workers.drivers.filter((w) => w.id !== worker!.id),
        },
      };
    }
    return { worker: null, remainingWorkers: workers };
  }

  isAllergicTo(worker: WorkerComplete, allergens: Allergy[]): boolean {
    return (
      worker.allergies
        .map((a) => a.id)
        .filter((id) => allergens.map((a) => a.id).includes(id)).length > 0
    );
  }

  categorizeWorkers(workers: WorkerComplete[]): CategorizedWorkers {
    return workers.reduce(
      (acc: CategorizedWorkers, worker: WorkerComplete) => {
        if (worker.cars.length > 0) {
          return {
            drivers: [...acc.drivers, worker],
            strong: acc.strong,
            others: acc.others,
          };
        }
        if (worker.isStrong && worker.cars.length === 0) {
          return {
            drivers: acc.drivers,
            strong: [...acc.strong, worker],
            others: acc.others,
          };
        }
        return {
          drivers: acc.drivers,
          strong: acc.strong,
          others: [...acc.others, worker],
        };
      },
      { drivers: [], strong: [], others: [] }
    );
  }

  decategorizeWorkers(workers: CategorizedWorkers): WorkerComplete[] {
    return [...workers.drivers, ...workers.strong, ...workers.others];
  }

  numWorkers(workers: CategorizedWorkers): number {
    return (
      workers.drivers.length + workers.strong.length + workers.others.length
    );
  }

  /**
   * Creates a new planned job, and updates rides in other jobs if necessary
   * @param workers Workers for the job, excluding drivers
   * @param drivers Drivers for the job
   * @param job Proposed job
   * @returns List of planned jobs with updated rides if necessary
   */
  createJob(
    job: ProposedJobNoActive,
    workers: WorkerComplete[],
    drivers: WorkerComplete[],
    sharedRides: JobRide[],
    plannedJobs: PlannedJob[]
  ): PlannedJob[] {
    // Create rides for the job and put as many passengers as possible in the cars
    const rides: RideWithPassengers[] = [];
    let workersWithoutRide = workers.slice(0);
    for (const driver of drivers) {
      const seats = driver.cars[0].seats - 1;
      const passengers = workersWithoutRide.slice(0, seats);
      workersWithoutRide = workersWithoutRide.slice(seats);
      const ride: RideWithPassengers = {
        driver: driver,
        car: driver.cars[0],
        passengers: passengers,
      };
      rides.push(ride);
    }

    // Put the remaining workers in shared rides
    for (const sharedRideInfo of sharedRides) {
      const sharedRide = sharedRideInfo.ride;
      const seats = sharedRide.car.seats - sharedRide.passengers.length - 1;
      const passengers = workersWithoutRide.slice(0, seats);
      workersWithoutRide = workersWithoutRide.slice(seats);
      const originalRide = plannedJobs
        .find((j) => j.job.id === sharedRideInfo.proposedJobId)!
        .rides.find((r) => r.driver.id === sharedRide.driver.id)!;
      originalRide.passengers = [...originalRide.passengers, ...passengers];
    }
    plannedJobs.push({
      job: job,
      workers: [...drivers, ...workers],
      responsibleWorker: drivers.length > 0 ? drivers[0] : workers[0],
      rides: rides,
    });
    return plannedJobs;
  }

  plannedJobToDatabaseJob(plannedJob: PlannedJob): JobToBePlanned {
    const responsibleWorker =
      plannedJob.responsibleWorker || plannedJob.workers[0] || undefined;
    return {
      proposedJobId: plannedJob.job.id,
      workerIds: plannedJob.workers.map((w) => w.id),
      responsibleWorkerId: responsibleWorker ? responsibleWorker.id : undefined,
      privateDescription:
        plannedJob.privateDescription || plannedJob.job.privateDescription,
      publicDescription:
        plannedJob.publicDescription || plannedJob.job.publicDescription,
      rides: plannedJob.rides.map((r) => ({
        driverId: r.driver.id,
        carId: r.car.id,
        passengerIds: r.passengers.map((p) => p.id),
      })),
    };
  }
}

type FindWorkerResult = {
  worker: WorkerComplete | null;
  remainingWorkers: CategorizedWorkers;
};

type FindSharedRidesResult = {
  success: boolean;
  availableRides: JobRide[];
};

type JobRide = {
  proposedJobId: string;
  ride: RideWithPassengers;
};

type CategorizedWorkers = {
  drivers: WorkerComplete[];
  strong: WorkerComplete[];
  others: WorkerComplete[];
};

type PlannedJob = {
  job: ProposedJobNoActive;
  workers: WorkerComplete[];
  responsibleWorker?: Worker;
  rides: RideWithPassengers[];
  privateDescription?: string;
  publicDescription?: string;
};

type RideWithPassengers = {
  driver: Worker;
  car: Car;
  passengers: Worker[];
};

type RecPlanningResult = {
  plannedJobs: PlannedJob[];
  remainingWorkers: CategorizedWorkers;
};

type FillPlanningResult = {
  plannedJobs: PlannedJob[];
  remainingWorkers: WorkerComplete[];
};

type JobPlanningAttempt = {
  attemptsLeft: number;
  plannedJob: PlannedJob;
};
