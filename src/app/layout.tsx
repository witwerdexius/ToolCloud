import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ToolCloud – Leihen statt kaufen",
  description:
    "Die Plattform für Geräte- und Gegenstandsverleih in deiner Nachbarschaft.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
