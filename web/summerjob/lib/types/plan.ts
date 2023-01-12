import { ActiveJob, Plan } from "lib/prisma/client";
import { ActiveJobNoPlan } from "./active-job";

export type PlanComplete = Plan & {
  jobs: ActiveJobNoPlan[];
};

export type PlanWithJobs = Plan & {
  jobs: ActiveJob[];
};
