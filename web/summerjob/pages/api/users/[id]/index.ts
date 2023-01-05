import { ApiErrorType } from "lib/data/apiError";
import { getUserById, modifyUser } from "lib/data/users";
import { WorkerSerializable, WorkerSerializableSchema } from "lib/types/worker";
import { NextApiRequest, NextApiResponse } from "next";

async function get(id: string, req: NextApiRequest, res: NextApiResponse) {
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

async function put(
  id: string,
  body: object,
  req: NextApiRequest,
  res: NextApiResponse
) {
  let workerData: WorkerSerializable;
  try {
    workerData = WorkerSerializableSchema.parse(body);
    await modifyUser(id, workerData);
  } catch (error) {
    res.status(400).json({
      error: {
        type: ApiErrorType.BAD_REQUEST,
        message: "Invalid input.",
      },
    });
    return;
  }
  res.status(204).end();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (req.method === "GET") {
    await get(id as string, req, res);
  } else if (req.method === "PUT") {
    await put(id as string, req.body, req, res);
  } else {
    res.status(405).end();
  }
}
