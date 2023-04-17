import { PrismaClient } from "../../../prisma/client";
import { ProposedJobComplete } from "../DataSource";

export async function getProposedJobs(
  eventId: string,
  day: Date,
  prisma: PrismaClient
): Promise<ProposedJobComplete[]> {
  const jobs = await prisma.proposedJob.findMany({
    where: {
      area: {
        summerJobEvent: {
          id: eventId,
        },
      },
      availability: { has: day.toJSON() },
    },
    include: {
      area: true,
      activeJobs: true,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });
  return jobs as ProposedJobComplete[];
}
