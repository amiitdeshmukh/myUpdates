import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Edge Coach",
  description: "Top updates, learning roadmap, and daily reminder."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
