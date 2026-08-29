import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TriageBot from "@/components/TriageBot";

export const metadata: Metadata = {
  title: "National Cyber Crime Reporting Portal",
  description: "An official portal to safely and anonymously report cybercrime complaints.",
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
