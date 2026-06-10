'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { formatFileSize, formatDateShort, cn } from '@/lib/utils';
import type { EvidenceFile, DuplicateGroup } from '@/lib/types';

// ─── Mock duplicate groups builder ──────────────────────────────────────────

function buildDuplicateGroups(evidence: EvidenceFile[]): DuplicateGroup[] {
  const dupeFiles = evidence.filter((f) => f.isDuplicate && f.duplicateGroupId);
  const groupMap: Record<string, EvidenceFile[]> = {};
  for (const f of dupeFiles) {
    const gid = f.duplicateGroupId!;
    if (!groupMap[gid]) groupMap[gid] = [];
    groupMap[gid].push(f);
  }

  // If not enough pairs, build synthetic pairs from non-dupe files for demo
  const groups = Object.entries(groupMap).map(([id, files]) => ({
    id,
    projectId: files[0]?.projectId ?? '',
    files: files.slice(0, 2),
    similarity: 0.88 + Math.random() * 0.1,
    recommendedKeep: files[0]?.id,
  }));

  // Pad with synthetic groups if fewer than 3
  if (groups.length < 3) {
    const extras = evidence.filter(
      (f) => !f.isDuplicate && f.status === 'ready' && f.thumbnailUrl
    );
    for (let i = 0; i < Math.min(3 - groups.length, Math.floor(extras.length / 2)); i++) {
      const a = extras[i * 2];
      const b = extras[i * 2 + 1];
      if (!a || !b) break;
      groups.push({
        id: `synthetic-dup-${i}`,
        projectId: a.projectId,
        files: [a, b],
        similarity: 0.88 + i * 0.03,
        recommendedKeep: a.id,
      });
    }
  }

  return groups;
}

// ─── Decision type ───────────────────────────────────────────────────────────

type Decision =
  | { type: 'keep_first' }
  | { type: 'keep_second' }
  | { type: 'keep_both' }
  | null;

// ─── Quality bar ─────────────────────────────────────────────────────────────

function QualityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500">Quality</span>
        <span className="font-semibold text-gray-700">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Similarity label ─────────────────────────────────────────────────────────

function similarityLabel(score: number): string {
  if (score >= 0.95) return 'Nearly identical';
  if (score >= 0.9) return 'Highly similar';
  if (score >= 0.8) return 'Very similar';
  return 'Similar';
}

// ─── DuplicateGroupCard ───────────────────────────────────────────────────────

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  index: number;
  total: number;
  decision: Decision;
  onDecide: (groupId: string, decision: Decision) => void;
  onResolve: (groupId: string) => void;
  resolved: boolean;
}

