import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { updateUser } from "lib/data/users";
import { Permission } from "lib/types/auth";
import { UserUpdateData, UserUpdateSchema } from "lib/types/user";
import { NextApiRequest, NextApiResponse } from "next";

export type UserAPIPatchData = UserUpdateData;
async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const userData = validateOrSendError(UserUpdateSchema, req.body, res);
  if (!userData) {
    return;
  }
  await updateUser(id, userData);
  res.status(204).end();
}

export default APIAccessController(
  [Permission.ADMIN],
  APIMethodHandler({ patch })
);
