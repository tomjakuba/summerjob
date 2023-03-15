import { http_method_handler } from "lib/api/method_handler";
import { updateRide, deleteRide } from "lib/data/rides";
import { RideUpdateSchema } from "lib/types/ride";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.rideId as string;
  const rideData = RideUpdateSchema.parse(req.body);
  await updateRide(id, rideData);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.rideId as string;
  await deleteRide(id);
  res.status(204).end();
}

export default http_method_handler({ patch: patch, del: del });
