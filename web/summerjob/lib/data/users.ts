import prisma from "lib/prisma/connection";

export async function getUserById(id: string) {
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    include: {},
  });
  return user;
}
