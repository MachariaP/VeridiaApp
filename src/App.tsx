// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: '' });
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  const handleToggleMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'register' : 'login'));
    setMessage({ text: '', type: '' });
  };

  const handleForgotPassword = () => {
    setMode('forgot');
    setMessage({ text: '', type: '' });
  };

  const handleLoginSuccess = (email: string) => {
    setUser(email);
  };

  const setAppMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
  };

  const Message = ({ text, type }: { text: string; type: 'success' | 'error' }) => {
    if (!text) return null;
    const alertClass = type === 'success'
      ? 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'
      : 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    return (
      <div className={alertClass}>
        <p>{text}</p>
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
          {user ? (
            <div className="text-center p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
              <h2 className="text-2xl font-bold mb-4">Welcome, {user}!</h2>
              <p className="text-lg">You are successfully logged in.</p>
              <button
                onClick={() => setUser(null)}
                className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Message text={message.text} type={message.type} />
              <Routes>
                <Route
                  path="/login"
                  element={
                    <Login
                      onToggleMode={handleToggleMode}
                      onForgotPassword={handleForgotPassword}
                      onLoginSuccess={handleLoginSuccess}
                      setMessage={setAppMessage}
                    />
                  }
                />
                <Route
                  path="/register"
                  element={
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Register</h2>
                      <p className="text-center text-gray-600 dark:text-gray-300">
                        Register page (to be implemented).
                      </p>
                      <div className="mt-6 text-center">
                        <button
                          onClick={handleToggleMode}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          Go back to Login
                        </button>
                      </div>
                    </div>
                  }
                />
                <Route
                  path="/forgot"
                  element={
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Forgot Password</h2>
                      <p className="text-center text-gray-600 dark:text-gray-300">
                        Forgot Password page (to be implemented).
                      </p>
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setMode('login')}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          Go back to Login
                        </button>
                      </div>
                    </div>
                  }
                />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;