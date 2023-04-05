import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { getWorkers } from "lib/data/workers";
import { Permission } from "lib/types/auth";
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

export default APIAccessController(
  [Permission.WORKERS, Permission.PLANS],
  APIMethodHandler({ get })
);
