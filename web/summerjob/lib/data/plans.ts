import { prisma } from "lib/prisma/connection";

export async function getPlans() {
  // TODO replace with the currently active year instead of newest
  const plans = await prisma.summerJobEvent.findMany({
    orderBy: {
      startDate: "desc",
    },
    take: 1,
    select: {
      plans: true,
    },
  });
  if (plans.length === 0) {
    return [];
  }
  return plans[0].plans;
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
          ride: true,
        },
      },
    },
  });
  return plan;
}
