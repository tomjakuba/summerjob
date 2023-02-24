import { createActiveJob } from "lib/data/active-jobs";
import { ApiErrorType } from "lib/data/api-error";
import { CreateActiveJobSerializableSchema } from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const jobData = CreateActiveJobSerializableSchema.parse(req.body);
    await createActiveJob(jobData);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({
      error: {
        type: ApiErrorType.BAD_REQUEST,
        message: "Invalid input.",
      },
    });
    return;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await post(req, res);
    return;
  }
  res.status(405).end();
}
