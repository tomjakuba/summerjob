import "styles/bootstrap/css/bootstrap.min.css";
import "styles/custom.css";
import "styles/auth.css";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
