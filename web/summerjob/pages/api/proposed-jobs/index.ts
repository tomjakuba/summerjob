import { http_method_handler } from "lib/api/method_handler";
import { WrappedError, ApiBadRequestError, ApiError } from "lib/data/api-error";
import {
  createProposedJob,
  getProposedJobs,
  getUnplannedProposedJobs,
} from "lib/data/proposed-jobs";
import {
  ProposedJobCreateData,
  ProposedJobCreateSchema,
} from "lib/types/proposed-job";
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

export type ProposedJobsAPIPostData = ProposedJobCreateData;
export type ProposedJobsAPIPostResponse = Awaited<
  ReturnType<typeof createProposedJob>
>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<ProposedJobsAPIPostResponse | WrappedError<ApiError>>
) {
  const result = ProposedJobCreateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: new ApiBadRequestError(JSON.stringify(result.error.issues)),
    });
    return;
  }
  const job = await createProposedJob(result.data);
  res.status(201).json(job);
}

export default http_method_handler({ get: get, post: post });
