import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import {
  createSummerJobEvent,
  getSummerJobEvents,
} from "lib/data/summerjob-event";
import { Permission } from "lib/types/auth";
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

export default APIAccessController(
  [Permission.ADMIN],
  APIMethodHandler({ get, post })
);
