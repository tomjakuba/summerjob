import { http_method_handler } from "lib/api/method_handler";
import { validateOrSendError } from "lib/api/validator";
import {
  deleteActiveJob,
  getActiveJobById,
  updateActiveJob,
} from "lib/data/active-jobs";
import { ActiveJobUpdateSchema } from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.jobId as string;
  const data = validateOrSendError(ActiveJobUpdateSchema, req.body, res);
  if (!data) {
    return;
  }
  await updateActiveJob(id, data);
  res.status(204).end();
}

export type ActiveJobAPIGetResponse = Awaited<
  ReturnType<typeof getActiveJobById>
>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<ActiveJobAPIGetResponse>
) {
  const id = req.query.jobId as string;
  const job = await getActiveJobById(id);
  if (!job) {
    res.status(404).end();
    return;
  }
  res.status(200).json(job);
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.jobId as string;
  await deleteActiveJob(id);
  res.status(204).end();
}

export default http_method_handler({ get: get, patch: patch, del: del });
