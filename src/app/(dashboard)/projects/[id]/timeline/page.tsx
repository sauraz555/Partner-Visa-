'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Star,
  Plus,
  AlertTriangle,
  Eye,
  Info,
  MapPin,
  Users,
  Clock,
  Trash2,
  X,
  Save,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { CATEGORY_META } from '@/lib/mock-data';
import { formatDate, formatDateShort, formatMonthYear, cn, generateId } from '@/lib/utils';
import type { TimelineMilestone, EvidenceCategory, EvidenceFile } from '@/lib/types';

export default function TimelineBuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject, getEvidence, getMilestones, dispatch, notify } = useApp();

  const project = getProject(projectId);
  const evidence = getEvidence(projectId);
  const rawMilestones = getMilestones(projectId);

  // States
  const [filterKeyMilestones, setFilterKeyMilestones] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new milestone
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mDateApprox, setMDateApprox] = useState(false);
  const [mDescription, setMDescription] = useState('');
  const [mCategory, setMCategory] = useState<EvidenceCategory | 'milestone'>('milestone');
  const [mIsKey, setMIsKey] = useState(true);
  const [mSelectedFiles, setMSelectedFiles] = useState<string[]>([]);

  // Calculate gaps (e.g. periods of >3 months without evidence)
  const timelineGaps = useMemo(() => {
    if (evidence.length === 0) return [];
    
    // Sort evidence by date
    const sortedFiles = [...evidence]
      .filter(f => f.status === 'ready' || f.status === 'approved')
      .map(f => ({
        date: new Date(f.confirmedDate || f.suggestedDate || ''),
        id: f.id
      }))
      .filter(f => !isNaN(f.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (sortedFiles.length < 2) return [];

    const gaps: { startStr: string; endStr: string; months: number }[] = [];
    for (let i = 0; i < sortedFiles.length - 1; i++) {
      const current = sortedFiles[i].date;
      const next = sortedFiles[i + 1].date;
      
      const diffMs = next.getTime() - current.getTime();
      const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375); // Average month length

      if (diffMonths >= 3) {
        gaps.push({
          startStr: sortedFiles[i].date.toISOString().split('T')[0],
          endStr: sortedFiles[i + 1].date.toISOString().split('T')[0],
          months: Math.round(diffMonths)
        });
      }
    }
    return gaps;
  }, [evidence]);

  // Combine milestones and evidence into a unified chronological list
  const timelineItems = useMemo(() => {
    const items: {
      type: 'milestone' | 'evidence';
      id: string;
      date: string;
      title: string;
      description?: string;
      category: string;
      isKey: boolean;
      files?: EvidenceFile[];
      location?: string;
    }[] = [];

    // Add custom milestones
    rawMilestones.forEach(m => {
      // Find linked files if any
      const linkedFiles = m.linkedFileIds
        ? evidence.filter(f => m.linkedFileIds?.includes(f.id))
        : [];

      items.push({
        type: 'milestone',
        id: m.id,
        date: m.date,
        title: m.title,
        description: m.description,
        category: m.category,
        isKey: !!m.isKeyMilestone,
        files: linkedFiles
      });
    });

    // Add key evidence files that aren't already linked to milestones (e.g. photos)
    const linkedFileIds = new Set(rawMilestones.flatMap(m => m.linkedFileIds || []));
    evidence
      .filter(f => (f.status === 'ready' || f.status === 'approved') && !linkedFileIds.has(f.id))
      .forEach(f => {
        // Group files by month/category to avoid timeline clutter? 
        // For simplicity and timeline completeness, we include files with distinct captions
        if (f.confirmedCaption || f.suggestedCaption) {
          items.push({
            type: 'evidence',
            id: f.id,
            date: f.confirmedDate || f.suggestedDate || '',
            title: f.originalFilename,
            description: f.confirmedCaption || f.suggestedCaption,
            category: f.confirmedCategory || f.suggestedCategory || 'other',
            isKey: false,
            files: [f],
            location: f.confirmedLocation || f.suggestedLocation
          });
        }
      });

    // Sort items chronologically
    return items
      .filter(item => item.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter(item => !filterKeyMilestones || item.isKey);
  }, [rawMilestones, evidence, filterKeyMilestones]);

  // Group by year and month
  const groupedTimeline = useMemo(() => {
    const groups: {
      year: number;
      months: {
        monthName: string;
        items: typeof timelineItems;
      }[];
    }[] = [];

    timelineItems.forEach(item => {
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return;
      
      const year = date.getFullYear();
      const monthName = date.toLocaleString('en-AU', { month: 'long' });

      let yearGroup = groups.find(g => g.year === year);
      if (!yearGroup) {
        yearGroup = { year, months: [] };
        groups.push(yearGroup);
      }

      let monthGroup = yearGroup.months.find(m => m.monthName === monthName);
      if (!monthGroup) {
        monthGroup = { monthName, items: [] };
        yearGroup.months.push(monthGroup);
      }

      monthGroup.items.push(item);
    });

    // Sort years descending, months chronological
    return groups
      .sort((a, b) => b.year - a.year)
      .map(g => ({
        ...g,
        months: g.months.sort((a, b) => {
          const m1 = new Date(`${a.monthName} 1, ${g.year}`).getMonth();
          const m2 = new Date(`${b.monthName} 1, ${g.year}`).getMonth();
          return m2 - m1; // Show recent first
        })
      }));
  }, [timelineItems]);

  const handleAddMilestone = () => {
    if (!mTitle || !mDate) {
      notify('error', 'Validation Error', 'Title and Date are required fields.');
      return;
    }

    const newMilestone: TimelineMilestone = {
      id: generateId('milestone'),
      projectId,
      title: mTitle,
      date: mDate,
      dateApproximate: mDateApprox,
      description: mDescription,
      category: mCategory,
      isKeyMilestone: mIsKey,
      linkedFileIds: mSelectedFiles
    };

    dispatch({
      type: 'SET_MILESTONES',
      payload: {
        projectId,
        milestones: [...rawMilestones, newMilestone]
      }
    });

    notify('success', 'Milestone Created', `Successfully added "${mTitle}" to timeline.`);
    
    // Clear form
    setMTitle('');
    setMDate('');
    setMDateApprox(false);
    setMDescription('');
    setMCategory('milestone');
    setMIsKey(true);
    setMSelectedFiles([]);
    setIsModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    const updated = rawMilestones.filter(m => m.id !== id);
    dispatch({
      type: 'SET_MILESTONES',
      payload: { projectId, milestones: updated }
    });
    notify('info', 'Milestone Deleted', 'Removed milestone from timeline.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relationship Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your evidence arranged chronologically. Click any event to view or edit related evidence.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setFilterKeyMilestones(!filterKeyMilestones)}
            className={cn(
              'px-4 py-2 border rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5',
              filterKeyMilestones
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 dark:bg-gray-900'
            )}
          >
            <Star className={cn('w-4 h-4', filterKeyMilestones && 'fill-current')} />
            Key Milestones Only
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/15"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Gap Warning Banner */}
      {timelineGaps.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 flex gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              Timeline Gaps Detected
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-normal">
              Registered agents look for continuous relationship evidence. Consider adding evidence for the following periods:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
              {timelineGaps.slice(0, 3).map((gap, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <strong>{formatMonthYear(gap.startStr)} – {formatMonthYear(gap.endStr)}</strong> ({gap.months} months gap)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Timeline Layout */}
      {groupedTimeline.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-20 px-4 text-center">
          <Calendar className="w-14 h-14 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Timeline is empty</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Upload evidence files to generate events, or click &quot;Add Milestone&quot; to define a custom relationship milestone.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto pl-4 md:pl-28 relative">
          {/* Main vertical line */}
          <div className="absolute left-4 md:left-[108px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800" />

          {groupedTimeline.map((yearGroup) => (
            <div key={yearGroup.year} className="mb-10 relative">
              {/* Year Header */}
              <div className="sticky top-2 z-10 md:absolute md:left-[-120px] md:w-20 md:text-right mt-1.5">
                <span className="inline-block text-lg font-black text-blue-600 dark:text-blue-400 bg-[#fdfdfc] dark:bg-transparent px-2 py-0.5 rounded md:px-0">
                  {yearGroup.year}
                </span>
              </div>

              <div className="space-y-8 mt-4">
                {yearGroup.months.map((monthGroup) => (
                  <div key={monthGroup.monthName} className="space-y-6">
                    {/* Month header badge */}
                    <div className="relative pl-8 md:pl-0">
                      <div className="absolute left-[-2px] md:left-[61px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 md:ml-4">
                        {monthGroup.monthName}
                      </span>
                    </div>

                    <div className="space-y-5 pl-8 md:pl-0">
                      {monthGroup.items.map((item) => {
                        const isMilestone = item.type === 'milestone';
                        const catMeta = CATEGORY_META[item.category as EvidenceCategory] || {
                          label: 'Milestone',
                          icon: '📍',
                          colour: 'indigo'
                        };

                        return (
                          <div key={item.id} className="relative group">
                            {/* Dot indicator */}
                            <div className="absolute left-[-34px] md:left-[63px] top-6 w-3 h-3 rounded-full bg-white dark:bg-gray-950 border-2 border-blue-500 shadow-sm z-10 transition-transform group-hover:scale-125" />

                            {/* Card content */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative md:ml-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Date Badge */}
                                  <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded">
                                    {formatDateShort(item.date)}
                                  </span>

                                  {/* Category pill */}
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-[10px] font-semibold rounded-full dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                    <span>{catMeta.icon}</span>
                                    {catMeta.label}
                                  </span>

                                  {/* Key milestone star */}
                                  {item.isKey && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                      <Star className="w-3 h-3 fill-current" />
                                      Key Milestone
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                  {item.title}
                                </h3>

                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                  {item.description}
                                </p>

                                {item.location && (
                                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {item.location}
                                  </div>
                                )}

                                {/* Thumbnail Strip */}
                                {item.files && item.files.length > 0 && (
                                  <div className="flex gap-2 mt-3 flex-wrap">
                                    {item.files.map((file) => (
                                      <div key={file.id} className="w-14 h-11 bg-gray-50 rounded border overflow-hidden shrink-0 relative group/thumb">
                                        {file.thumbnailUrl ? (
                                          <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="w-full h-full flex items-center justify-center text-xs">📄</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Milestone Actions */}
                              {isMilestone && (
                                <button
                                  onClick={() => handleDeleteMilestone(item.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors shrink-0 md:self-center"
                                  title="Delete Milestone"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD MILESTONE MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4.5 h-4.5 text-blue-500" />
                  Add Custom Milestone
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Milestone Title</label>
                  <input
                    type="text"
                    placeholder="e.g. First Meeting, Moved in together"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mDateApprox}
                        onChange={(e) => setMDateApprox(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span className="text-xs text-gray-500">Approximate date</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900"
                  />
                </div>

                {/* Category selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                  <div className="relative">
                    <select
                      value={mCategory}
                      onChange={(e) => setMCategory(e.target.value as any)}
                      className="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none appearance-none"
                    >
                      <option value="milestone">📍 Milestone Event</option>
                      {Object.entries(CATEGORY_META).map(([key, val]) => (
                        <option key={key} value={key}>{val.icon} {val.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what occurred, who was present, and why it's significant for your relationship..."
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 resize-none leading-relaxed"
                  />
                </div>

                {/* Key Milestone checkbox */}
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/40 rounded-xl select-none">
                  <input
                    type="checkbox"
                    checked={mIsKey}
                    onChange={(e) => setMIsKey(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-blue-600"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Mark as Key Milestone</h4>
                    <p className="text-[10px] text-gray-400">Highlights this event in the PDF document cover section</p>
                  </div>
                </label>

                {/* Linked Evidence files dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Link Evidence (Optional)</label>
                  <div className="max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg p-2 divide-y divide-gray-50 dark:divide-gray-800 space-y-1">
                    {evidence
                      .filter(f => f.status === 'ready' || f.status === 'approved')
                      .map((file) => {
                        const isChecked = mSelectedFiles.includes(file.id);
                        return (
                          <label key={file.id} className="flex items-center gap-2.5 py-1.5 px-1 hover:bg-gray-50 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setMSelectedFiles(prev =>
                                  isChecked ? prev.filter(x => x !== file.id) : [...prev, file.id]
                                );
                              }}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <div className="w-8 h-6 bg-gray-100 rounded overflow-hidden shrink-0">
                              {file.thumbnailUrl && (
                                <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="text-xs text-gray-600 truncate flex-1">{file.originalFilename}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Footer controls */}
              <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Add to timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
