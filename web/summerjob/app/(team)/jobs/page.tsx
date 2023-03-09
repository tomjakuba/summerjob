import { serializeProposedJobs } from "lib/types/proposed-job";
import { getProposedJobs } from "lib/data/proposed-jobs";
import ProposedJobsClientPage from "lib/components/jobs/JobsClientPage";

export default async function ProposedJobsPage() {
  const jobs = await getProposedJobs();
  const serialized = serializeProposedJobs(jobs);
  return <ProposedJobsClientPage initialData={serialized} />;
}
