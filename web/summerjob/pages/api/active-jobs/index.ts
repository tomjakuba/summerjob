import { PrismaClientValidationError } from "@prisma/client/runtime";
import { http_method_handler } from "lib/api/method_handler";
import { createActiveJob } from "lib/data/active-jobs";
import { ApiBadRequestError } from "lib/data/api-error";
import {
  CreateActiveJobSerializable,
  CreateActiveJobSerializableSchema,
} from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

export type ActiveJobsAPIPostData = CreateActiveJobSerializable;
async function post(req: NextApiRequest, res: NextApiResponse) {
  const jobData = CreateActiveJobSerializableSchema.parse(req.body);
  const job = await createActiveJob(jobData);
  res.status(201).json(job);
}

export default http_method_handler({ post: post });
