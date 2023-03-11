import { ActiveJob, Allergy, Area, ProposedJob } from "lib/prisma/client";
import { z } from "zod";

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
};

export const ProposedJobCreateSchema = z
  .object({
    areaId: z.string().min(1),
    allergens: z.array(z.string()),
    description: z.string(),
    name: z.string().min(1),
    address: z.string().min(1),
    contact: z.string().min(1),
    maxWorkers: z.number().min(1),
    minWorkers: z.number().min(1),
    strongWorkers: z.number().nonnegative(),
    requiredDays: z.number().min(1),
    hasFood: z.boolean(),
    hasShower: z.boolean(),
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

export function serializeProposedJob(job: ProposedJobComplete) {
  return JSON.stringify(job);
}

export function deserializeProposedJob(job: string) {
  const parsed = JSON.parse(job) as ProposedJobComplete;
  return parsed;
}
