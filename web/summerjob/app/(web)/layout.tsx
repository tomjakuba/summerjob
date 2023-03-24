import { Navbar } from "../../lib/components/navbar/Navbar";
import "styles/bootstrap/css/bootstrap.min.css";
import "styles/custom.css";
import { getClientSafeSession } from "lib/auth/auth";

export default async function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClientSafeSession();
  return (
    <>
      <Navbar session={session} />
      <main>{children}</main>
    </>
  );
}
