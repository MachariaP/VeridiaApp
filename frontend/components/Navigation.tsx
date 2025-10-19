'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Zap,
  Menu,
  X as CloseIcon,
  PlusCircle,
} from 'lucide-react';

interface NavigationProps {
  userId?: string | null;
}

interface NavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Home', route: '/dashboard-new', icon: Home },
  { label: 'Profile', route: '/dashboard', icon: User },
  { label: 'Search', route: '/search', icon: Search },
  { label: 'Notifications', route: '/notifications', icon: Bell },
  { label: 'Messages', route: '/messages', icon: MessageSquare },
  { label: 'Settings', route: '/settings', icon: Settings },
];

export default function Navigation({ userId }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    router.push('/');
  };

  const handleLogoClick = () => {
    router.push('/dashboard-new');
  };

  return (
    <>
      {/* Fixed Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-2 cursor-pointer group"
                aria-label="VeridiaApp Home"
              >
                <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Veridia<span className="text-blue-600 dark:text-blue-400">App</span>
                </span>
              </button>
            </div>

            {/* Search Bar - Center */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search content, users, topics..."
                  onClick={() => router.push('/search')}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 cursor-pointer text-gray-900 dark:text-white placeholder-gray-500"
                  readOnly
                  aria-label="Search"
                />
              </div>
            </div>

            {/* Profile/Notifications Icons - Right */}
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/search')}
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/notifications')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => router.push('/messages')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Messages"
                aria-label="Messages"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-shadow"
                title="Profile"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 lg:bg-transparent z-40 w-64 lg:w-auto transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:block overflow-y-auto`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-600 dark:text-gray-300"
            aria-label="Close menu"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 p-4 lg:p-0">
          {/* Mini-Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  User {userId?.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{userId?.slice(0, 8)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-gray-500 dark:text-gray-400">Posts</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-gray-500 dark:text-gray-400">Votes</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-gray-500 dark:text-gray-400">Comments</p>
              </div>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.route;
              return (
                <a
                  key={item.route}
                  href={item.route}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Quick Links */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-2">
              Quick Links
            </h3>
            <a
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              My Activity
            </a>
            <a
              href="/settings"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Settings
            </a>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Action Button (FAB) - Mobile */}
      <button
        onClick={() => router.push('/create-content')}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label="Create Post"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </>
  );
}
