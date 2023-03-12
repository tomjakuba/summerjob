import { http_method_handler } from "lib/api/method_handler";
import { deleteProposedJob, updateProposedJob } from "lib/data/proposed-jobs";
import {
  type ProposedJobUpdateData,
  ProposedJobUpdateSchema,
} from "lib/types/proposed-job";
import { NextApiRequest, NextApiResponse } from "next";

export type ProposedJobAPIPatchData = ProposedJobUpdateData;
async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const proposedJobData = ProposedJobUpdateSchema.parse(req.body);
  await updateProposedJob(id, proposedJobData);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  await deleteProposedJob(id);
  res.status(204).end();
}

export default http_method_handler({ patch: patch, del: del });
