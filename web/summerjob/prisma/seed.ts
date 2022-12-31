import { Allergy, PrismaClient } from "../lib/prisma/client";
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
}

async function main() {
  const allergies = await createAllergies();
  await createWorkers(allergies);
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
