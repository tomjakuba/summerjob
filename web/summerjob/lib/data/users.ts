import prisma from "lib/prisma/connection";

export async function getUserById(id: string) {
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    include: {
      permissions: true,
    },
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.worker.findUnique({
    where: {
      email,
    },
    include: {
      permissions: true,
    },
  });
  return user;
}
