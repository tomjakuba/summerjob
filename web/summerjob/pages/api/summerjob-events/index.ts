import { http_method_handler } from "lib/api/method_handler";
import { validateOrSendError } from "lib/api/validator";
import {
  createSummerJobEvent,
  getSummerJobEvents,
} from "lib/data/summerjob-event";
import {
  SummerJobEventCreateDataInput,
  SummerJobEventCreateSchema,
} from "lib/types/summerjob-event";
import { NextApiRequest, NextApiResponse } from "next";

export type SummerJobEventsAPIPostData = SummerJobEventCreateDataInput;
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

export default http_method_handler({ get: get, post: post });
