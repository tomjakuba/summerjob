import { APIMethodHandler } from 'lib/api/MethodHandler'
import { parseFormWithImages } from 'lib/api/parse-form'
import { validateOrSendError } from 'lib/api/validator'
import { createApplication } from 'lib/data/applications'
import logger from 'lib/logger/logger'
import {
  ApplicationCreateSchema,
  ApplicationCreateDataInput,
} from 'lib/types/application'
import { NextApiRequest, NextApiResponse } from 'next'
import { APILogEvent } from 'lib/types/logger'
import { generateFileName } from 'lib/api/fileManager'
import { getApplicationsUploadDir } from 'lib/api/fileManager'

export type ApplicationAPIPostData = ApplicationCreateDataInput

async function post(req: NextApiRequest, res: NextApiResponse) {
  const temporaryName = generateFileName(30)
  const uploadDir = await getApplicationsUploadDir()
  const { files, json } = await parseFormWithImages(
    req,
    res,
    temporaryName,
    uploadDir,
    1
  )

  const applicationData = validateOrSendError(
    ApplicationCreateSchema,
    json,
    res
  )
  if (!applicationData) {
    return
  }
  const file = files?.photoFile
    ? Array.isArray(files.photoFile)
      ? files.photoFile[0]
      : files.photoFile
    : undefined
  const application = await createApplication(applicationData, file)

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
