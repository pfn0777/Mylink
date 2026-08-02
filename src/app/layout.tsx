import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BirJoyda",
  description: "Admin tool for link-in-bio pages and QR codes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
