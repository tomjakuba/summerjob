import { Plan } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { PlanComplete, PlanWithJobs } from "lib/types/plan";
import { cache_getActiveSummerJobEventId } from "./data-store";
import { InvalidDataError, NoActiveEventError } from "./internal-error";
import { databaseWorkerToWorkerComplete } from "./workers";

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
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      jobs: {
        include: {
          workers: {
            include: {
              allergies: true,
              cars: true,
              availability: {
                where: {
                  eventId: activeEventId,
                },
                take: 1,
              },
            },
          },
          proposedJob: {
            include: {
              area: true,
              allergens: true,
            },
          },
          rides: {
            include: {
              driver: true,
              car: true,
              job: {
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
  if (!plan) {
    return null;
  }
  const jobs: ActiveJobNoPlan[] = [];
  for (const job of plan.jobs) {
    jobs.push({
      ...job,
      workers: job.workers.map(databaseWorkerToWorkerComplete),
    });
  }
  return { ...plan, jobs };
}

export async function createPlan(date: Date): Promise<Plan> {
  const event = await prisma.summerJobEvent.findFirst({
    where: {
      startDate: {
        lte: date,
      },
      endDate: {
        gte: date,
      },
    },
  });
  if (!event) {
    throw new InvalidDataError("No summerjob event found for this date.");
  }
  const plan = await prisma.plan.create({
    data: {
      day: date,
      summerJobEventId: event.id,
    },
  });
  return plan;
}

export async function deletePlan(id: string) {
  await prisma.plan.delete({
    where: { id },
  });
}
