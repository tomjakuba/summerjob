import { ActiveJob, Plan, ProposedJob } from "lib/prisma/client";
import { ProposedJobNoActive } from "./proposed-job";
import type { Worker } from "lib/prisma/client";
import { RideComplete } from "./ride";
import { z } from "zod";
import { WorkerWithAllergies } from "./worker";

export type ActiveJobNoPlan = ActiveJob & {
  workers: WorkerWithAllergies[];
  proposedJob: ProposedJobNoActive;
  rides: RideComplete[];
  responsibleWorker: Worker | null;
};

export type ActiveJobComplete = ActiveJob & {
  workers: WorkerWithAllergies[];
  proposedJob: ProposedJobNoActive;
  rides: RideComplete[];
  responsibleWorker: Worker | null;
  plan: Plan;
};

export type ActiveJobWithWorkersRides = ActiveJob & {
  workers: Worker[];
  rides: RideComplete[];
};

export type ActiveJobWithProposed = ActiveJob & {
  proposedJob: ProposedJob;
};

export const ActiveJobCreateSchema = z
  .object({
    proposedJobId: z.string(),
    privateDescription: z.string(),
    publicDescription: z.string(),
    planId: z.string(),
  })
  .strict();

export type ActiveJobCreateData = z.infer<typeof ActiveJobCreateSchema>;

export const ActiveJobUpdateSchema = z
  .object({
    id: z.string(),
    privateDescription: z.string(),
    publicDescription: z.string(),
    proposedJobId: z.string(),
    workerIds: z.array(z.string()),
    responsibleWorkerId: z.string(),
    rideIds: z.array(z.string()),
  })
  .partial()
  .strict();

export type ActiveJobUpdateData = z.infer<typeof ActiveJobUpdateSchema>;

export function serializeActiveJob(job: ActiveJobComplete) {
  return JSON.stringify(job);
}

export function deserializeActiveJob(job: string) {
  const parsed = JSON.parse(job) as ActiveJobComplete;
  parsed.plan.day = new Date(parsed.plan.day);
  return parsed;
}
