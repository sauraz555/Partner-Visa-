'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useReducer, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/lib/store';
import type { EvidenceCategory, ProcessingStage } from '@/lib/types';
import { formatFileSize, cn, generateId } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string | null;
  category: EvidenceCategory | null;
  stage: ProcessingStage;
  progress: number; // 0-100
  error?: string;
}

interface RecentItem {
  id: string;
  filename: string;
  previewUrl: string | null;
  category: EvidenceCategory | null;
  status: 'ready' | 'processing';
}

type QueueAction =
  | { type: 'ADD_FILES'; payload: UploadQueueItem[] }
  | { type: 'UPDATE_STAGE'; payload: { id: string; stage: ProcessingStage; progress: number } }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR_DONE' };

function queueReducer(state: UploadQueueItem[], action: QueueAction): UploadQueueItem[] {
  switch (action.type) {
    case 'ADD_FILES':
      return [...state, ...action.payload];
    case 'UPDATE_STAGE':
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, stage: action.payload.stage, progress: action.payload.progress }
          : item
      );
    case 'REMOVE':
      return state.filter((item) => item.id !== action.payload);
    case 'CLEAR_DONE':
      return state.filter((item) => item.stage !== 'ready' && item.stage !== 'error');
    default:
      return state;
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BATCH_TYPES: Array<{ label: string; category: EvidenceCategory | null }> = [
  { label: 'Photos Together', category: 'social' },
  { label: 'Family & Friends', category: 'family_community' },
  { label: 'Travel', category: 'travel' },
  { label: 'Chats & Messages', category: 'communication' },
  { label: 'Call Logs', category: 'communication' },
  { label: 'Social Media', category: 'social' },
  { label: 'Financial', category: 'financial' },
  { label: 'Household', category: 'household' },
  { label: 'Marriage / Engagement', category: 'commitment' },
  { label: 'Other', category: null },
];

const PROCESSING_STAGES: ProcessingStage[] = [
  'uploading',
  'security_scan',
  'reading_metadata',
  'extracting_text',
  'detecting_duplicates',
  'categorising',
  'ready',
];

const STAGE_LABELS: Record<ProcessingStage, string> = {
  uploading: 'Uploading',
  security_scan: 'Security scan',
  reading_metadata: 'Reading metadata',
  extracting_text: 'Extracting text',
  detecting_duplicates: 'Detecting duplicates',
  categorising: 'Categorising',
  ready: 'Ready',
  error: 'Error',
};

const STAGE_ICONS: Record<ProcessingStage, string> = {
  uploading: '⬆️',
  security_scan: '🔒',
  reading_metadata: '🔍',
  extracting_text: '📝',
  detecting_duplicates: '🔄',
  categorising: '🏷️',
  ready: '✅',
  error: '❌',
};

const CATEGORY_LABELS: Partial<Record<EvidenceCategory, string>> = {
  financial: 'Financial',
  household: 'Household',
  social: 'Social',
  commitment: 'Commitment',
  communication: 'Communication',
  travel: 'Travel',
  family_community: 'Family & Community',
  timeline_milestones: 'Timeline',
  other: 'Other',
};

