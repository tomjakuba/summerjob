import { http_method_handler } from "lib/api/method_handler";
import { getActiveJobById, updateActiveJob } from "lib/data/active-jobs";
import { ApiBadRequestError } from "lib/data/api-error";
import { ActiveJobUpdateSchema } from "lib/types/active-job";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const result = ActiveJobUpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: new ApiBadRequestError(JSON.stringify(result.error.issues)),
    });
    return;
  }
  const jobData = result.data;
  jobData.id = id;
  await updateActiveJob(jobData);

  res.status(204).end();
}

export type ActiveJobAPIGetResponse = Awaited<
  ReturnType<typeof getActiveJobById>
>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<ActiveJobAPIGetResponse>
) {
  const id = req.query.id as string;
  const job = await getActiveJobById(id);
  if (!job) {
    res.status(404).end();
    return;
  }
  res.status(200).json(job);
}

export default http_method_handler({ get: get, patch: patch });
