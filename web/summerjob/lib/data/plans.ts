import { prisma } from "lib/prisma/connection";

export async function getPlans() {
  // TODO replace with the currently active year instead of newest
  const events = await prisma.summerJobEvent.findMany({
    orderBy: {
      startDate: "desc",
    },
    take: 1,
    select: {
      plans: {
        include: {
          jobs: true,
        },
      },
    },
  });
  if (events.length === 0) {
    return [];
  }
  return events[0].plans;
}

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      jobs: {
        include: {
          workers: true,
          proposedJob: {
            include: {
              area: true,
            },
          },
          ride: {
            include: {
              driver: true,
              car: true,
              forJobs: {
                include: {
                  proposedJob: true,
                },
              },
              passengers: true,
            },
          },
        },
      },
    },
  });
  return plan;
}
