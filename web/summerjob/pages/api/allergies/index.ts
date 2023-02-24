import { getAllergies } from "lib/data/allergies";
import { ApiErrorType } from "lib/data/api-error";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const allergies = await getAllergies();
    res.status(200).json(allergies);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}
