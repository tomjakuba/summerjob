import { http_method_handler } from "lib/api/method_handler";
import { ApiErrorType } from "lib/data/apiError";
import { getWorkerById, modifyUser } from "lib/data/workers";
import { WorkerSerializableSchema } from "lib/types/worker";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  try {
    const user = await getWorkerById(id);
    if (!user) {
      res.status(404).end();
      return;
    }
    res.status(200).json(user);
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
  const id = req.query.id as string;
  try {
    const workerData = WorkerSerializableSchema.parse(req.body);
    await modifyUser(id, workerData);
  } catch (error) {
    res.status(400).json({
      error: {
        type: ApiErrorType.BAD_REQUEST,
        message: "Invalid input.",
      },
    });
    return;
  }
  res.status(204).end();
}

export default http_method_handler({ get: get, patch: patch });
