import { http_method_handler } from "lib/api/method_handler";
import { getWorkers } from "lib/data/workers";
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

export default http_method_handler({ get: get });
