import { ProposedJobAvailability } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import {
  ProposedJobCreateData,
  type ProposedJobComplete,
  type ProposedJobUpdateData,
} from "lib/types/proposed-job";
import { cache_getActiveSummerJobEventId } from "./cache";
import { InvalidDataError, NoActiveEventError } from "./internal-error";

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
  const jobs = await prisma.proposedJob.findMany({
    where: {
      area: {
        summerJobEvent: {
          isActive: true,
        },
      },
    },
    include: {
      area: true,
      activeJobs: true,
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
        name: "asc",
      },
    ],
  });
  return jobs.map(databaseProposedJobToProposedJobComplete);
}

/**
 * Find all proposed jobs that are not already assigned to the given plan and are available on the plan's day.
 * @param planId The ID of the plan to check against.
 * @returns Proposed jobs that are not already assigned to the given plan and are available on the plan's day.
 */
export async function getProposedJobsAssignableTo(
  planId: string
): Promise<ProposedJobComplete[]> {
  const planDay = await prisma.plan.findUnique({
    where: {
      id: planId,
    },
    select: {
      day: true,
    },
  });
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
      hidden: false,
      availability: {
        some: {
          days: {
            has: planDay?.day,
          },
        },
      },
    },
    include: {
      area: true,
      activeJobs: true,
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
  const allergyUpdate = allergens ? { allergies: { set: allergens } } : {};

  const proposedJob = await prisma.proposedJob.update({
    where: {
      id,
    },
    data: {
      ...rest,
      ...allergyUpdate,
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
  const area = await prisma.area.findUnique({
    where: {
      id: proposedJobDataWithoutAllergens.areaId,
    },
  });
  if (!area) {
    throw new InvalidDataError("Area not found");
  }
  const proposedJob = await prisma.proposedJob.create({
    data: {
      ...proposedJobDataWithoutAllergens,
      allergens: {
        set: allergens,
      },
      availability: {
        create: {
          eventId: area?.summerJobEventId,
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
