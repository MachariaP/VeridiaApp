'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  // Pages that should not have the navigation layout
  const excludedPaths = ['/', '/register', '/onboarding'];
  const shouldShowNavigation = !excludedPaths.includes(pathname);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('userId');
      setUserId(uid);
    }
  }, []);

  if (!shouldShowNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userId={userId} />
      
      {/* Main Content Area with Sidebars */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
          {/* Left Sidebar Spacer - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3"></div>
          
          {/* Central Content */}
          <main className="lg:col-span-6">
            {children}
          </main>
          
          {/* Right Sidebar - Optional, can be used by pages */}
          <aside className="hidden lg:block lg:col-span-3">
            {/* Pages can use this space for widgets, trending, etc. */}
          </aside>
        </div>
      </div>
    </div>
  );
}
