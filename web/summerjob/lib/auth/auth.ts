import { UserSession } from "lib/types/auth";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export function toClientSession(session: Session): UserSession {
  if (!session.user) return { workerId: "", name: "" };
  return {
    workerId: "WorkerId here",
    name: session.user.email || "",
  };
}

export async function getClientSafeSession(): Promise<UserSession | null> {
  const session = await getSession();
  if (!session) return null;
  return toClientSession(session);
}
