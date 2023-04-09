import { createPlan, getPlans } from "lib/data/plans";
import { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "lib/prisma/client";
import { ApiBadRequestError, WrappedError } from "lib/data/api-error";
import { InvalidDataError } from "lib/data/internal-error";
import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { ExtendedSession, Permission } from "lib/types/auth";
import logger from "lib/logger/logger";
import { APILogEvent } from "lib/types/logger";
import { cache_getActiveSummerJobEvent } from "lib/data/cache";

export type PlansAPIGetResponse = Awaited<ReturnType<typeof getPlans>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<PlansAPIGetResponse>
) {
  const plans = await getPlans();
  res.status(200).json(plans);
}

export type PlansAPIPostData = { date: string };
export type PlansAPIPostResponse = Awaited<ReturnType<typeof createPlan>>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PlansAPIPostResponse | WrappedError<ApiBadRequestError>>,
  session: ExtendedSession
) {
  const date = new Date(req.body.date);
  const activeEvent = await cache_getActiveSummerJobEvent();
  if (
    !activeEvent ||
    date < activeEvent.startDate ||
    date > activeEvent.endDate
  ) {
    res.status(400).json({ error: new ApiBadRequestError("Invalid date.") });
    return;
  }
  await logger.apiRequest(APILogEvent.PLAN_CREATE, "plans", req.body, session);
  try {
    const plan = await createPlan(date);
    res.status(201).json(plan);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const message =
        error.code === "P2002"
          ? "Plan with this date already exists."
          : undefined;
      res.status(400).json({ error: new ApiBadRequestError(message) });
      return;
    } else if (error instanceof InvalidDataError) {
      res.status(400).json({ error: new ApiBadRequestError(error.reason) });
      return;
    }
    throw error;
  }
}

export default APIAccessController(
  [Permission.PLANS],
  APIMethodHandler({ get, post })
);
