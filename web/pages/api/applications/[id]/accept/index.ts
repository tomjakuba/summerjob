import { NextApiRequest, NextApiResponse } from 'next'
import { APIAccessController } from 'lib/api/APIAccessControler'
import { APIMethodHandler } from 'lib/api/MethodHandler'
import { Permission } from 'lib/types/auth'
import prisma from 'lib/prisma/connection'
import { ApplicationStatus } from 'lib/prisma/client'
import logger from 'lib/logger/logger'
import { APILogEvent } from 'lib/types/logger'
import { ExtendedSession } from 'lib/types/auth'

async function patch(
  req: NextApiRequest,
  res: NextApiResponse,
  session: ExtendedSession
) {
  const id = req.query.id as string

  const updated = await prisma.application.update({
    where: { id },
    data: { status: ApplicationStatus.ACCEPTED },
  })

  await logger.apiRequest(
    APILogEvent.APPLICATION_ACCEPTED,
    id,
    {
      status: ApplicationStatus.ACCEPTED,
      applicationId: id,
    },
    session
  )

  res.status(200).json(updated)
}

export default APIAccessController(
  [Permission.APPLICATIONS],
  APIMethodHandler({ patch })
)
