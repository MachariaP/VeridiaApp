'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MessageCircle,
  ThumbsUp,
  Search,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { getToken, getUserId, clearAuthData } from '@/lib/auth';
import { VOTING_API_URL, COMMENT_API_URL } from '@/lib/api-config';

interface UserVote {
  id: string;
  user_id: string;
  content_id: string;
  vote_type: string;
  reasoning?: string;
  voted_at: string;
}

interface UserComment {
  id: string;
  user_id: string;
  content_id: string;
  comment_text: string;
  created_at: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  authentic: <ThumbsUp className="w-5 h-5 text-green-500" />,
  false: <XCircle className="w-5 h-5 text-red-500" />,
  unsure: <AlertCircle className="w-5 h-5 text-yellow-500" />,
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'votes' | 'comments'>('votes');
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    const uid = getUserId();

    if (!token || !uid) {
      router.push('/');
      return;
    }

    setUserId(uid);
    loadUserData(token);
  }, [router]);

  const loadUserData = async (token: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Load user votes
      const votesResponse = await fetch(`${VOTING_API_URL}/votes/user/votes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setUserVotes(votesData);
      }

      // Load user comments
      const commentsResponse = await fetch(`${COMMENT_API_URL}/comments/user/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setUserComments(commentsData);
      }
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/search')}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
              <p className="text-gray-600">User ID: {userId?.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{userVotes.length}</div>
                <div className="text-sm text-gray-600">Votes Cast</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{userComments.length}</div>
                <div className="text-sm text-gray-600">Comments Made</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userVotes.length + userComments.length}
                </div>
                <div className="text-sm text-gray-600">Total Activity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('votes')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'votes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  My Votes ({userVotes.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === 'comments'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  My Comments ({userComments.length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your activity...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : activeTab === 'votes' ? (
              <div className="space-y-4">
                {userVotes.length === 0 ? (
                  <div className="text-center py-12">
                    <ThumbsUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No votes yet</h3>
                    <p className="text-gray-600 mb-6">Start verifying content to see your votes here</p>
                    <button
                      onClick={() => router.push('/search')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4" />
                      Search Content
                    </button>
                  </div>
                ) : (
                  userVotes.map((vote) => (
                    <button
                      key={vote.id}
                      onClick={() => router.push(`/content/${vote.content_id}`)}
                      className="block w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {statusIcons[vote.vote_type]}
                          <span className="font-medium text-gray-900 capitalize">{vote.vote_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(vote.voted_at)}
                        </div>
                      </div>
                      {vote.reasoning && (
                        <p className="text-gray-600 text-sm mt-2">{vote.reasoning}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        Content ID: {vote.content_id}
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {userComments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                    <p className="text-gray-600 mb-6">Join the discussion on content items</p>
                    <button
                      onClick={() => router.push('/search')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4" />
                      Search Content
                    </button>
                  </div>
                ) : (
                  userComments.map((comment) => (
                    <button
                      key={comment.id}
                      onClick={() => router.push(`/content/${comment.content_id}`)}
                      className="block w-full text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(comment.created_at)}
                      </div>
                      <div
                        className="text-gray-800 mb-2"
                        dangerouslySetInnerHTML={{ __html: comment.comment_text }}
                      />
                      <div className="text-xs text-gray-400">
                        Content ID: {comment.content_id}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
