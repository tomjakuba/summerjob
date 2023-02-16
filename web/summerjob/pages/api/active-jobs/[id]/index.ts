import { http_method_handler } from "lib/api/method_handler";
import { getActiveJobById, updateActiveJob } from "lib/data/active-jobs";
import { ApiErrorType } from "lib/data/apiError";
import { UpdateActiveJobSerializableSchema } from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  try {
    const result = UpdateActiveJobSerializableSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json(result.error);
      return;
    }
    const jobData = result.data;
    jobData.id = id;
    await updateActiveJob(jobData);
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

async function get(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  try {
    const job = await getActiveJobById(id);
    if (!job) {
      res.status(404).end();
      return;
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
    return;
  }
  res.status(204).end();
}

export default http_method_handler({ get: get, patch: patch });
