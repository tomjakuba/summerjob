import { ApiBadRequestError } from "lib/data/api-error";
import { NextApiResponse } from "next";
import { z } from "zod";

export function validateOrSendError<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  res: NextApiResponse
): z.infer<T> | undefined {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    res.status(400).json({
      error: new ApiBadRequestError(
        "Incorrect input values.",
        parsed.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
        }))
      ),
    });
    return undefined;
  }
  return parsed.data;
}
