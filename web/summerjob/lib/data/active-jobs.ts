import { prisma } from "lib/prisma/connection";
import { CreateActiveJobSerializable } from "lib/types/active-job";

export async function createActiveJob(job: CreateActiveJobSerializable) {
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
