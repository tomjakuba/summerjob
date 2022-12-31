import { ApiErrorType } from "lib/data/apiError";
import { getUserById } from "lib/data/users";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({
      error: {
        type: ApiErrorType.BAD_REQUEST,
        message: "Invalid ID provided.",
      },
    });
    return;
  }
  try {
    const user = await getUserById(id);
    if (!user) {
      res.status(404);
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}
