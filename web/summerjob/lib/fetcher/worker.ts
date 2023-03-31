import { deserializeWorkerAvailability } from "lib/types/worker";
import type { WorkersAPIGetResponse } from "pages/api/workers";
import type {
  WorkerAPIGetResponse,
  WorkerAPIPatchData,
} from "pages/api/workers/[id]";
import { useEffect, useMemo } from "react";
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

  return useMemo(() => {
    return {
      isLoading: res.isLoading,
      error: res.error,
      mutate: res.mutate,
      data: res.data ? res.data.map(deserializeWorkerAvailability) : res.data,
    };
  }, [res.mutate, res.data, res.isLoading, res.error]);
}

export function useAPIWorker(id: string) {
  return useData<WorkerAPIGetResponse>(`/api/workers/${id}`);
}
