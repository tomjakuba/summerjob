import { Navbar } from "../lib/components/navbar/Navbar";
import "../styles/custom.css";
import "../styles/bootstrap/css/bootstrap.min.css";
import "../styles/fonts/fontawesome/fontawesome-all.min.css";

export const metadata = {
  title: "SummerJob Plánovač",
  description: "SummerJob Plánovač",
  author: "SummerJob",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
