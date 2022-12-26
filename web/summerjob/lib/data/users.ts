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

export async function getWorkersWithAbilities() {}
