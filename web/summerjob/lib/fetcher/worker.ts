import { deserializeWorkerAvailability } from "lib/types/worker";
import type { WorkersAPIGetResponse } from "pages/api/workers";
import type {
  WorkerAPIGetResponse,
  WorkerAPIPatchData,
} from "pages/api/workers/[id]";
import { useData, useDataPartialUpdate } from "./fetcher";

export function useAPIWorkerUpdate(workerId: string, options?: any) {
  return useDataPartialUpdate<WorkerAPIPatchData>(
    `/api/workers/${workerId}`,
    options
  );
}

export function useAPIWorkers(options?: any) {
  return useData<WorkersAPIGetResponse>("/api/workers", options);
}

export function useAPIWorkersWithoutJob(planId: string, options?: any) {
  const opts = Object.assign({ refreshInterval: 1000 }, options);
  const res = useData<WorkersAPIGetResponse>(
    `/api/workers?withoutJob=true&planId=${planId}`,
    opts
  );
  if (res.data) {
    return { ...res, data: res.data.map(deserializeWorkerAvailability) };
  }
  return res;
}

export function useAPIWorker(id: string) {
  return useData<WorkerAPIGetResponse>(`/api/workers/${id}`);
}
