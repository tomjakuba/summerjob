import { getUsers } from "lib/data/users";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = await getUsers();
  res.status(200).json(users);
}
