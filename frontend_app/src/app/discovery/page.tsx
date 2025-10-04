"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { searchContent, getCategories, SearchResult } from "@/lib/api";

export default function DiscoveryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch available categories on mount
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      // Use the search utility function
      const data = await searchContent({
        query: query.trim(),
        category: category || undefined,
        sort_by: sortBy || undefined,
      });

      setSearchResults(data.results);
      setTotalResults(data.total);
      setSearchTime(data.took_ms);

    } catch (err: any) {
      setError(err.message || "Failed to perform search");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setCategory("");
    setSortBy("relevance");
    setSearchResults([]);
    setTotalResults(0);
    setHasSearched(false);
    setError("");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover Verified Content</h1>
          <p className="text-sm md:text-base opacity-70">
            Search and explore community-verified content across various topics
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-foreground/5 p-6 rounded-lg border border-foreground/20 mb-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Query
              </label>
              <input
                type="text"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter keywords to search..."
                className="w-full px-4 py-3 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50 text-lg"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category (Optional)
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium mb-2">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest First)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 rounded-md border border-foreground hover:bg-foreground hover:text-background transition-colors font-medium disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Search Results Info */}
        {hasSearched && !loading && (
          <div className="mb-4 text-sm opacity-70">
            Found {totalResults} result{totalResults !== 1 ? "s" : ""} in {searchTime}ms
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && searchResults.length === 0 && !error && (
          <div className="text-center py-12 bg-foreground/5 rounded-lg border border-foreground/20">
            <p className="text-lg mb-2">No results found</p>
            <p className="text-sm opacity-70">Try different keywords or remove filters</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((result) => (
              <Link
                key={result.content_id}
                href={`/content/${result.content_id}`}
                className="block bg-foreground/5 p-6 rounded-lg border border-foreground/20 hover:bg-foreground/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs bg-foreground/10">
                      {result.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === "Verified" ? "bg-green-500/20 text-green-500" :
                      result.status === "Disputed" ? "bg-red-500/20 text-red-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <span className="text-xs opacity-60">
                    Score: {result.score.toFixed(2)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 hover:underline">
                  {result.title}
                </h3>

                <p className="text-sm opacity-80 mb-3 line-clamp-2">
                  {result.description}
                </p>

                <div className="flex items-center justify-between text-xs opacity-60">
                  <span>
                    By {result.created_by_username || "Anonymous"}
                  </span>
                  {result.created_at && (
                    <span>
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Getting Started Hint */}
        {!hasSearched && (
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Search Tips</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>• Use specific keywords for better results</li>
              <li>• Filter by category to narrow your search</li>
              <li>• Sort by relevance for most accurate matches</li>
              <li>• Sort by date to see the latest content</li>
              <li>• Click on any result to view details and participate in discussions</li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
