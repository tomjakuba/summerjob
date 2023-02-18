import { WorkerComplete } from "lib/types/worker";
import { useData, useDataPartialUpdate } from "./fetcher";

export function useAPIWorkerUpdate<T>(workerId: string, options?: any) {
  return useDataPartialUpdate<T>(`/api/workers/${workerId}`, options);
}

export function useAPIWorkers() {
  return useData<WorkerComplete[]>("/api/workers");
}

export function useAPIWorkersWithoutJob(planId: string, options?: any) {
  const opts = Object.assign({ refreshInterval: 1000 }, options);
  return useData<WorkerComplete[]>(
    `/api/workers?withoutJob=true&planId=${planId}`,
    opts
  );
}

export function useAPIWorker(id: string) {
  return useData<WorkerComplete>(`/api/workers/${id}`);
}
