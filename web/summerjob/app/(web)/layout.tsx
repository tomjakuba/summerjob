import { Navbar } from "../../lib/components/navbar/Navbar";
import "styles/bootstrap/css/bootstrap.min.css";
import "styles/custom.css";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
