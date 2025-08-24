// src/components/auth/AuthContainer.tsx
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

type AuthMode = 'login' | 'register' | 'forgotPassword';

const AuthContainer: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const handleToggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const handleForgotPassword = () => {
    setAuthMode('forgotPassword');
  };

  const handleBackToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-8 left-8">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Chama Hub</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Transparent group financial management</p>
      </div>
      
      {authMode === 'login' && (
        <Login onToggleMode={handleToggleMode} onForgotPassword={handleForgotPassword} />
      )}
      
      {authMode === 'register' && (
        <Register onToggleMode={handleToggleMode} />
      )}
      
      {authMode === 'forgotPassword' && (
        <ForgotPassword onBackToLogin={handleBackToLogin} />
      )}
    </div>
  );
};

export default AuthContainer;
