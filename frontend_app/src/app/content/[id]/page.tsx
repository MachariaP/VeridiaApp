"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import {
  isAuthenticated,
  getContentById,
  getVoteStats,
  submitVote,
  getComments,
  postComment,
  deleteComment,
  deleteContent,
  getCurrentUser,
  Content,
  VoteStats,
  Comment,
  User,
} from "@/lib/api";

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  const [content, setContent] = useState<Content | null>(null);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [votingLoading, setVotingLoading] = useState(false);
  
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const authenticated = isAuthenticated();

  useEffect(() => {
    fetchContentData();
    if (authenticated) {
      fetchCurrentUser();
    }
  }, [contentId, authenticated]);
  
  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchContentData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch content details using API utility
      const contentData = await getContentById(contentId);
      setContent(contentData);

      // Fetch vote statistics using API utility
      const voteData = await getVoteStats(contentId);
      if (voteData) {
        setVoteStats(voteData);
      }

      // Fetch comments using API utility
      const commentsData = await getComments(contentId);
      setComments(commentsData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load content";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote: boolean) => {
    if (!authenticated) {
      router.push("/login");
      return;
    }

    setVotingLoading(true);
    try {
      // Submit vote using API utility
      await submitVote(contentId, vote);
      setUserVote(vote);
      
      // Refresh vote stats
      const voteData = await getVoteStats(contentId);
      if (voteData) {
        setVoteStats(voteData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit vote";
      alert(errorMessage);
    } finally {
      setVotingLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      router.push("/login");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setCommentLoading(true);
    setCommentError("");

    try {
      // Post comment using API utility
      await postComment(contentId, newComment);
      setNewComment("");
      
      // Refresh comments
      const commentsData = await getComments(contentId);
      setComments(commentsData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to post comment";
      setCommentError(errorMessage);
    } finally {
      setCommentLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      await deleteComment(contentId, commentId);
      // Refresh comments
      const commentsData = await getComments(contentId);
      setComments(commentsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete comment";
      alert(errorMessage);
    }
  };
  
  const handleDeleteContent = async () => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteContent(contentId);
      alert("Content deleted successfully");
      router.push("/discovery");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete content";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg">Loading content...</p>
        </div>
      </Layout>
    );
  }

  if (error || !content) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded text-red-500">
            {error || "Content not found"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Content Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-foreground/10 text-sm">
                {content.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                content.status === "Verified" ? "bg-green-500/20 text-green-500" :
                content.status === "Disputed" ? "bg-red-500/20 text-red-500" :
                "bg-yellow-500/20 text-yellow-500"
              }`}>
                {content.status}
              </span>
            </div>
            {/* Delete button - show if user is content creator */}
            {currentUser && content.created_by_username === currentUser.username && (
              <button
                onClick={handleDeleteContent}
                className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
                title="Delete this content"
              >
                🗑️ Delete
              </button>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{content.title}</h1>
          <p className="text-sm opacity-70">
            Submitted by {content.created_by_username || "Anonymous"} • {new Date(content.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Content Details */}
        <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/20 mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="mb-4 whitespace-pre-wrap">{content.description}</p>
          
          <h2 className="text-lg font-semibold mb-2">Source</h2>
          <a
            href={content.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {content.source_url}
          </a>
        </div>

        {/* Voting Section */}
        <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/20 mb-6">
          <h2 className="text-lg font-semibold mb-4">Community Verification</h2>
          
          {voteStats && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{voteStats.total_votes}</div>
                <div className="text-sm opacity-70">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{voteStats.verified_votes}</div>
                <div className="text-sm opacity-70">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{voteStats.disputed_votes}</div>
                <div className="text-sm opacity-70">Disputed</div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={votingLoading || userVote === true}
              className={`flex-1 py-3 rounded-md font-medium transition-colors ${
                userVote === true
                  ? "bg-green-500 text-white"
                  : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {userVote === true ? "✓ Verified" : "Mark as Verified"}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={votingLoading || userVote === false}
              className={`flex-1 py-3 rounded-md font-medium transition-colors ${
                userVote === false
                  ? "bg-red-500 text-white"
                  : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {userVote === false ? "✓ Disputed" : "Mark as Disputed"}
            </button>
          </div>

          {!authenticated && (
            <p className="text-sm opacity-70 mt-3 text-center">
              Please <button onClick={() => router.push("/login")} className="underline">login</button> to vote
            </p>
          )}
        </div>

        {/* Discussion Section */}
        <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/20">
          <h2 className="text-lg font-semibold mb-4">Discussion ({comments.length})</h2>

          {/* Comment Form */}
          {authenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              {commentError && (
                <div className="mb-3 p-2 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
                  {commentError}
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-2 rounded-md border border-foreground/30 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/50 resize-y"
                rows={3}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs opacity-60">{newComment.length}/2000</span>
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="px-4 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded text-center">
              <button onClick={() => router.push("/login")} className="underline">
                Login to join the discussion
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center opacity-70 py-4">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-background rounded-lg border border-foreground/20">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="font-semibold">{comment.username}</span>
                      <span className="text-xs opacity-60 ml-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    {/* Delete button - show if user is comment author */}
                    {currentUser && comment.username === currentUser.username && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="px-2 py-1 rounded text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
