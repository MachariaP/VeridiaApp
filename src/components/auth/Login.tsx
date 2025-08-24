// src/components/auth/Login.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../utils/firebase';

interface LoginProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: (email: string) => void;
  setMessage: (msg: string, type: 'success' | 'error') => void;
}

const Login: React.FC<LoginProps> = ({ onToggleMode, onForgotPassword, onLoginSuccess, setMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('', 'success');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login successful! Welcome.', 'success');
      onLoginSuccess(userCredential.user.email || '');
    } catch (error: any) {
      setMessage(`Login failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('', 'success');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setMessage('Google login successful! Welcome.', 'success');
      onLoginSuccess(userCredential.user.email || '');
    } catch (error: any) {
      setMessage(`Google login failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
      {/* Logo Section */}
      <div className="flex justify-center mb-6">
        <img
          src="https://placehold.co/150x50/1d4ed8/ffffff?text=Chama+Hub+Logo"
          alt="Chama Hub Logo"
          className="rounded-lg"
        />
      </div>

      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Login to Chama Hub</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Google Login Button */}
      <div className="my-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">or continue with</p>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M23.518 12.247c0-.986-.086-1.896-.245-2.775H12.24v5.215h6.39c-.278 1.488-1.144 2.753-2.482 3.593v4.218h5.433c3.187-2.937 4.97-7.237 4.97-12.033z"
              fill="#4285F4"
            />
            <path
              d="M12.24 24c3.273 0 6.012-1.077 8.016-2.92l-5.433-4.218c-1.42 1.072-3.235 1.706-5.583 1.706-4.28 0-7.896-2.887-9.208-6.795H1.36v4.35C3.39 21.056 7.426 24 12.24 24z"
              fill="#34A853"
            />
            <path
              d="M3.032 14.885c-.297-.88-.466-1.815-.466-2.885s.169-2.005.466-2.885V4.76H1.36C.493 6.64.001 9.205.001 12s.492 5.36 1.359 7.24l1.673-2.355z"
              fill="#FBBC05"
            />
            <path
              d="M12.24 5.922c2.316 0 4.382.793 6.017 2.376L19.492 4.14C17.487 2.296 14.747 1 12.24 1c-4.814 0-8.85 2.944-10.887 7.76l1.672 2.355c1.312-3.908 4.928-6.795 9.215-6.795z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={onForgotPassword}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Forgot your password?
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;