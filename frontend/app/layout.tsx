import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeridiaApp - The Truth Engine",
  description: "Combat misinformation with collective intelligence and AI-powered verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
