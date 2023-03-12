import { http_method_handler } from "lib/api/method_handler";
import { createActiveJob } from "lib/data/active-jobs";
import { ApiBadRequestError, ApiError, WrappedError } from "lib/data/api-error";
import {
  ActiveJobCreateData,
  ActiveJobCreateSchema,
} from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

export type ActiveJobsAPIPostData = Omit<ActiveJobCreateData, "planId">;
export type ActiveJobsAPIPostResponse = Awaited<
  ReturnType<typeof createActiveJob>
>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<ActiveJobsAPIPostResponse | WrappedError<ApiError>>
) {
  const result = ActiveJobCreateSchema.safeParse({
    ...req.body,
    planId: req.query.planId,
  });
  if (!result.success) {
    res.status(400).json({
      error: new ApiBadRequestError(JSON.stringify(result.error.issues)),
    });
    return;
  }
  const job = await createActiveJob(result.data);
  res.status(201).json(job);
}

export default http_method_handler({ post: post });
