import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { createWorker, getWorkers } from "lib/data/workers";
import { Permission } from "lib/types/auth";
import { WorkerCreateDataInput, WorkerCreateSchema } from "lib/types/worker";
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

export type WorkersAPIPostData = WorkerCreateDataInput;
async function post(req: NextApiRequest, res: NextApiResponse) {
  const data = validateOrSendError(WorkerCreateSchema, req.body, res);
  if (!data) {
    return;
  }
  const worker = await createWorker(data);
  res.status(201).json(worker);
}

export default APIAccessController(
  [Permission.WORKERS, Permission.PLANS],
  APIMethodHandler({ get, post })
);
