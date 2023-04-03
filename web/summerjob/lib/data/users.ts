import { WorkerPermissions } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import { Permission } from "lib/types/auth";
import { UserComplete } from "lib/types/user";
import { cache_getActiveSummerJobEventId } from "./cache";

export async function getUserById(id: string): Promise<UserComplete | null> {
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  if (!user) return null;
  return databaseUserToUserComplete(user);
}

export async function getUserByEmail(
  email: string
): Promise<UserComplete | null> {
  const user = await prisma.worker.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  if (!user) return null;
  return databaseUserToUserComplete(user);
}

export async function getUsers(): Promise<UserComplete[]> {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) return [];
  const users = await prisma.worker.findMany({
    where: {
      deleted: false,
      registeredIn: {
        some: {
          id: activeEventId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  return users.map(databaseUserToUserComplete);
}

type DBUserComplete = Omit<UserComplete, "permissions"> & {
  permissions: WorkerPermissions;
};
function databaseUserToUserComplete(user: DBUserComplete): UserComplete {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    blocked: user.blocked,
    deleted: user.deleted,
    permissions: user.permissions.permissions as Permission[],
  };
}
