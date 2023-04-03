import { z } from "zod";
import { Permission } from "./auth";
import { Serialized } from "./serialize";

export type UserComplete = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  blocked: boolean;
  deleted: boolean;
  permissions: Permission[];
};

const PermissionEnum = z.nativeEnum(Permission);
type PermissionEnum = z.infer<typeof PermissionEnum>;
export const UserUpdateSchema = z
  .object({
    blocked: z.boolean(),
    permissions: z.array(PermissionEnum),
  })
  .partial()
  .strict();

export type UserUpdateData = z.infer<typeof UserUpdateSchema>;

export function serializeUser(user: UserComplete): Serialized<UserComplete> {
  return { data: JSON.stringify(user) };
}

export function deserializeUser(
  serialized: Serialized<UserComplete>
): UserComplete {
  return JSON.parse(serialized.data);
}

export function serializeUsers(
  users: UserComplete[]
): Serialized<UserComplete[]> {
  return { data: JSON.stringify(users) };
}

export function deserializeUsers(
  serialized: Serialized<UserComplete[]>
): UserComplete[] {
  return JSON.parse(serialized.data);
}
