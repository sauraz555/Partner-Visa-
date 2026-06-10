'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { formatDateShort, statusColour, statusLabel, generateId, cn } from '@/lib/utils';
import { CATEGORY_META } from '@/lib/mock-data';
import type { EvidenceFile, EvidenceCategory, EvidenceStatus } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'needs_date' | 'needs_location' | 'needs_names' | 'needs_explanation';

type DatePrecision = 'exact' | 'approximate_month' | 'approximate_year' | 'unknown';

interface LocalAnswer {
  fileId: string;
  datePrecision?: DatePrecision;
  dateValue?: string;
  location?: string;
  locationUnknown?: boolean;
  names?: string[];
  explanation?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NEEDS_STATUSES: EvidenceStatus[] = ['needs_date', 'needs_location', 'needs_names', 'needs_explanation'];

function getQuestionText(status: EvidenceStatus, file: EvidenceFile): string {
  if (status === 'needs_date') return 'Approximately when was this photograph taken?';
  if (status === 'needs_location') return 'Where was this event or photograph taken?';
  if (status === 'needs_names') return 'Who appears in this photograph?';
  if (status === 'needs_explanation') return `What is the significance of this item to your relationship?`;
  return 'Please provide more information about this item.';
}

function getCategoryMeta(cat?: EvidenceCategory) {
  if (!cat) return { label: 'Uncategorised', icon: '📄', colour: 'gray' };
  return CATEGORY_META[cat] ?? { label: 'Other', icon: '📄', colour: 'gray' };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  }, [inputValue, tags, onChange]);

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Type a name and press Enter"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={addTag}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

interface QuestionCardProps {
  file: EvidenceFile;
  onConfirm: (fileId: string, answer: LocalAnswer) => void;
  onSkip: (fileId: string) => void;
  isAnimatingOut: boolean;
}

