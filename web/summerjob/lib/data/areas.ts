import prisma from "lib/prisma/connection";

export async function getAreas() {
  return await prisma.area.findMany({
    where: {
      summerJobEvent: {
        isActive: true,
      },
    },
    include: {
      jobs: true,
    },
  });
}

export async function deleteArea(id: string) {
  await prisma.area.delete({
    where: {
      id,
    },
  });
}
