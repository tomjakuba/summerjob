import { http_method_handler } from "lib/api/method_handler";
import { ApiErrorType } from "lib/data/api-error";
import { getPlanById } from "lib/data/plans";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  try {
    const plan = await getPlanById(id);
    if (!plan) {
      res.status(404).end();
      return;
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}

export default http_method_handler({ get: get, patch: patch });
