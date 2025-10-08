import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeridiaApp - Empowering Truth-Seekers",
  description: "A dynamic, mobile-first platform for truth-seekers, researchers, and content creators. Create, share, and discover verified, AI-assisted content through a community-driven ecosystem.",
  keywords: ["verification", "truth", "content", "fact-checking", "community", "AI-assisted"],
  authors: [{ name: "VeridiaApp Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A7FFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts (optional CDN) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inter font with system fallbacks */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}