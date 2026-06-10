'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  User,
  CreditCard,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ─── Breadcrumb helpers ─────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  upload: 'Upload Centre',
  evidence: 'Evidence Library',
  timeline: 'Timeline Builder',
  categories: 'Category Review',
  missing: 'Missing Information',
  duplicates: 'Duplicate Review',
  redaction: 'Redaction',
  'pdf-builder': 'PDF Builder',
  'pdf-preview': 'PDF Preview',
  downloads: 'Downloads',
  sharing: 'Sharing & Permissions',
  profile: 'Profile & Security',
  audit: 'Audit History',
  billing: 'Billing',
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let accumulated = '';

  for (const seg of segments) {
    accumulated += `/${seg}`;
    const label = ROUTE_LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: accumulated });
  }

  return crumbs;
}

// ─── Notification type icon ──────────────────────────────────────────────────

function NotifIcon({ type }: { type: 'info' | 'success' | 'warning' | 'error' }) {
  const map = {
    info: <Info className="w-4 h-4 text-blue-500" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };
  return map[type];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DashboardNav() {
  const { state, dispatch, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter((n) => !n.read).length;
  const breadcrumbs = buildBreadcrumbs(pathname ?? '');

  // Close dropdowns on outside click
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setNotifOpen(false);
    }
    if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
      setAvatarOpen(false);
    }
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  function markAllRead() {
    state.notifications.forEach((n) => {
      if (!n.read) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
      }
    });
  }

  function handleLogout() {
    setAvatarOpen(false);
    logout();
    router.push('/login');
  }

  const user = state.user;

  return (
    <header className="sticky top-0 z-40 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

      {/* ── Logo ── */}
      <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="10" cy="14" r="8" stroke="#2563EB" strokeWidth="2.5" fill="none" />
          <circle cx="18" cy="14" r="8" stroke="#2563EB" strokeWidth="2.5" fill="none" opacity="0.55" />
        </svg>
        <span className="font-semibold text-gray-900 dark:text-white text-[15px] tracking-tight hidden sm:block">
          Interlace
        </span>
      </Link>

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="flex-1 flex items-center gap-1 overflow-hidden min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* ── Right Controls ── */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setSearchOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          {searchOpen && (
            <div className="absolute right-0 top-10 w-72 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-3 z-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search evidence, projects…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {!searchQuery && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-1">
                  Type to search across your evidence and projects
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setAvatarOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center px-[3px] leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {state.notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications yet
                  </div>
                ) : (
                  state.notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                        n.read
                          ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                          : 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100/50 dark:hover:bg-blue-950/50'
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        <NotifIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm leading-snug',
                          n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'
                        )}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <Link
          href="/help"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* Avatar Dropdown */}
        <div ref={avatarRef} className="relative ml-1">
          <button
            onClick={() => { setAvatarOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            aria-label="User menu"
            aria-expanded={avatarOpen}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                {user ? getInitials(user.name) : 'U'}
              </div>
            )}
            <ChevronDown className={cn(
              'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
              avatarOpen && 'rotate-180'
            )} />
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user?.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                      {user ? getInitials(user.name) : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-gray-400" />
                  Profile &amp; Security
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  Billing
                </Link>

                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
