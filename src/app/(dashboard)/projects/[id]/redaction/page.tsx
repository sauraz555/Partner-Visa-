'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Undo2,
  Trash2,
  AlertTriangle,
  Info,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Plus
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatDateShort, formatFileSize, cn, generateId } from '@/lib/utils';
import type { EvidenceFile, Redaction } from '@/lib/types';

export default function RedactionWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getEvidence, dispatch, notify } = useApp();

  const evidence = getEvidence(projectId);

  // States
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [filterSensitiveOnly, setFilterSensitiveOnly] = useState(false);
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [redactionReason, setRedactionReason] = useState('Personal sensitive information');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Filter files
  const filteredFiles = useMemo(() => {
    return evidence.filter(f => {
      if (filterSensitiveOnly) {
        return f.status === 'sensitive_detected' || (f.redactions && f.redactions.length > 0);
      }
      return f.status === 'ready' || f.status === 'approved' || f.status === 'sensitive_detected' || (f.redactions && f.redactions.length > 0);
    });
  }, [evidence, filterSensitiveOnly]);

  const activeFile = useMemo(() => {
    return evidence.find(f => f.id === selectedFileId) || filteredFiles[0] || null;
  }, [evidence, selectedFileId, filteredFiles]);

  // Sync redactions from active file
  useEffect(() => {
    if (activeFile) {
      setRedactions(activeFile.redactions || []);
      setSelectedFileId(activeFile.id);
    } else {
      setRedactions([]);
    }
  }, [activeFile]);

  // AI suggestions list
  const suggestedRedactions = useMemo(() => {
    if (!activeFile) return [];
    
    // Simulate suggestions based on name or index
    if (activeFile.originalFilename.includes('statement') || activeFile.id === 'file-002') {
      return [
        { id: 'sug-1', box: { x: 10, y: 12, width: 35, height: 8 }, reason: 'Bank account number detected', applied: false },
        { id: 'sug-2', box: { x: 75, y: 8, width: 20, height: 6 }, reason: 'Residential address detected', applied: false }
      ];
    }
    if (activeFile.originalFilename.includes('chat') || activeFile.originalFilename.includes('evidence_2') || activeFile.id === 'file-004') {
      return [
        { id: 'sug-3', box: { x: 40, y: 32, width: 25, height: 5 }, reason: 'Phone number visible in message chat bubble', applied: false }
      ];
    }
    return [];
  }, [activeFile]);

  // Drawing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgRef.current || isPreviewMode) return;

    const rect = imgRef.current.getBoundingClientRect();
    
    // Relative coordinates in % (0 - 100)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Boundary check
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      setIsDrawing(true);
      setStartPos({ x, y });
      setCurrentBox({ x, y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current || !imgRef.current || !currentBox) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp boundary
    const clampX = Math.max(0, Math.min(100, x));
    const clampY = Math.max(0, Math.min(100, y));

    const boxX = Math.min(startPos.x, clampX);
    const boxY = Math.min(startPos.y, clampY);
    const boxW = Math.abs(startPos.x - clampX);
    const boxH = Math.abs(startPos.y - clampY);

    setCurrentBox({ x: boxX, y: boxY, w: boxW, h: boxH });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;
    setIsDrawing(false);

    // Filter tiny clicks
    if (currentBox.w > 1.5 && currentBox.h > 1.5) {
      const newRedaction: Redaction = {
        id: generateId('redact'),
        x: Math.round(currentBox.x),
        y: Math.round(currentBox.y),
        width: Math.round(currentBox.w),
        height: Math.round(currentBox.h),
        reason: redactionReason,
        appliedAt: new Date().toISOString()
      };

      setRedactions(prev => [...prev, newRedaction]);
      notify('info', 'Redaction Added', 'Drawn redaction area.');
    }
    setCurrentBox(null);
  };

  const handleApplySuggestion = (suggestion: typeof suggestedRedactions[0]) => {
    const newRedaction: Redaction = {
      id: generateId('redact'),
      x: suggestion.box.x,
      y: suggestion.box.y,
      width: suggestion.box.width,
      height: suggestion.box.height,
      reason: suggestion.reason,
      appliedAt: new Date().toISOString()
    };

    setRedactions(prev => [...prev, newRedaction]);
    notify('success', 'Suggestion Applied', `Applied redaction for: ${suggestion.reason}`);
  };

  const handleRemoveRedaction = (id: string) => {
    setRedactions(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAll = () => {
    setRedactions([]);
  };

  const handleSave = () => {
    if (!activeFile) return;

    const updatedFile: EvidenceFile = {
      ...activeFile,
      hasRedactions: redactions.length > 0,
      redactions: redactions,
      updatedAt: new Date().toISOString(),
      // Update status if it had sensitive flags
      status: activeFile.status === 'sensitive_detected' && redactions.length > 0 ? 'ready' : activeFile.status
    };

    dispatch({
      type: 'UPDATE_EVIDENCE',
      payload: { projectId, file: updatedFile }
    });

    notify('success', 'Redactions Saved', `Saved ${redactions.length} redactions on ${activeFile.originalFilename}.`);
  };

  const handlePrevNext = (dir: 'prev' | 'next') => {
    if (!activeFile) return;
    const currentIndex = filteredFiles.findIndex(f => f.id === activeFile.id);
    if (currentIndex === -1) return;

    let targetIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < filteredFiles.length) {
      handleSave(); // save current first
      setSelectedFileId(filteredFiles[targetIndex].id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Redaction Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and apply redactions to protect sensitive information in your evidence documents.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 flex gap-3.5">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
            Original Preserved
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mt-0.5">
            Redactions are applied to the generated document version only. Your original uploaded files are never modified. Always double-check redaction boxes overlap sensitive names, emails, or numbers perfectly before building.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Evidence selector (30%) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Select File</h2>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterSensitiveOnly}
                onChange={(e) => setFilterSensitiveOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-xs text-gray-500">Sensitive Flags</span>
            </label>
          </div>

          <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800 pr-1 space-y-1.5">
            {filteredFiles.map((file) => {
              const active = file.id === selectedFileId;
              const hasAppliedRedactions = file.redactions && file.redactions.length > 0;
              
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={cn(
                    'w-full text-left p-2.5 rounded-lg border flex gap-3 items-center transition-all',
                    active
                      ? 'bg-blue-50/50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400'
                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="w-12 h-9 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-100">
                    {file.thumbnailUrl ? (
                      <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs">📄</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {file.originalFilename}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-400">{formatFileSize(file.sizeBytes)}</span>
                      {file.status === 'sensitive_detected' && (
                        <span className="px-1.5 py-0.2 bg-red-50 text-red-600 border border-red-100 rounded-full text-[9px] font-bold">
                          ⚠️ Sensitive
                        </span>
                      )}
                      {hasAppliedRedactions && (
                        <span className="px-1.5 py-0.2 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-bold">
                          ✏️ Redacted ({file.redactions?.length})
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Editor (70%) */}
        <div className="lg:col-span-8 space-y-4">
          {activeFile ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center justify-between bg-gray-50/50 dark:bg-gray-950">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Workspace:</span>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-300 truncate max-w-xs">
                    {activeFile.originalFilename}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={cn(
                      'px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
                      isPreviewMode
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    )}
                  >
                    {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {isPreviewMode ? 'Exit Preview' : 'Preview Redacted'}
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={redactions.length === 0}
                    className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Redactions
                  </button>
                </div>
              </div>

              {/* Redaction Canvas Editor Area */}
              <div className="p-6 bg-neutral-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-center min-h-[400px]">
                <div
                  ref={containerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative select-none cursor-crosshair overflow-hidden"
                  style={{ pointerEvents: isPreviewMode ? 'none' : 'auto' }}
                >
                  <img
                    ref={imgRef}
                    src={activeFile.previewUrl}
                    alt=""
                    className="max-h-[60vh] max-w-full object-contain pointer-events-none rounded border border-neutral-800"
                    onLoad={() => {
                      // Trigger re-render once image is loaded to align coordinates
                    }}
                  />

                  {/* Render Redaction Overlays */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {redactions.map((box) => (
                      <g key={box.id}>
                        {/* Redaction Box (Blackout) */}
                        <rect
                          x={box.x}
                          y={box.y}
                          width={box.width}
                          height={box.height}
                          fill="black"
                          fillOpacity={isPreviewMode ? 1.0 : 0.65}
                          stroke={isPreviewMode ? 'none' : '#2563eb'}
                          strokeWidth={isPreviewMode ? 0 : 0.5}
                        />
                        {/* Label on non-preview */}
                        {!isPreviewMode && (
                          <text
                            x={box.x + 0.5}
                            y={box.y + 3}
                            fill="#93c5fd"
                            fontSize="2"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                          >
                            Redacted Area
                          </text>
                        )}
                      </g>
                    ))}

                    {/* Active Drag Box */}
                    {currentBox && (
                      <rect
                        x={currentBox.x}
                        y={currentBox.y}
                        width={currentBox.w}
                        height={currentBox.h}
                        fill="rgba(37, 99, 235, 0.2)"
                        stroke="#2563eb"
                        strokeWidth="0.5"
                        strokeDasharray="1"
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Footer configuration */}
              <div className="p-5 grid md:grid-cols-2 gap-6 items-start bg-white dark:bg-gray-900">
                {/* Left side: Reason for redactions */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Default Redaction Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Account number protection, email details"
                      value={redactionReason}
                      onChange={(e) => setRedactionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900"
                    />
                  </div>

                  <p className="text-[10px] text-gray-400">
                    * Drag your cursor over sensitive areas (names, addresses, transaction IDs) on the image above to blackout and redact that content in the final PDF.
                  </p>
                </div>

                {/* Right side: Redacted sections list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Redacted Regions ({redactions.length})
                  </h3>

                  {redactions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No redacted areas drawn yet.</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-gray-50 dark:border-gray-800/40 rounded-lg p-2 bg-gray-50/50 dark:bg-gray-950">
                      {redactions.map((r, idx) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 p-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded text-xs">
                          <span className="font-medium truncate text-gray-700 dark:text-gray-300">
                            #{idx + 1}: {r.reason || 'Sensitive Data'}
                          </span>
                          <button
                            onClick={() => handleRemoveRedaction(r.id)}
                            className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {suggestedRedactions.length > 0 && (
                <div className="p-5 bg-blue-50/40 dark:bg-blue-950/20 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <h3 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    AI Redaction Suggestions
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {suggestedRedactions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleApplySuggestion(s)}
                        className="px-3.5 py-2 bg-white dark:bg-gray-900 hover:border-blue-300 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-500" />
                        Apply blackout: &quot;{s.reason}&quot;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev/Next arrows in footer */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs shrink-0">
                <span className="text-gray-400">Step details</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrevNext('prev')}
                    className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold text-gray-600 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev File
                  </button>
                  <button
                    onClick={() => handlePrevNext('next')}
                    className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold text-gray-600 flex items-center gap-1.5"
                  >
                    Next File
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-24 text-center">
              <Shield className="w-14 h-14 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No files matching criteria</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                No files are currently available to redact. Try clearing the sensitive items filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
