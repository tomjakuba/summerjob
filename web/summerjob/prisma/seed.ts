import {
  Allergy,
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

async function createWorkers(allergies?: Allergy[]) {
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
    };
  };
  const withCar = (worker: any) => {
    return {
      ...worker,
      car: {
        create: {
          name: faker.vehicle.vehicle(),
          description: faker.vehicle.color(),
        },
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
  if (allergies) {
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
      endDate: new Date("2023-07-07"),
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
  if (job.strongWorkers > 0) {
    const strongWorker = workers.find((w) => w.isStrong) || workers[0];
    if (!workersIds.includes(strongWorker.id)) {
      workersIds[0] = strongWorker.id;
    }
  }
  await prisma.activeJob.create({
    data: {
      privateDescription: "Popis úkolu, který vidí jen organizátor",
      publicDescription: "Popis úkolu, který vidí všichni",
      planId: plan.id,
      proposedJobId: job.id,
      workers: {
        connect: workersIds.map((id) => ({ id })),
      },
    },
  });
}

async function main() {
  const allergies = await createAllergies();
  console.log("Creating workers, cars...");
  const workers = await createWorkers(allergies);
  console.log("Creating yearly event...");
  const yearlyEvent = await createYearlyEvent();
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
