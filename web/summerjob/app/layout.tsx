import "../styles/fonts/fontawesome/all.min.css";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

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
      <body>{children}</body>
    </html>
  );
}