function DuplicateGroupCard({
  group,
  index,
  total,
  decision,
  onDecide,
  onResolve,
  resolved,
}: DuplicateGroupCardProps) {
  const [fileA, fileB] = group.files;
  if (!fileA || !fileB) return null;

  const simPct = Math.round(group.similarity * 100);
  const simText = similarityLabel(group.similarity);

  const scoreA = fileA.qualityScore ?? 70;
  const scoreB = fileB.qualityScore ?? 70;
  const recommendLabel =
    scoreA >= scoreB
      ? `Recommended: Keep image 1 (higher quality, better orientation)`
      : `Recommended: Keep image 2 (higher quality, better orientation)`;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
        resolved ? 'border-emerald-200' : 'border-gray-200'
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">
            Group {index + 1} of {total}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v4a1 1 0 01-2 0V6a1 1 0 011-1zm0 8a1.25 1.25 0 110-2.5A1.25 1.25 0 0110 13z" />
            </svg>
            {simText} ({simPct}% match)
          </span>
        </div>
        {resolved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Resolved
          </span>
        )}
        {!resolved && (
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Pending
          </span>
        )}
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">
        {([fileA, fileB] as EvidenceFile[]).map((file, fi) => {
          const isFirst = fi === 0;
          const choiceType: Decision = isFirst ? { type: 'keep_first' } : { type: 'keep_second' };
          const isSelected =
            decision?.type === (isFirst ? 'keep_first' : 'keep_second') ||
            (decision?.type === 'keep_both');
          const isKept =
            decision?.type === 'keep_both' ||
            decision?.type === (isFirst ? 'keep_first' : 'keep_second');
          const isExcluded =
            !isKept &&
            ((isFirst && decision?.type === 'keep_second') ||
              (!isFirst && decision?.type === 'keep_first'));

          return (
            <div
              key={file.id}
              className={cn(
                'p-4 flex flex-col gap-3 transition-all',
                isKept && 'bg-blue-50',
                isExcluded && 'bg-gray-50 opacity-60'
              )}
            >
              {/* Image */}
              <div
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all',
                  isKept ? 'border-blue-500' : 'border-gray-200'
                )}
              >
                {file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.originalFilename}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-3xl">📷</div>
                )}
                {isKept && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 truncate">{file.originalFilename}</p>
                <p className="text-xs text-gray-500">
                  {file.confirmedDate || file.suggestedDate
                    ? formatDateShort(file.confirmedDate ?? file.suggestedDate ?? '')
                    : 'Date unknown'}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.sizeBytes)}</p>
              </div>

              {/* Quality */}
              <QualityBar score={file.qualityScore ?? 70} />

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-1">
                <button
                  disabled={resolved}
                  onClick={() => onDecide(group.id, choiceType)}
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-all',
                    isKept && decision?.type !== 'keep_both'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600',
                    resolved && 'cursor-not-allowed opacity-70'
                  )}
                >
                  {isKept && decision?.type !== 'keep_both' ? '✓ Keep this one' : 'Keep this one'}
                </button>
                <button
                  disabled={resolved}
                  onClick={() =>
                    onDecide(
                      group.id,
                      isFirst ? { type: 'keep_second' } : { type: 'keep_first' }
                    )
                  }
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                    isExcluded
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500',
                    resolved && 'cursor-not-allowed opacity-70'
                  )}
                >
                  Exclude this one
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-blue-700 font-medium">
            <span className="mr-1">🤖</span>
            {recommendLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={resolved}
            onClick={() => onDecide(group.id, { type: 'keep_both' })}
            className={cn(
              'text-sm font-medium px-3 py-1.5 rounded-lg border transition-all',
              decision?.type === 'keep_both'
                ? 'border-blue-400 bg-blue-100 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100',
              resolved && 'cursor-not-allowed opacity-70'
            )}
          >
            Keep both
          </button>
          <button
            disabled={resolved || !decision}
            onClick={() => onResolve(group.id)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
              !resolved && decision
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {resolved ? 'Resolved' : 'Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DuplicatesPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { getEvidence } = useApp();

  const evidence = getEvidence(projectId);
  const groups = useMemo(() => buildDuplicateGroups(evidence), [evidence]);

  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const resolvedCount = resolved.size;
  const total = groups.length;
  const allResolved = resolvedCount === total && total > 0;

  const handleDecide = (groupId: string, decision: Decision) => {
    if (resolved.has(groupId)) return;
    setDecisions((prev) => ({ ...prev, [groupId]: decision }));
  };

  const handleResolve = (groupId: string) => {
    if (!decisions[groupId]) return;
    setResolved((prev) => new Set([...prev, groupId]));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Duplicate Review</h1>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            These evidence items appear to be similar. Review each group and choose which version to keep.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{total} duplicate group{total !== 1 ? 's' : ''} found.</span>{' '}
              Resolving duplicates will reduce repetition and improve document quality.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{resolvedCount}</p>
              <p className="text-xs text-gray-500">of {total} resolved</p>
            </div>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: total > 0 ? `${(resolvedCount / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* All resolved state */}
        {allResolved ? (
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All duplicates resolved!</h2>
            <p className="text-gray-500 max-w-sm">
              Great work. Your evidence set has been cleaned up. Proceed to the next step to continue building your document.
            </p>
          </div>
        ) : total === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No duplicates found</h2>
            <p className="text-gray-500">All your evidence items appear to be unique.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group, i) => (
              <DuplicateGroupCard
                key={group.id}
                group={group}
                index={i}
                total={total}
                decision={decisions[group.id] ?? null}
                onDecide={handleDecide}
                onResolve={handleResolve}
                resolved={resolved.has(group.id)}
              />
            ))}
          </div>
        )}

        {/* Footer progress */}
        {!allResolved && total > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {resolvedCount} of {total} groups resolved
            {resolvedCount === total - 1 && (
              <span className="ml-2 font-medium text-blue-600">Almost there!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
