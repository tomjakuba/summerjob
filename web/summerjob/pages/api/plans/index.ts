import { getPlans } from "lib/data/plans";
import { NextApiRequest, NextApiResponse } from "next";
import { http_method_handler } from "lib/api/method_handler";

export type PlansAPIGetResponse = Awaited<ReturnType<typeof getPlans>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<PlansAPIGetResponse>
) {
  const plans = await getPlans();
  res.status(200).json(plans);
}

export default http_method_handler({ get: get });
