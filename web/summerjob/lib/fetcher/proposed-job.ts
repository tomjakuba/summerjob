import type { ProposedJobsAPIGetResponse } from "pages/api/proposed-jobs";
import { useData } from "./fetcher";

export function useAPIProposedJobs() {
  return useData<ProposedJobsAPIGetResponse>("/api/proposed-jobs");
}

export function useAPIProposedJobsNotInPlan(planId: string) {
  return useData<ProposedJobsAPIGetResponse>(
    `/api/proposed-jobs?notInPlan=${planId}`
  );
}
