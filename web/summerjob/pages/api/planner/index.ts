import { http_method_handler } from "lib/api/method_handler";
import { validateOrSendError } from "lib/api/validator";
import { WrappedError } from "lib/data/api-error";
import { requestPlanner } from "lib/data/planner";
import { PlannerSubmitSchema } from "lib/types/planner";
import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";

export type PlannerAPIPostData = { planId: string };
export type PlannerAPIPostResponse = { success: boolean };
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PlannerAPIPostResponse | WrappedError<ApiError>>
) {
  const result = validateOrSendError(PlannerSubmitSchema, req.body, res);
  if (!result) {
    return;
  }
  await requestPlanner(result.planId);
  res.status(200).json({ success: true });
}

export default http_method_handler({ post: post });
