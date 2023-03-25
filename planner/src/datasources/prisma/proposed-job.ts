import { PrismaClient, ProposedJobAvailability } from "../../../prisma/client";
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
      availability: {
        some: {
          event: {
            id: eventId,
          },
          days: {
            has: day.toJSON(),
          },
        },
      },
    },
    include: {
      area: true,
      activeJobs: true,
      allergens: true,
      availability: {
        where: {
          event: {
            id: eventId,
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

export function databaseProposedJobToProposedJobComplete(
  proposedJob: Omit<ProposedJobComplete, "availability"> & {
    availability: ProposedJobAvailability[];
  }
): ProposedJobComplete {
  const { availability, ...rest } = proposedJob;
  return { ...rest, availability: availability[0] };
}
