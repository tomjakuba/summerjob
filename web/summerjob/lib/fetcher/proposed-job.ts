import { ProposedJobComplete } from "lib/types/proposed-job";
import { useData } from "./fetcher";

export function useAPIProposedJobs() {
  return useData<ProposedJobComplete[]>("/api/proposed-jobs");
}

export function useAPIProposedJobsNotInPlan(planId: string) {
  return useData<ProposedJobComplete[]>(
    `/api/proposed-jobs?notInPlan=${planId}`
  );
}
