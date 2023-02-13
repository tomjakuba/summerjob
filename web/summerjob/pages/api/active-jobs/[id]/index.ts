import { http_method_handler } from "lib/api/method_handler";
import { updateActiveJob } from "lib/data/active-jobs";
import { ApiErrorType } from "lib/data/apiError";
import { UpdateActiveJobSerializableSchema } from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  try {
    const jobData = UpdateActiveJobSerializableSchema.parse(req.body);
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

export default http_method_handler({ patch: patch });
