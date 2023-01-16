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
