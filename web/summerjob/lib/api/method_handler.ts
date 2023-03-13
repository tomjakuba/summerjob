import {
  ApiBadRequestError,
  ApiDbError,
  ApiInternalServerError,
} from "lib/data/api-error";
import { InternalError } from "lib/data/internal-error";
import { Prisma } from "lib/prisma/client";
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
          await handle(get, req, res);
          return;
        }
        break;
      case "POST":
        if (post) {
          await handle(post, req, res);
          return;
        }
        break;
      case "PATCH":
        if (patch) {
          await handle(patch, req, res);
          return;
        }
        break;
      case "DELETE":
        if (del) {
          await handle(del, req, res);
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

async function handle(
  func: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await func(req, res);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      res.status(500).json({
        error: new ApiDbError(),
      });
      return;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({
        error: new ApiBadRequestError(),
      });
      return;
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({
        error: new ApiBadRequestError(),
      });
      return;
    } else if (error instanceof InternalError) {
      console.error(error);
      res.status(500).json({
        error: new ApiInternalServerError(error.reason),
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      error: new ApiInternalServerError(),
    });
  }
}
