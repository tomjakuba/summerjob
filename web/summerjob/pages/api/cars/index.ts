import { http_method_handler } from "lib/api/method_handler";
import { ApiBadRequestError, ApiError, WrappedError } from "lib/data/api-error";
import { createCar, getCars } from "lib/data/cars";
import { CarCreateData, CarCreateSchema } from "lib/types/car";
import { NextApiRequest, NextApiResponse } from "next";

export type CarsAPIGetResponse = Awaited<ReturnType<typeof getCars>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<CarsAPIGetResponse>
) {
  const cars = await getCars();
  res.status(200).json(cars);
}

export type CarsAPIPostData = CarCreateData;
export type CarsAPIPostResponse = Awaited<ReturnType<typeof createCar>>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<CarsAPIPostResponse | WrappedError<ApiError>>
) {
  const result = CarCreateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: new ApiBadRequestError(JSON.stringify(result.error.issues)),
    });
    return;
  }
  const car = await createCar(result.data);
  res.status(201).json(car);
}

export default http_method_handler({ get: get, post: post });
