import {
  deleteFile,
  getUploadDirForImagesForCurrentEvent,
  renameFile,
} from 'lib/api/fileManager'
import { PrismaTransactionClient } from 'lib/types/prisma'
import formidable from 'formidable'
import path from 'path'
import prisma from 'lib/prisma/connection'
import {
  ApplicationCreateDataInput,
  ApplicationUpdateDataInput,
} from 'lib/types/application'
import { getApplicationsUploadDir } from 'lib/api/fileManager'

export async function getApplications() {
  return prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
  })
}

export async function createApplication(
  data: ApplicationCreateDataInput,
  file: formidable.File | undefined = undefined,
  prismaClient: PrismaTransactionClient = prisma
) {
  let application

  try {
    application = await prismaClient.application.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        gender: data.gender,
        phone: data.phone,
        email: data.email.toLowerCase(),
        address: data.address,
        pastParticipation: data.pastParticipation,
        arrivalDate: data.arrivalDate,
        departureDate: data.departureDate,
        allergies: data.allergies,
        toolsSkills: data.toolsSkills,
        toolsBringing: data.toolsBringing,
        heardAboutUs: data.heardAboutUs,
        playsInstrument: data.playsInstrument,
        tShirtSize: data.tShirtSize,
        additionalInfo: data.additionalInfo,
        accommodationPrice: data.accommodationPrice,
        ownsCar: data.ownsCar,
        canBeMedic: data.canBeMedic,
        photo: '',
      },
    })
  } catch (error) {
    throw error
  }

  if (file) {
    try {
      const uploadDir = await getApplicationsUploadDir()

      const fileExtension = path.extname(file.originalFilename || '.png')
      const fileName = `${application.id}${fileExtension}`
      const photoPath = path.join(uploadDir, fileName)

      await renameFile(file.filepath, photoPath)

      const relativePath = path.normalize(photoPath.substring(uploadDir.length))

      const updatedApp = await prismaClient.application.update({
        where: { id: application.id },
        data: { photo: relativePath },
      })

      return updatedApp
    } catch (error) {
      throw error
    }
  }

  return application
}
export async function updateApplication(
  id: string,
  data: Partial<ApplicationUpdateDataInput> & { photoFileRemoved?: boolean },
  file?: formidable.File,
  prismaClient: PrismaTransactionClient = prisma
) {
  let photoPath = data.photo ?? ''

  if (file) {
    const uploadDir = await getApplicationsUploadDir()
    const fileExtension = path.extname(file.originalFilename || '.png')
    const fileName = `${id}${fileExtension}`
    photoPath = path.join(uploadDir, fileName)

    await renameFile(file.filepath, photoPath)

    const oldPhotoPath = await getApplicationPhotoPathById(id, prismaClient)
    if (oldPhotoPath) {
      await deleteFile(oldPhotoPath)
    }

    photoPath = path.normalize(photoPath.substring(uploadDir.length))
  } else if (data.photoFileRemoved) {
    const oldPhotoPath = await getApplicationPhotoPathById(id, prismaClient)
    if (oldPhotoPath) {
      await deleteFile(oldPhotoPath)
    }
    photoPath = ''
  }

  return prismaClient.application.update({
    where: { id },
    data: {
      ...data,
      photo: photoPath || undefined,
    },
  })
}

export async function deleteApplication(id: string) {
  return prisma.$transaction(async tx => {
    const applicationPhotoPath = await getApplicationPhotoPathById(id, tx)
    if (applicationPhotoPath) {
      await deleteFile(applicationPhotoPath)
    }

    return await tx.application.delete({
      where: { id },
    })
  })
}

export async function getApplicationPhotoPathById(
  id: string,
  prismaClient: PrismaTransactionClient = prisma
): Promise<string | null> {
  const application = await prismaClient.application.findUnique({
    where: { id },
    select: { photo: true },
  })

  if (!application || !application.photo) {
    return null
  }

  const uploadDirAbsolutePath = await getUploadDirForImagesForCurrentEvent()
  return path.join(uploadDirAbsolutePath, application.photo)
}
