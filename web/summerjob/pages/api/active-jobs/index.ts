import { http_method_handler } from "lib/api/method_handler";
import { createActiveJob } from "lib/data/active-jobs";
import { CreateActiveJobSerializableSchema } from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const jobData = CreateActiveJobSerializableSchema.parse(req.body);
  await createActiveJob(jobData);
  res.status(204).end();
}

export default http_method_handler({ post: post });
