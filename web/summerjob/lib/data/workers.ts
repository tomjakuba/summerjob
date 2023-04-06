import { WorkerAvailability, Worker, PrismaClient } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import { PrismaTransactionClient } from "lib/types/prisma";
import {
  WorkerComplete,
  WorkerCreateData,
  WorkerUpdateData,
} from "lib/types/worker";
import { cache_getActiveSummerJobEventId } from "./cache";
import { NoActiveEventError } from "./internal-error";
import { deleteUserSessions } from "./users";

export async function getWorkers(
  planId: string | undefined = undefined,
  hasJob: boolean | undefined = undefined
): Promise<WorkerComplete[]> {
  let whereClause: any = {
    where: {
      registeredIn: {
        some: {
          isActive: true,
        },
      },
      deleted: false,
    },
  };
  if (planId) {
    let inPlan: any = {
      jobs: {
        some: {
          planId,
        },
      },
    };
    if (!hasJob) {
      inPlan = {
        NOT: inPlan,
      };
    }
    whereClause = {
      where: {
        ...whereClause.where,
        ...inPlan,
      },
    };
  }

  const users = await prisma.worker.findMany({
    ...whereClause,
    include: {
      allergies: true,
      cars: {
        where: {
          deleted: false,
        },
      },
      availability: {
        where: {
          event: {
            isActive: true,
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

export async function getWorkerById(
  id: string
): Promise<WorkerComplete | null> {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    include: {
      cars: {
        where: {
          deleted: false,
        },
      },
      allergies: true,
      availability: {
        where: {
          eventId: activeEventId,
        },
        take: 1,
      },
    },
  });
  if (!user) {
    return null;
  }
  // Only return availability for the active event
  return databaseWorkerToWorkerComplete(user);
}

export function databaseWorkerToWorkerComplete(
  worker: Omit<WorkerComplete, "availability"> & {
    availability: WorkerAvailability[];
  }
): WorkerComplete {
  const { availability, ...rest } = worker;
  return { ...rest, availability: availability[0] };
}

export async function deleteWorker(id: string) {
  await prisma.$transaction(async (tx) => {
    // Check if the worker has ever been assigned to a job
    // If not, we can just delete them
    const worker = await tx.worker.findUnique({
      where: { id },
      include: {
        jobs: true,
        permissions: true,
      },
    });
    if (!worker) {
      return;
    }
    await deleteUserSessions(worker.email);
    if (worker.jobs.length === 0) {
      await tx.worker.delete({
        where: {
          id,
        },
      });
      await tx.workerPermissions.delete({
        where: {
          id: worker.permissions.id,
        },
      });
      return;
    }
    // If the worker has been assigned to a job, we cannot delete them from the database as it would break the job history
    // Instead, we anonymize them
    await prisma.worker.update({
      where: {
        id,
      },
      data: {
        firstName: "Deleted",
        lastName: "Worker",
        email: `${id}@deleted.xyz`,
        phone: "00000000",
        allergies: {
          set: [],
        },
        availability: {
          updateMany: {
            where: {},
            data: {
              workDays: [],
              adorationDays: [],
            },
          },
        },
        cars: {
          updateMany: {
            where: {},
            data: {
              deleted: true,
              description: "Deleted",
              name: "Deleted Car",
            },
          },
        },
        deleted: true,
        blocked: true,
        permissions: {
          update: {
            permissions: [],
          },
        },
      },
    });
  });
}

export async function createWorker(data: WorkerCreateData) {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (data.availability) {
    if (!activeEventId) {
      throw new NoActiveEventError();
    }
  }

  return await prisma.worker.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      isStrong: data.strong,
      allergies: {
        connect: data.allergyIds.map((id) => ({ id })),
      },
      availability: {
        create: {
          workDays: data.availability?.workDays ?? [],
          adorationDays: data.availability?.adorationDays ?? [],
          event: {
            connect: {
              id: activeEventId,
            },
          },
        },
      },
      registeredIn: {
        connect: {
          id: activeEventId,
        },
      },
      permissions: {
        create: {
          permissions: [],
        },
      },
    },
  });
}

export async function updateWorker(id: string, data: WorkerUpdateData) {
  if (!data.email) {
    return await internal_updateWorker(id, data);
  }
  data.email = data.email.toLowerCase();
  return await prisma.$transaction(async (tx) => {
    const user = await internal_updateWorker(id, data, tx);
    if (!user) return null;
    await deleteUserSessions(user.email, tx);
    return user;
  });
}

export async function internal_updateWorker(
  id: string,
  data: WorkerUpdateData,
  prismaClient: PrismaClient | PrismaTransactionClient = prisma
) {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (data.availability) {
    if (!activeEventId) {
      throw new NoActiveEventError();
    }
  }

  return await prismaClient.worker.update({
    where: {
      id,
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      isStrong: data.strong,
      allergies: {
        set: data.allergyIds?.map((allergyId) => ({ id: allergyId })),
      },
      availability: {
        update: {
          where: {
            workerId_eventId: {
              workerId: id,
              eventId: activeEventId ?? "",
            },
          },
          data: {
            workDays: data.availability?.workDays,
            adorationDays: data.availability?.adorationDays,
          },
        },
      },
    },
  });
}
