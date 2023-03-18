import { ProposedJobAvailability } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import {
  ProposedJobCreateData,
  type ProposedJobComplete,
  type ProposedJobUpdateData,
} from "lib/types/proposed-job";
import {
  cache_getActiveSummerJobEvent,
  cache_getActiveSummerJobEventId,
} from "./data-store";
import { NoActiveEventError } from "./internal-error";

export async function getProposedJobById(
  id: string
): Promise<ProposedJobComplete | null> {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const job = await prisma.proposedJob.findUnique({
    where: {
      id: id,
    },
    include: {
      area: true,
      activeJobs: true,
      allergens: true,
      availability: {
        where: {
          eventId: activeEventId,
        },
      },
    },
  });
  if (!job) {
    return null;
  }
  return databaseProposedJobToProposedJobComplete(job);
}

export async function getProposedJobs(): Promise<ProposedJobComplete[]> {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const jobs = await prisma.proposedJob.findMany({
    include: {
      area: true,
      activeJobs: true,
      allergens: true,
      availability: {
        where: {
          eventId: activeEventId,
        },
        take: 1,
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  return jobs.map(databaseProposedJobToProposedJobComplete);
}

export async function getUnplannedProposedJobs(
  planId: string
): Promise<ProposedJobComplete[]> {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const jobs = await prisma.proposedJob.findMany({
    where: {
      NOT: {
        activeJobs: {
          some: {
            planId: planId,
          },
        },
      },
      completed: false,
    },
    include: {
      area: true,
      activeJobs: true,
      allergens: true,
      availability: {
        where: {
          eventId: activeEventId,
        },
        take: 1,
      },
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  return jobs.map(databaseProposedJobToProposedJobComplete);
}

export async function updateProposedJob(
  id: string,
  proposedJobData: ProposedJobUpdateData
) {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) {
    throw new NoActiveEventError();
  }
  const { allergens, availability, ...rest } = proposedJobData;

  const proposedJob = await prisma.proposedJob.update({
    where: {
      id,
    },
    data: {
      ...rest,
      allergens: {
        set: allergens?.map((allergyId) => ({ id: allergyId })),
      },
      availability: {
        update: {
          where: {
            jobId_eventId: {
              jobId: id,
              eventId: activeEventId,
            },
          },
          data: {
            days: availability,
          },
        },
      },
    },
  });
  return proposedJob;
}

export async function createProposedJob(data: ProposedJobCreateData) {
  const { allergens, availability, ...proposedJobDataWithoutAllergens } = data;
  const activeEvent = await cache_getActiveSummerJobEvent();
  if (!activeEvent) {
    throw new NoActiveEventError();
  }
  const proposedJob = await prisma.proposedJob.create({
    data: {
      ...proposedJobDataWithoutAllergens,
      allergens: {
        connect: allergens.map((allergyId) => ({ id: allergyId })),
      },
      availability: {
        create: {
          eventId: activeEvent.id,
          days: availability,
        },
      },
    },
  });
  return proposedJob;
}

export async function deleteProposedJob(id: string) {
  await prisma.proposedJob.delete({
    where: {
      id,
    },
  });
}

export function databaseProposedJobToProposedJobComplete(
  proposedJob: Omit<ProposedJobComplete, "availability"> & {
    availability: ProposedJobAvailability[];
  }
): ProposedJobComplete {
  const { availability, ...rest } = proposedJob;
  return { ...rest, availability: availability[0] };
}

// export function databaseWorkerToWorkerComplete(
//   worker: Omit<WorkerComplete, "availability"> & {
//     availability: WorkerAvailability[];
//   }
// ): WorkerComplete {
//   const { availability, ...rest } = worker;
//   return { ...rest, availability: availability[0] };
// }
