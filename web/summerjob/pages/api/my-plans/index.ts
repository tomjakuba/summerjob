import { http_method_handler } from "lib/api/method_handler";
import { getMyPlans } from "lib/data/my-plan";
import { getActiveSummerJobEvent } from "lib/data/summerjob-event";
import { getWorkers, getWorkerById } from "lib/data/workers";
import { NextApiRequest, NextApiResponse } from "next";

export type MyPlansAPIGetResponse = Awaited<ReturnType<typeof getMyPlans>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<MyPlansAPIGetResponse>
) {
  const summerJobEvent = await getActiveSummerJobEvent();
  if (!summerJobEvent) {
    res.status(500).end();
    return;
  }
  // TODO replace with ID from session
  const workers = await getWorkers();
  if (workers.length === 0) {
    res.status(500).end();
    return;
  }
  // ^^^^^^^^^^^^^^
  const plans = await getMyPlans(workers[0].id);
  res.status(200).json(plans);
}

export default http_method_handler({ get: get });
