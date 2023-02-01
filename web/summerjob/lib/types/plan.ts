import { ActiveJob, Plan } from "lib/prisma/client";
import { z } from "zod";
import { ActiveJobNoPlan } from "./active-job";

export type PlanComplete = Plan & {
  jobs: ActiveJobNoPlan[];
};

export type PlanWithJobs = Plan & {
  jobs: ActiveJob[];
};

export const PlanUpdateMoveWorkerSchema = z.object({
  workerId: z.string(),
  fromJobId: z.string(),
  toJobId: z.string(),
  fromRideId: z.string().optional(),
  toRideId: z.string().optional(),
});

export type PlanUpdateMoveWorker = z.infer<typeof PlanUpdateMoveWorkerSchema>;
