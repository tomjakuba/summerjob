import { prisma } from "lib/prisma/connection";
import { ProposedJobComplete } from "lib/types/proposed-job";

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
