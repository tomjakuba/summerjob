import {
  ActiveJobNoPlan,
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
  return useData<ActiveJobNoPlan>(`/api/active-jobs/${id}`);
}
