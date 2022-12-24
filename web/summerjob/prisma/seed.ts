import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/cz";

const prisma = new PrismaClient();

async function createWorkers() {
  const createWorker = () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    return {
      firstName: firstName,
      lastName: lastName,
      phone: faker.phone.number("#########"),
      email: faker.internet.email(firstName, lastName),
    };
  };
  return prisma.worker.createMany({
    data: [
      // generate more users with czech names using faker
      ...Array.from({ length: 10 }).map(createWorker),
    ],
  });
}

async function main() {
  const createdWorkers = await createWorkers();
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

export default {};
