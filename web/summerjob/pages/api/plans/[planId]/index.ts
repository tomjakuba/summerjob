import { http_method_handler } from "lib/api/method_handler";
import { deletePlan, getPlanById } from "lib/data/plans";
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

export default http_method_handler({ get: get, patch: patch, del: del });
