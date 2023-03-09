import type { ProposedJobsAPIGetResponse } from "pages/api/proposed-jobs";
import { ProposedJobAPIPatchData } from "pages/api/proposed-jobs/[id]";
import { useData, useDataPartialUpdateDynamic } from "./fetcher";

export function useAPIProposedJobs(options?: any) {
  return useData<ProposedJobsAPIGetResponse>("/api/proposed-jobs", options);
}

export function useAPIProposedJobsNotInPlan(planId: string) {
  return useData<ProposedJobsAPIGetResponse>(
    `/api/proposed-jobs?notInPlan=${planId}`
  );
}

export function useAPIProposedJobUpdateDynamic(
  jobId: () => string | undefined,
  options?: any
) {
  const url = () => {
    const id = jobId();
    if (!id) return undefined;
    return `/api/proposed-jobs/${id}`;
  };
  return useDataPartialUpdateDynamic<ProposedJobAPIPatchData>(url, options);
}
