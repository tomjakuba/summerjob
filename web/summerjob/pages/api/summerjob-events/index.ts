import { http_method_handler } from "lib/api/method_handler";
import {
  getSummerJobEvents,
  setActiveSummerJobEvent,
} from "lib/data/summerjob-event";
import { NextApiRequest, NextApiResponse } from "next";

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

export default http_method_handler({ get: get, patch: patch });
