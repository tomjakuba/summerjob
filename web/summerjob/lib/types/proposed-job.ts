import { ActiveJob, Allergy, Area, ProposedJob } from "lib/prisma/client";
import { z } from "zod";

export type ProposedJobWithArea = ProposedJob & {
  area: Area;
};

export type ProposedJobComplete = ProposedJob & {
  area: Area;
  allergens: Allergy[];
  activeJobs: ActiveJob[];
};

// TODO add other properties
export const ProposedJobUpdateSchema = z
  .object({
    areaId: z.string(),
    allergens: z.array(z.string()),
    description: z.string(),
    name: z.string(),
    address: z.string(),
    contact: z.string(),
    maxWorkers: z.number().min(1),
    minWorkers: z.number().min(1),
    strongWorkers: z.number().nonnegative(),
    requiredDays: z.number().min(1),
    completed: z.boolean(),
    pinned: z.boolean(),
    hasFood: z.boolean(),
    hasShower: z.boolean(),
  })
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
