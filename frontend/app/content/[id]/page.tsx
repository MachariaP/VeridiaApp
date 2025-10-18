'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  MessageCircle,
  Send,
  User,
  Calendar,
  Tag,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

const CONTENT_API_URL = 'http://localhost:8001/api/v1';
const VOTING_API_URL = 'http://localhost:8003/api/v1';
const COMMENT_API_URL = 'http://localhost:8004/api/v1';

interface Content {
  _id: string;
  author_id: string;
  content_url?: string;
  content_text?: string;
  tags: string[];
  status: string;
  submission_date: string;
  media_attachment?: string;
}

interface VoteResults {
  content_id: string;
  total_votes: number;
  authentic_count: number;
  false_count: number;
  unsure_count: number;
  authentic_percentage: number;
  false_percentage: number;
  unsure_percentage: number;
  verification_result: string;
}

interface Comment {
  id: string;
  user_id: string;
  content_id: string;
  parent_comment_id?: string;
  comment_text: string;
  is_deleted: boolean;
  created_at: string;
  replies: Comment[];
}

const statusIcons: Record<string, React.ReactNode> = {
  verified: <CheckCircle className="w-6 h-6 text-green-500" />,
  false: <XCircle className="w-6 h-6 text-red-500" />,
  disputed: <AlertCircle className="w-6 h-6 text-yellow-500" />,
  pending: <Clock className="w-6 h-6 text-gray-500" />,
};

const statusColors: Record<string, string> = {
  verified: 'bg-green-100 text-green-800 border-green-200',
  false: 'bg-red-100 text-red-800 border-red-200',
  disputed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params?.id as string;

  const [content, setContent] = useState<Content | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResults | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Voting state
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [voteReasoning, setVoteReasoning] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    if (contentId) {
      loadContent();
      loadVoteResults();
      loadComments();
    }
  }, [contentId]);

  const loadContent = async () => {
    // Note: This assumes content service has a GET endpoint
    // If not, we'll need to add it or get content from search service
    setIsLoading(true);
    setError('');
    
    try {
      // For now, we'll show a placeholder since the content service
      // doesn't have a GET endpoint yet
      setContent({
        _id: contentId,
        author_id: 'unknown',
        content_text: 'Content details would be loaded here...',
        tags: [],
        status: 'pending',
        submission_date: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVoteResults = async () => {
    try {
      const response = await fetch(`${VOTING_API_URL}/votes/content/${contentId}/results`);
      if (response.ok) {
        const data = await response.json();
        setVoteResults(data);
      }
    } catch (err) {
      console.error('Failed to load vote results:', err);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`${COMMENT_API_URL}/comments/content/${contentId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleVote = async (voteType: string) => {
    const token = getToken();
    if (!token) {
      alert('Please login to vote');
      router.push('/');
      return;
    }

    setIsVoting(true);
    try {
      const response = await fetch(`${VOTING_API_URL}/votes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_id: contentId,
          vote_type: voteType,
          reasoning: voteReasoning || undefined,
        }),
      });

      if (response.ok) {
        setSelectedVote(voteType);
        setVoteReasoning('');
        await loadVoteResults();
        alert('Vote submitted successfully!');
      } else if (response.status === 409) {
        alert('You have already voted on this content');
      } else {
        throw new Error('Failed to submit vote');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      alert('Please login to comment');
      router.push('/');
      return;
    }

    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const response = await fetch(`${COMMENT_API_URL}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_id: contentId,
          comment_text: newComment,
          parent_comment_id: null,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await loadComments();
      } else {
        throw new Error('Failed to submit comment');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setIsCommenting(false);
    }
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

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">User {comment.user_id.slice(0, 8)}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{formatDate(comment.created_at)}</span>
        </div>
        <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: comment.comment_text }} />
      </div>
      {comment.replies && comment.replies.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The content you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VeridiaApp
              </a>
            </div>
            <nav className="flex space-x-4">
              <a href="/search" className="text-gray-600 hover:text-gray-900">Search</a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-6">
            {statusIcons[content.status]}
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[content.status]}`}>
              {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
            </span>
            <div className="flex items-center gap-2 text-gray-500 text-sm ml-auto">
              <Calendar className="w-4 h-4" />
              {formatDate(content.submission_date)}
            </div>
          </div>

          {/* Content */}
          {content.content_text && (
            <div className="prose max-w-none mb-6">
              <p className="text-lg text-gray-800 leading-relaxed">{content.content_text}</p>
            </div>
          )}

          {content.content_url && (
            <a
              href={content.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
            >
              <ExternalLink className="w-4 h-4" />
              {content.content_url}
            </a>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Vote Results */}
        {voteResults && voteResults.total_votes > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Verification</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{voteResults.authentic_percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 mt-1">Authentic ({voteResults.authentic_count})</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{voteResults.false_percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 mt-1">False ({voteResults.false_count})</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{voteResults.unsure_percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 mt-1">Unsure ({voteResults.unsure_count})</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              Total votes: {voteResults.total_votes}
            </div>
          </div>
        )}

        {/* Voting Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => handleVote('authentic')}
              disabled={isVoting}
              className="p-6 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-center font-medium text-gray-900">Authentic</div>
            </button>
            <button
              onClick={() => handleVote('false')}
              disabled={isVoting}
              className="p-6 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-center font-medium text-gray-900">False</div>
            </button>
            <button
              onClick={() => handleVote('unsure')}
              disabled={isVoting}
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <HelpCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-center font-medium text-gray-900">Unsure</div>
            </button>
          </div>
          <textarea
            value={voteReasoning}
            onChange={(e) => setVoteReasoning(e.target.value)}
            placeholder="Optional: Explain your reasoning..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Discussion ({comments.length})
          </h2>

          {/* New Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              rows={4}
            />
            <button
              type="submit"
              disabled={isCommenting || !newComment.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Post Comment
            </button>
          </form>

          {/* Comments List */}
          <div>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
