import "./globals.css";
import type { ReactNode } from "react";
import SessionProvider from "@/components/auth/SessionProvider";

export const metadata = {
  title: "CivicLab",
  description: "Quick help desk",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
    <body className="h-full">
    <SessionProvider>
      {children}
    </SessionProvider>
    </body>
    </html>
  );
}
