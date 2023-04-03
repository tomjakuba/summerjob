import { http_method_handler } from "lib/api/method_handler";
import { getUsers } from "lib/data/users";
import { NextApiRequest, NextApiResponse } from "next";

export type UsersAPIGetResponse = Awaited<ReturnType<typeof getUsers>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<UsersAPIGetResponse>
) {
  const users = await getUsers();
  res.status(200).json(users);
}

export default http_method_handler({ get: get });
