/**
 * API utility functions for making authenticated requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiError {
  detail: string;
  status: number;
}

/**
 * Get the JWT token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

/**
 * Set the JWT token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

/**
 * Remove the JWT token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    
    // If unauthorized, remove token
    if (response.status === 401) {
      removeToken();
    }
    
    const error: ApiError = {
      detail: errorData.detail || "Request failed",
      status: response.status,
    };
    throw error;
  }

  return response.json();
}

/**
 * Login user and store token
 */
export async function login(username: string, password: string): Promise<void> {
  const data = await apiRequest<{ access_token: string; token_type: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }
  );
  
  setToken(data.access_token);
}

/**
 * Register new user
 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<void> {
  await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * Get current user profile
 */
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}

/**
 * Logout user
 */
export function logout(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// Content Service API Functions

/**
 * Content data interface
 */
export interface Content {
  id: string;
  title: string;
  source_url: string;
  description: string;
  category: string;
  status: string;
  user_id: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create new content
 */
export async function createContent(data: {
  title: string;
  source_url: string;
  description: string;
  category: string;
}): Promise<Content> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch('/api/content/create', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "Failed to submit content",
    }));
    
    if (response.status === 401) {
      removeToken();
    }
    
    throw new Error(errorData.detail || "Failed to submit content");
  }

  return response.json();
}

// Search Service API Functions

/**
 * Search result interface
 */
export interface SearchResult {
  content_id: string;
  title: string;
  description: string;
  source_url: string;
  category: string;
  status: string;
  created_by_username?: string;
  created_at?: string;
  score: number;
}

/**
 * Search response interface
 */
export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
  took_ms: number;
}

/**
 * Search for content
 */
export async function searchContent(params: {
  query: string;
  category?: string;
  sort_by?: string;
}): Promise<SearchResponse> {
  const queryParams = new URLSearchParams({
    query: params.query.trim(),
  });

  if (params.category) {
    queryParams.append("category", params.category);
  }

  if (params.sort_by) {
    queryParams.append("sort_by", params.sort_by);
  }

  const response = await fetch(
    `/api/search?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Search request failed");
  }

  return response.json();
}

/**
 * Get available content categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch('/api/search/categories');
    if (response.ok) {
      const data = await response.json();
      return data.categories || [];
    }
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }
  return [];
}

/**
 * Get content by ID
 */
export async function getContentById(contentId: string): Promise<Content> {
  const response = await fetch(`/api/content/${contentId}`);
  
  if (!response.ok) {
    throw new Error("Content not found");
  }
  
  return response.json();
}

/**
 * Content with enriched data (votes and comments count)
 */
export interface EnrichedContent extends Content {
  total_votes?: number;
  verified_votes?: number;
  disputed_votes?: number;
  verification_percentage?: number;
  comments_count?: number;
}

/**
 * Get all content with optional sorting
 */
export async function getAllContent(params?: {
  skip?: number;
  limit?: number;
  sort_by?: 'recent' | 'most_voted' | 'most_commented';
}): Promise<EnrichedContent[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip) queryParams.append("skip", params.skip.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const response = await fetch(
    `/api/content?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch content");
  }
  
  const contents: Content[] = await response.json();
  
  // Enrich with vote stats and comment counts
  const enrichedContents = await Promise.all(
    contents.map(async (content) => {
      try {
        // Fetch vote stats
        const voteStats = await getVoteStats(content.id);
        const comments = await getComments(content.id);
        
        return {
          ...content,
          total_votes: voteStats?.total_votes || 0,
          verified_votes: voteStats?.verified_votes || 0,
          disputed_votes: voteStats?.disputed_votes || 0,
          verification_percentage: voteStats?.verification_percentage || 0,
          comments_count: comments.length || 0,
        } as EnrichedContent;
      } catch {
        // If enrichment fails, return basic content
        return {
          ...content,
          total_votes: 0,
          verified_votes: 0,
          disputed_votes: 0,
          verification_percentage: 0,
          comments_count: 0,
        } as EnrichedContent;
      }
    })
  );
  
  // Sort if requested
  if (params?.sort_by === 'most_voted') {
    enrichedContents.sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0));
  } else if (params?.sort_by === 'most_commented') {
    enrichedContents.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
  } else if (params?.sort_by === 'recent') {
    enrichedContents.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }
  
  return enrichedContents;
}

// Verification Service API Functions

/**
 * Vote statistics interface
 */
export interface VoteStats {
  content_id: string;
  total_votes: number;
  verified_votes: number;
  disputed_votes: number;
  verification_percentage: number;
}

/**
 * Comment interface
 */
export interface Comment {
  id: number;
  username: string;
  comment: string;
  created_at: string;
}

/**
 * Get vote statistics for content
 */
export async function getVoteStats(contentId: string): Promise<VoteStats | null> {
  try {
    const response = await fetch(`/api/verify/${contentId}/votes`);
    
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.error("Failed to fetch vote stats:", err);
  }
  return null;
}

/**
 * Submit a vote for content
 */
export async function submitVote(contentId: string, vote: boolean): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`/api/verify/${contentId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ vote }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit vote");
  }
}

/**
 * Get comments for content
 */
export async function getComments(contentId: string): Promise<Comment[]> {
  try {
    const response = await fetch(`/api/verify/${contentId}/comments`);
    
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.error("Failed to fetch comments:", err);
  }
  return [];
}

/**
 * Post a comment on content
 */
export async function postComment(contentId: string, comment: string): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`/api/verify/${contentId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });

  if (!response.ok) {
    throw new Error("Failed to post comment");
  }
}

/**
 * Delete a comment (user can delete own comments)
 * Note: Backend endpoint needs to be implemented
 */
export async function deleteComment(contentId: string, commentId: number): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`/api/verify/${contentId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
}

/**
 * Delete content (user can delete own content)
 * Note: Backend endpoint needs to be implemented
 */
export async function deleteContent(contentId: string): Promise<void> {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`/api/content/${contentId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete content");
  }
}