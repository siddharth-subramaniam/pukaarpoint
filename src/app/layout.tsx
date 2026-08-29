import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TriageBot from "@/components/TriageBot";

export const metadata: Metadata = {
  title: "PukaarPoint",
  description: "Raise it. Track it. Resolve it. — Your civic complaint and cybercrime reporting portal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <TriageBot />
      </body>
    </html>
  );
}
