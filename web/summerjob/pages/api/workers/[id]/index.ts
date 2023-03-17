import { http_method_handler } from "lib/api/method_handler";
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
  const workerData = WorkerUpdateSchema.safeParse(req.body);
  if (!workerData.success) {
    res.status(400).json({
      error: new ApiBadRequestError(JSON.stringify(workerData.error.issues)),
    });
    return;
  }
  await updateWorker(id, workerData.data);
  res.status(204).end();
}

export default http_method_handler({ get: get, patch: patch });
