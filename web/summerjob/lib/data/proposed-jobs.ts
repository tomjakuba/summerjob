import prisma from "lib/prisma/connection";
import {
  ProposedJobCreateData,
  type ProposedJobComplete,
  type ProposedJobUpdateData,
} from "lib/types/proposed-job";

export async function getProposedJobById(
  id: string
): Promise<ProposedJobComplete | null> {
  const job = await prisma.proposedJob.findUnique({
    where: {
      id: id,
    },
    include: {
      area: true,
      activeJobs: true,
      allergens: true,
    },
  });
  return job;
}

export async function getProposedJobs(): Promise<ProposedJobComplete[]> {
  const jobs = await prisma.proposedJob.findMany({
    include: {
      area: true,
      activeJobs: true,
      allergens: true,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  return jobs;
}

export async function getUnplannedProposedJobs(
  planId: string
): Promise<ProposedJobComplete[]> {
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
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  return jobs;
}

export async function updateProposedJob(
  id: string,
  proposedJobData: ProposedJobUpdateData
) {
  const { allergens, ...proposedJobDataWithoutAllergens } = proposedJobData;
  let allergensUpdate = {};
  if (allergens) {
    allergensUpdate = {
      allergens: {
        set: allergens.map((allergyId) => ({ id: allergyId })),
      },
    };
  }
  const proposedJob = await prisma.proposedJob.update({
    where: {
      id,
    },
    data: {
      ...proposedJobDataWithoutAllergens,
      ...allergensUpdate,
    },
  });
}

export async function createProposedJob(data: ProposedJobCreateData) {
  const { allergens, ...proposedJobDataWithoutAllergens } = data;
  const proposedJob = await prisma.proposedJob.create({
    data: {
      ...proposedJobDataWithoutAllergens,
      allergens: {
        connect: allergens.map((allergyId) => ({ id: allergyId })),
      },
    },
  });
  return proposedJob;
}
