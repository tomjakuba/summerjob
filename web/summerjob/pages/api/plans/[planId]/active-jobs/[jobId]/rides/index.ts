import { http_method_handler } from "lib/api/method_handler";
import { WrappedError, ApiBadRequestError, ApiError } from "lib/data/api-error";
import { createRide } from "lib/data/rides";
import { RideCreateData, RideCreateSchema } from "lib/types/ride";
import { NextApiRequest, NextApiResponse } from "next";

export type RidesAPIPostData = RideCreateData;
export type RidesAPIPostResponse = Awaited<ReturnType<typeof createRide>>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<RidesAPIPostResponse | WrappedError<ApiError>>
) {
  const result = RideCreateSchema.safeParse({
    ...req.body,
  });
  if (!result.success) {
    res.status(400).json({
      error: new ApiBadRequestError(JSON.stringify(result.error.issues)),
    });
    return;
  }
  const ride = await createRide(result.data, req.query.jobId as string);
  res.status(201).json(ride);
}

export default http_method_handler({ post: post });
