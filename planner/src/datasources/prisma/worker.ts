import { Plan, PrismaClient, WorkerAvailability } from "../../../prisma/client";
import { WorkerComplete } from "../DataSource";

export async function getWorkersWithoutJob(
  plan: Plan,
  prisma: PrismaClient
): Promise<WorkerComplete[]> {
  const users = await prisma.worker.findMany({
    where: {
      jobs: {
        none: {
          planId: plan.id,
        },
      },
      availability: {
        some: {
          eventId: plan.summerJobEventId,
          workDays: {
            has: plan.day.toJSON(),
          },
        },
      },
    },
    include: {
      allergies: true,
      cars: true,
      availability: {
        where: {
          event: {
            id: plan.summerJobEventId,
          },
        },
        take: 1,
      },
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });
  // TODO: Remove this when the prisma client findMany is fixed
  let correctType = users as Parameters<
    typeof databaseWorkerToWorkerComplete
  >[0][];
  const res = correctType.map(databaseWorkerToWorkerComplete);
  return res;
}

export function databaseWorkerToWorkerComplete(
  worker: Omit<WorkerComplete, "availability"> & {
    availability: WorkerAvailability[];
  }
): WorkerComplete {
  const { availability, ...rest } = worker;
  return { ...rest, availability: availability[0] };
}
