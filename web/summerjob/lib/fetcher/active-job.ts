import { UpdateActiveJobSerializable } from "lib/types/active-job";
import { useDataCreate, useDataPartialUpdate } from "./fetcher";

export function useAPIActiveJobCreate(options?: any) {
  return useDataCreate("/api/active-jobs", options);
}

export function useAPIActiveJobUpdate(jobId: string, options?: any) {
  return useDataPartialUpdate<UpdateActiveJobSerializable>(
    `/api/active-jobs/${jobId}`,
    options
  );
}
