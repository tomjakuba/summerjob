import { PrismaClient } from "../lib/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const aJobs = await prisma.activeJob.findMany({});
  for (const aJob of aJobs) {
    const rides = await prisma.activeJob.update({
      where: {
        id: aJob.id,
      },
      data: {
        workers: {
          set: [],
        },
      },
      include: {
        rides: true,
      },
    });
    for (const ride of rides.rides) {
      await prisma.ride.delete({
        where: {
          id: ride.id,
        },
      });
    }
  }
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