function QuestionCard({ file, onConfirm, onSkip, isAnimatingOut }: QuestionCardProps) {
  const status = file.status as EvidenceStatus;
  const catMeta = getCategoryMeta(file.confirmedCategory ?? file.suggestedCategory);
  const question = getQuestionText(status, file);

  // Date state
  const [datePrecision, setDatePrecision] = useState<DatePrecision>('approximate_month');
  const [dateValue, setDateValue] = useState(file.suggestedDate ?? '');

  // Location state
  const [location, setLocation] = useState(file.suggestedLocation ?? '');
  const [locationUnknown, setLocationUnknown] = useState(false);

  // Names state
  const [names, setNames] = useState<string[]>(file.suggestedPeople ?? []);

  // Explanation
  const [explanation, setExplanation] = useState('');

  const handleConfirm = () => {
    onConfirm(file.id, {
      fileId: file.id,
      datePrecision,
      dateValue,
      location: locationUnknown ? undefined : location,
      locationUnknown,
      names,
      explanation,
    });
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-500',
        isAnimatingOut && 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      )}
    >
      <div className="flex gap-4 p-5">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt={file.originalFilename}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {catMeta.icon} {catMeta.label}
            </span>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                statusColour(status)
              )}
            >
              {statusLabel(status)}
            </span>
            <span className="text-xs text-gray-400 ml-auto truncate max-w-[160px]">
              {file.originalFilename}
            </span>
          </div>

          {/* Question */}
          <p className="text-gray-900 font-semibold mb-3">{question}</p>

          {/* Answer inputs */}
          {status === 'needs_date' && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                {(
                  [
                    ['exact', 'Exact date'],
                    ['approximate_month', 'Approximate month'],
                    ['approximate_year', 'Approximate year'],
                    ['unknown', 'Date unknown'],
                  ] as [DatePrecision, string][]
                ).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`date-precision-${file.id}`}
                      value={val}
                      checked={datePrecision === val}
                      onChange={() => setDatePrecision(val)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {datePrecision !== 'unknown' && (
                <div>
                  <input
                    type={datePrecision === 'exact' ? 'date' : datePrecision === 'approximate_month' ? 'month' : 'number'}
                    value={dateValue}
                    min={datePrecision === 'approximate_year' ? 2015 : undefined}
                    max={datePrecision === 'approximate_year' ? new Date().getFullYear() : undefined}
                    onChange={(e) => setDateValue(e.target.value)}
                    placeholder={datePrecision === 'approximate_year' ? 'e.g. 2023' : undefined}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {status === 'needs_location' && (
            <div className="space-y-3">
              <input
                type="text"
                value={location}
                disabled={locationUnknown}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Brisbane, Queensland"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationUnknown}
                  onChange={(e) => setLocationUnknown(e.target.checked)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-600">Location unknown</span>
              </label>
            </div>
          )}

          {status === 'needs_names' && (
            <TagInput tags={names} onChange={setNames} />
          )}

          {status === 'needs_explanation' && (
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              placeholder="Describe the significance of this evidence to your relationship…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onSkip(file.id)}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          Skip for now
        </button>
        <button
          onClick={handleConfirm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Confirm &amp; Save
        </button>
      </div>
    </div>
  );
}

// ─── Completed Item ───────────────────────────────────────────────────────────

interface CompletedItemProps {
  file: EvidenceFile;
  onEdit: (fileId: string) => void;
}

function CompletedItem({ file, onEdit }: CompletedItemProps) {
  const catMeta = getCategoryMeta(file.confirmedCategory ?? file.suggestedCategory);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {file.thumbnailUrl ? (
          <img src={file.thumbnailUrl} alt={file.originalFilename} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">📄</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.originalFilename}</p>
        <p className="text-xs text-gray-500">{catMeta.icon} {catMeta.label}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Confirmed
        </span>
        <button
          onClick={() => onEdit(file.id)}
          className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MissingInfoPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { getEvidence, dispatch } = useApp();

  const allEvidence = getEvidence(projectId);

  // Queue state – set of confirmed file IDs
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Build the queue from evidence
  const queueFiles = useMemo(
    () =>
      allEvidence.filter(
        (f) => NEEDS_STATUSES.includes(f.status as EvidenceStatus) && !confirmedIds.has(f.id)
      ),
    [allEvidence, confirmedIds]
  );

  const filteredQueue = useMemo(() => {
    if (activeFilter === 'all') return queueFiles;
    return queueFiles.filter((f) => f.status === activeFilter);
  }, [queueFiles, activeFilter]);

  const confirmedFiles = useMemo(
    () => allEvidence.filter((f) => confirmedIds.has(f.id)),
    [allEvidence, confirmedIds]
  );

  const totalItems = useMemo(
    () => allEvidence.filter((f) => NEEDS_STATUSES.includes(f.status as EvidenceStatus)).length,
    [allEvidence]
  );

  const confirmedCount = confirmedIds.size;
  const progressPct = totalItems > 0 ? Math.round((confirmedCount / totalItems) * 100) : 0;

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'needs_date', label: 'Needs Date' },
    { key: 'needs_location', label: 'Needs Location' },
    { key: 'needs_names', label: 'Needs Names' },
    { key: 'needs_explanation', label: 'Needs Explanation' },
  ];

  const handleConfirm = useCallback(
    (fileId: string, answer: LocalAnswer) => {
      const file = allEvidence.find((f) => f.id === fileId);
      if (!file) return;

      // Animate out
      setAnimatingOut((prev) => new Set([...prev, fileId]));

      setTimeout(() => {
        setConfirmedIds((prev) => new Set([...prev, fileId]));
        setAnimatingOut((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });

        // Update evidence in store
        const updatedFile: EvidenceFile = {
          ...file,
          status: 'ready',
          confirmedDate: answer.dateValue,
          dateApproximate: answer.datePrecision !== 'exact',
          confirmedLocation: answer.locationUnknown ? undefined : answer.location,
          confirmedPeople: answer.names,
          confirmedCaption: answer.explanation ?? file.suggestedCaption,
          updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'UPDATE_EVIDENCE', payload: { projectId, file: updatedFile } });
      }, 450);
    },
    [allEvidence, dispatch, projectId]
  );

  const handleSkip = useCallback((fileId: string) => {
    setSkippedIds((prev) => new Set([...prev, fileId]));
  }, []);

  const handleEdit = useCallback((fileId: string) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
  }, []);

  const isAllDone = filteredQueue.length === 0 && queueFiles.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Information to Confirm</h1>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Review these items to improve the accuracy and completeness of your evidence document.
            You only need to answer questions when you are confident of the information.
          </p>
        </div>

        {/* Disclaimer callout */}
        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            <span className="font-semibold">Important: </span>
            If you are uncertain about a date or detail, select &quot;Approximate&quot; or &quot;Unknown&quot;. Never guess a precise
            date from an uncertain memory.
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {confirmedCount} of {totalItems} items confirmed
            </span>
            <span className="text-sm font-bold text-blue-600">{progressPct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto shadow-sm">
          {filterTabs.map((tab) => {
            const count =
              tab.key === 'all'
                ? queueFiles.length
                : queueFiles.filter((f) => f.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                    activeFilter === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* All done state */}
        {isAllDone ? (
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All done!</h2>
            <p className="text-gray-500 max-w-sm">
              You have reviewed all items in your information queue. Your evidence document is looking great.
            </p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No items match this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQueue.map((file) => (
              <QuestionCard
                key={file.id}
                file={file}
                onConfirm={handleConfirm}
                onSkip={handleSkip}
                isAnimatingOut={animatingOut.has(file.id)}
              />
            ))}
          </div>
        )}

        {/* Completed items accordion */}
        {confirmedFiles.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setCompletedExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-900">Completed Items</span>
                <span className="text-sm text-gray-500">({confirmedFiles.length})</span>
              </div>
              <svg
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform duration-200',
                  completedExpanded && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {completedExpanded && (
              <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-2">
                {confirmedFiles.map((file) => (
                  <CompletedItem key={file.id} file={file} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
