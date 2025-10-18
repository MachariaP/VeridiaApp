'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { LogIn, UserPlus, Lock, CheckCircle, AlertTriangle, Loader, Zap, Aperture, User, LockKeyhole, Mail, FileText, Link as LinkIcon, Tag, Upload, Send, X } from 'lucide-react';

// --- Global Constants and API Configuration ---
// Note: In a real Next.js environment, these would be loaded from .env variables.
const API_BASE_URL = 'http://localhost:8000/api/v1'; // Placeholder for the User Service
const CONTENT_API_BASE_URL = 'http://localhost:8001/api/v1'; // Placeholder for the Content Service

// --- TypeScript Types ---

type AuthState = {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
};

type ViewState = 'home' | 'login' | 'register' | 'recover';

type Message = {
  type: 'success' | 'error' | 'info';
  text: string;
}

// --- Context for Auth State ---
const AuthContext = createContext<{ auth: AuthState, setAuth: React.Dispatch<React.SetStateAction<AuthState>> } | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Utility Functions ---

/**
 * Implements exponential backoff for API retries.
 * @param fn The fetch function to execute.
 * @param maxRetries Maximum number of retries.
 * @param delayInitial Initial delay in ms.
 */
const withBackoff = async (fn: () => Promise<Response>, maxRetries = 3, delayInitial = 1000): Promise<Response> => {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fn();
            if (response.status === 429 || response.status >= 500) {
                throw new Error(`Server error or rate limit hit: ${response.status}`);
            }
            return response;
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                const delay = delayInitial * Math.pow(2, attempt);
                // console.log(`Retry attempt ${attempt + 1}/${maxRetries}. Delaying for ${delay}ms...`); // Suppressing console logging as per instructions
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`API call failed after ${maxRetries} attempts: ${lastError?.message}`);
};

/**
 * Custom fetch wrapper to handle API calls with backoff.
 * @param endpoint The API path.
 * @param options Fetch options.
 * @param token Optional JWT token for authorization.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    return await withBackoff(() => fetch(url, options));
};


// --- UI Components ---

/**
 * Reusable loading spinner.
 */
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-4">
    <Loader className="w-6 h-6 animate-spin text-indigo-400" />
  </div>
);

/**
 * Displays global application messages (Success/Error/Info).
 */
const MessageDisplay: React.FC<{ message: Message | null }> = ({ message }) => {
  if (!message) return null;

  const classes = message.type === 'success'
    ? 'bg-green-100 text-green-800 border-green-400'
    : message.type === 'error'
      ? 'bg-red-100 text-red-800 border-red-400'
      : 'bg-blue-100 text-blue-800 border-blue-400';

  const Icon = message.type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div className={`p-3 my-4 rounded-xl border-l-4 ${classes} transition duration-300 ease-in-out transform`}>
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <p className="text-sm font-medium">{message.text}</p>
      </div>
    </div>
  );
};

/**
 * Main marketing and value proposition section.
 */
