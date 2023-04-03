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
