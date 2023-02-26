import type { PlansAPIGetResponse, PlansAPIPostData } from "pages/api/plans";
import type { PlanAPIGetResponse } from "pages/api/plans/[id]";
import { useData, useDataCreate, useDataPartialUpdate } from "./fetcher";

export function useAPIPlans(options?: any) {
  const properties = useData<PlansAPIGetResponse>("/api/plans", options);
  if (properties.data) {
    for (const plan of properties.data) {
      plan.day = new Date(plan.day);
    }
  }
  return properties;
}

export function useAPIPlan(id: string, options?: any) {
  const opts = Object.assign({ refreshInterval: 1000 }, options);
  const properties = useData<PlanAPIGetResponse>(`/api/plans/${id}`, opts);
  if (properties.data) {
    properties.data.day = new Date(properties.data.day);
  }
  return properties;
}

export function useAPIPlanMoveWorker(id: string, options?: any) {
  return useDataPartialUpdate(`/api/plans/${id}`, options);
}

export function useAPIPlansCreate(options?: any) {
  return useDataCreate<PlansAPIPostData>(`/api/plans`, options);
}
