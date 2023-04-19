import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { Allergy } from "lib/types/allergy";
import { NextApiRequest, NextApiResponse } from "next";

export type AllergiesAPIGetResponse = string[];
async function get(
  req: NextApiRequest,
  res: NextApiResponse<AllergiesAPIGetResponse>
) {
  const allergies = Object.values(Allergy);
  res.status(200).json(allergies);
}

export default APIAccessController([], APIMethodHandler({ get }));
