import {
  Allergy,
  Car,
  Plan,
  PrismaClient,
  ProposedJob,
  SummerJobEvent,
  Worker,
} from "../lib/prisma/client";
import { faker } from "@faker-js/faker/locale/cz";

const prisma = new PrismaClient();

function choose<T>(array: T[], amount: number): T[] {
  return array
    .map((x) => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((a) => a.x)
    .slice(0, amount);
}

function between(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function createAllergies() {
  const allergies = [
    "ALLERGY_ANIMALS",
    "ALLERGY_POLLEN",
    "ALLERGY_DUST",
    "ALLERGY_GRASS",
  ];
  await prisma.allergy.createMany({
    data: allergies.map((allergy) => ({ code: allergy })),
  });
  return await prisma.allergy.findMany();
}

async function createWorkers(
  allergies: Allergy[],
  eventId: string,
  days: Date[]
) {
  const createWorker = () => {
    const sex = Math.random() > 0.5 ? "male" : "female";
    const firstName = faker.name.firstName(sex);
    const lastName = faker.name.lastName(sex);
    return {
      firstName: firstName,
      lastName: lastName,
      phone: faker.phone.number("### ### ###"),
      email: faker.internet.email(firstName, lastName),
      isStrong: Math.random() > 0.75,
      registeredIn: { connect: { id: eventId } },
      availability: {
        create: {
          eventId: eventId,
          days: choose(days, between(2, days.length)),
        },
      },
    };
  };
  const withCar = (worker: any) => {
    const odometerValue = between(10000, 100000);
    return {
      ...worker,
      cars: {
        create: [
          {
            name: faker.vehicle.vehicle() + ", " + faker.vehicle.vrm(),
            description: faker.color.human(),
            seats: between(1, 3) * 2,
            odometers: {
              create: [
                {
                  start: odometerValue,
                  end: odometerValue,
                  event: { connect: { id: eventId } },
                },
              ],
            },
          },
        ],
      },
    };
  };
  for (let i = 0; i < 7; i++) {
    const worker = createWorker();
    if (i === 0) {
      worker.isStrong = true;
    }
    await prisma.worker.create({
      data: worker,
    });
  }
  for (let i = 0; i < 3; i++) {
    const worker = withCar(createWorker());
    await prisma.worker.create({
      data: worker,
    });
  }
  if (allergies.length > 0) {
    const allergyWorkers = await prisma.worker.findMany({
      take: 5,
    });
    for (let i = 0; i < 5; i++) {
      await prisma.worker.update({
        where: { id: allergyWorkers[i].id },
        data: {
          allergies: {
            connect: choose(allergies, between(1, 3)).map((allergy) => ({
              id: allergy.id,
            })),
          },
        },
      });
    }
  }
  return await prisma.worker.findMany();
}

async function createYearlyEvent() {
  const event = await prisma.summerJobEvent.create({
    data: {
      name: "Krkonoše 2023",
      startDate: new Date("2023-07-03"),
      endDate: new Date("2023-07-09"),
      isActive: true,
    },
  });
  return event;
}

async function createAreas(eventId: string) {
  const createArea = () => {
    return {
      name: faker.address.city(),
      description: faker.lorem.paragraph(),
      summerJobEventId: eventId,
      requiresCar: Math.random() > 0.5,
    };
  };
  await prisma.area.createMany({
    data: [createArea(), createArea(), createArea()],
  });
  return await prisma.area.findMany();
}

async function createProposedJobs(areaIds: string[]) {
  const titles = [
    "Hrabání listí",
    "Přesouvání kamení",
    "Řezání dřeva",
    "Úprava zahrady",
    "Vymalování místnosti",
  ];
  const createProposedJob = (name: string) => {
    return {
      name: name,
      description: faker.lorem.paragraph(),
      areaId: choose(areaIds, 1)[0],
      requiredDays: between(1, 3),
      minWorkers: between(2, 3),
      maxWorkers: between(4, 6),
      strongWorkers: between(0, 1),
      address: faker.address.streetAddress(),
      contact: faker.name.fullName() + ", " + faker.phone.number("### ### ###"),
      hasFood: Math.random() > 0.5,
      hasShower: Math.random() > 0.7,
    };
  };
  await prisma.proposedJob.createMany({
    data: titles.map((title) => createProposedJob(title)),
  });
  return await prisma.proposedJob.findMany();
}

async function createPlan(event: SummerJobEvent) {
  const plan = await prisma.plan.create({
    data: {
      day: event.startDate,
      summerJobEventId: event.id,
    },
  });
  return plan;
}

async function populatePlan(
  plan: Plan,
  proposedJobs: ProposedJob[],
  workers: Worker[]
) {
  const job = choose(proposedJobs, 1)[0];
  const workersCount = between(job.minWorkers, job.maxWorkers);
  const workersIds = choose(workers, workersCount).map((worker) => worker.id);
  // Have strong worker if required
  if (job.strongWorkers > 0) {
    const strongWorker = workers.find((w) => w.isStrong) || workers[0];
    if (!workersIds.includes(strongWorker.id)) {
      workersIds[0] = strongWorker.id;
    }
  }
  // Have driver
  type WorkerWithCar = Worker & { cars: Car[] };
  const drivers = (await prisma.worker.findMany({
    where: {
      cars: {
        some: {},
      },
    },
    include: {
      cars: true,
    },
  })) as WorkerWithCar[];
  const assignedWorkersWithCar = drivers.filter((driver) =>
    workersIds.includes(driver.id)
  );
  let driver: WorkerWithCar;
  if (assignedWorkersWithCar.length === 0) {
    driver = drivers[0];
    workersIds[1] = driver.id;
  } else {
    driver = assignedWorkersWithCar[0];
  }

  const activeJob = await prisma.activeJob.create({
    data: {
      privateDescription: "Popis úkolu, který vidí jen organizátor",
      publicDescription: "Popis úkolu, který vidí všichni",
      planId: plan.id,
      proposedJobId: job.id,
      workers: {
        connect: workersIds.map((id) => ({ id })),
      },
      responsibleWorkerId: driver.id,
    },
  });

  const ride = await prisma.ride.create({
    data: {
      driverId: driver.id,
      carId: driver.cars[0].id,
      passengers: {
        connect: workersIds
          .filter((id) => id !== driver.id)
          .map((id) => ({ id })),
      },
      jobId: activeJob.id,
    },
  });
}

async function main() {
  console.log("Creating yearly event...");
  const yearlyEvent = await createYearlyEvent();
  const allergies = await createAllergies();
  console.log("Creating workers, cars...");
  const workers = await createWorkers(
    allergies,
    yearlyEvent.id,
    datesBetween(yearlyEvent.startDate, yearlyEvent.endDate)
  );
  console.log("Creating areas...");
  const areas = await createAreas(yearlyEvent.id);
  console.log("Creating proposed jobs...");
  const proposedJobs = await createProposedJobs(areas.map((area) => area.id));
  console.log("Creating plan...");
  const plan = await createPlan(yearlyEvent);
  console.log("Populating plan...");
  await populatePlan(plan, proposedJobs, workers);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

function datesBetween(start: Date, end: Date) {
  const dates: Date[] = [];
  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }
  return dates;
}
