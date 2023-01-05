import { Navbar } from "../lib/components/navbar/Navbar";
import "../styles/custom.css";
import "../styles/Navbar-With-Button-icons.css";
import "../styles/bootstrap/css/bootstrap.min.css";
import "../styles/fonts/fontawesome/fontawesome-all.min.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
