"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use the login utility function which handles token storage
      await login(username, password);
      
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fadeIn">
        <div className="bg-foreground/5 p-6 md:p-8 rounded-lg border border-foreground/20">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Login</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
