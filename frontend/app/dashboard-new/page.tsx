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
  Zap,
  Menu,
  X as CloseIcon,
  TrendingUp,
  Users,
} from 'lucide-react';

// API Configuration
const CONTENT_API_URL = 'http://localhost:8001/api/v1';
const VOTING_API_URL = 'http://localhost:8003/api/v1';
const COMMENT_API_URL = 'http://localhost:8004/api/v1';

// TypeScript Interfaces
interface IAuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
}

interface IPostContent {
  text?: string;
  images?: string[];
  video?: string;
  createdAt: Date;
}

interface IPost {
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

interface INavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
}

interface IUser {
  id: string;
  name: string;
  avatar?: string;
}

// Navigation Items Configuration
const navItems: INavItem[] = [
  { label: 'Home', route: '/dashboard-new', icon: Home, requiresAuth: true },
  { label: 'Profile', route: '/profile', icon: User, requiresAuth: true },
  { label: 'Search', route: '/search', icon: Search, requiresAuth: true },
  { label: 'Notifications', route: '/notifications', icon: Bell, requiresAuth: true },
  { label: 'Messages', route: '/messages', icon: MessageSquare, requiresAuth: true },
  { label: 'Settings', route: '/settings', icon: Settings, requiresAuth: true },
];

// Status configuration
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

export default function DashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<IAuthState>({
    isAuthenticated: false,
    token: null,
    userId: null,
  });
  const [feedItems, setFeedItems] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Auth helpers
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

  // Logo navigation logic - Fix as per requirements
  const handleLogoClick = () => {
    if (auth.isAuthenticated && auth.token) {
      router.push('/dashboard-new');
    } else {
      router.push('/');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const token = getToken();
    const userId = getUserId();

    if (!token || !userId) {
      // Redirect to login with error message
      router.push('/?error=Please log in to continue');
      return;
    }

    setAuth({
      isAuthenticated: true,
      token,
      userId,
    });

    loadFeed(token);
  }, []);

  // Load feed data with pagination
  const loadFeed = async (token: string, pageNum: number = 1) => {
    setIsLoading(true);
    try {
      // Fetch content from search service
      const response = await fetch(
        `http://localhost:8002/api/v1/search/query?query=*&per_page=20&page=${pageNum}`
      );

      if (response.ok) {
        const data = await response.json();
        const items = data.results || [];

        // Load additional metadata for each item
        const itemsWithMetadata = await Promise.all(
          items.map(async (item: any) => {
            try {
              const [voteResponse, commentResponse] = await Promise.all([
                fetch(`${VOTING_API_URL}/votes/content/${item.content_id}/results`),
                fetch(`${COMMENT_API_URL}/comments/content/${item.content_id}`),
              ]);

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

        if (pageNum === 1) {
          setFeedItems(itemsWithMetadata);
        } else {
          setFeedItems((prev) => [...prev, ...itemsWithMetadata]);
        }

        setHasMore(items.length === 20);
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
    setAuth({ isAuthenticated: false, token: null, userId: null });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header/Navbar - Section A */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-2 cursor-pointer group"
                aria-label="VeridiaApp Home"
              >
                <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Veridia<span className="text-blue-600 dark:text-blue-400">App</span>
                </span>
              </button>
            </div>

            {/* Search Bar - Center */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search content, users, topics..."
                  onClick={() => router.push('/search')}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 cursor-pointer text-gray-900 dark:text-white placeholder-gray-500"
                  readOnly
                  aria-label="Search"
                />
              </div>
            </div>

            {/* Profile/Notifications Icons - Right */}
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/search')}
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Messages"
                aria-label="Messages"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-shadow"
                title="Profile"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebars */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
          {/* Left Sidebar - Section B */}
          <aside
            className={`lg:col-span-3 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 lg:bg-transparent z-40 w-64 lg:w-auto transform transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } lg:block overflow-y-auto`}
          >
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-end p-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-600 dark:text-gray-300"
                aria-label="Close menu"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 p-4 lg:p-0">
              {/* Mini-Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      User {auth.userId?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{auth.userId?.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-gray-500 dark:text-gray-400">Posts</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-gray-500 dark:text-gray-400">Votes</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-gray-500 dark:text-gray-400">Comments</p>
                  </div>
                </div>
              </div>

              {/* Primary Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.route === '/dashboard-new';
                  return (
                    <button
                      key={item.route}
                      onClick={() => router.push(item.route)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </nav>

              {/* Quick Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Quick Links
                </h3>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors w-full text-left"
                >
                  My Activity
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors w-full text-left"
                >
                  Settings
                </button>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Central Feed - Section C */}
          <main className="lg:col-span-6">
            {/* Create Post Prompt */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => router.push('/create-content')}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-left transition-colors group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                  What&apos;s on your mind?
                </span>
                <PlusCircle className="w-5 h-5 text-gray-400 ml-auto" />
              </button>
            </div>

            {/* Feed Items */}
            {isLoading && page === 1 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading feed...</p>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
                <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No content yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to submit content for verification!
                </p>
                <button
                  onClick={() => router.push('/create-content')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                    onClick={() => router.push(`/content/${item._id}`)}
                  >
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              User {item.author_id.slice(0, 8)}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.submission_date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {statusIcons[item.status]}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        {item.content_text && (
                          <p className="text-gray-800 dark:text-gray-200 mb-3 line-clamp-4 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {item.content_text}
                          </p>
                        )}
                        {item.content_url && (
                          <a
                            href={item.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.content_url}</span>
                          </a>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Engagement Metrics */}
                      <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/content/${item._id}`);
                          }}
                          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <ThumbsUp className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.vote_count || 0}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/content/${item._id}`);
                          }}
                          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.comment_count || 0}</span>
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-6">
                    <button
                      onClick={() => {
                        const nextPage = page + 1;
                        setPage(nextPage);
                        if (auth.token) loadFeed(auth.token, nextPage);
                      }}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - Section D */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-6">
              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Trending Topics</span>
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/search?q=technology')}
                    className="block w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">#Technology</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">125 posts</p>
                  </button>
                  <button
                    onClick={() => router.push('/search?q=health')}
                    className="block w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">#Health</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">98 posts</p>
                  </button>
                  <button
                    onClick={() => router.push('/search?q=news')}
                    className="block w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">#News</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">87 posts</p>
                  </button>
                </div>
              </div>

              {/* Follow Suggestions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white mb-4">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Active Contributors</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">User 1234</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">45 verifications</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">User 5678</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">38 verifications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">About VeridiaApp</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Combat misinformation through collective intelligence and AI-powered verification.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button (FAB) - Mobile */}
      <button
        onClick={() => router.push('/create-content')}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label="Create Post"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
