import { ActiveJob, Plan } from "lib/prisma/client";
import { z } from "zod";
import { ActiveJobNoPlan } from "./active-job";
import { Serialized } from "./serialize";
import {
  deserializeWorker,
  deserializeWorkerAvailability,
  serializeWorker,
} from "./worker";

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

export function serializePlan(plan: PlanComplete): Serialized<PlanComplete> {
  return {
    data: JSON.stringify(plan),
  };
}

export function deserializePlan(plan: Serialized<PlanComplete>) {
  const parsed = JSON.parse(plan.data) as PlanComplete;
  parsed.day = new Date(parsed.day);
  for (let i = 0; i < parsed.jobs.length; i++) {
    parsed.jobs[i].workers = parsed.jobs[i].workers.map(
      deserializeWorkerAvailability
    );
  }
  return parsed as PlanComplete;
}

export function serializePlans(
  plans: PlanWithJobs[]
): Serialized<PlanWithJobs[]> {
  return {
    data: JSON.stringify(plans),
  };
}

export function deserializePlans(
  data: Serialized<PlanWithJobs[]>
): PlanWithJobs[] {
  const parsed = JSON.parse(data.data);
  for (const plan of parsed) {
    plan.day = new Date(plan.day);
  }
  return parsed;
}
