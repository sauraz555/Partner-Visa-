'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Trash2,
  FolderOpen,
  ArrowRight,
  Eye,
  Settings,
  MoreVertical,
  Check,
  Plus
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { CATEGORY_META } from '@/lib/mock-data';
import { cn, formatDateShort } from '@/lib/utils';
import type { EvidenceCategory, EvidenceFile } from '@/lib/types';

export default function CategoryReviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getEvidence, dispatch, notify } = useApp();

  const evidence = getEvidence(projectId);

  // States
  const [activeTab, setActiveTab] = useState<EvidenceCategory>('financial');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Group files by category
  const categorizedEvidence = useMemo(() => {
    const groups: Record<string, EvidenceFile[]> = {
      financial: [],
      household: [],
      social: [],
      commitment: [],
      communication: [],
      travel: [],
      family_community: [],
      timeline_milestones: [],
      other: [],
      uncategorised: []
    };

    evidence.forEach(file => {
      const cat = file.confirmedCategory || file.suggestedCategory;
      if (!cat) {
        groups.uncategorised.push(file);
      } else if (groups[cat]) {
        groups[cat].push(file);
      } else {
        groups.other.push(file);
      }
    });

    return groups;
  }, [evidence]);

  const activeFiles = useMemo(() => {
    return categorizedEvidence[activeTab] || [];
  }, [categorizedEvidence, activeTab]);

  const uncategorisedFiles = categorizedEvidence.uncategorised || [];

  // Bulk Actions
  const handleSelectAll = (files: EvidenceFile[]) => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map(f => f.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkReassign = (targetCategory: EvidenceCategory) => {
    selectedIds.forEach(id => {
      const file = evidence.find(f => f.id === id);
      if (file) {
        dispatch({
          type: 'UPDATE_EVIDENCE',
          payload: {
            projectId,
            file: {
              ...file,
              confirmedCategory: targetCategory,
              categoryStatus: 'client_confirmed',
              // Clear duplicate or warning if resolved
              status: file.status === 'excluded' ? 'excluded' : 'ready'
            }
          }
        });
      }
    });

    notify(
      'success',
      'Category Updated',
      `Reassigned ${selectedIds.length} file(s) to ${CATEGORY_META[targetCategory].label}.`
    );
    setSelectedIds([]);
    setIsBulkMenuOpen(false);
  };

  const handleBulkExclude = () => {
    selectedIds.forEach(id => {
      const file = evidence.find(f => f.id === id);
      if (file) {
        dispatch({
          type: 'UPDATE_EVIDENCE',
          payload: {
            projectId,
            file: { ...file, status: 'excluded', includeInDocument: false }
          }
        });
      }
    });
    notify('info', 'Bulk Action Complete', `Excluded ${selectedIds.length} files from document.`);
    setSelectedIds([]);
  };

  const handleAutoCategorise = () => {
    if (uncategorisedFiles.length === 0) {
      notify('info', 'All Categorised', 'No uncategorised files left to process.');
      return;
    }

    setIsAutoCategorizing(true);
    setTimeout(() => {
      uncategorisedFiles.forEach((file, idx) => {
        // AI assigns category based on index
        const keys = Object.keys(CATEGORY_META) as EvidenceCategory[];
        const suggested = keys[idx % keys.length];

        dispatch({
          type: 'UPDATE_EVIDENCE',
          payload: {
            projectId,
            file: {
              ...file,
              suggestedCategory: suggested,
              categoryStatus: 'ai_suggested',
              categoryConfidence: 'high'
            }
          }
        });
      });

      setIsAutoCategorizing(false);
      notify('success', 'Auto-Categorisation Complete', `AI successfully categorized ${uncategorisedFiles.length} files.`);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Review</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and adjust evidence categories to satisfy Department of Home Affairs guidelines.
          </p>
        </div>
      </div>

      {/* Coverage summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {(Object.keys(CATEGORY_META) as EvidenceCategory[]).map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const files = categorizedEvidence[catKey] || [];
          const count = files.length;
          const isSelected = activeTab === catKey;

          return (
            <button
              key={catKey}
              onClick={() => {
                setActiveTab(catKey);
                setSelectedIds([]);
              }}
              className={cn(
                'p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all select-none hover:shadow-sm',
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400 font-bold scale-[1.02] ring-2 ring-blue-500/10'
                  : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 text-gray-600'
              )}
            >
              <span className="text-xl">{meta.icon}</span>
              <span className="text-[11px] font-semibold truncate w-full">{meta.label}</span>
              <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-[9px] font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Section Details */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{CATEGORY_META[activeTab].icon}</span>
              {CATEGORY_META[activeTab].label} Evidence
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
              {CATEGORY_META[activeTab].description}
            </p>
          </div>

          {/* Bulk Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleBulkExclude}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold"
              >
                Exclude Selected
              </button>
              <button
                onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Tag className="w-3.5 h-3.5" />
                Move to Category
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isBulkMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-20 p-1 divide-y divide-gray-50 dark:divide-gray-800">
                  {Object.entries(CATEGORY_META)
                    .filter(([k]) => k !== activeTab)
                    .map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleBulkReassign(key as EvidenceCategory)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg flex items-center gap-2"
                      >
                        <span>{value.icon}</span>
                        {value.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evidence Grid inside active Category */}
        {activeFiles.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">No evidence in this category yet</p>
            <p className="text-xs text-gray-500 mt-0.5">Upload files or reassign items here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center gap-2 pl-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === activeFiles.length}
                onChange={() => handleSelectAll(activeFiles)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Select All in {CATEGORY_META[activeTab].label} ({activeFiles.length} files)
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeFiles.map(file => {
                const selected = selectedIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    className={cn(
                      'bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl overflow-hidden relative group p-2 transition-all',
                      selected && 'ring-2 ring-blue-500/10 border-blue-500 bg-blue-50/10'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleSelectOne(file.id)}
                      className="w-4 h-4 rounded text-blue-600 absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 checked:opacity-100"
                    />

                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                      {file.thumbnailUrl ? (
                        <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xs">📄</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate" title={file.originalFilename}>
                        {file.originalFilename}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDateShort(file.confirmedDate || file.suggestedDate || '')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Uncategorized Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>❓</span>
              Uncategorised Evidence ({uncategorisedFiles.length})
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Evidence items that have not yet been assigned to a visa category.
            </p>
          </div>

          {uncategorisedFiles.length > 0 && (
            <button
              onClick={handleAutoCategorise}
              disabled={isAutoCategorizing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
            >
              <Sparkles className={cn('w-3.5 h-3.5', isAutoCategorizing && 'animate-spin')} />
              {isAutoCategorizing ? 'Analyzing metadata...' : 'Auto-Categorise Remaining'}
            </button>
          )}
        </div>

        {uncategorisedFiles.length === 0 ? (
          <div className="py-6 text-center text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            All evidence files have been successfully categorized!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {uncategorisedFiles.map(file => (
              <div
                key={file.id}
                className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl overflow-hidden p-2 relative"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                  {file.thumbnailUrl ? (
                    <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs">📄</span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate" title={file.originalFilename}>
                    {file.originalFilename}
                  </p>
                  <span className="inline-block px-1.5 py-0.2 bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-bold rounded-full mt-1">
                    Uncategorised
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
