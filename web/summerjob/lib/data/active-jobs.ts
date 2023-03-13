import prisma from "lib/prisma/connection";
import {
  ActiveJobComplete,
  ActiveJobCreateData,
  ActiveJobUpdateData,
} from "lib/types/active-job";
import type { Worker, Prisma } from "lib/prisma/client";

export async function getActiveJobById(
  id: string
): Promise<ActiveJobComplete | null> {
  const job = await prisma.activeJob.findFirst({
    where: {
      id,
    },
    include: {
      workers: {
        include: {
          allergies: true,
          cars: true,
        },
      },
      proposedJob: {
        include: {
          area: true,
          allergens: true,
        },
      },
      responsibleWorker: true,
      rides: {
        include: {
          car: true,
          driver: true,
          jobs: {
            include: {
              proposedJob: true,
            },
          },
          passengers: true,
        },
      },
      plan: true,
    },
  });
  return job;
}

type ActiveJobSimplified = {
  id: string;
  responsibleWorkerId: string | null;
  workers: {
    id: string;
  }[];
};

/**
 * Removes a worker from a job and all rides associated with the job.
 * If the worker is the responsible worker, the responsible worker is set to null.
 * If the worker is a driver of a ride, the ride is deleted.
 * @param workerId ID of the worker to remove
 * @param jobId ID of the job to remove the worker from
 * @param tx Prisma transaction client
 */
async function removeWorkerFromJob(
  workerId: string,
  job: ActiveJobSimplified,
  tx: Prisma.TransactionClient
) {
  const newResponsiblePersonId =
    job.responsibleWorkerId === workerId ? null : job.responsibleWorkerId;
  const updatedJob = await tx.activeJob.update({
    where: {
      id: job.id,
    },
    data: {
      responsibleWorkerId: newResponsiblePersonId,
      workers: {
        disconnect: {
          id: workerId,
        },
      },
      rides: {
        deleteMany: {
          driverId: workerId,
        },
      },
    },
    select: {
      rides: {
        select: {
          id: true,
          passengers: true,
        },
      },
    },
  });

  for (const ride of updatedJob.rides) {
    if (ride.passengers.some((p) => p.id === workerId)) {
      await tx.ride.update({
        where: {
          id: ride.id,
        },
        data: {
          passengers: {
            disconnect: {
              id: workerId,
            },
          },
        },
      });
    }
  }
}

function getJobsWithWorkers(
  workerIds: string[],
  planId: string,
  tx: Prisma.TransactionClient
) {
  return tx.activeJob.findMany({
    where: {
      planId,
      workers: {
        some: {
          id: {
            in: workerIds,
          },
        },
      },
    },
    select: {
      id: true,
      responsibleWorkerId: true,
      workers: {
        select: {
          id: true,
        },
      },
    },
  });
}

function getActiveJobDetailsById(
  id: string | undefined,
  tx: Prisma.TransactionClient
) {
  return tx.activeJob.findFirst({
    where: {
      id,
    },
    include: {
      workers: {
        select: {
          id: true,
        },
      },
      rides: {
        include: {
          passengers: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
}

export async function updateActiveJob(job: ActiveJobUpdateData) {
  const {
    id,
    privateDescription,
    publicDescription,
    responsibleWorkerId,
    workerIds,
  } = job;
  return await prisma.$transaction(async (tx) => {
    const existingActiveJob = await getActiveJobDetailsById(id, tx);
    if (!existingActiveJob) {
      throw new Error("Active job not found");
    }
    let workersCommand = {};

    // Remove new workers from other active jobs
    const currentWorkerIds = existingActiveJob.workers.map((w) => w.id);
    const workersToAdd = workerIds?.filter(
      (id) => !currentWorkerIds.includes(id)
    );
    if (workersToAdd && workersToAdd.length > 0) {
      const previousJobsWithWorkers = await getJobsWithWorkers(
        workersToAdd,
        existingActiveJob?.planId,
        tx
      );
      for (const previousJob of previousJobsWithWorkers) {
        if (previousJob.id !== id) {
          for (const workerId of workersToAdd) {
            if (previousJob.workers.some((w) => w.id === workerId)) {
              await removeWorkerFromJob(workerId, previousJob, tx);
            }
          }
        }
      }
    }

    // Remove old workers from this job if needed
    let workersToRemove: string[] = [];
    if (workerIds) {
      workersToRemove = currentWorkerIds.filter(
        (id) => !workerIds?.includes(id)
      );
      for (const workerId of workersToRemove) {
        await removeWorkerFromJob(workerId, existingActiveJob, tx);
      }
    }

    const addedWorkers = workersToAdd?.length ?? 0 > 0;
    let removedWorkers = workersToRemove.length > 0;
    if (workerIds && (addedWorkers || removedWorkers)) {
      workersCommand = {
        workers: {
          connect: workersToAdd?.map((id) => ({ id })) ?? [],
          disconnect: workersToRemove.map((id) => ({ id })),
        },
      };
    }

    const activeJob = await tx.activeJob.update({
      where: {
        id,
      },
      data: {
        privateDescription,
        publicDescription,
        responsibleWorkerId,
        ...workersCommand,
      },
    });

    //TODO update ride

    return activeJob;
  });
}

export async function createActiveJob(job: ActiveJobCreateData) {
  const { proposedJobId, privateDescription, publicDescription, planId } = job;
  const activeJob = await prisma.$transaction(async (tx) => {
    const existingActiveJob = await tx.activeJob.findFirst({
      where: {
        proposedJobId,
        planId,
      },
    });
    if (existingActiveJob) {
      throw new Error("Active job already exists in this plan");
    }
    const activeJob = await tx.activeJob.create({
      data: {
        privateDescription,
        publicDescription,
        planId,
        proposedJobId,
      },
    });
    return activeJob;
  });

  return activeJob;
}

export function deleteActiveJob(id: string) {
  return prisma.activeJob.delete({
    where: {
      id,
    },
  });
}
