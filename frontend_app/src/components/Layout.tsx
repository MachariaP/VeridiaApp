"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { isAuthenticated, logout } from "@/lib/api";
import { HomeIcon, SearchIcon, PlusIcon, UserIcon, BellIcon } from "@/components/icons";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check authentication status on client side
    setIsLoggedIn(isAuthenticated());

    // Handle scroll for header shadow
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Enhanced Header with Scroll Effect */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg' 
            : 'bg-white dark:bg-gray-900 shadow-md'
        }`}
      >
        <nav className="container mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo & Primary Nav */}
            <div className="flex items-center gap-8">
              <Link 
                href="/" 
                className="text-xl md:text-2xl font-bold hover:opacity-80 transition-opacity flex items-center gap-2"
                style={{ color: '#0A7FFF' }}
              >
                <span className="text-2xl">✓</span>
                <span>VeridiaApp</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/discovery"
                  className="text-base font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#374151' }}
                >
                  Discover
                </Link>
                {isLoggedIn && (
                  <Link
                    href="/create"
                    className="text-base font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#374151' }}
                  >
                    Create
                  </Link>
                )}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all btn-hover"
                    style={{ 
                      color: '#0A7FFF',
                      border: '2px solid #0A7FFF'
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all btn-hover"
                    style={{ 
                      backgroundColor: '#0A7FFF',
                      color: 'white'
                    }}
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all btn-hover"
                    style={{ 
                      color: '#0A7FFF',
                      border: '2px solid #0A7FFF'
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all btn-hover"
                    style={{ 
                      backgroundColor: '#EF4444',
                      color: 'white'
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6 md:py-16">
        {children}
      </main>
      
      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl" style={{ color: '#0A7FFF' }}>✓</span>
                <span className="text-xl font-bold">VeridiaApp</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering truth-seekers with AI-assisted content verification 
                and community-driven fact-checking.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/discovery" className="hover:text-white transition-colors">
                    Discover
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-white transition-colors">
                    Create Content
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* About */}
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} VeridiaApp. Empowering Truth-Seekers Worldwide.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (iOS/Android style) */}
      {isLoggedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 shadow-lg">
          <div className="flex justify-around items-center px-4 py-2">
            <Link href="/" className="flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all hover:opacity-70">
              <HomeIcon size={24} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Home</span>
            </Link>
            <Link href="/discovery" className="flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all hover:opacity-70">
              <SearchIcon size={24} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Discover</span>
            </Link>
            <Link 
              href="/create" 
              className="flex flex-col items-center gap-1 p-2 min-w-[60px] -mt-6"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#0A7FFF' }}
              >
                <PlusIcon size={28} className="text-white" />
              </div>
              <span className="text-xs font-medium mt-1 text-gray-600 dark:text-gray-400">Create</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all hover:opacity-70 relative">
              <BellIcon size={24} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Activity</span>
              {/* Notification Badge */}
              <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all hover:opacity-70">
              <UserIcon size={24} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Profile</span>
            </Link>
          </div>
        </nav>
      )}
      
      {/* Add padding to body when mobile nav is visible */}
      {isLoggedIn && <div className="md:hidden h-20" />}
    </div>
  );
}
