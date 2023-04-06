import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { getSMJSessionAPI, isAccessAllowed } from "lib/auth/auth";
import { ApiError, WrappedError } from "lib/data/api-error";
import { deleteWorker, getWorkerById, updateWorker } from "lib/data/workers";
import { Permission } from "lib/types/auth";
import { WorkerUpdateDataInput, WorkerUpdateSchema } from "lib/types/worker";
import { NextApiRequest, NextApiResponse } from "next";

export type WorkerAPIGetResponse = Awaited<ReturnType<typeof getWorkerById>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<WorkerAPIGetResponse | WrappedError<ApiError>>
) {
  const id = req.query.id as string;
  const user = await getWorkerById(id);
  if (!user) {
    res.status(404).end();
    return;
  }
  res.status(200).json(user);
}

export type WorkerAPIPatchData = WorkerUpdateDataInput;
async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const allowed = await isAllowedToAccessWorker(req, res, id);
  if (!allowed) {
    return;
  }
  const workerData = validateOrSendError(WorkerUpdateSchema, req.body, res);
  if (!workerData) {
    return;
  }
  await updateWorker(id, workerData);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const allowed = await isAllowedToDeleteWorker(req, res);
  if (!allowed) {
    return;
  }
  await deleteWorker(id);
  res.status(204).end();
}

async function isAllowedToAccessWorker(
  req: NextApiRequest,
  res: NextApiResponse,
  workerId: string
) {
  const session = await getSMJSessionAPI(req, res);
  if (!session) {
    res.status(401).end();
    return;
  }
  const regularAccess = isAccessAllowed([Permission.WORKERS], session);
  if (regularAccess) {
    return true;
  }
  // Users can access their own data and modify them in profile page
  if (session.userID === workerId) {
    return true;
  }
  res.status(403).end();
  return false;
}

async function isAllowedToDeleteWorker(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSMJSessionAPI(req, res);
  if (!session) {
    res.status(401).end();
    return;
  }
  const regularAccess = isAccessAllowed([Permission.WORKERS], session);
  if (!regularAccess) {
    res.status(403).end();
  }
  return true;
}

// Access control is done individually in this case to allow users to access their own data
export default APIMethodHandler({ get, patch, del });
