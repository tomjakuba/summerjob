import { prisma } from "lib/prisma/connection";

export async function getProposedJobs() {
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

export async function getUnplannedProposedJobs(planId: string) {
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
