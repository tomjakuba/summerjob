import { http_method_handler } from "lib/api/method_handler";
import {
  getProposedJobs,
  getUnplannedProposedJobs,
} from "lib/data/proposed-jobs";
import { NextApiRequest, NextApiResponse } from "next";

export type ProposedJobsAPIGetResponse = Awaited<
  ReturnType<typeof getProposedJobs>
>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<ProposedJobsAPIGetResponse>
) {
  const { notInPlan } = req.query;
  let jobs;
  if (notInPlan && typeof notInPlan === "string") {
    jobs = await getUnplannedProposedJobs(notInPlan);
  } else {
    jobs = await getProposedJobs();
  }
  res.status(200).json(jobs);
}

export default http_method_handler({ get: get });
