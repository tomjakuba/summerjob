import { ApiErrorType } from "lib/data/apiError";
import { getPlans } from "lib/data/plans";
import { NextApiRequest, NextApiResponse } from "next";
import { http_method_handler } from "lib/api/method_handler";

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const plans = await getPlans();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}

export default http_method_handler({ get: get });
