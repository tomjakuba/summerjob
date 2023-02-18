import {
  ActiveJobComplete,
  UpdateActiveJobSerializable,
} from "lib/types/active-job";
import {
  useData,
  useDataCreate,
  useDataPartialUpdate,
  useDataPartialUpdateDynamic,
} from "./fetcher";

export function useAPIActiveJobCreate(options?: any) {
  return useDataCreate("/api/active-jobs", options);
}

export function useAPIActiveJobUpdate(id: string, options?: any) {
  return useDataPartialUpdate<UpdateActiveJobSerializable>(
    `/api/active-jobs/${id}`,
    options
  );
}

export function useAPIActiveJobUpdateDynamic(id: () => string, options?: any) {
  return useDataPartialUpdateDynamic<UpdateActiveJobSerializable>(
    id,
    (value) => `/api/active-jobs/${value}`,
    options
  );
}

export function useAPIActiveJob(id: string) {
  const result = useData<ActiveJobComplete>(`/api/active-jobs/${id}`);
  if (result.data) {
    result.data.plan.day = new Date(result.data.plan.day);
  }
  return result;
}
