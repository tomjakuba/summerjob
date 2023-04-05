import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { WrappedError } from "lib/data/api-error";
import { createArea, getAreas } from "lib/data/areas";
import { AreaCreateData, AreaCreateSchema } from "lib/types/area";
import { Permission } from "lib/types/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";

export type AreasAPIGetResponse = Awaited<ReturnType<typeof getAreas>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<AreasAPIGetResponse>
) {
  const areas = await getAreas();
  res.status(200).json(areas);
}

export type AreasAPIPostData = AreaCreateData;
export type AreasAPIPostResponse = Awaited<ReturnType<typeof createArea>>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<AreasAPIPostResponse | WrappedError<ApiError>>
) {
  const result = validateOrSendError(AreaCreateSchema, req.body, res);
  if (!result) {
    return;
  }
  result.summerJobEventId = req.query.eventId as string;
  const area = await createArea(result);
  res.status(201).json(area);
}

export default APIAccessController(
  [Permission.ADMIN],
  APIMethodHandler({ get, post })
);
