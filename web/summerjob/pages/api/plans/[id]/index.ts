import { ApiErrorType } from "lib/data/apiError";
import { getPlanById } from "lib/data/plans";
import { NextApiRequest, NextApiResponse } from "next";

async function get(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const plan = await getPlanById(id);
    if (!plan) {
      res.status(404).end();
      return;
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}

async function patch(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      error: {
        type: ApiErrorType.DB_CONNECT_ERROR,
        message: "Could not retrieve data from database.",
      },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (req.method === "GET") {
    await get(id as string, req, res);
  } else if (req.method === "PATCH") {
    await patch(id as string, req, res);
  } else {
    res.status(405).end();
  }
}
