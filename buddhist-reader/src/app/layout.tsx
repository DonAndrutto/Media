import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buddhist Text Reader",
  description: "A mindful reader for Buddhist texts in Tibetan, Sanskrit, and English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
