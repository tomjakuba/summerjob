import { useDataCreate } from "./fetcher";

export function useAPIActiveJobCreate(options?: any) {
  return useDataCreate("/api/active-jobs", options);
}
