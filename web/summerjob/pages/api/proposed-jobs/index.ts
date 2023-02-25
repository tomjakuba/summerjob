import { http_method_handler } from "lib/api/method_handler";
import { ApiErrorType } from "lib/data/api-error";
import {
  getProposedJobs,
  getUnplannedProposedJobs,
} from "lib/data/proposed-jobs";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse<any>) {
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
