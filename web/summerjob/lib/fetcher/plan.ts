import { PlanComplete, PlanWithJobs } from "lib/types/plan";
import { useData, useDataPartialUpdate } from "./fetcher";

export function useAPIPlans() {
  const properties = useData<PlanWithJobs[]>("/api/plans");
  if (properties.data) {
    for (const plan of properties.data) {
      plan.day = new Date(plan.day);
    }
  }
  return properties;
}

export function useAPIPlan(id: string, options?: any) {
  const opts = Object.assign({ refreshInterval: 1000 }, options);
  const properties = useData<PlanComplete>(`/api/plans/${id}`, opts);
  if (properties.data) {
    properties.data.day = new Date(properties.data.day);
  }
  return properties;
}

export function useAPIPlanMoveWorker(id: string, options?: any) {
  return useDataPartialUpdate(`/api/plans/${id}`, options);
}
