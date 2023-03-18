import { http_method_handler } from "lib/api/method_handler";
import { validateOrSendError } from "lib/api/validator";
import { ApiBadRequestError, ApiError, WrappedError } from "lib/data/api-error";
import { getWorkerById, updateWorker } from "lib/data/workers";
import { WorkerUpdateData, WorkerUpdateSchema } from "lib/types/worker";
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

export type WorkerAPIPatchData = Omit<WorkerUpdateData, "availability"> & {
  availability: string[];
};
async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const workerData = validateOrSendError(WorkerUpdateSchema, req.body, res);
  if (!workerData) {
    return;
  }
  await updateWorker(id, workerData);
  res.status(204).end();
}

export default http_method_handler({ get: get, patch: patch });