const CATEGORY_COLOURS: Partial<Record<EvidenceCategory, string>> = {
  financial: 'bg-emerald-100 text-emerald-700',
  household: 'bg-amber-100 text-amber-700',
  social: 'bg-pink-100 text-pink-700',
  commitment: 'bg-purple-100 text-purple-700',
  communication: 'bg-blue-100 text-blue-700',
  travel: 'bg-sky-100 text-sky-700',
  family_community: 'bg-orange-100 text-orange-700',
  timeline_milestones: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-600',
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-10', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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

// ── Upload Processing Simulator ───────────────────────────────────────────────

function simulateProcessing(
  itemId: string,
  dispatch: React.Dispatch<QueueAction>
) {
  const stageCount = PROCESSING_STAGES.length;

  PROCESSING_STAGES.forEach((stage, idx) => {
    const delay = idx * 600;
    const progress = Math.round(((idx + 1) / stageCount) * 100);

    setTimeout(() => {
      dispatch({
        type: 'UPDATE_STAGE',
        payload: { id: itemId, stage, progress },
      });
    }, delay);
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QueueItemRow({
  item,
  onRemove,
}: {
  item: UploadQueueItem;
  onRemove: (id: string) => void;
}) {
  const isDone = item.stage === 'ready';
  const isError = item.stage === 'error';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        isDone ? 'border-emerald-100 bg-emerald-50' : 'border-gray-100 bg-white'
      )}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
            📄
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-800 truncate">{item.file.name}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatFileSize(item.file.size)}
          </span>
          {item.category && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0',
                CATEGORY_COLOURS[item.category] || 'bg-gray-100 text-gray-600'
              )}
            >
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
          )}
        </div>

        {/* Stage + Progress */}
        <div className="flex items-center gap-2">
          <span className="text-xs">{STAGE_ICONS[item.stage]}</span>
          <span
            className={cn(
              'text-xs font-medium',
              isDone ? 'text-emerald-600' : isError ? 'text-red-600' : 'text-blue-600'
            )}
          >
            {STAGE_LABELS[item.stage]}
          </span>
          {!isDone && !isError && (
            <div className="flex-1 max-w-[120px] bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        aria-label="Remove file"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function RecentThumb({ item }: { item: RecentItem }) {
  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
      {item.previewUrl ? (
        <img
          src={item.previewUrl}
          alt={item.filename}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
      {/* Category pill */}
      {item.category && (
        <div className="absolute bottom-1 left-1">
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              CATEGORY_COLOURS[item.category] || 'bg-gray-100 text-gray-700'
            )}
          >
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>
      )}
      {/* Status */}
      <div className="absolute top-1 right-1">
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full font-medium',
            item.status === 'ready'
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-500 text-white'
          )}
        >
          {item.status === 'ready' ? '✓' : '…'}
        </span>
      </div>
      {/* Filename on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white font-medium truncate drop-shadow">{item.filename}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { getProject, dispatch: appDispatch, notify } = useApp();

  const project = getProject(projectId);

  const [selectedBatch, setSelectedBatch] = useState<EvidenceCategory | null>('social');
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, dispatchQueue] = useReducer(queueReducer, []);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const readyCount = queue.filter((i) => i.stage === 'ready').length;
  const processingCount = queue.filter(
    (i) => i.stage !== 'ready' && i.stage !== 'error'
  ).length;
  const queuedCount = queue.filter((i) => i.stage === 'uploading').length;

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const items: UploadQueueItem[] = [];
      Array.from(files).forEach((file) => {
        // Validate
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          notify('warning', 'File too large', `${file.name} exceeds the 50 MB limit.`);
          return;
        }

        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(file) : null;
        const id = generateId('upload');

        const item: UploadQueueItem = {
          id,
          file,
          previewUrl,
          category: selectedBatch,
          stage: 'uploading',
          progress: 0,
        };
        items.push(item);
      });

      if (items.length === 0) return;

      dispatchQueue({ type: 'ADD_FILES', payload: items });

      // Simulate processing for each file with staggered starts
      items.forEach((item, idx) => {
        setTimeout(() => {
          simulateProcessing(item.id, dispatchQueue);
        }, idx * 300);
      });

      // Add to recent items after processing completes
      items.forEach((item, idx) => {
        const totalDelay = idx * 300 + PROCESSING_STAGES.length * 600 + 100;
        setTimeout(() => {
          setRecentItems((prev) => [
            {
              id: item.id,
              filename: item.file.name,
              previewUrl: item.previewUrl,
              category: item.category,
              status: 'ready',
            },
            ...prev.slice(0, 19),
          ]);

          // Also add to app evidence
          const evidenceFile = {
            id: item.id,
            projectId,
            originalFilename: item.file.name,
            mimeType: item.file.type,
            sizeBytes: item.file.size,
            thumbnailUrl: item.previewUrl || undefined,
            previewUrl: item.previewUrl || undefined,
            status: 'ready' as const,
            processingStage: 'ready' as const,
            suggestedCategory: item.category ?? undefined,
            confirmedCategory: item.category ?? undefined,
            categoryConfidence: 'medium' as const,
            categoryStatus: 'ai_suggested' as const,
            dateStatus: 'unknown' as const,
            locationStatus: 'unknown' as const,
            peopleStatus: 'unknown' as const,
            captionStatus: 'unknown' as const,
            includeInDocument: true,
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          appDispatch({ type: 'ADD_EVIDENCE', payload: { projectId, file: evidenceFile } });
        }, totalDelay);
      });
    },
    [selectedBatch, projectId, appDispatch, notify]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input so same files can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleClickZone = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (id: string) => {
    const item = queue.find((i) => i.id === id);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    dispatchQueue({ type: 'REMOVE', payload: id });
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Evidence</h1>
        <p className="text-sm text-gray-500">
          Add photos, documents, screenshots, and other files to support your partner visa
          application. Files are processed automatically — we&apos;ll read dates, locations, and
          other details where possible.
        </p>
      </div>

      {/* ── Batch Selector ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          What type of evidence are you uploading?
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {BATCH_TYPES.map(({ label, category }) => (
            <button
              key={label}
              onClick={() => setSelectedBatch(category)}
              className={cn(
                'flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap',
                selectedBatch === category
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Drop Zone ── */}
      <div
        onClick={handleClickZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-14 px-6 text-center',
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
        )}
      >
        <IconUpload
          className={cn(
            'mx-auto mb-4 transition-colors',
            isDragOver ? 'text-blue-500' : 'text-gray-300'
          )}
        />
        <p className={cn('text-base font-semibold mb-1', isDragOver ? 'text-blue-700' : 'text-gray-700')}>
          {isDragOver ? 'Release to upload files' : 'Drop files here or click to upload'}
        </p>
        <p className="text-sm text-gray-400">
          Supports HEIC, JPG, JPEG, PNG, WEBP, PDF &nbsp;·&nbsp; Max 50 MB per file
        </p>
        {selectedBatch && (
          <div className="mt-3">
            <span
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-medium',
                CATEGORY_COLOURS[selectedBatch] || 'bg-gray-100 text-gray-600'
              )}
            >
              Files will be categorised as: {CATEGORY_LABELS[selectedBatch]}
            </span>
          </div>
        )}
        {isDragOver && (
          <div className="absolute inset-0 rounded-xl bg-blue-500/5 border-2 border-blue-500 pointer-events-none" />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.heic,.heif"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload files"
      />

      {/* ── Processing Stats ── */}
      {queue.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{readyCount}</p>
            <p className="text-xs text-emerald-700 mt-1">files ready</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
            <p className="text-xs text-blue-700 mt-1">processing</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{queuedCount}</p>
            <p className="text-xs text-gray-600 mt-1">in queue</p>
          </div>
        </div>
      )}

      {/* ── Upload Queue ── */}
      {queue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Upload Queue ({queue.length} file{queue.length !== 1 ? 's' : ''})
            </h2>
            {readyCount > 0 && (
              <button
                onClick={() => dispatchQueue({ type: 'CLEAR_DONE' })}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {queue.map((item) => (
              <QueueItemRow key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recently Uploaded ── */}
      {recentItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Recently Uploaded ({recentItems.length})
            </h2>
            <Link
              href={`/projects/${projectId}/evidence`}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
            >
              View all <IconArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {recentItems.map((item) => (
              <RecentThumb key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tips ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Upload Tips</h3>
        <ul className="space-y-1.5 text-sm text-blue-700">
          <li>• Select the correct category before uploading for the best auto-detection accuracy.</li>
          <li>• Original photos (not screenshots) contain GPS and date data — upload originals where possible.</li>
          <li>• For chat screenshots, capture the full conversation thread including dates.</li>
          <li>• Bank statements and documents work best as PDF files.</li>
          <li>• You can upload hundreds of files at once — batch uploads are encouraged.</li>
        </ul>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          ← Back to Overview
        </Link>
        <Link
          href={`/projects/${projectId}/evidence`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Continue to Evidence Library
          <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
