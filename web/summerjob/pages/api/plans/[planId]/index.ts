import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { deletePlan, getPlanById } from "lib/data/plans";
import { Permission } from "lib/types/auth";
import { NextApiRequest, NextApiResponse } from "next";

export type PlanAPIGetResponse = Awaited<ReturnType<typeof getPlanById>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<PlanAPIGetResponse>
) {
  const id = req.query.planId as string;
  const plan = await getPlanById(id);
  if (!plan) {
    res.status(404).end();
    return;
  }
  res.status(200).json(plan);
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  // TODO: implement plan update
  const data = req.body;
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.planId as string;
  await deletePlan(id);
  res.status(204).end();
}

export default APIAccessController(
  [Permission.PLANS],
  APIMethodHandler({ get, patch, del })
);
