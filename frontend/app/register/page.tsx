'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Mail, LockKeyhole, Zap, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-config';
import { setAuthData } from '@/lib/auth';

type Message = {
  type: 'success' | 'error' | 'info';
  text: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
      });

      const body = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Registration successful! Redirecting to onboarding...` });
        
        // Auto-login after registration
        const loginForm = new URLSearchParams();
        loginForm.append('username', email);
        loginForm.append('password', password);

        const loginResponse = await fetch(`${API_BASE_URL}/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginForm.toString(),
        });

        if (loginResponse.ok) {
          const loginBody = await loginResponse.json();
          setAuthData(loginBody.access_token, loginBody.user_id);
          
          // Redirect to onboarding
          setTimeout(() => {
            router.push('/onboarding');
          }, 1000);
        } else {
          // If auto-login fails, redirect to login
          setMessage({ type: 'success', text: 'Registration successful! Please log in.' });
          setTimeout(() => {
            router.push('/?view=login');
          }, 2000);
        }
      } else {
        throw new Error(body.detail || 'Registration failed. Email might be in use.');
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen veridia-bg text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .veridia-bg {
          background: #0f172a;
          background-image: radial-gradient(at 0% 0%, #1e3a8a 0%, transparent 50%),
                            radial-gradient(at 100% 100%, #4c1d95 0%, transparent 50%);
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-extrabold text-white flex items-center cursor-pointer group"
          >
            <Zap className="w-6 h-6 mr-2 text-indigo-400 transition-transform group-hover:scale-110" />
            Veridia<span className="text-indigo-400">App</span>
          </button>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="text-indigo-300 hover:text-white transition duration-200 text-sm"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Registration Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center items-start">
          <div className="bg-gray-800/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-500 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <UserPlus className="w-6 h-6 mr-3 text-indigo-400" />
                Create Your Account
              </h2>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`p-3 my-4 rounded-xl border-l-4 ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800 border-green-400'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-800 border-red-400'
                    : 'bg-blue-100 text-blue-800 border-blue-400'
                } transition duration-300 ease-in-out transform`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                  />
                </div>
              </div>

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

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                />
              </div>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/80 text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Register
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-indigo-400 hover:text-indigo-300 transition duration-200 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900/80 border-t border-gray-700/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          &copy; 2024 VeridiaApp. Built with ❤️ for a more trustworthy internet. | MIT License
        </div>
      </footer>
    </div>
  );
}
