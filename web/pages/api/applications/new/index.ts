import { APIAccessController } from 'lib/api/APIAccessControler'
import { APIMethodHandler } from 'lib/api/MethodHandler'
import { parseFormWithImages } from 'lib/api/parse-form'
import { validateOrSendError } from 'lib/api/validator'
import { createApplication } from 'lib/data/applications'
import { ExtendedSession, Permission } from 'lib/types/auth'
import logger from 'lib/logger/logger'
import {
  ApplicationCreateSchema,
  ApplicationCreateDataInput,
} from 'lib/types/application'
import { NextApiRequest, NextApiResponse } from 'next'
import { APILogEvent } from 'lib/types/logger'

export type ApplicationAPIPostData = ApplicationCreateDataInput

async function post(
  req: NextApiRequest,
  res: NextApiResponse,
  session: ExtendedSession
) {
  const { files, json } = await parseFormWithImages(
    req,
    res,
    'app_photo',
    'uploads/applications',
    1
  )

  const applicationData = validateOrSendError(
    ApplicationCreateSchema,
    json,
    res
  )
  if (!applicationData) return

  const application = await createApplication(applicationData)

  await logger.apiRequestWithoutSession(
    APILogEvent.APPLICATION_CREATE,
    'applications',
    application
  )

  res.status(201).json(application)
}

export default APIMethodHandler({ post })

export const config = {
  api: {
    bodyParser: false,
  },
}
