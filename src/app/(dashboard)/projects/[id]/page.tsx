'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { CATEGORY_META } from '@/lib/mock-data';
import type { EvidenceCategory, EvidenceFile } from '@/lib/types';
import { formatDate, formatDateShort, cn } from '@/lib/utils';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function IconDocumentText({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconPhotos({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  );
}

function IconDuplicate({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDERED_CATEGORIES: EvidenceCategory[] = [
  'financial',
  'household',
  'social',
  'commitment',
  'communication',
  'travel',
  'family_community',
  'timeline_milestones',
];

function getCategoryCount(evidence: EvidenceFile[], category: EvidenceCategory): number {
  return evidence.filter(
    (e) =>
      e.confirmedCategory === category ||
      e.suggestedCategory === category
  ).length;
}

function getCategoryCoverage(count: number): number {
  // 20 files = 100% coverage (arbitrary threshold)
  return Math.min(100, Math.round((count / 20) * 100));
}

function statusPillClasses(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'draft':
      return 'bg-gray-100 text-gray-600';
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    case 'archived':
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// ── Step Progress Tracker ─────────────────────────────────────────────────────

interface StepConfig {
  number: number;
  label: string;
  sublabel: string;
  state: 'done' | 'warning' | 'progress' | 'locked' | 'current';
  href?: string;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { getProject, getEvidence } = useApp();

  const project = getProject(projectId);
  const evidence = getEvidence(projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  const totalEvidence = evidence.length;
  const readyCount = evidence.filter((e) => e.status === 'ready' || e.status === 'approved').length;
  const needsInfoCount = evidence.filter(
    (e) =>
      e.status === 'needs_date' ||
      e.status === 'needs_location' ||
      e.status === 'needs_names' ||
      e.status === 'needs_explanation'
  ).length;
  const duplicateCount = evidence.filter((e) => e.status === 'possible_duplicate').length;
  const excludedCount = evidence.filter((e) => e.status === 'excluded').length;

  // Overall doc progress (based on ready evidence)
  const docProgress = totalEvidence > 0 ? Math.round((readyCount / totalEvidence) * 100) : 0;

  const steps: StepConfig[] = [
    {
      number: 1,
      label: 'Project Details',
      sublabel: 'Done',
      state: 'done',
      href: `/projects/${projectId}/details`,
    },
    {
      number: 2,
      label: 'Upload Evidence',
      sublabel: `${totalEvidence} files`,
      state: 'current',
      href: `/projects/${projectId}/upload`,
    },
    {
      number: 3,
      label: 'Confirm Information',
      sublabel: needsInfoCount > 0 ? `${needsInfoCount} items need attention` : 'All confirmed',
      state: needsInfoCount > 0 ? 'warning' : 'done',
      href: `/projects/${projectId}/missing`,
    },
    {
      number: 4,
      label: 'Review Document',
      sublabel: `${docProgress}% complete`,
      state: 'progress',
      href: `/projects/${projectId}/document`,
    },
    {
      number: 5,
      label: 'Download PDF',
      sublabel: 'Upcoming',
      state: 'locked',
    },
  ];

  const nextActions = [
    {
      label: `Confirm dates for ${needsInfoCount} evidence items`,
      href: `/projects/${projectId}/missing`,
      icon: '📅',
    },
    {
      label: `Review ${duplicateCount} possible duplicates`,
      href: `/projects/${projectId}/duplicates`,
      icon: '🔍',
    },
    {
      label: 'Upload more travel evidence for better timeline coverage',
      href: `/projects/${projectId}/upload`,
      icon: '✈️',
    },
  ];

  const quickLinks = [
    { label: 'Evidence Library', href: `/projects/${projectId}/evidence`, emoji: '🗂️' },
    { label: 'Timeline', href: `/projects/${projectId}/timeline`, emoji: '📅' },
    { label: 'Missing Info', href: `/projects/${projectId}/missing`, emoji: '⚠️' },
    { label: 'Duplicates', href: `/projects/${projectId}/duplicates`, emoji: '🔍' },
    { label: 'Document', href: `/projects/${projectId}/document`, emoji: '📄' },
    { label: 'Upload', href: `/projects/${projectId}/upload`, emoji: '⬆️' },
  ];

  // Reviewer comments (mocked — pulled from evidence reviewComments)
  const reviewerComments = evidence
    .flatMap((e) => (e.reviewComments || []).map((c) => ({ ...c, filename: e.originalFilename })))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                statusPillClasses(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {project.applicantName} &amp; {project.partnerName} &nbsp;·&nbsp; Last updated{' '}
            {formatDateShort(project.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href={`/projects/${projectId}/upload`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconUpload className="w-4 h-4" />
            Upload Evidence
          </Link>
          <Link
            href={`/projects/${projectId}/document`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <IconDocumentText className="w-4 h-4" />
            View Document
          </Link>
        </div>
      </div>

      {/* ── 5-Step Progress Tracker ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
          Progress
        </h2>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {steps.map((step, idx) => {
            const isDone = step.state === 'done';
            const isWarning = step.state === 'warning';
            const isCurrent = step.state === 'current' || step.state === 'progress';
            const isLocked = step.state === 'locked';

            const dotClasses = cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm transition-all',
              isDone && 'bg-emerald-500 text-white',
              isWarning && 'bg-amber-400 text-white',
              isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-100',
              isLocked && 'bg-gray-100 text-gray-400 border border-gray-200'
            );

            const cardContent = (
              <div
                className={cn(
                  'flex flex-col items-center text-center min-w-[120px] px-2',
                  isLocked && 'opacity-50'
                )}
              >
                <div className={dotClasses}>
                  {isDone ? (
                    <IconCheck className="w-4 h-4" />
                  ) : isLocked ? (
                    <IconLock className="w-4 h-4" />
                  ) : isWarning ? (
                    <IconWarning className="w-3 h-3" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-semibold',
                    isDone && 'text-emerald-600',
                    isWarning && 'text-amber-600',
                    isCurrent && 'text-blue-700',
                    isLocked && 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    'text-xs mt-0.5',
                    isWarning ? 'text-amber-500 font-medium' : 'text-gray-400'
                  )}
                >
                  {step.sublabel}
                </span>
                {step.state === 'progress' && (
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${docProgress}%` }}
                    />
                  </div>
                )}
              </div>
            );

            return (
              <div key={step.number} className="flex items-center">
                {step.href && !isLocked ? (
                  <Link href={step.href} className="hover:opacity-80 transition-opacity">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
                {idx < steps.length - 1 && (
                  <div className="w-8 h-0.5 flex-shrink-0 bg-gray-200 mx-1 mt-[-20px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evidence */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total Evidence
            </span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <IconPhotos className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalEvidence}</p>
          <p className="text-xs text-gray-400 mt-1">files uploaded</p>
        </div>

        {/* Ready */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ready
            </span>
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <IconCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{readyCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            {totalEvidence > 0 ? Math.round((readyCount / totalEvidence) * 100) : 0}% of total
          </p>
        </div>

        {/* Needs Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Needs Info
            </span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <IconWarning className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600">{needsInfoCount}</p>
          <p className="text-xs text-gray-400 mt-1">items awaiting confirmation</p>
        </div>

        {/* Duplicates */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Duplicates
            </span>
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <IconDuplicate className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">{duplicateCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            {excludedCount > 0 ? `${excludedCount} excluded` : 'none excluded'}
          </p>
        </div>
      </div>

      {/* ── Two-column layout: Category Coverage + Next Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Coverage */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Category Coverage</h2>
          <div className="space-y-3">
            {ORDERED_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = getCategoryCount(evidence, cat);
              const coverage = getCategoryCoverage(count);
              const hasEvidence = count > 0;

              const barColour =
                coverage >= 80
                  ? 'bg-emerald-400'
                  : coverage >= 40
                  ? 'bg-amber-400'
                  : 'bg-red-400';

              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0 w-6 text-center">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {meta.label}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-500">{count} files</span>
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full font-medium',
                            hasEvidence
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          )}
                        >
                          {hasEvidence ? 'Evidence added' : 'Needs more context'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={cn('h-1.5 rounded-full transition-all duration-500', barColour)}
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Next Actions + Quick Links */}
        <div className="space-y-5">
          {/* Next Actions */}
          <div className="bg-white rounded-xl border-2 border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎯</span>
              <h2 className="text-sm font-semibold text-gray-900">Next Actions</h2>
            </div>
            <div className="space-y-2">
              {nextActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors group"
                >
                  <span className="text-base flex-shrink-0">{action.icon}</span>
                  <span className="text-sm text-gray-700 flex-1 leading-snug">{action.label}</span>
                  <IconArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                >
                  <span className="text-base">{link.emoji}</span>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700 truncate">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviewer Comments ── */}
      {reviewerComments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Reviewer Comments</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
            <div className="space-y-5">
              {reviewerComments.map((comment, idx) => (
                <div key={`${comment.id}-${idx}`} className="flex gap-4 pl-10 relative">
                  {/* Dot */}
                  <div className="absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                      {!comment.isClientVisible && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">Re: {comment.filename}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Separation Periods Notice ── */}
      {project.hasSeparationPeriods && project.separationPeriods && project.separationPeriods.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">✈️</span>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Separation Period Recorded</h3>
              <p className="text-sm text-blue-700">
                This application includes {project.separationPeriods.length} separation period(s).
                Make sure to upload communication evidence (calls, chats, video logs) for these periods.
              </p>
              <ul className="mt-2 space-y-1">
                {project.separationPeriods.map((sp) => (
                  <li key={sp.id} className="text-xs text-blue-600">
                    • {formatDateShort(sp.startDate)} –{' '}
                    {sp.endDate ? formatDateShort(sp.endDate) : 'ongoing'}
                    {sp.reason ? ` · ${sp.reason}` : ''}
                    {sp.location ? ` · ${sp.location}` : ''}
                  </li>
                ))}
              </ul>
              <Link
                href={`/projects/${projectId}/upload`}
                className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
              >
                Upload communication evidence <IconChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
