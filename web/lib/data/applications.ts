import prisma from 'lib/prisma/connection'
import {
  ApplicationCreateDataInput,
  ApplicationUpdateDataInput,
} from 'lib/types/application'

export async function getApplications() {
  return prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function createApplication(data: ApplicationCreateDataInput) {
  return prisma.application.create({
    data,
  })
}

export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
  })
}

export async function updateApplication(
  id: string,
  data: ApplicationUpdateDataInput
) {
  return prisma.application.update({
    where: { id },
    data,
  })
}

export async function deleteApplication(id: string) {
  return prisma.application.delete({
    where: { id },
  })
}
