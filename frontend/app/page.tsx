'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Lock, CheckCircle, AlertTriangle, Loader, Zap, Aperture, LockKeyhole, Mail } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-config';
import { setAuthData } from '@/lib/auth';

type ViewState = 'home' | 'login' | 'recover';

type Message = {
  type: 'success' | 'error' | 'info';
  text: string;
};

// --- UI Components ---

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-4">
    <Loader className="w-6 h-6 animate-spin text-indigo-400" />
  </div>
);

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

const FeatureCard: React.FC<{ icon: React.FC<any>, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 hover:border-indigo-500 transition duration-300 backdrop-blur-sm">
    <Icon className="w-8 h-8 text-indigo-400 mb-3" />
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </div>
);

const HeroSection: React.FC<{ onViewChange: (view: ViewState) => void }> = ({ onViewChange }) => {
  const router = useRouter();
  
  return (
    <div className="text-center py-16 px-4 md:px-8">
      <Aperture className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
        VeridiaApp: The Truth Engine
      </h1>
      <p className="text-xl text-indigo-200 mb-8 max-w-3xl mx-auto">
        Combat misinformation with collective intelligence and AI-powered verification. Join the community to submit, vote, and verify content authenticity in real time.
      </p>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/register')}
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
};

const AuthForm: React.FC<{ view: ViewState, onViewChange: (view: ViewState) => void, onMessage: (msg: Message | null) => void, onLoginSuccess: (token: string, userId: string) => void }> = ({ view, onViewChange, onMessage, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = view === 'login';
  const isRecover = view === 'recover';

  const title = isLogin ? 'Sign In to Veridia' : 'Recover Password';
  const Icon = isLogin ? LogIn : Lock;

  useEffect(() => {
    setEmail('');
    setPassword('');
    onMessage(null);
  }, [view, onMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onMessage(null);

    try {
      if (isLogin) {
        const form = new URLSearchParams();
        form.append('username', email);
        form.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        
        const body = await response.json();

        if (response.ok) {
          onLoginSuccess(body.access_token, body.user_id);
          onMessage({ type: 'success', text: 'Login successful! Redirecting to Dashboard...' });
        } else {
          throw new Error(body.detail || 'Invalid credentials or API error.');
        }
      } else if (isRecover) {
        await new Promise(resolve => setTimeout(resolve, 1500));
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
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
          />
        </div>

        {!isRecover && (
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : (
            <>
              {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
              {isLogin ? 'Sign In' : 'Send Recovery Link'}
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
        {isRecover && (
          <p className="text-gray-400">
            Remembered your password?{' '}
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


// --- Main Application Component ---

// --- Main Application Component ---

export default function App() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>('home');
  const [message, setMessage] = useState<Message | null>(null);

  const handleLoginSuccess = (token: string, userId: string) => {
    setAuthData(token, userId);
    window.location.href = '/dashboard-new';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const renderContent = () => {
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
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .veridia-bg {
          background: #0f172a;
          background-image: radial-gradient(at 0% 0%, #1e3a8a 0%, transparent 50%),
                            radial-gradient(at 100% 100%, #4c1d95 0%, transparent 50%);
        }
      `}</style>

      <div className="min-h-screen veridia-bg text-white">
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
              <button onClick={() => setView('login')} className="text-indigo-300 hover:text-white transition duration-200 text-sm">
                Sign In
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-200"
              >
                Join Now
              </button>
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
    </div>
  );
}
