import {
  ActiveJob,
  Allergy,
  Area,
  ProposedJob,
  ProposedJobAvailability,
} from "lib/prisma/client";
import { z } from "zod";
import { Serialized } from "./serialize";

export type ProposedJobWithArea = ProposedJob & {
  area: Area;
};

export type ProposedJobNoActive = ProposedJob & {
  area: Area;
  allergens: Allergy[];
};

export type ProposedJobComplete = ProposedJob & {
  area: Area;
  allergens: Allergy[];
  activeJobs: ActiveJob[];
  availability: ProposedJobAvailability;
};

export const ProposedJobCreateSchema = z
  .object({
    areaId: z.string().min(1),
    allergens: z.array(z.string()),
    privateDescription: z.string(),
    publicDescription: z.string(),
    name: z.string().min(1),
    address: z.string().min(1),
    contact: z.string().min(1),
    maxWorkers: z.number().min(1),
    minWorkers: z.number().min(1),
    strongWorkers: z.number().nonnegative(),
    requiredDays: z.number().min(1),
    hasFood: z.boolean(),
    hasShower: z.boolean(),
    availability: z.array(z.coerce.date()),
  })
  .strict();

export type ProposedJobCreateData = z.infer<typeof ProposedJobCreateSchema>;

export const ProposedJobUpdateSchema = ProposedJobCreateSchema.merge(
  z.object({
    completed: z.boolean(),
    pinned: z.boolean(),
  })
)
  .strict()
  .partial();

export type ProposedJobUpdateData = z.infer<typeof ProposedJobUpdateSchema>;

export function serializeProposedJobs(jobs: ProposedJobComplete[]) {
  return JSON.stringify(jobs);
}

export function deserializeProposedJobs(jobs: string) {
  return JSON.parse(jobs) as ProposedJobComplete[];
}

export function serializeProposedJob(
  job: ProposedJobComplete
): Serialized<ProposedJobComplete> {
  return {
    data: JSON.stringify(job),
  };
}

export function deserializeProposedJob(job: Serialized<ProposedJobComplete>) {
  const parsed = JSON.parse(job.data) as ProposedJobComplete;
  return deserializeProposedJobAvailability(parsed);
}

export function deserializeProposedJobAvailability(job: ProposedJobComplete) {
  job.availability.days = job.availability.days.map((date) => new Date(date));
  return job;
}
