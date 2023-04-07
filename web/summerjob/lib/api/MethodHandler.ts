import {
  ApiBadRequestError,
  ApiDbError,
  ApiInternalServerError,
} from "lib/data/api-error";
import { InternalError } from "lib/data/internal-error";
import { Prisma } from "lib/prisma/client";
import { APIMethod } from "lib/types/api";
import { NextApiRequest, NextApiResponse } from "next";

interface MethodHandlerProps {
  get?: APIMethod;
  post?: APIMethod;
  del?: APIMethod;
  patch?: APIMethod;
}

export function APIMethodHandler({
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
  func: APIMethod,
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
      // TODO: Replace with logging error
      if (process.env.NODE_ENV === "development") {
        console.error(error);
      }
      res.status(500).json({
        error: new ApiInternalServerError(error.reason),
      });
      return;
    }
    // TODO: Replace with logging error
    console.error(error);
    res.status(500).json({
      error: new ApiInternalServerError(),
    });
  }
}
