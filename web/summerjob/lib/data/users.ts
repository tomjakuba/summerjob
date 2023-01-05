import { prisma } from "lib/prisma/connection";
import { WorkerSerializable } from "lib/types/worker";

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

export async function modifyUser(id: string, data: WorkerSerializable) {
  const user = await prisma.worker.update({
    where: {
      id,
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      allergies: {
        set: data.allergyIds.map((allergyId) => ({ id: allergyId })),
      },
    },
  });

  return user;
}
