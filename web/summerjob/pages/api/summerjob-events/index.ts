import { http_method_handler } from "lib/api/method_handler";
import { validateOrSendError } from "lib/api/validator";
import {
  createSummerJobEvent,
  getSummerJobEvents,
  setActiveSummerJobEvent,
} from "lib/data/summerjob-event";
import {
  SummerJobEventCreateData,
  SummerJobEventCreateSchema,
} from "lib/types/summerjob-event";
import { NextApiRequest, NextApiResponse } from "next";

export type SummerJobEventsAPIPostData = Omit<
  SummerJobEventCreateData,
  "startDate" | "endDate"
> & {
  startDate: string;
  endDate: string;
};
export type SummerJobEventsAPIPostResponse = Awaited<
  ReturnType<typeof createSummerJobEvent>
>;
async function post(req: NextApiRequest, res: NextApiResponse) {
  const data = validateOrSendError(SummerJobEventCreateSchema, req.body, res);
  if (!data) {
    return;
  }
  const job = await createSummerJobEvent(data);
  res.status(201).json(job);
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Update event instead of only setting active
  const { id } = req.body;
  await setActiveSummerJobEvent(id as string);
  res.status(204).end();
}

type SummerJobEventsAPIGetResponse = Awaited<
  ReturnType<typeof getSummerJobEvents>
>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<SummerJobEventsAPIGetResponse>
) {
  const events = await getSummerJobEvents();
  res.status(200).json(events);
}

export default http_method_handler({ get: get, patch: patch, post: post });
