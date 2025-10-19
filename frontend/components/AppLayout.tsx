'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from './Navigation';
import { getUserId } from '@/lib/auth';

interface AppLayoutProps {
  children: React.ReactNode;
  rightSidebar?: ReactNode;
}

export default function AppLayout({ children, rightSidebar }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  // Pages that should not have the navigation layout
  const excludedPaths = ['/', '/register', '/onboarding'];
  const shouldShowNavigation = !excludedPaths.includes(pathname);

  useEffect(() => {
    const uid = getUserId();
    setUserId(uid);
    
    // Redirect to home if not authenticated (except for excluded paths)
    if (!uid && shouldShowNavigation) {
      router.push('/');
    }
  }, [pathname, shouldShowNavigation, router]);

  if (!shouldShowNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userId={userId} />
      
      {/* Main Content Area with Sidebars */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
          {/* Left Sidebar Spacer - Hidden on mobile, Navigation component handles the sidebar */}
          <div className="hidden lg:block lg:col-span-3"></div>
          
          {/* Central Content */}
          <main className="lg:col-span-6">
            {children}
          </main>
          
          {/* Right Sidebar - Optional, can be used by pages */}
          {rightSidebar ? (
            <aside className="hidden lg:block lg:col-span-3">
              {rightSidebar}
            </aside>
          ) : (
            <div className="hidden lg:block lg:col-span-3"></div>
          )}
        </div>
      </div>
    </div>
  );
}
