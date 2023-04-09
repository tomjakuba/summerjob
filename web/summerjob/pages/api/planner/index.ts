import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { WrappedError } from "lib/data/api-error";
import { requestPlanner } from "lib/data/planner";
import logger from "lib/logger/logger";
import { ExtendedSession, Permission } from "lib/types/auth";
import { APILogEvent } from "lib/types/logger";
import { PlannerSubmitSchema } from "lib/types/planner";
import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";

export type PlannerAPIPostData = { planId: string };
export type PlannerAPIPostResponse = { success: boolean };
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PlannerAPIPostResponse | WrappedError<ApiError>>,
  session: ExtendedSession
) {
  const result = validateOrSendError(PlannerSubmitSchema, req.body, res);
  if (!result) {
    return;
  }
  await logger.apiRequest(APILogEvent.PLAN_PLANNER_START, req.body, session);
  await requestPlanner(result.planId);
  res.status(200).json({ success: true });
}

export default APIAccessController(
  [Permission.PLANS],
  APIMethodHandler({ post })
);
