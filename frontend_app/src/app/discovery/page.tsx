"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { searchContent, getCategories, SearchResult, getAllContent, EnrichedContent, isAuthenticated } from "@/lib/api";

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
  const [showSearch, setShowSearch] = useState(false);
  
  // Feed state
  const [feedContent, setFeedContent] = useState<EnrichedContent[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'discussed'>('trending');
  
  const authenticated = isAuthenticated();

  useEffect(() => {
    // Fetch available categories and initial feed on mount
    const fetchInitialData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        
        // Fetch initial feed content
        await loadFeedContent('trending');
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchInitialData();
  }, []);
  
  const loadFeedContent = async (tab: 'trending' | 'recent' | 'discussed') => {
    setFeedLoading(true);
    setError("");
    try {
      let sortBy: 'most_voted' | 'recent' | 'most_commented' = 'most_voted';
      if (tab === 'recent') sortBy = 'recent';
      else if (tab === 'discussed') sortBy = 'most_commented';
      
      const content = await getAllContent({ limit: 20, sort_by: sortBy });
      setFeedContent(content);
      setActiveTab(tab);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load content";
      setError(errorMessage);
    } finally {
      setFeedLoading(false);
    }
  };

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
    setShowSearch(false);
  };

  // Render a content card (used for both feed and search results)
  const renderContentCard = (content: EnrichedContent | SearchResult, index: number) => {
    const isEnriched = 'total_votes' in content;
    const contentId = 'content_id' in content ? content.content_id : content.id;
    
    return (
      <Link
        key={contentId}
        href={`/content/${contentId}`}
        className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="p-5">
          {/* Header with user info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {content.created_by_username?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {content.created_by_username || "Anonymous"}
                </div>
                {content.created_at && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(content.created_at).toLocaleDateString()} • {new Date(content.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {content.category}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                content.status === "Verified" 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                  : content.status === "Disputed" 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" 
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              }`}>
                {content.status === "Verified" ? "✓" : content.status === "Disputed" ? "⚠" : "⏱"} {content.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {content.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {content.description}
          </p>

          {/* Engagement metrics */}
          {isEnriched && (
            <div className="flex items-center gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-base">💬</span>
                <span className="font-medium">{(content as EnrichedContent).comments_count || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-base">🗳️</span>
                <span className="font-medium">{(content as EnrichedContent).total_votes || 0}</span>
              </div>
              {(content as EnrichedContent).total_votes! > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className={`font-semibold ${
                    (content as EnrichedContent).verification_percentage! >= 70 
                      ? "text-green-600 dark:text-green-400" 
                      : (content as EnrichedContent).verification_percentage! >= 40 
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {(content as EnrichedContent).verification_percentage}% verified
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Discovery Feed
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Explore community-verified content • Stay informed • Join the discussion
          </p>
        </div>

        {/* Search Toggle Button */}
        {!hasSearched && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="mb-4 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium transition-all flex items-center gap-2"
          >
            <span>🔍</span>
            <span>{showSearch ? 'Hide Search' : 'Search Content'}</span>
          </button>
        )}

        {/* Enhanced Search Form */}
        {(showSearch || hasSearched) && (
          <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 animate-fadeIn">
            <div className="space-y-4">
              {/* Search Input */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for content..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest First)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all"
                >
                  Back to Feed
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {hasSearched && !loading && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Found <strong>{totalResults}</strong> result{totalResults !== 1 ? "s" : ""} in {searchTime}ms
            </div>
          </div>
        )}

        {/* Feed Tabs (only show when not searching) */}
        {!hasSearched && (
          <div className="flex items-center gap-1 mb-4 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => loadFeedContent('trending')}
              className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'trending'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => loadFeedContent('recent')}
              className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'recent'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ⚡ Recent
            </button>
            <button
              onClick={() => loadFeedContent('discussed')}
              className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'discussed'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              💬 Most Discussed
            </button>
          </div>
        )}

        {/* Loading State */}
        {(loading || feedLoading) && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {/* Feed Content or Search Results */}
        {!loading && !feedLoading && (
          <div className="space-y-4">
            {hasSearched ? (
              // Search Results
              searchResults.length > 0 ? (
                searchResults.map((result, index) => renderContentCard(result, index))
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No results found</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">Try different keywords or filters</p>
                </div>
              )
            ) : (
              // Feed Content
              feedContent.length > 0 ? (
                feedContent.map((content, index) => renderContentCard(content, index))
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No content yet</p>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Be the first to share verified content</p>
                  {authenticated && (
                    <Link href="/submit" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                      Submit Content
                    </Link>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
