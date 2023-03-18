import { SummerJobEventsAPIPostData } from "pages/api/summerjob-events";
import { useDataCreate } from "./fetcher";

export function useAPISummerJobEventCreate(options?: any) {
  return useDataCreate<SummerJobEventsAPIPostData>(
    `/api/summerjob-events`,
    options
  );
}
