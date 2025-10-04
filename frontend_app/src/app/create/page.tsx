"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { isAuthenticated, createContent } from "@/lib/api";

// Content categories for dropdown
const CATEGORIES = [
  "News",
  "Science",
  "Technology",
  "Health",
  "Politics",
  "Education",
  "Entertainment",
  "Other",
];

export default function CreateContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Route guard: Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate URL format
    try {
      new URL(sourceUrl);
    } catch {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      // Submit to content_service API using the utility function
      const data = await createContent({
        title,
        source_url: sourceUrl,
        description,
        category,
      });

      setSuccess("Content submitted successfully! Redirecting to content page...");
      
      // Clear form
      setTitle("");
      setSourceUrl("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      
      // Redirect to content detail page after a short delay
      setTimeout(() => {
        router.push(`/content/${data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit content");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Submit Content for Verification</h1>
          <p className="text-sm md:text-base opacity-70">
            Share content with the community for verification and discussion
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded text-green-500 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-foreground/5 p-6 md:p-8 rounded-lg border border-foreground/20">
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
                placeholder="Enter a descriptive title"
              />
              <p className="text-xs opacity-60 mt-1">{title.length}/200 characters</p>
            </div>

            <div>
              <label htmlFor="sourceUrl" className="block text-sm font-medium mb-2">
                Source URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="sourceUrl"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
                placeholder="https://example.com/article"
              />
              <p className="text-xs opacity-60 mt-1">
                Provide the original source of the content
              </p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50 resize-y"
                placeholder="Provide a detailed description of the content and why it should be verified"
              />
              <p className="text-xs opacity-60 mt-1">{description.length}/1000 characters</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-3 rounded-md border border-foreground hover:bg-foreground hover:text-background transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
          <h3 className="font-semibold mb-2">Content Submission Guidelines:</h3>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Ensure the source URL is valid and accessible</li>
            <li>Provide accurate and honest descriptions</li>
            <li>Choose the most appropriate category</li>
            <li>Content will undergo community and AI verification</li>
            <li>You can track verification status from your dashboard</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
