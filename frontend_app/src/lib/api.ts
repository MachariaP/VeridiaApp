/**
 * API utility functions for making authenticated requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    "/api/v1/auth/login",
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
  await apiRequest("/api/v1/auth/register", {
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
  return apiRequest<User>("/api/v1/auth/me");
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
  // Content service runs on port 8001
  const CONTENT_API_URL = process.env.NEXT_PUBLIC_CONTENT_API_URL || "http://localhost:8001";
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${CONTENT_API_URL}/api/v1/content/create`, {
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
  // Search service runs on port 8003
  const SEARCH_API_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || "http://localhost:8003";
  
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
    `${SEARCH_API_URL}/api/v1/search/?${queryParams.toString()}`
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
  // Search service runs on port 8003
  const SEARCH_API_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || "http://localhost:8003";
  
  try {
    const response = await fetch(`${SEARCH_API_URL}/api/v1/search/categories`);
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
  const CONTENT_API_URL = process.env.NEXT_PUBLIC_CONTENT_API_URL || "http://localhost:8001";
  
  const response = await fetch(`${CONTENT_API_URL}/api/v1/content/${contentId}`);
  
  if (!response.ok) {
    throw new Error("Content not found");
  }
  
  return response.json();
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
  const VERIFICATION_API_URL = process.env.NEXT_PUBLIC_VERIFICATION_API_URL || "http://localhost:8002";
  
  try {
    const response = await fetch(`${VERIFICATION_API_URL}/api/v1/verify/${contentId}/votes`);
    
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
  const VERIFICATION_API_URL = process.env.NEXT_PUBLIC_VERIFICATION_API_URL || "http://localhost:8002";
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${VERIFICATION_API_URL}/api/v1/verify/${contentId}/vote`, {
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
  const VERIFICATION_API_URL = process.env.NEXT_PUBLIC_VERIFICATION_API_URL || "http://localhost:8002";
  
  try {
    const response = await fetch(`${VERIFICATION_API_URL}/api/v1/verify/${contentId}/comments`);
    
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
  const VERIFICATION_API_URL = process.env.NEXT_PUBLIC_VERIFICATION_API_URL || "http://localhost:8002";
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${VERIFICATION_API_URL}/api/v1/verify/${contentId}/comments`, {
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
