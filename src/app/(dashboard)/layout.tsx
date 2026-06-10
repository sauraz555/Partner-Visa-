'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import DashboardNav from '@/components/layout/DashboardNav';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const router = useRouter();

  // Guard: redirect to /login if not authenticated
  useEffect(() => {
    if (!state.isAuthenticated) {
      router.replace('/login');
    }
  }, [state.isAuthenticated, router]);

  // While checking auth, render nothing (avoids flash of content)
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          {/* Animated Interlace rings */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="animate-pulse"
            aria-hidden="true"
          >
            <circle cx="14" cy="20" r="11" stroke="#2563EB" strokeWidth="3" fill="none" />
            <circle cx="26" cy="20" r="11" stroke="#2563EB" strokeWidth="3" fill="none" opacity="0.45" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-600">Checking authentication…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* ── Sidebar ── */}
      <DashboardSidebar />

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Nav ── */}
        <DashboardNav />

        {/* ── Scrollable page content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
