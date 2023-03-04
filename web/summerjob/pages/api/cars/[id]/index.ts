import { http_method_handler } from "lib/api/method_handler";
import { updateCar } from "lib/data/cars";
import { CarUpdateSchema } from "lib/types/car";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const carData = CarUpdateSchema.parse(req.body);
  await updateCar(id, carData);
  res.status(204).end();
}

export default http_method_handler({ patch: patch });
