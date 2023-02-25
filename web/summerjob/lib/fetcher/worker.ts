import type { WorkersAPIGetResponse } from "pages/api/workers";
import type { WorkerAPIGetResponse } from "pages/api/workers/[id]";
import { useData, useDataPartialUpdate } from "./fetcher";

export function useAPIWorkerUpdate<T>(workerId: string, options?: any) {
  return useDataPartialUpdate<T>(`/api/workers/${workerId}`, options);
}

export function useAPIWorkers() {
  return useData<WorkersAPIGetResponse>("/api/workers");
}

export function useAPIWorkersWithoutJob(planId: string, options?: any) {
  const opts = Object.assign({ refreshInterval: 1000 }, options);
  return useData<WorkersAPIGetResponse>(
    `/api/workers?withoutJob=true&planId=${planId}`,
    opts
  );
}

export function useAPIWorker(id: string) {
  return useData<WorkerAPIGetResponse>(`/api/workers/${id}`);
}
