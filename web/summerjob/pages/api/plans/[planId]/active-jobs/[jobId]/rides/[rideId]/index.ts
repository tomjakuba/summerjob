import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { updateRide, deleteRide } from "lib/data/rides";
import { Permission } from "lib/types/auth";
import { RideUpdateSchema } from "lib/types/ride";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.rideId as string;
  const data = validateOrSendError(RideUpdateSchema, req.body, res);
  if (!data) {
    return;
  }
  await updateRide(id, data);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.rideId as string;
  await deleteRide(id);
  res.status(204).end();
}

export default APIAccessController(
  [Permission.PLANS],
  APIMethodHandler({ patch, del })
);
