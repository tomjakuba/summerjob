import {
  getClientSafeSession,
  getSession,
  toClientSession,
} from "lib/auth/auth";
import { LoginClientTest } from "lib/components/auth/test";

export default async function LoginTest() {
  const userSession = await getClientSafeSession();
  return (
    <div>
      <h1>Test API</h1>
      <p>Session: {JSON.stringify(userSession)}</p>
      <LoginClientTest session={userSession} />
    </div>
  );
}
