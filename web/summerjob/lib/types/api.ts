import { NextApiRequest, NextApiResponse } from "next";

export type APIMethod = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
