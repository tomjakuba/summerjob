import { http_method_handler } from "lib/api/method_handler";
import { ApiBadRequestError } from "lib/data/api-error";
import { deleteProposedJob, updateProposedJob } from "lib/data/proposed-jobs";
import {
  type ProposedJobUpdateData,
  ProposedJobUpdateSchema,
} from "lib/types/proposed-job";
import { NextApiRequest, NextApiResponse } from "next";

export type ProposedJobAPIPatchData = Omit<
  ProposedJobUpdateData,
  "availability"
> & {
  availability: string[];
};
async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const proposedJobData = ProposedJobUpdateSchema.safeParse(req.body);
  if (!proposedJobData.success) {
    res.status(400).json({
      error: new ApiBadRequestError(
        JSON.stringify(proposedJobData.error.issues)
      ),
    });
    return;
  }
  await updateProposedJob(id, proposedJobData.data);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  await deleteProposedJob(id);
  res.status(204).end();
}

export default http_method_handler({ patch: patch, del: del });
