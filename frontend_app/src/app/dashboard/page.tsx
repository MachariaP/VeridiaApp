"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { getCurrentUser, isAuthenticated, logout, User } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Route guard: Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        const err = error as { detail?: string; status?: number };
        setError(err.detail || "Failed to load profile");
        // If unauthorized, redirect to login
        if (err.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error && !user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded text-red-500">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-sm md:text-base"
          >
            Logout
          </button>
        </div>

        {user && (
          <div className="bg-foreground/5 p-6 md:p-8 rounded-lg border border-foreground/20 mb-6 animate-fadeIn delay-100">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Username:</span>{" "}
                <span className="opacity-80">{user.username}</span>
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                <span className="opacity-80">{user.email}</span>
              </div>
              <div>
                <span className="font-medium">User ID:</span>{" "}
                <span className="opacity-80">{user.id}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className={user.is_active ? "text-green-500" : "text-red-500"}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/20 hover-lift animate-slideInFromLeft delay-200">
            <h3 className="text-lg font-semibold mb-2">Content Discovery</h3>
            <p className="text-sm opacity-70 mb-4">
              Explore verified content from the community
            </p>
            <Link
              href="/discovery"
              className="block w-full px-4 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity text-center"
            >
              Browse Content
            </Link>
          </div>

          <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/20 hover-lift animate-slideInFromRight delay-300">
            <h3 className="text-lg font-semibold mb-2">Submit Content</h3>
            <p className="text-sm opacity-70 mb-4">
              Share content for community verification
            </p>
            <Link
              href="/create"
              className="block w-full px-4 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity text-center"
            >
              Create New
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-foreground/5 p-6 rounded-lg border border-foreground/20">
          <h3 className="text-lg font-semibold mb-2">Welcome to VeridiaApp!</h3>
          <p className="text-sm opacity-70">
            Your central hub for verified content discovery and community engagement.
            Use the dashboard to explore content, participate in discussions, and submit
            new content for verification.
          </p>
        </div>
      </div>
    </Layout>
  );
}
