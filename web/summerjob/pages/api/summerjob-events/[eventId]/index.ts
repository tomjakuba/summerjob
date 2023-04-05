import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import {
  deleteSummerJobEvent,
  setActiveSummerJobEvent,
} from "lib/data/summerjob-event";
import { Permission } from "lib/types/auth";
import {
  SummerJobEventUpdateDataInput,
  SummerJobEventUpdateSchema,
} from "lib/types/summerjob-event";
import { NextApiRequest, NextApiResponse } from "next";

export type SummerJobEventsAPIPatchData = SummerJobEventUpdateDataInput;
async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.eventId as string;
  const data = validateOrSendError(SummerJobEventUpdateSchema, req.body, res);
  if (!data) {
    return;
  }
  // TODO: Update event instead of only setting active
  await setActiveSummerJobEvent(id);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.eventId as string;
  await deleteSummerJobEvent(id);
  res.status(204).end();
}

export default APIAccessController(
  [Permission.ADMIN],
  APIMethodHandler({ patch, del })
);
