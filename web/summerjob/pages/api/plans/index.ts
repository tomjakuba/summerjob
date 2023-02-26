import { createPlan, getPlans } from "lib/data/plans";
import { NextApiRequest, NextApiResponse } from "next";
import { http_method_handler } from "lib/api/method_handler";
import { Prisma } from "lib/prisma/client";
import { ApiBadRequestError, WrappedError } from "lib/data/api-error";
import { InvalidDataError } from "lib/data/internal-error";

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
  res: NextApiResponse<PlansAPIPostResponse | WrappedError<ApiBadRequestError>>
) {
  const date = new Date(req.body.date);
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

export default http_method_handler({ get: get, post: post });
