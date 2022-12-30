import { ApiErrorType } from "lib/data/apiError";
import { getUsers } from "lib/data/users";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}
