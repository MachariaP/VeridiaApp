/**
 * Main Feed Dashboard Page
 * 
 * This is the primary dashboard showing:
 * - All content feed with voting and comments
 * - Pagination support
 * - Create post functionality
 * 
 * Different from:
 * - /dashboard: User's personal activity (votes & comments only)
 * - /feed: Alternative feed view with different navigation layout
 * - /profile: Comprehensive user profile page
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  TrendingUp,
  Users,
  User,
} from 'lucide-react';
import { getToken, getUserId } from '@/lib/auth';
import { SEARCH_API_URL, VOTING_API_URL, COMMENT_API_URL } from '@/lib/api-config';
import { formatDate } from '@/lib/utils';

// TypeScript Interfaces
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
  const [feedItems, setFeedItems] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Initialize auth state and load feed
  useEffect(() => {
    const token = getToken();
    const uid = getUserId();

    if (!token || !uid) {
      router.push('/?error=Please log in to continue');
      return;
    }

    loadFeed(token);
  }, [router]);

  // Load feed data with pagination
  const loadFeed = async (token: string, pageNum: number = 1) => {
    setIsLoading(true);
    try {
      // Fetch content from search service
      const response = await fetch(
        `${SEARCH_API_URL}/search/query?query=*&per_page=20&page=${pageNum}`
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

  return (
    <>
      {/* Central Feed */}
      <div className="space-y-6">
        {/* Create Post Prompt */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
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
                    const token = getToken();
                    if (token) loadFeed(token, nextPage);
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
