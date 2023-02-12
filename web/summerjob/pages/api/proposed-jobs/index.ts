import { http_method_handler } from "lib/api/method_handler";
import { ApiErrorType } from "lib/data/apiError";
import {
  getProposedJobs,
  getUnplannedProposedJobs,
} from "lib/data/proposed-jobs";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse<any>) {
  const { notInPlan } = req.query;
  try {
    let jobs;
    if (notInPlan && typeof notInPlan === "string") {
      jobs = await getUnplannedProposedJobs(notInPlan);
    } else {
      jobs = await getProposedJobs();
    }
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}

export default http_method_handler({ get: get });
