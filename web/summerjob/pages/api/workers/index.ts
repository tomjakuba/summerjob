import { ApiErrorType } from "lib/data/apiError";
import { getWorkers } from "lib/data/workers";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const { withoutJob, planId } = req.query;
  const hasJob = !Boolean(withoutJob);
  try {
    const users = await getWorkers(planId as string, hasJob);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}
