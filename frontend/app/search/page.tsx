'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, Filter, Tag, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const SEARCH_API_URL = 'http://localhost:8002/api/v1';

interface SearchResult {
  _id: string;
  content_id: string;
  author_id: string;
  content_url?: string;
  content_text?: string;
  tags: string[];
  status: string;
  submission_date: string;
  media_attachment?: string;
  _score: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const statusIcons: Record<string, React.ReactNode> = {
  verified: <CheckCircle className="w-5 h-5 text-green-500" />,
  false: <XCircle className="w-5 h-5 text-red-500" />,
  disputed: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  pending: <Clock className="w-5 h-5 text-gray-500" />,
};

const statusColors: Record<string, string> = {
  verified: 'bg-green-100 text-green-800',
  false: 'bg-red-100 text-red-800',
  disputed: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800',
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        page: page.toString(),
        per_page: '10',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (tagsFilter) {
        params.append('tags', tagsFilter);
      }

      const response = await fetch(`${SEARCH_API_URL}/search/query?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    performSearch();
  };

  useEffect(() => {
    if (query && page > 1) {
      performSearch();
    }
  }, [page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard-new')}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
              >
                VeridiaApp
              </button>
              <span className="text-gray-500">|</span>
              <h1 className="text-xl font-semibold text-gray-800">Search</h1>
            </div>
            <nav className="flex space-x-4">
              <button onClick={() => router.push('/dashboard-new')} className="text-gray-600 hover:text-gray-900">Home</button>
              <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">My Activity</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for content, claims, or topics..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="verified">Verified</option>
                      <option value="false">False</option>
                      <option value="disputed">Disputed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagsFilter}
                      onChange={(e) => setTagsFilter(e.target.value)}
                      placeholder="e.g., news, politics"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Summary */}
        {total > 0 && (
          <div className="mb-6 text-gray-600">
            Found <span className="font-semibold text-gray-900">{total}</span> results
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {results.map((result) => (
            <a
              key={result._id}
              href={`/content/${result.content_id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {statusIcons[result.status]}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[result.status]}`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(result.submission_date)}
                </div>
              </div>

              {result.content_text && (
                <p className="text-gray-800 mb-3 line-clamp-3">
                  {result.content_text}
                </p>
              )}

              {result.content_url && (
                <a
                  href={result.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm mb-3 block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.content_url}
                </a>
              )}

              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>

        {/* No Results */}
        {!isLoading && results.length === 0 && query && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
