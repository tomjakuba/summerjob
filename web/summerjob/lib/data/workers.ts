import prisma from "lib/prisma/connection";
import { WorkerComplete, WorkerSerializable } from "lib/types/worker";

export async function getWorkers(
  planId: string | undefined = undefined,
  hasJob: boolean | undefined = undefined
): Promise<WorkerComplete[]> {
  let whereClause: any = {};
  if (planId) {
    whereClause = {
      where: {
        jobs: {
          some: {
            planId,
          },
        },
      },
    };
  }
  if (!hasJob) {
    whereClause = {
      where: {
        NOT: whereClause.where,
      },
    };
  }
  const users = await prisma.worker.findMany({
    include: {
      allergies: true,
      car: true,
    },
    ...whereClause,
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
  return users as WorkerComplete[];
}

export async function getWorkerById(
  id: string
): Promise<WorkerComplete | null> {
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    include: {
      car: true,
      allergies: true,
    },
  });
  return user;
}

export async function modifyUser(id: string, data: WorkerSerializable) {
  const user = await prisma.worker.update({
    where: {
      id,
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      allergies: {
        set: data.allergyIds.map((allergyId) => ({ id: allergyId })),
      },
    },
  });

  return user;
}
