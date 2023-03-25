import { Allergy } from "@prisma/client";
import {
  DataSource,
  PlanComplete,
  ProposedJobComplete,
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
      return;
    }
    const workersWithoutJob = await this.datasource.getWorkersWithoutJob(plan);
    const proposedJobs = await this.datasource.getProposedJobs(
      plan.summerJobEventId,
      plan.day
    );
    const CategorizedWorkers = this.categorizeWorkers(workersWithoutJob);
    const planned = this.planJobRecursive(
      plan,
      CategorizedWorkers,
      proposedJobs
    );
  }

  planJobRecursive(
    plan: PlanComplete,
    workersWithoutJob: CategorizedWorkers,
    proposedJobs: ProposedJobComplete[]
  ): PlanComplete {
    if (proposedJobs.length === 0) {
      console.log("BasicPlanner: No more proposed jobs");
      return plan;
    }
    // if (workersWithoutJob.length === 0) {
    //   console.log("BasicPlanner: No more workers without job");
    //   return plan;
    // }
    const proposedJob = proposedJobs[0];
    if (
      proposedJob.minWorkers >
      workersWithoutJob.drivers.length +
        workersWithoutJob.strong.length +
        workersWithoutJob.others.length
    ) {
      console.log("BasicPlanner: Not enough workers for job");
      return plan;
    }

    const needsDriver = proposedJob.area.requiresCar;
    const workers: WorkerComplete[] = [];
    // Find a driver if needed
    if (needsDriver) {
      const { worker, remainingWorkers } = this.findDriver(workersWithoutJob);
      if (!worker) {
        console.log("BasicPlanner: No driver found");
        // TODO: Find shared ride
        return plan;
      }
      workers.push(worker);
      workersWithoutJob = remainingWorkers;
    }
    // Find strong workers
    for (let i = 0; i < proposedJob.strongWorkers; i++) {
      const { worker, remainingWorkers } =
        this.findStrongWorker(workersWithoutJob);
      if (!worker) {
        console.log("BasicPlanner: No strong worker found");
        return plan;
      }
      workers.push(worker);
      workersWithoutJob = remainingWorkers;
    }

    // Fill with other workers
    const remainingWorkers = proposedJob.minWorkers - workers.length;
    for (let i = 0; i < remainingWorkers; i++) {
      const worker = this.findWorker(workersWithoutJob, proposedJob.allergens);
      if (!worker.worker) {
        console.log("BasicPlanner: No worker found");
        return plan;
      }
      workers.push(worker.worker);
      workersWithoutJob = worker.remainingWorkers;
    }

    console.log(
      proposedJob.name,
      workers.map((w) => w.lastName)
    );

    return this.planJobRecursive(
      plan,
      workersWithoutJob,
      proposedJobs.slice(1)
    );
  }

  findDriver(workers: CategorizedWorkers): FindWorkerResult {
    type Acc = { driver: WorkerComplete | null; workers: WorkerComplete[] };
    if (workers.drivers.length === 0) {
      return { worker: null, remainingWorkers: workers };
    }
    // TODO filter by allergies
    return {
      worker: workers.drivers[0],
      remainingWorkers: {
        others: workers.others,
        strong: workers.strong,
        drivers: workers.drivers.slice(1),
      },
    };
  }

  findStrongWorker(workers: CategorizedWorkers): FindWorkerResult {
    const worker = workers.strong.find((worker) => worker.isStrong);
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
        if (worker.isStrong) {
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
}

type FindWorkerResult = {
  worker: WorkerComplete | null;
  remainingWorkers: CategorizedWorkers;
};

type CategorizedWorkers = {
  drivers: WorkerComplete[];
  strong: WorkerComplete[];
  others: WorkerComplete[];
};
