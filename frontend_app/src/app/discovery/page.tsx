"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { searchContent, getCategories, SearchResult } from "@/lib/api";

export default function DiscoveryPage() {
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to perform search";
      setError(errorMessage);
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
        {/* Page Header */}
        <div className="mb-10 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Discover Verified Content
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Search and explore community-verified content across various topics
          </p>
        </div>

        {/* Enhanced Search Form */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md mb-8 animate-slideInFromLeft delay-100">
          <div className="space-y-5">
            {/* Search Input with Icon */}
            <div>
              <label htmlFor="search" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                🔍 Search Query
              </label>
              <input
                type="text"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter keywords to search..."
                className="w-full px-5 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg transition-all"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  📂 Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                <label htmlFor="sortBy" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  ⚡ Sort By
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest First)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-semibold transition-all btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: loading ? '#9CA3AF' : '#0A7FFF',
                  color: 'white',
                  boxShadow: loading ? 'none' : '0 4px 6px rgba(10, 127, 255, 0.25)'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Searching...
                  </span>
                ) : (
                  "Search Content"
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-8 py-4 rounded-lg border-2 font-semibold transition-all btn-hover disabled:opacity-50"
                style={{ 
                  borderColor: '#0A7FFF',
                  color: '#0A7FFF'
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 animate-shake">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {hasSearched && !loading && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                in {searchTime}ms
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {hasSearched && !loading && searchResults.length === 0 && !error && (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No results found</p>
            <p className="text-base text-gray-600 dark:text-gray-400">Try different keywords or remove filters</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl"></div>
            ))}
          </div>
        )}

        {/* Search Results - F-Pattern Layout */}
        {searchResults.length > 0 && !loading && (
          <div className="space-y-5 animate-fadeIn">
            {searchResults.map((result, index) => (
              <Link
                key={result.content_id}
                href={`/content/${result.content_id}`}
                className="block bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover-lift transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Top Bar - Status & Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      📂 {result.category}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      result.status === "Verified" 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                        : result.status === "Disputed" 
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" 
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}>
                      {result.status === "Verified" ? "✓" : result.status === "Disputed" ? "⚠" : "⏱"}
                      {result.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 hidden md:block">
                    Score: {result.score.toFixed(2)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {result.title}
                </h3>

                {/* Description */}
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                  {result.description}
                </p>

                {/* Footer - Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-2">
                    <span className="text-base">👤</span>
                    <span className="font-medium">{result.created_by_username || "Anonymous"}</span>
                  </span>
                  {result.created_at && (
                    <span className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <span>{new Date(result.created_at).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Getting Started Hint */}
        {!hasSearched && (
          <div className="mt-10 p-8 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl animate-fadeIn delay-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Search Tips</h3>
                <ul className="space-y-3 text-base text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Use <strong>specific keywords</strong> for better results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Filter by <strong>category</strong> to narrow your search</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Sort by <strong>relevance</strong> for most accurate matches</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Sort by <strong>date</strong> to see the latest content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Click on any result to view details and <strong>participate in discussions</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
