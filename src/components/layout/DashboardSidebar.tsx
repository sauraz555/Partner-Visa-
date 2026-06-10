'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Images,
  GitBranch,
  Tag,
  HelpCircle,
  Copy,
  Eye,
  FileText,
  Download,
  Users,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Check,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: (projectId: string) => string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

// ─── Navigation Structure ────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: () => '/dashboard', icon: LayoutDashboard, exact: true },
      { label: 'Projects', href: () => '/projects', icon: FolderOpen },
    ],
  },
  {
    heading: 'EVIDENCE',
    items: [
      { label: 'Upload Centre', href: (id) => `/projects/${id}/upload`, icon: Upload },
      { label: 'Evidence Library', href: (id) => `/projects/${id}/evidence`, icon: Images },
      { label: 'Timeline Builder', href: (id) => `/projects/${id}/timeline`, icon: GitBranch },
      { label: 'Category Review', href: (id) => `/projects/${id}/categories`, icon: Tag },
    ],
  },
  {
    heading: 'REVIEW',
    items: [
      { label: 'Missing Information', href: (id) => `/projects/${id}/missing`, icon: HelpCircle },
      { label: 'Duplicate Review', href: (id) => `/projects/${id}/duplicates`, icon: Copy },
      { label: 'Redaction', href: (id) => `/projects/${id}/redaction`, icon: Eye },
    ],
  },
  {
    heading: 'DOCUMENT',
    items: [
      { label: 'PDF Builder', href: (id) => `/projects/${id}/pdf-builder`, icon: FileText },
      { label: 'PDF Preview', href: (id) => `/projects/${id}/pdf-preview`, icon: Eye },
      { label: 'Downloads', href: (id) => `/projects/${id}/downloads`, icon: Download },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { label: 'Sharing & Permissions', href: (id) => `/projects/${id}/sharing`, icon: Users },
      { label: 'Profile & Security', href: () => '/profile', icon: Settings },
      { label: 'Audit History', href: (id) => `/projects/${id}/audit`, icon: History },
    ],
  },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Project Selector ─────────────────────────────────────────────────────────

function ProjectSelector({ collapsed }: { collapsed: boolean }) {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeProject = state.projects.find((p) => p.id === state.activeProjectId) ?? state.projects[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (collapsed) {
    return (
      <Tooltip label={activeProject?.title ?? 'Select project'}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-center py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-6 h-6 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {activeProject ? activeProject.title.charAt(0) : '?'}
          </div>
        </button>
      </Tooltip>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all text-left group"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {activeProject ? activeProject.title.charAt(0) : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight">
            {activeProject?.title ?? 'Select a project'}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight capitalize">
            {activeProject?.status ?? 'No project'}
          </p>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {state.projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
                  setOpen(false);
                  router.push(`/projects/${project.id}`);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  project.id === activeProject?.id && 'bg-blue-50 dark:bg-blue-950/30'
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {project.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{project.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate capitalize">{project.status}</p>
                </div>
                {project.id === activeProject?.id && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 p-2">
            <Link
              href="/projects/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar Component ───────────────────────────────────────────────────

export default function DashboardSidebar() {
  const { state, dispatch } = useApp();
  const pathname = usePathname() ?? '';
  const collapsed = state.sidebarCollapsed;

  const activeProjectId = state.activeProjectId ?? state.projects[0]?.id ?? 'proj-001';

  function isActive(item: NavItem): boolean {
    const href = item.href(activeProjectId);
    if (item.exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shadow-sm hover:shadow-md transition-all"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />
        }
      </button>

      {/* ── Project Selector ── */}
      <div className={cn('px-2 pt-3 pb-2', collapsed && 'px-1.5')}>
        <ProjectSelector collapsed={collapsed} />
      </div>

      {/* ── New Project Quick Action (expanded only) ── */}
      {!collapsed && (
        <div className="px-2 pb-2">
          <Link
            href="/projects/new"
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-dashed border-blue-200 dark:border-blue-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </Link>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-2 space-y-0.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-1">
            {/* Section heading */}
            {!collapsed && (
              <p className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-gray-400 dark:text-gray-600 uppercase select-none">
                {section.heading}
              </p>
            )}
            {collapsed && (
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-1 my-2" />
            )}

            {/* Nav items */}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                const href = item.href(activeProjectId);
                const Icon = item.icon;

                if (collapsed) {
                  return (
                    <li key={item.label}>
                      <Tooltip label={item.label}>
                        <Link
                          href={href}
                          className={cn(
                            'flex items-center justify-center w-full h-9 rounded-lg transition-all duration-150',
                            active
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <Icon className="w-4 h-4" />
                        </Link>
                      </Tooltip>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      className={cn(
                        'sidebar-link',
                        active && 'active'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className={cn(
                        'w-4 h-4 shrink-0',
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                      )} />
                      <span className="truncate">{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-300 dark:text-gray-700 text-center">
            Interlace © 2026 · v0.1.0
          </p>
        </div>
      )}
    </aside>
  );
}
