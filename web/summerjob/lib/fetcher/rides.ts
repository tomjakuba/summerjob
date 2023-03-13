import { ActiveJobNoPlan } from "lib/types/active-job";
import { RidesAPIPostData } from "pages/api/plans/[planId]/active-jobs/[jobId]/rides";
import { useDataCreate } from "./fetcher";

export function useAPIRideCreate(job: ActiveJobNoPlan, options?: any) {
  return useDataCreate<RidesAPIPostData>(
    `/api/plans/${job.planId}/active-jobs/${job.id}/rides`,
    options
  );
}
