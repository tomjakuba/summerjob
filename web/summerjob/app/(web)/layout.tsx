import { NavbarServer } from "../../lib/components/navbar/NavbarServer";
import "styles/bootstrap/css/bootstrap.min.css";
import "styles/custom.css";
import { getClientSafeSession, getSMJSession } from "lib/auth/auth";

export default async function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSMJSession();
  return (
    <>
      <NavbarServer session={session} />
      <main>{children}</main>
    </>
  );
}
