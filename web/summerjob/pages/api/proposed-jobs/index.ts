import { ApiErrorType } from "lib/data/apiError";
import {
  getProposedJobs,
  getUnplannedProposedJobs,
} from "lib/data/proposed-jobs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
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