const HeroSection: React.FC<{ onViewChange: (view: ViewState) => void }> = ({ onViewChange }) => (
  <div className="text-center py-16 px-4 md:px-8">
    <Aperture className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
      VeridiaApp: The Truth Engine
    </h1>
    <p className="text-xl text-indigo-200 mb-8 max-w-3xl mx-auto">
      Combat misinformation with **collective intelligence and AI-powered verification**. Join the community to submit, vote, and verify content authenticity in real time.
    </p>

    <div className="flex justify-center space-x-4">
      <button
        onClick={() => onViewChange('register')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition duration-300 ease-out hover:scale-105 flex items-center group"
      >
        <UserPlus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
        Get Started - It&apos;s Free
      </button>
      <button
        onClick={() => onViewChange('login')}
        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition duration-300 ease-out hover:scale-105 flex items-center group"
      >
        <LogIn className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
        Sign In
      </button>
    </div>

    <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <FeatureCard icon={Zap} title="AI Grounding" description="Preliminary authenticity scoring using state-of-the-art NLP models." />
      <FeatureCard icon={LockKeyhole} title="Community Vetted" description="Democratic voting system where every voice contributes to the truth score." />
      <FeatureCard icon={Aperture} title="Full Transparency" description="See the full audit trail, sources, and voter breakdown for every claim." />
    </div>
  </div>
);

/**
 * Generic card for marketing features.
 */
const FeatureCard: React.FC<{ icon: React.FC<any>, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 hover:border-indigo-500 transition duration-300 backdrop-blur-sm">
    <Icon className="w-8 h-8 text-indigo-400 mb-3" />
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </div>
);

/**
 * Container for Login, Register, and Recovery forms.
 */
const AuthForm: React.FC<{ view: ViewState, onViewChange: (view: ViewState) => void, onMessage: (msg: Message | null) => void, onLoginSuccess: (token: string, userId: string) => void }> = ({ view, onViewChange, onMessage, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = view === 'login';
  const isRegister = view === 'register';
  const isRecover = view === 'recover';

  const title = isLogin ? 'Sign In to Veridia' : isRegister ? 'Create Your Account' : 'Recover Password';
  const Icon = isLogin ? LogIn : isRegister ? UserPlus : Lock;

  useEffect(() => {
    // Clear forms when view changes
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    onMessage(null); // Clear previous messages
  }, [view, onMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onMessage(null);

    try {
      let response: Response;
      let body: any;

      if (isLogin) {
        // Feature 1: Login (POST /auth/token)
        const form = new URLSearchParams();
        form.append('username', email); // FastAPI uses 'username' for the email in OAuth2PasswordRequestForm
        form.append('password', password);

        response = await apiFetch('/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        body = await response.json();

        if (response.ok) {
          // Token structure: { "access_token": "...", "refresh_token": "...", "token_type": "bearer", "user_id": "..." }
          onLoginSuccess(body.access_token, body.user_id);
          onMessage({ type: 'success', text: 'Login successful! Redirecting to Dashboard...' });
        } else {
          throw new Error(body.detail || 'Invalid credentials or API error.');
        }

      } else if (isRegister) {
        // Feature 1: Registration (POST /auth/register)
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        response = await apiFetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
        });
        body = await response.json();

        if (response.ok) {
          onMessage({ type: 'success', text: `Registration successful! Welcome, ${body.first_name}. Please log in.` });
          onViewChange('login');
        } else {
          throw new Error(body.detail || 'Registration failed. Email might be in use.');
        }

      } else if (isRecover) {
        // Feature 1: Password Recovery (POST /auth/recover - Simulated)
        // This endpoint logic is often complex and asynchronous. We simulate success here.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        onMessage({ type: 'info', text: 'If an account exists for that email, a recovery link has been sent.' });
      }

    } catch (error) {
      onMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition duration-500 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Icon className="w-6 h-6 mr-3 text-indigo-400" />
          {title}
        </h2>
        <button
          onClick={() => onViewChange('home')}
          className="text-indigo-400 hover:text-indigo-300 transition duration-200 text-sm font-medium"
        >
          &times; Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="firstName"
              icon={User}
              placeholder="First Name"
              value={firstName}
              onChange={setFirstName}
            />
            <InputField
              id="lastName"
              icon={User}
              placeholder="Last Name"
              value={lastName}
              onChange={setLastName}
            />
          </div>
        )}

        <InputField
          id="email"
          type="email"
          icon={Mail}
          placeholder="Email Address"
          value={email}
          onChange={setEmail}
          required
        />

        {!isRecover && (
          <InputField
            id="password"
            type="password"
            icon={LockKeyhole}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
          />
        )}

        {isRegister && (
          <InputField
            id="confirmPassword"
            type="password"
            icon={LockKeyhole}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            autoComplete="new-password"
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : (
            <>
              {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : isRegister ? <UserPlus className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
              {isLogin ? 'Sign In' : isRegister ? 'Register' : 'Send Recovery Link'}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        {isLogin && (
          <button
            onClick={() => onViewChange('recover')}
            className="text-indigo-400 hover:text-indigo-300 transition duration-200"
          >
            Forgot your password?
          </button>
        )}
        {(isRegister || isRecover) && (
          <p className="text-gray-400">
            {isRecover ? 'Remembered your password? ' : 'Already have an account? '}
            <button
              onClick={() => onViewChange('login')}
              className="text-indigo-400 hover:text-indigo-300 transition duration-200 font-semibold"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Reusable input field with icon.
 */
const InputField: React.FC<{
  id: string;
  type?: string;
  icon: React.FC<any>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}> = ({ id, type = 'text', icon: Icon, placeholder, value, onChange, required = false, autoComplete }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={autoComplete}
      className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
    />
  </div>
);

/**
 * Content Submission Form Component
 */
const ContentSubmissionForm: React.FC<{ onMessage: (msg: Message | null) => void }> = ({ onMessage }) => {
  const { auth } = useAuth();
  const [contentUrl, setContentUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onMessage(null);

    try {
      // Validate that at least one content field is provided
      if (!contentUrl && !contentText) {
        throw new Error('Please provide either a URL or text content to submit.');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      if (contentUrl) formData.append('content_url', contentUrl);
      if (contentText) formData.append('content_text', contentText);
      if (tags) formData.append('tags', tags);
      if (mediaFile) formData.append('media_file', mediaFile);

      // Submit to content service
      const response = await fetch(`${CONTENT_API_BASE_URL}/content/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onMessage({ type: 'success', text: 'Content submitted successfully! Your submission is now pending verification.' });
        // Clear form
        setContentUrl('');
        setContentText('');
        setTags('');
        setMediaFile(null);
        // Reset file input
        const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.detail || 'Failed to submit content.');
      }
    } catch (error) {
      onMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setContentUrl('');
    setContentText('');
    setTags('');
    setMediaFile(null);
    const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    onMessage(null);
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Send className="w-6 h-6 mr-3 text-indigo-400" />
          Submit Content for Verification
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-400 hover:text-indigo-300 transition duration-200 text-sm font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Content URL Input */}
            <div>
              <label htmlFor="content-url" className="block text-sm font-medium text-gray-300 mb-2">
                Content URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  id="content-url"
                  type="url"
                  placeholder="https://example.com/article-to-verify"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Provide the URL of content you want verified</p>
            </div>

            {/* Content Text Input */}
            <div>
              <label htmlFor="content-text" className="block text-sm font-medium text-gray-300 mb-2">
                Content Text
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-indigo-400" />
                <textarea
                  id="content-text"
                  placeholder="Paste the text content you want to verify..."
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={5}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200 resize-y"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Or paste the text content directly (max 10,000 characters)</p>
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  id="tags"
                  type="text"
                  placeholder="news, technology, health (comma-separated, max 20)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Add relevant tags to categorize your submission</p>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="media-file-input" className="block text-sm font-medium text-gray-300 mb-2">
                Media Attachment (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="media-file-input"
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-700/80 text-white border border-dashed border-gray-500 hover:border-indigo-500 rounded-xl cursor-pointer transition duration-200"
                >
                  <Upload className="w-5 h-5 mr-2 text-indigo-400" />
                  <span className="text-sm">
                    {mediaFile ? mediaFile.name : 'Choose file or drag here'}
                  </span>
                </label>
                {mediaFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null);
                      const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <input
                id="media-file-input"
                type="file"
                onChange={handleFileChange}
                accept=".txt,.jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-1">
                Supported: Images (.jpg, .png, .gif), Documents (.pdf, .txt) - Max 10MB
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit for Verification
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/**
 * Dashboard component for authenticated users with content submission.
 */
const Dashboard: React.FC<{ onLogout: () => void, onMessage: (msg: Message | null) => void }> = ({ onLogout, onMessage }) => {
  const { auth } = useAuth();

  return (
    <div className="min-h-screen flex flex-col p-8 bg-gray-900 text-white">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-400 mb-4 mx-auto" />
        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-lg text-gray-300 mb-2">
          You are authenticated as User ID: <span className="font-mono text-indigo-300">{auth.userId}</span>
        </p>
        <button
          onClick={onLogout}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition duration-300 ease-out hover:scale-105"
        >
          Sign Out
        </button>
      </div>

      {/* Content Submission Form */}
      <div className="flex-1 flex items-start justify-center">
        <ContentSubmissionForm onMessage={onMessage} />
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-gray-400 max-w-2xl mx-auto">
        <p className="mb-2">
          Submit content for community verification. Your submission will be reviewed by the community and AI systems.
        </p>
        <p>
          Make sure to provide accurate information to help maintain the integrity of the verification process.
        </p>
      </div>
    </div>
  );
};

// --- Main Application Component ---

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, userId: null, token: null });
  const [view, setView] = useState<ViewState>('home');
  const [message, setMessage] = useState<Message | null>(null);

  // Function to handle successful login from AuthForm
  const handleLoginSuccess = useCallback((token: string, userId: string) => {
    setAuth({ isAuthenticated: true, userId, token });
    setView('home'); // Go back to home view to show dashboard
  }, []);

  // Function to handle logout
  const handleLogout = useCallback(() => {
    setAuth({ isAuthenticated: false, userId: null, token: null });
    setMessage({ type: 'info', text: 'You have been successfully logged out.' });
    setView('home');
  }, []);

  // Effect for animation: Reset scroll position when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);


  const renderContent = () => {
    if (auth.isAuthenticated) {
      return <Dashboard onLogout={handleLogout} onMessage={setMessage} />;
    }

    if (view === 'home') {
      return <HeroSection onViewChange={setView} />;
    }

    return (
      <div className="flex justify-center items-start min-h-screen pt-20 pb-10 px-4">
        <AuthForm
          view={view}
          onViewChange={setView}
          onMessage={setMessage}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        /* Custom background gradient for aesthetics */
        .veridia-bg {
          background: #0f172a;
          background-image: radial-gradient(at 0% 0%, #1e3a8a 0%, transparent 50%),
                            radial-gradient(at 100% 100%, #4c1d95 0%, transparent 50%);
        }
      `}</style>

      <div className="min-h-screen veridia-bg text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div
              onClick={() => { setView('home'); setMessage(null); }}
              className="text-2xl font-extrabold text-white flex items-center cursor-pointer group"
            >
              <Zap className="w-6 h-6 mr-2 text-indigo-400 transition-transform group-hover:scale-110" />
              Veridia<span className="text-indigo-400">App</span>
            </div>
            <nav className="flex items-center space-x-4">
              {auth.isAuthenticated ? (
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-300 hidden sm:inline">User: {auth.userId ? auth.userId.substring(0, 8) + '...' : 'Unknown'}</span>
                  <button onClick={handleLogout} className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-xs font-semibold transition duration-200">
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setView('login')} className="text-indigo-300 hover:text-white transition duration-200 text-sm">
                    Sign In
                  </button>
                  <button onClick={() => setView('register')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-200">
                    Join Now
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <MessageDisplay message={message} />
          {renderContent()}
        </main>

        <footer className="bg-gray-900/80 border-t border-gray-700/50 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
            &copy; 2024 VeridiaApp. Built with ❤️ for a more trustworthy internet. | MIT License
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  );
}
