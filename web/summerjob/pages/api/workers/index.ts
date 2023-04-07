import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { createWorker, createWorkers, getWorkers } from "lib/data/workers";
import { Permission } from "lib/types/auth";
import {
  WorkerCreateDataInput,
  WorkerCreateSchema,
  WorkersCreateDataInput,
  WorkersCreateSchema,
} from "lib/types/worker";
import { NextApiRequest, NextApiResponse } from "next";

export type WorkersAPIGetResponse = Awaited<ReturnType<typeof getWorkers>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<WorkersAPIGetResponse>
) {
  const { withoutJob, planId } = req.query;
  const hasJob = !Boolean(withoutJob);
  const users = await getWorkers(planId as string, hasJob);
  res.status(200).json(users);
}

export type WorkersAPIPostData = WorkerCreateDataInput | WorkersCreateDataInput;
async function post(req: NextApiRequest, res: NextApiResponse) {
  const singleWorker = WorkerCreateSchema.safeParse(req.body);
  if (singleWorker.success) {
    const worker = await createWorker(singleWorker.data);
    res.status(201).json(worker);
    return;
  }
  const multipleWorkers = validateOrSendError(
    WorkersCreateSchema,
    req.body,
    res
  );
  if (!multipleWorkers) {
    return;
  }
  const workers = await createWorkers(multipleWorkers);
  res.status(201).json(workers);
}

export default APIAccessController(
  [Permission.WORKERS, Permission.PLANS],
  APIMethodHandler({ get, post })
);
