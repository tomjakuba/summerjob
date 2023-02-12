import { NextApiRequest, NextApiResponse } from "next";

interface MethodHandlerProps {
  get?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  post?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  del?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  patch?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
}

export function http_method_handler({
  get,
  post,
  patch,
  del,
}: MethodHandlerProps) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
      case "GET":
        if (get) {
          await get(req, res);
          return;
        }
        break;
      case "POST":
        if (post) {
          await post(req, res);
          return;
        }
        break;
      case "PATCH":
        if (patch) {
          await patch(req, res);
          return;
        }
        break;
      case "DELETE":
        if (del) {
          await del(req, res);
          return;
        }
        break;
      default:
        res.status(405).end();
        break;
    }
    res.status(405).end();
  };
}
