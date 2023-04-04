import { http_method_handler } from "lib/api/method_handler";
import { getSMJSessionAPI } from "lib/auth/auth";
import { getMyPlans } from "lib/data/my-plan";
import { getActiveSummerJobEvent } from "lib/data/summerjob-event";
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
  const session = await getSMJSessionAPI(req, res);
  if (!session) {
    res.status(401).end();
    return;
  }

  const plans = await getMyPlans(session.userID);
  res.status(200).json(plans);
}

export default http_method_handler({ get: get });
