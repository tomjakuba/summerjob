import { http_method_handler } from "lib/api/method_handler";
import { ApiErrorType } from "lib/data/api-error";
import { getWorkers } from "lib/data/workers";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse<any>) {
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

export default http_method_handler({ get: get });
