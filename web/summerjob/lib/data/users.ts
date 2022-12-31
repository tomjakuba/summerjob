import { prisma } from "lib/prisma/connection";

export async function getUsers() {
  const users = await prisma.worker.findMany({
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });
  return users;
}

export async function getUserById(id: string) {
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    include: {
      car: true,
      allergies: true,
    },
  });
  return user;
}

export async function getWorkersWithAbilities() {}
