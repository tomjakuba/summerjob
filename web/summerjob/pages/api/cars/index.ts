import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { ApiBadRequestError, ApiError, WrappedError } from "lib/data/api-error";
import { createCar, getCars } from "lib/data/cars";
import { Permission } from "lib/types/auth";
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
  const data = validateOrSendError(CarCreateSchema, req.body, res);
  if (!data) {
    return;
  }
  const car = await createCar(data);
  res.status(201).json(car);
}

export default APIAccessController(
  [Permission.CARS, Permission.PLANS],
  APIMethodHandler({ get, post })
);
