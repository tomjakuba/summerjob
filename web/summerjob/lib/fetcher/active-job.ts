import { ActiveJobUpdateData } from "lib/types/active-job";
import {
  useData,
  useDataCreate,
  useDataPartialUpdate,
  useDataPartialUpdateDynamic,
} from "./fetcher";
import type { ActiveJobAPIGetResponse } from "pages/api/active-jobs/[id]";

export function useAPIActiveJobCreate(options?: any) {
  return useDataCreate("/api/active-jobs", options);
}

export function useAPIActiveJobUpdate(id: string, options?: any) {
  return useDataPartialUpdate<ActiveJobUpdateData>(
    `/api/active-jobs/${id}`,
    options
  );
}

export function useAPIActiveJobUpdateDynamic(
  id: () => string | undefined,
  options?: any
) {
  const url = () => {
    const jobId = id();
    if (!jobId) return undefined;
    return `/api/active-jobs/${jobId}`;
  };
  return useDataPartialUpdateDynamic<ActiveJobUpdateData>(url, options);
}

export function useAPIActiveJob(id: string) {
  const result = useData<ActiveJobAPIGetResponse>(`/api/active-jobs/${id}`);
  if (result.data) {
    result.data.plan.day = new Date(result.data.plan.day);
  }
  return result;
}
