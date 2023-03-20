import { http_method_handler } from "lib/api/method_handler";
import { deleteArea } from "lib/data/areas";
import { NextApiRequest, NextApiResponse } from "next";

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.areaId as string;
  await deleteArea(id);
  res.status(204).end();
}

export default http_method_handler({ del: del });
