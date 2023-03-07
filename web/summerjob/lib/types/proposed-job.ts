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
    maxWorkers: z.number(),
    minWorkers: z.number(),
    completed: z.boolean(),
    pinned: z.boolean(),
  })
  .strict()
  .partial();

export type ProposedJobUpdateData = z.infer<typeof ProposedJobUpdateSchema>;
