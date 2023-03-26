import { JobToBePlanned } from "../datasources/DataSource";

export interface Planner {
  start(planId: string): Promise<PlanningResult>;
}

export type PlanningResult = {
  success: boolean;
  jobs: JobToBePlanned[];
};
