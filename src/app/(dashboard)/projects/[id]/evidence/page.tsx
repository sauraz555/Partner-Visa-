'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  ChevronDown,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Copy,
  AlertTriangle,
  EyeOff,
  Calendar,
  MapPin,
  Users,
  Edit2,
  Save,
  Check,
  Tag,
  Eye,
  Settings,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { CATEGORY_META } from '@/lib/mock-data';
import { formatDate, formatDateShort, formatFileSize, statusLabel, statusColour, confidenceLabel, confirmationLabel, cn } from '@/lib/utils';
import type { EvidenceFile, EvidenceCategory, ConfirmationStatus } from '@/lib/types';

const ITEMS_PER_PAGE = 48;

export default function EvidenceLibraryPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getEvidence, dispatch, notify } = useApp();

  const rawEvidence = getEvidence(projectId);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'needs_info' | 'duplicates' | 'low_quality' | 'excluded'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'upload_date' | 'size' | 'quality'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

  // Detail Modal State
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form edit states
  const [editCategory, setEditCategory] = useState<EvidenceCategory>('other');
  const [editDate, setEditDate] = useState('');
  const [editDateApprox, setEditDateApprox] = useState(false);
  const [editDateLevel, setEditDateLevel] = useState<'day' | 'month' | 'year'>('day');
  const [editLocation, setEditLocation] = useState('');
  const [editLocationUnknown, setEditLocationUnknown] = useState(false);
  const [editPeople, setEditPeople] = useState<string[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editSourceType, setEditSourceType] = useState<string>('photograph');
  const [editInclude, setEditInclude] = useState(true);
  const [editNotes, setEditNotes] = useState('');

  // Bulk Actions
  const handleSelectAll = (filteredFiles: EvidenceFile[]) => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map(f => f.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkExclude = () => {
    selectedIds.forEach(id => {
      const file = rawEvidence.find(f => f.id === id);
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
    setIsBulkMenuOpen(false);
  };

  const handleBulkReassignCategory = (cat: EvidenceCategory) => {
    selectedIds.forEach(id => {
      const file = rawEvidence.find(f => f.id === id);
      if (file) {
        dispatch({
          type: 'UPDATE_EVIDENCE',
          payload: {
            projectId,
            file: { ...file, confirmedCategory: cat, categoryStatus: 'client_confirmed', status: file.status === 'excluded' ? 'ready' : file.status }
          }
        });
      }
    });
    notify('success', 'Bulk Action Complete', `Reassigned ${selectedIds.length} files to ${CATEGORY_META[cat].label}.`);
    setSelectedIds([]);
    setIsBulkMenuOpen(false);
  };

  const handleBulkMarkReviewed = () => {
    selectedIds.forEach(id => {
      const file = rawEvidence.find(f => f.id === id);
      if (file) {
        dispatch({
          type: 'UPDATE_EVIDENCE',
          payload: {
            projectId,
            file: { ...file, status: 'ready', includeInDocument: true }
          }
        });
      }
    });
    notify('success', 'Bulk Action Complete', `Marked ${selectedIds.length} items as reviewed and ready.`);
    setSelectedIds([]);
    setIsBulkMenuOpen(false);
  };

  // Filter & Search Logic
  const filteredEvidence = useMemo(() => {
    return rawEvidence
      .filter((file) => {
        // Tab Filter
        if (activeTab === 'ready') return file.status === 'ready' || file.status === 'approved';
        if (activeTab === 'needs_info') {
          return ['needs_date', 'needs_location', 'needs_names', 'needs_explanation'].includes(file.status);
        }
        if (activeTab === 'duplicates') return file.status === 'possible_duplicate';
        if (activeTab === 'low_quality') return file.status === 'low_quality';
        if (activeTab === 'excluded') return file.status === 'excluded';
        return true;
      })
      .filter((file) => {
        // Category Filter
        if (selectedCategory === 'all') return true;
        const cat = file.confirmedCategory || file.suggestedCategory;
        return cat === selectedCategory;
      })
      .filter((file) => {
        // Search query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const nameMatch = file.originalFilename.toLowerCase().includes(query);
        const captionMatch = (file.confirmedCaption || file.suggestedCaption || '').toLowerCase().includes(query);
        const locationMatch = (file.confirmedLocation || file.suggestedLocation || '').toLowerCase().includes(query);
        const peopleMatch = (file.confirmedPeople || file.suggestedPeople || []).some(p => p.toLowerCase().includes(query));
        return nameMatch || captionMatch || locationMatch || peopleMatch;
      })
      .sort((a, b) => {
        // Sorting Logic
        let comparison = 0;
        if (sortBy === 'date') {
          const dateA = a.confirmedDate || a.suggestedDate || '0000-00-00';
          const dateB = b.confirmedDate || b.suggestedDate || '0000-00-00';
          comparison = dateA.localeCompare(dateB);
        } else if (sortBy === 'upload_date') {
          comparison = a.uploadedAt.localeCompare(b.uploadedAt);
        } else if (sortBy === 'size') {
          comparison = a.sizeBytes - b.sizeBytes;
        } else if (sortBy === 'quality') {
          comparison = (a.qualityScore || 0) - (b.qualityScore || 0);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [rawEvidence, activeTab, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalItems = filteredEvidence.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedEvidence = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvidence.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvidence, currentPage]);

  const counts = useMemo(() => {
    const all = rawEvidence.length;
    const ready = rawEvidence.filter(e => e.status === 'ready' || e.status === 'approved').length;
    const needsInfo = rawEvidence.filter(e => ['needs_date', 'needs_location', 'needs_names', 'needs_explanation'].includes(e.status)).length;
    const duplicates = rawEvidence.filter(e => e.status === 'possible_duplicate').length;
    const lowQuality = rawEvidence.filter(e => e.status === 'low_quality').length;
    const excluded = rawEvidence.filter(e => e.status === 'excluded').length;
    return { all, ready, needsInfo, duplicates, lowQuality, excluded };
  }, [rawEvidence]);

  // Modal Handlers
  const handleOpenModal = (file: EvidenceFile) => {
    setSelectedFile(file);
    setEditCategory(file.confirmedCategory || file.suggestedCategory || 'other');
    setEditDate(file.confirmedDate || file.suggestedDate || '');
    setEditDateApprox(file.dateApproximate || false);
    setEditDateLevel(file.dateApproximateLevel || 'day');
    setEditLocation(file.confirmedLocation || file.suggestedLocation || '');
    setEditLocationUnknown(file.locationStatus === 'unknown');
    setEditPeople(file.confirmedPeople || file.suggestedPeople || []);
    setEditCaption(file.confirmedCaption || file.suggestedCaption || '');
    setEditSourceType(file.sourceType || 'photograph');
    setEditInclude(file.includeInDocument);
    setEditNotes(file.notes || '');
    setIsModalOpen(true);
  };

  const handleAddPerson = () => {
    if (newPersonName.trim() && !editPeople.includes(newPersonName.trim())) {
      setEditPeople(prev => [...prev, newPersonName.trim()]);
      setNewPersonName('');
    }
  };

  const handleRemovePerson = (name: string) => {
    setEditPeople(prev => prev.filter(p => p !== name));
  };

  const handleSaveModal = () => {
    if (!selectedFile) return;

    let newStatus = selectedFile.status;
    if (newStatus === 'excluded' && editInclude) {
      newStatus = 'ready';
    } else if (!editInclude) {
      newStatus = 'excluded';
    } else if (['needs_date', 'needs_location', 'needs_names', 'needs_explanation'].includes(newStatus)) {
      // Check if we resolved everything
      const dateOk = editDate || editDateApprox;
      const locOk = editLocation || editLocationUnknown;
      const peopleOk = editPeople.length > 0;
      if (dateOk && locOk && peopleOk) {
        newStatus = 'ready';
      }
    }

    const updatedFile: EvidenceFile = {
      ...selectedFile,
      confirmedCategory: editCategory,
      categoryStatus: 'client_confirmed',
      confirmedDate: editDate || undefined,
      dateApproximate: editDateApprox,
      dateApproximateLevel: editDateLevel,
      dateStatus: editDate ? 'client_confirmed' : 'unknown',
      confirmedLocation: editLocationUnknown ? undefined : editLocation,
      locationStatus: editLocationUnknown ? 'unknown' : 'client_confirmed',
      confirmedPeople: editPeople,
      peopleStatus: editPeople.length > 0 ? 'client_confirmed' : 'unknown',
      confirmedCaption: editCaption,
      captionStatus: editCaption ? 'client_confirmed' : 'ai_suggested',
      sourceType: editSourceType as any,
      includeInDocument: editInclude,
      status: newStatus,
      notes: editNotes,
      updatedAt: new Date().toISOString()
    };

    dispatch({
      type: 'UPDATE_EVIDENCE',
      payload: { projectId, file: updatedFile }
    });

    notify('success', 'Changes Saved', `Saved updates for ${selectedFile.originalFilename}.`);
    setIsModalOpen(false);
  };

  const handlePrevNext = (dir: 'prev' | 'next') => {
    if (!selectedFile) return;
    const currentIndex = filteredEvidence.findIndex(f => f.id === selectedFile.id);
    if (currentIndex === -1) return;

    let targetIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < filteredEvidence.length) {
      // First save current
      handleSaveModal();
      // Open next
      setTimeout(() => {
        handleOpenModal(filteredEvidence[targetIndex]);
      }, 50);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Evidence Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            {counts.all} items total ({counts.ready} ready, {counts.needsInfo} need info, {counts.duplicates} duplicates, {counts.excluded} excluded)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-gray-800 flex items-center overflow-x-auto gap-1">
        {(['all', 'ready', 'needs_info', 'duplicates', 'low_quality', 'excluded'] as const).map((tab) => {
          let count = counts.all;
          if (tab === 'ready') count = counts.ready;
          if (tab === 'needs_info') count = counts.needsInfo;
          if (tab === 'duplicates') count = counts.duplicates;
          if (tab === 'low_quality') count = counts.lowQuality;
          if (tab === 'excluded') count = counts.excluded;

          const active = activeTab === tab;
          const labels = {
            all: 'All Files',
            ready: 'Ready',
            needs_info: 'Needs Info',
            duplicates: 'Duplicates',
            low_quality: 'Low Quality',
            excluded: 'Excluded'
          };

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2',
                active
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-200'
              )}
            >
              {labels[tab]}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                active ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search filename, captions, location, names..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[150px]"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_META).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Sorting */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              }}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500"
              title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
            >
              <option value="date">Sort by Date</option>
              <option value="upload_date">Sort by Upload Date</option>
              <option value="size">Sort by Size</option>
              <option value="quality">Sort by Quality</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Grid/List toggle */}
          <div className="flex border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900',
                viewMode === 'grid' && 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              )}
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900',
                viewMode === 'list' && 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              )}
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {selectedIds.length} files selected
            </span>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={handleBulkMarkReviewed}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Mark Reviewed
            </button>
            <button
              onClick={handleBulkExclude}
              className="px-3.5 py-1.5 border border-blue-200 text-blue-800 dark:text-blue-300 hover:bg-blue-100/50 rounded-lg text-xs font-semibold"
            >
              Exclude Selected
            </button>
            <button
              onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
              className="p-1.5 border border-blue-200 text-blue-800 dark:text-blue-300 hover:bg-blue-100/50 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5" />
              Categorise
            </button>

            {/* Bulk Categorize Dropdown */}
            {isBulkMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-30 p-1 divide-y divide-gray-50 dark:divide-gray-800">
                {Object.entries(CATEGORY_META).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleBulkReassignCategory(key as EvidenceCategory)}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg flex items-center gap-2"
                  >
                    <span>{value.icon}</span>
                    {value.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-3 pl-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedIds.length > 0 && selectedIds.length === filteredEvidence.length}
            onChange={() => handleSelectAll(filteredEvidence)}
            className="w-4.5 h-4.5 border border-gray-300 rounded text-blue-600 focus:ring-blue-500/20"
          />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Select All on Page ({filteredEvidence.length} files)
          </span>
        </label>
      </div>

      {/* Empty State */}
      {filteredEvidence.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No evidence files found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, tab filters, or selected categories.
          </p>
        </div>
      )}

      {/* Evidence Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedEvidence.map((file) => {
            const cat = file.confirmedCategory || file.suggestedCategory;
            const meta = cat ? CATEGORY_META[cat] : null;
            const selected = selectedIds.includes(file.id);

            return (
              <motion.div
                key={file.id}
                layoutId={`card-${file.id}`}
                className={cn(
                  'bg-white dark:bg-gray-900 rounded-xl border overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative group border-gray-100 dark:border-gray-800',
                  selected && 'border-blue-500 ring-2 ring-blue-500/10'
                )}
              >
                {/* Select Checkbox */}
                <div className={cn(
                  'absolute top-3 left-3 z-10 transition-opacity',
                  selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleSelectOne(file.id)}
                    className="w-4.5 h-4.5 border border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Thumbnail */}
                <div
                  className="aspect-[4/3] bg-gray-50 dark:bg-gray-950 relative cursor-pointer overflow-hidden group-hover:opacity-95"
                  onClick={() => handleOpenModal(file)}
                >
                  {file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt={file.originalFilename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      📄
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 right-3 shrink-0">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm', statusColour(file.status))}>
                      {statusLabel(file.status)}
                    </span>
                  </div>

                  {/* Category overlay */}
                  {meta && (
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full">
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate flex-1" title={file.originalFilename}>
                      {file.originalFilename}
                    </p>
                    {/* Quality score dot */}
                    {file.qualityScore !== undefined && (
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full mt-1 shrink-0',
                          file.qualityScore >= 70
                            ? 'bg-emerald-400'
                            : file.qualityScore >= 50
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        )}
                        title={`Quality Score: ${file.qualityScore}%`}
                      />
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate leading-snug">
                    {file.confirmedCaption || file.suggestedCaption || 'No caption added yet'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-600 border-t border-gray-50 dark:border-gray-800/40 pt-2 mt-1">
                    <span className="font-semibold">{formatDateShort(file.confirmedDate || file.suggestedDate || '')}</span>
                    <span>{formatFileSize(file.sizeBytes)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="w-10 px-4 py-3 text-left"></th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">File</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedEvidence.map((file) => {
                const cat = file.confirmedCategory || file.suggestedCategory;
                const meta = cat ? CATEGORY_META[cat] : null;
                const selected = selectedIds.includes(file.id);

                return (
                  <tr
                    key={file.id}
                    className={cn(
                      'hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors',
                      selected && 'bg-blue-50/10 dark:bg-blue-950/10'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSelectOne(file.id)}
                        className="w-4.5 h-4.5 border border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleOpenModal(file)}>
                        <div className="w-12 h-9 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {file.thumbnailUrl ? (
                            <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-xs">📄</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs">
                            {file.originalFilename}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                            {file.confirmedCaption || file.suggestedCaption}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {meta ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-medium rounded-full text-gray-700 dark:text-gray-300">
                          <span>{meta.icon}</span>
                          {meta.label}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {formatDateShort(file.confirmedDate || file.suggestedDate || '')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {file.confirmedLocation || file.suggestedLocation || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm', statusColour(file.status))}>
                        {statusLabel(file.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenModal(file)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
            <span className="font-semibold">{totalItems}</span> results
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  'w-9 h-9 rounded-lg border text-sm font-semibold transition-all',
                  currentPage === i + 1
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EVIDENCE DETAIL MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isModalOpen && selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900"
              onClick={handleSaveModal}
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden grid md:grid-cols-12 max-h-[90vh] z-10"
            >
              {/* Left Column: Media Preview (55%) */}
              <div className="md:col-span-7 bg-neutral-950/90 flex flex-col justify-between relative min-h-[300px] md:min-h-[500px]">
                {/* Header info */}
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white max-w-xs">
                  <p className="text-xs font-bold truncate">{selectedFile.originalFilename}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">{formatFileSize(selectedFile.sizeBytes)}</p>
                </div>

                {/* Preview Image */}
                <div className="flex-1 flex items-center justify-center p-4">
                  {selectedFile.previewUrl ? (
                    <img
                      src={selectedFile.previewUrl}
                      alt={selectedFile.originalFilename}
                      className="max-h-[60vh] object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <span className="text-6xl mb-2">📄</span>
                      <span className="text-sm">Preview not available</span>
                    </div>
                  )}
                </div>

                {/* Left side footer action / source */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-gray-300">
                  <span className="capitalize font-semibold">Source: {selectedFile.sourceType || 'photograph'}</span>
                  <span>Confidence: <strong className="text-emerald-400 capitalize">{selectedFile.categoryConfidence}</strong></span>
                </div>
              </div>

              {/* Right Column: Editable Fields (45%) */}
              <div className="md:col-span-5 flex flex-col max-h-[90vh] bg-white dark:bg-gray-950">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Evidence details</h3>
                  <button onClick={handleSaveModal} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Form */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {/* Category select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                    <div className="relative">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as EvidenceCategory)}
                        className="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        {Object.entries(CATEGORY_META).map(([key, val]) => (
                          <option key={key} value={key}>{val.icon} {val.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date of Evidence</label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editDateApprox}
                          onChange={(e) => setEditDateApprox(e.target.checked)}
                          className="w-3.5 h-3.5 border border-gray-300 rounded text-blue-600"
                        />
                        <span className="text-xs text-gray-500">Approximate</span>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900"
                      />
                      {editDateApprox && (
                        <select
                          value={editDateLevel}
                          onChange={(e) => setEditDateLevel(e.target.value as any)}
                          className="px-2 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900"
                        >
                          <option value="day">Day</option>
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Location Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editLocationUnknown}
                          onChange={(e) => setEditLocationUnknown(e.target.checked)}
                          className="w-3.5 h-3.5 border border-gray-300 rounded text-blue-600"
                        />
                        <span className="text-xs text-gray-500">Unknown</span>
                      </label>
                    </div>
                    {!editLocationUnknown && (
                      <input
                        type="text"
                        placeholder="e.g. Brisbane, Queensland"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900"
                      />
                    )}
                  </div>

                  {/* People In Evidence */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">People in Photo/Screenshot</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add person name..."
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900"
                      />
                      <button
                        onClick={handleAddPerson}
                        className="px-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editPeople.map((person) => (
                        <span
                          key={person}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        >
                          {person}
                          <button onClick={() => handleRemovePerson(person)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Caption Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Caption (Visa Document Statement)</label>
                    <textarea
                      rows={3}
                      placeholder="Add a detailed caption describing this evidence..."
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 resize-none leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-400">
                      Include who, when, where, and context. E.g., &quot;Applicant and partner celebrating de facto anniversary...&quot;
                    </p>
                  </div>

                  {/* Source Type select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Evidence Source Type</label>
                    <div className="relative">
                      <select
                        value={editSourceType}
                        onChange={(e) => setEditSourceType(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none appearance-none"
                      >
                        <option value="photograph">📸 Photograph</option>
                        <option value="screenshot_chat">💬 Screenshot - Chat History</option>
                        <option value="screenshot_social">🌐 Screenshot - Social Media</option>
                        <option value="screenshot_call">📞 Screenshot - Call Log</option>
                        <option value="receipt">💳 Receipt / Invoice</option>
                        <option value="document">📄 Document (PDF/Word)</option>
                        <option value="booking">✈️ Travel / Booking Confirmation</option>
                        <option value="email">✉️ Email correspondence</option>
                        <option value="other">📎 Other Supporting File</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Include Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/40">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Include in final document</h4>
                      <p className="text-[10px] text-gray-400">Uncheck to hide this file without deleting it</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editInclude}
                        onChange={(e) => setEditInclude(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Reviewer Comments (if any) */}
                  {selectedFile.reviewComments && selectedFile.reviewComments.length > 0 && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Reviewer Comments
                      </h4>
                      {selectedFile.reviewComments.map((c) => (
                        <div key={c.id} className="text-xs text-amber-800 dark:text-amber-300">
                          <p className="font-semibold">{c.authorName}:</p>
                          <p className="mt-0.5 leading-relaxed">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes / Internal Comments */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Internal Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Add any internal notes or reminders..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950 shrink-0">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handlePrevNext('prev')}
                      className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-gray-500"
                      title="Previous item"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handlePrevNext('next')}
                      className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-gray-500"
                      title="Next item"
                    >
                      <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveModal}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/10 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
