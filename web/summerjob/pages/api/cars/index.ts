import { http_method_handler } from "lib/api/method_handler";
import { getCars } from "lib/data/cars";
import { NextApiRequest, NextApiResponse } from "next";

export type CarsAPIGetResponse = Awaited<ReturnType<typeof getCars>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<CarsAPIGetResponse>
) {
  const cars = await getCars();
  res.status(200).json(cars);
}

export default http_method_handler({ get: get });
