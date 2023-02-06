import { ActiveJob, ProposedJob } from "lib/prisma/client";
import { ProposedJobWithArea } from "./proposed-job";
import type { Worker } from "lib/prisma/client";
import { RideComplete } from "./ride";
import { z } from "zod";
import { WorkerWithAllergies } from "./worker";

export type ActiveJobNoPlan = ActiveJob & {
  workers: WorkerWithAllergies[];
  proposedJob: ProposedJobWithArea;
  rides: RideComplete[];
  responsibleWorker?: Worker;
};

export type ActiveJobWithProposed = ActiveJob & {
  proposedJob: ProposedJob;
};

export const CreateActiveJobSerializableSchema = z
  .object({
    proposedJobId: z.string(),
    privateDescription: z.string(),
    publicDescription: z.string(),
    planId: z.string(),
  })
  .strict();

export type CreateActiveJobSerializable = z.infer<
  typeof CreateActiveJobSerializableSchema
>;
