import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-foreground text-background shadow-md">
        <nav className="container mx-auto px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl md:text-2xl font-bold hover:opacity-80 transition-opacity">
                VeridiaApp
              </Link>
              <Link
                href="/discovery"
                className="text-sm md:text-base hover:opacity-80 transition-opacity"
              >
                Discover
              </Link>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md border border-background hover:bg-background hover:text-foreground transition-colors text-sm md:text-base"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md bg-background text-foreground hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                Register
              </Link>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
        {children}
      </main>
      
      <footer className="bg-foreground text-background py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm md:text-base">
          <p>&copy; {new Date().getFullYear()} VeridiaApp. Empowering Truth-Seekers.</p>
        </div>
      </footer>
    </div>
  );
}
