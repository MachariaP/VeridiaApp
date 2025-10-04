import Layout from "@/components/Layout";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
          Welcome to VeridiaApp
        </h1>
        <p className="text-base md:text-xl mb-6 md:mb-8 opacity-80">
          Empowering Truth-Seekers in a World of Information Overload
        </p>
        <p className="text-sm md:text-base mb-8 md:mb-12 opacity-70 max-w-2xl mx-auto">
          A dynamic, mobile-first platform designed for content verification, 
          fostering a community-driven ecosystem for truth-seekers, researchers, 
          and content creators.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 md:mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity font-medium text-base md:text-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-foreground hover:bg-foreground hover:text-background transition-colors font-medium text-base md:text-lg"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 text-left">
          <div className="p-4 md:p-6 rounded-lg border border-foreground/20">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Create & Verify</h3>
            <p className="text-sm md:text-base opacity-70">
              Tools for generating and verifying content with AI assistance
            </p>
          </div>
          <div className="p-4 md:p-6 rounded-lg border border-foreground/20">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Community</h3>
            <p className="text-sm md:text-base opacity-70">
              Collaborative features for discussions, voting, and real-time interactions
            </p>
          </div>
          <div className="p-4 md:p-6 rounded-lg border border-foreground/20">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Discover</h3>
            <p className="text-sm md:text-base opacity-70">
              Advanced search and recommendation engines powered by AI
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
