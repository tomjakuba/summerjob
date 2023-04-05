import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { WrappedError, ApiBadRequestError, ApiError } from "lib/data/api-error";
import {
  createProposedJob,
  getProposedJobs,
  getProposedJobsAssignableTo,
} from "lib/data/proposed-jobs";
import { Permission } from "lib/types/auth";
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
  const { assignableToPlan } = req.query;
  let jobs;
  if (assignableToPlan && typeof assignableToPlan === "string") {
    jobs = await getProposedJobsAssignableTo(assignableToPlan);
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

export default APIAccessController(
  [Permission.JOBS],
  APIMethodHandler({ get, post })
);
