import { prisma } from "lib/prisma/connection";
import { PlanComplete, PlanWithJobs } from "lib/types/plan";

export async function getPlans(): Promise<PlanWithJobs[]> {
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

export async function getPlanById(id: string): Promise<PlanComplete | null> {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      jobs: {
        include: {
          workers: {
            include: {
              allergies: true,
            },
          },
          proposedJob: {
            include: {
              area: true,
            },
          },
          rides: {
            include: {
              driver: true,
              car: true,
              jobs: {
                include: {
                  proposedJob: true,
                },
              },
              passengers: true,
            },
          },
          responsibleWorker: true,
        },
      },
    },
  });
  return plan;
}
