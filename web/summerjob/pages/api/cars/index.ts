import { http_method_handler } from "lib/api/method_handler";
import { ApiDbError, ApiError, WrappedError } from "lib/data/api-error";
import { getCars } from "lib/data/cars";
import { NextApiRequest, NextApiResponse } from "next";

export type CarsAPIGetResponse = Awaited<ReturnType<typeof getCars>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<CarsAPIGetResponse | WrappedError<ApiError>>
) {
  try {
    const cars = await getCars();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({
      error: new ApiDbError(),
    });
  }
}

export default http_method_handler({ get: get });
