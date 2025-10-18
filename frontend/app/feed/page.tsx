'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  PlusCircle,
  ThumbsUp,
  MessageCircle,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Tag,
  ExternalLink,
} from 'lucide-react';

const CONTENT_API_URL = 'http://localhost:8001/api/v1';
const VOTING_API_URL = 'http://localhost:8003/api/v1';
const COMMENT_API_URL = 'http://localhost:8004/api/v1';

interface ContentItem {
  _id: string;
  author_id: string;
  content_url?: string;
  content_text?: string;
  tags: string[];
  status: string;
  submission_date: string;
  media_attachment?: string;
  vote_count?: number;
  comment_count?: number;
}

interface VoteResults {
  total_votes: number;
  authentic_count: number;
  false_count: number;
  unsure_count: number;
}

const statusIcons: Record<string, React.ReactNode> = {
  verified: <CheckCircle className="w-4 h-4 text-green-500" />,
  false: <XCircle className="w-4 h-4 text-red-500" />,
  disputed: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  pending: <Clock className="w-4 h-4 text-gray-500" />,
};

const statusColors: Record<string, string> = {
  verified: 'bg-green-100 text-green-800',
  false: 'bg-red-100 text-red-800',
  disputed: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800',
};

export default function FeedPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const getUserId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId');
    }
    return null;
  };

  useEffect(() => {
    const token = getToken();
    const uid = getUserId();

    if (!token || !uid) {
      router.push('/');
      return;
    }

    setUserId(uid);
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use the search API to get all content
      // In a production app, there would be a dedicated feed endpoint
      const response = await fetch(`http://localhost:8002/api/v1/search/query?query=*&per_page=20&page=1`);
      
      if (response.ok) {
        const data = await response.json();
        const items = data.results || [];
        
        // Load vote counts for each item
        const itemsWithCounts = await Promise.all(
          items.map(async (item: any) => {
            try {
              const voteResponse = await fetch(`${VOTING_API_URL}/votes/content/${item.content_id}/results`);
              const commentResponse = await fetch(`${COMMENT_API_URL}/comments/content/${item.content_id}`);
              
              let voteCount = 0;
              let commentCount = 0;
              
              if (voteResponse.ok) {
                const voteData = await voteResponse.json();
                voteCount = voteData.total_votes || 0;
              }
              
              if (commentResponse.ok) {
                const commentData = await commentResponse.json();
                commentCount = Array.isArray(commentData) ? commentData.length : 0;
              }
              
              return {
                ...item,
                _id: item.content_id,
                vote_count: voteCount,
                comment_count: commentCount,
              };
            } catch (err) {
              return {
                ...item,
                _id: item.content_id,
                vote_count: 0,
                comment_count: 0,
              };
            }
          })
        );
        
        setFeedItems(itemsWithCounts);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <a href="/feed" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VeridiaApp
              </a>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    onClick={() => router.push('/search')}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Navigation Icons */}
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/feed')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
                title="Home"
              >
                <Home className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/search')}
                className="text-gray-600 hover:text-gray-900 transition-colors md:hidden"
                title="Search"
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
              </button>
              <button
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Profile"
              >
                <User className="w-6 h-6" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Navigation */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-2">
              <a
                href="/feed"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </a>
              <a
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </a>
              <a
                href="/search"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </a>
              <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 w-full text-left">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 w-full text-left">
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
              <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 w-full text-left">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>

              {/* Create Post Button */}
              <button
                onClick={() => router.push('/create-content')}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6">
            {/* Create Post Card - Mobile */}
            <div className="lg:hidden mb-6 bg-white rounded-xl shadow-lg p-4">
              <button
                onClick={() => router.push('/create-content')}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>

            {/* Feed Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
              <p className="text-gray-600 mt-1">Discover and verify content from the community</p>
            </div>

            {/* Feed Items */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading feed...</p>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600 mb-6">Be the first to submit content for verification!</p>
                <button
                  onClick={() => router.push('/create-content')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Create Post</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {feedItems.map((item) => (
                  <article
                    key={item._id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              User {item.author_id.slice(0, 8)}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.submission_date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {statusIcons[item.status]}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        {item.content_text && (
                          <p className="text-gray-800 mb-3 line-clamp-4">
                            {item.content_text}
                          </p>
                        )}
                        {item.content_url && (
                          <a
                            href={item.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="truncate">{item.content_url}</span>
                          </a>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.slice(0, 5).map((tag) => (
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

                      {/* Engagement Metrics */}
                      <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => router.push(`/content/${item._id}`)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.vote_count || 0} Votes</span>
                        </button>
                        <button
                          onClick={() => router.push(`/content/${item._id}`)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.comment_count || 0} Comments</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Trending/Suggestions */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* User Info Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Welcome back!</p>
                    <p className="text-xs text-gray-500">ID: {userId?.slice(0, 8)}...</p>
                  </div>
                </div>
                <a
                  href="/dashboard"
                  className="block text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
                >
                  View Profile
                </a>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <a
                    href="/search"
                    className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    Explore Content
                  </a>
                  <a
                    href="/dashboard"
                    className="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
                  >
                    My Activity
                  </a>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">About VeridiaApp</h3>
                <p className="text-sm text-gray-600">
                  Combat misinformation through collective intelligence and AI-powered verification.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
