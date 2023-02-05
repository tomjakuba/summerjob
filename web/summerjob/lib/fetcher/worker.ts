import { WorkerComplete } from "lib/types/worker";
import { useData, useDataPartialUpdate } from "./fetcher";

export function useAPIWorkerUpdate(workerId: string, options?: any) {
  return useDataPartialUpdate(`/api/workers/${workerId}`, options);
}

export function useAPIWorkers() {
  return useData<WorkerComplete[]>("/api/workers");
}

export function useAPIWorkersWithoutJob(planId: string) {
  return useData<WorkerComplete[]>(
    `/api/workers?withoutJob=true&planId=${planId}`
  );
}

export function useAPIWorker(id: string) {
  return useData<WorkerComplete>(`/api/workers/${id}`);
}
