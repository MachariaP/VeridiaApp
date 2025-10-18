'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, User, Lock, Shield, Bell, Palette, Globe, Trash2, Save, AlertTriangle } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// TypeScript Interfaces
interface ISettings {
  notifications_enabled: boolean;
  theme: 'light' | 'dark';
  language: string;
  privacy_posts: 'public' | 'followers' | 'private';
  privacy_profile: 'public' | 'private';
}

interface IAccountData {
  email: string;
  password: string;
  current_password: string;
}

type TabType = 'account' | 'privacy' | 'preferences';

// Settings Page Component
export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Account form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      const token = getToken();
      
      if (!token) {
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/settings/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  // Update settings
  const handleUpdateSettings = async (updates: Partial<ISettings>) => {
    const token = getToken();
    if (!token) return;

    try {
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`${API_BASE_URL}/settings/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(data);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Update account
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (password && password.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      const accountData: any = {
        current_password: currentPassword,
      };

      if (email) accountData.email = email;
      if (password) accountData.password = password;

      const response = await fetch(`${API_BASE_URL}/settings/account`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update account');
      }

      setSuccess('Account updated successfully!');
      setEmail('');
      setPassword('');
      setCurrentPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/settings/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear localStorage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => router.push('/dashboard-new')}
            className="text-2xl font-extrabold text-white flex items-center cursor-pointer group"
          >
            <span>Veridia</span><span className="text-indigo-400">App</span>
          </div>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="text-indigo-300 hover:text-white transition duration-200 text-sm flex items-center"
            >
              <User className="w-4 h-4 mr-1" />
              Profile
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-indigo-400" />
            Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Message Display */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg text-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === 'account'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === 'privacy'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === 'preferences'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Palette className="w-5 h-5" />
                <span>Preferences</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-indigo-400" />
                  Account Settings
                </h2>

                <form onSubmit={handleUpdateAccount} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Email (optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter new email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter new password (min 8 characters)"
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password (required)
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center transition"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Account
                  </button>
                </form>

                {/* Delete Account Section */}
                <div className="mt-12 pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center transition"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-red-300 font-semibold">Are you absolutely sure?</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                        >
                          Yes, Delete My Account
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && settings && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-indigo-400" />
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Who can see your posts?
                    </label>
                    <select
                      value={settings.privacy_posts}
                      onChange={(e) => handleUpdateSettings({ privacy_posts: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="public">Everyone</option>
                      <option value="followers">Followers Only</option>
                      <option value="private">Only Me</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Who can see your profile?
                    </label>
                    <select
                      value={settings.privacy_profile}
                      onChange={(e) => handleUpdateSettings({ privacy_profile: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="public">Everyone</option>
                      <option value="private">Only Me</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && settings && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Palette className="w-6 h-6 mr-2 text-indigo-400" />
                  Preferences
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        <Bell className="w-4 h-4 inline mr-2" />
                        Enable Notifications
                      </label>
                      <p className="text-xs text-gray-400 mt-1">
                        Receive notifications about your account activity
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ notifications_enabled: !settings.notifications_enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        settings.notifications_enabled ? 'bg-indigo-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleUpdateSettings({ theme: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleUpdateSettings({ language: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
