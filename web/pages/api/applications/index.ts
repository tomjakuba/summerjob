import { APIAccessController } from 'lib/api/APIAccessControler'
import { APIMethodHandler } from 'lib/api/MethodHandler'
import { getApplications } from 'lib/data/applications'
import { Permission } from 'lib/types/auth'
import { NextApiRequest, NextApiResponse } from 'next'

export type ApplicationsAPIGetResponse = Awaited<
  ReturnType<typeof getApplications>
>

async function get(
  req: NextApiRequest,
  res: NextApiResponse<ApplicationsAPIGetResponse>
) {
  const applications = await getApplications()
  res.status(200).json(applications)
}

export default APIAccessController(
  [Permission.ADMIN],
  APIMethodHandler({ get })
)
