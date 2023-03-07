import prisma from "lib/prisma/connection";
import {
  type ProposedJobComplete,
  type ProposedJobUpdateData,
} from "lib/types/proposed-job";

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
  // TODO update allergens in job
  const { allergens, ...proposedJobDataWithoutAllergens } = proposedJobData;
  const proposedJob = await prisma.proposedJob.update({
    where: {
      id,
    },
    data: proposedJobDataWithoutAllergens,
  });
}
