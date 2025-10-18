'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Heart, MessageCircle, UserPlus, AlertCircle, Check, CheckCheck, User } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8005/api/v1';

// TypeScript Interfaces
interface INotification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  target?: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

// Get icon for notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case 'system':
      return <AlertCircle className="w-5 h-5 text-indigo-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

// Notifications Page Component
export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = getToken();
    
    if (!token) {
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      
      const unreadOnlyParam = filter === 'unread' ? '?unread_only=true' : '';
      const response = await fetch(`${API_BASE_URL}/notifications/${unreadOnlyParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationIds: string[]) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Refresh notifications
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      // Refresh notifications
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading notifications...</div>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Bell className="w-8 h-8 mr-3 text-indigo-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-400 mt-2">Stay updated with your activity</p>
          </div>

          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`pb-4 px-2 font-medium transition ${
              filter === 'all'
                ? 'border-b-2 border-indigo-500 text-indigo-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-4 px-2 font-medium transition ${
              filter === 'unread'
                ? 'border-b-2 border-indigo-500 text-indigo-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No notifications yet</p>
              <p className="text-gray-500 text-sm mt-2">
                When you get notifications, they'll show up here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl transition cursor-pointer ${
                  notification.is_read
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-indigo-900/30 border border-indigo-700/50 hover:bg-indigo-900/40'
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead([notification.id]);
                  }
                  // Navigate to target if available
                  if (notification.target) {
                    router.push(`/content/${notification.target}`);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Sender Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      {notification.sender.avatar ? (
                        <img
                          src={notification.sender.avatar}
                          alt={notification.sender.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <span className="font-semibold text-white">
                        {notification.sender.name}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Mark as read button */}
                  {!notification.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead([notification.id]);
                      }}
                      className="flex-shrink-0 text-indigo-400 hover:text-indigo-300 transition"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
