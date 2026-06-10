'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Images,
  CheckCircle,
  AlertCircle,
  Copy,
  Upload,
  HelpCircle,
  FileText,
  Download,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Star,
  TriangleAlert,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { CATEGORY_META } from '@/lib/mock-data';
import { formatDateShort, cn } from '@/lib/utils';
import type { Project } from '@/lib/types';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name.split(' ')[0]} 👋`;
  if (hour < 17) return `Good afternoon, ${name.split(' ')[0]} 👋`;
  return `Good evening, ${name.split(' ')[0]} 👋`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateShort(dateStr);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colour: string;
  bg: string;
  custom: number;
}

function StatCard({ label, value, icon: Icon, colour, bg, custom }: StatCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={custom}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4"
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('w-5 h-5', colour)} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Category Coverage Bar ────────────────────────────────────────────────────

interface CoverageBarProps {
  label: string;
  pct: number;
  colour: string;
  warning?: string;
}

function CoverageBar({ label, pct, colour, warning }: CoverageBarProps) {
  return (
    <div className="flex items-center gap-3">
      <p className="w-36 text-xs font-medium text-gray-600 dark:text-gray-400 truncate shrink-0">{label}</p>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colour)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <p className={cn(
        'w-10 text-xs font-semibold text-right shrink-0',
        pct >= 80 ? 'text-emerald-600 dark:text-emerald-400'
          : pct >= 60 ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-500 dark:text-red-400'
      )}>
        {pct}%
      </p>
      {warning && (
        <TriangleAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      )}
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  custom: number;
}

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  active:    { pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', dot: 'bg-emerald-500' },
  draft:     { pill: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' },
  completed: { pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', dot: 'bg-blue-500' },
  archived:  { pill: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500', dot: 'bg-gray-300' },
};

// Mock category coverage per project — deterministic
const CATEGORY_PILLS = [
  { label: 'Financial', ok: true },
  { label: 'Household', ok: true },
  { label: 'Social', ok: true },
  { label: 'Commitment', ok: true },
  { label: 'Timeline', ok: false },
];

function ProjectCard({ project, custom }: ProjectCardProps) {
  const readyPct = project.evidenceCount > 0
    ? Math.round((project.readyCount / project.evidenceCount) * 100)
    : 0;

  const style = STATUS_STYLES[project.status] ?? STATUS_STYLES.draft;

  return (
    <motion.div
      variants={fadeInUp}
      custom={custom}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {project.title}
              </h3>
              <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', style.pill)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {project.applicantName} &amp; {project.partnerName}
            </p>
          </div>
        </div>

        {/* Evidence counts */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{project.readyCount}</span>
            <span className="text-gray-400 dark:text-gray-500">ready</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{project.needsInfoCount}</span>
            <span className="text-gray-400 dark:text-gray-500">needs info</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400">
            <Copy className="w-3.5 h-3.5" />
            <span className="font-semibold">{project.duplicateCount}</span>
            <span className="text-gray-400 dark:text-gray-500">duplicates</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-400 dark:text-gray-500">Evidence ready</span>
            <span className={cn(
              'text-[11px] font-semibold',
              readyPct >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                : readyPct >= 60 ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-500 dark:text-red-400'
            )}>
              {readyPct}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                readyPct >= 80 ? 'bg-emerald-500'
                  : readyPct >= 60 ? 'bg-amber-400'
                  : 'bg-red-400'
              )}
              style={{ width: `${readyPct}%` }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORY_PILLS.map((c) => (
            <span
              key={c.label}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                c.ok
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
              )}
            >
              {c.label}
              {c.ok ? ' ✓' : ' ⚠️'}
            </span>
          ))}
        </div>

        {/* Next action banner */}
        {project.needsInfoCount > 0 && (
          <div className="mb-4 flex items-center gap-2.5 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 flex-1 leading-snug">
              Confirm dates for {project.needsInfoCount} evidence items
            </p>
            <Link
              href={`/projects/${project.id}/missing`}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline whitespace-nowrap"
            >
              Fix now
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Updated {formatDateShort(project.updatedAt)}
          </p>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View project
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  iconBg: string;
  iconColour: string;
  custom: number;
}

function QuickActionCard({ label, description, icon: Icon, href, iconBg, iconColour, custom }: QuickActionProps) {
  return (
    <motion.div variants={fadeInUp} custom={custom}>
      <Link
        href={href}
        className="flex items-center gap-3.5 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 hover:-translate-y-0.5 transition-all duration-200 group"
      >
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('w-4.5 h-4.5', iconColour)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" />
      </Link>
    </motion.div>
  );
}

// ─── Recent Activity Item ─────────────────────────────────────────────────────

const ACTIVITY_EVENTS = [
  {
    id: 'act-1',
    icon: Upload,
    colour: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'You uploaded 12 files to Evidence Library',
    time: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'act-2',
    icon: CheckCircle,
    colour: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'Jane confirmed 3 captions in the Social category',
    time: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'act-3',
    icon: AlertCircle,
    colour: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: '18 items flagged as needing dates or locations',
    time: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'act-4',
    icon: Copy,
    colour: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: '9 duplicate groups detected by AI review',
    time: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'act-5',
    icon: FileText,
    colour: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'PDF draft generated — Relationship Evidence Profile v2',
    time: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'act-6',
    icon: Users,
    colour: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'You shared the project with migration agent Michael Chen',
    time: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// ─── Coverage Data ────────────────────────────────────────────────────────────

const COVERAGE_DATA = [
  { key: 'financial',          pct: 85, colour: 'bg-emerald-500' },
  { key: 'household',          pct: 72, colour: 'bg-amber-400' },
  { key: 'social',             pct: 91, colour: 'bg-emerald-500' },
  { key: 'commitment',         pct: 68, colour: 'bg-amber-400' },
  { key: 'communication',      pct: 78, colour: 'bg-blue-500' },
  { key: 'travel',             pct: 55, colour: 'bg-orange-400', warning: 'Low coverage' },
  { key: 'family_community',   pct: 62, colour: 'bg-orange-400' },
  { key: 'timeline_milestones',pct: 40, colour: 'bg-red-400', warning: 'Needs context for 3 periods' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { state } = useApp();
  const user = state.user;
  const projects = state.projects;

  const activeProject = useMemo(
    () => projects.find((p) => p.id === state.activeProjectId) ?? projects[0],
    [projects, state.activeProjectId]
  );

  const activeProjectId = activeProject?.id ?? 'proj-001';

  const totalEvidence = useMemo(() => projects.reduce((s, p) => s + p.evidenceCount, 0), [projects]);
  const totalReady    = useMemo(() => projects.reduce((s, p) => s + p.readyCount, 0), [projects]);
  const totalNeeds    = useMemo(() => projects.reduce((s, p) => s + p.needsInfoCount, 0), [projects]);
  const totalDups     = useMemo(() => projects.reduce((s, p) => s + p.duplicateCount, 0), [projects]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* ── Greeting ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} custom={0}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {user ? getGreeting(user.name) : 'Welcome back 👋'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s an overview of your partner visa evidence progress.
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          <StatCard
            label="Total Evidence"
            value={totalEvidence}
            icon={Images}
            colour="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950/40"
            custom={0}
          />
          <StatCard
            label="Ready to Include"
            value={totalReady}
            icon={CheckCircle}
            colour="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-50 dark:bg-emerald-950/40"
            custom={1}
          />
          <StatCard
            label="Needs Information"
            value={totalNeeds}
            icon={AlertCircle}
            colour="text-amber-600 dark:text-amber-400"
            bg="bg-amber-50 dark:bg-amber-950/40"
            custom={2}
          />
          <StatCard
            label="Duplicate Groups"
            value={totalDups}
            icon={Copy}
            colour="text-orange-600 dark:text-orange-400"
            bg="bg-orange-50 dark:bg-orange-950/40"
            custom={3}
          />
        </motion.div>
      </motion.div>

      {/* ── Active Projects ── */}
      <section>
        <motion.div
          variants={fadeInUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Active Projects</h2>
          <Link
            href="/projects"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            All projects <ExternalLink className="w-3 h-3" />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-4"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} custom={i} />
          ))}
        </motion.div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <motion.div
          variants={fadeInUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <QuickActionCard
            label="Upload Evidence"
            description="Add photos, screenshots, documents"
            icon={Upload}
            href={`/projects/${activeProjectId}/upload`}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColour="text-blue-600 dark:text-blue-400"
            custom={0}
          />
          <QuickActionCard
            label="Review Missing Info"
            description="Answer questions for flagged items"
            icon={HelpCircle}
            href={`/projects/${activeProjectId}/missing`}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            iconColour="text-amber-600 dark:text-amber-400"
            custom={1}
          />
          <QuickActionCard
            label="Build PDF Document"
            description="Compose your evidence document"
            icon={FileText}
            href={`/projects/${activeProjectId}/pdf-builder`}
            iconBg="bg-purple-50 dark:bg-purple-950/40"
            iconColour="text-purple-600 dark:text-purple-400"
            custom={2}
          />
          <QuickActionCard
            label="Download Latest PDF"
            description="Get your finalized document"
            icon={Download}
            href={`/projects/${activeProjectId}/downloads`}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColour="text-emerald-600 dark:text-emerald-400"
            custom={3}
          />
        </motion.div>
      </section>

      {/* ── Bottom grid: Activity + Coverage ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Recent Activity ── */}
        <motion.section
          variants={fadeInUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <Link
              href={`/projects/${activeProjectId}/audit`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View audit log →
            </Link>
          </div>

          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {ACTIVITY_EVENTS.map((event, i) => {
              const Icon = event.icon;
              return (
                <motion.li
                  key={event.id}
                  variants={fadeInUp}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3 px-5 py-3.5"
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', event.bg)}>
                    <Icon className={cn('w-4 h-4', event.colour)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{event.text}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">{timeAgo(event.time)}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.section>

        {/* ── Category Coverage ── */}
        <motion.section
          variants={fadeInUp}
          custom={1}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Category Coverage</h2>
            </div>
            <Link
              href={`/projects/${activeProjectId}/categories`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Review →
            </Link>
          </div>

          <div className="px-5 py-4 space-y-3">
            {COVERAGE_DATA.map((cat) => {
              const meta = CATEGORY_META[cat.key as keyof typeof CATEGORY_META];
              return (
                <CoverageBar
                  key={cat.key}
                  label={meta?.label ?? cat.key}
                  pct={cat.pct}
                  colour={cat.colour}
                  warning={cat.warning}
                />
              );
            })}
          </div>

          {/* Warning note */}
          <div className="mx-5 mb-4 flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
            <TriangleAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug">
              Timeline needs more context for 3 periods — consider adding travel or communication evidence.
            </p>
          </div>

          {/* Legend */}
          <div className="px-5 pb-4 flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> ≥ 80% strong</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 60–79% ok</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &lt; 60% low</span>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
