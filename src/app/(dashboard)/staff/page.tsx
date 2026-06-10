'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Using framer-motion for smooth transitions and hover states
import {
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  ChevronRight,
  Shield,
  Star,
  CheckSquare
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatDateShort, cn } from '@/lib/utils';

interface StaffProject {
  id: string;
  clientName: string;
  partnerName: string;
  status: 'pending_review' | 'under_review' | 'approved' | 'action_required';
  evidenceCount: number;
  missingCount: number;
  commentsCount: number;
  lastActivity: string;
  priority: 'high' | 'medium' | 'low';
}

export default function StaffDashboardPage() {
  const { notify } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const stats = [
    { label: 'Assigned Projects', value: 12, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Pending Review', value: 5, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Comments Added', value: 23, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Approved Documents', value: 8, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' }
  ];

  const projects: StaffProject[] = [
    { id: 'proj-001', clientName: 'Saurav Khanal', partnerName: 'Jane Smith', status: 'under_review', evidenceCount: 146, missingCount: 18, commentsCount: 5, lastActivity: '2026-06-10T04:22:00Z', priority: 'high' },
    { id: 'proj-002', clientName: 'Alice Johnson', partnerName: 'Bob Brown', status: 'pending_review', evidenceCount: 88, missingCount: 2, commentsCount: 0, lastActivity: '2026-06-09T14:15:00Z', priority: 'medium' },
    { id: 'proj-003', clientName: 'Carlos Ruiz', partnerName: 'Maria Ruiz', status: 'approved', evidenceCount: 195, missingCount: 0, commentsCount: 12, lastActivity: '2026-06-08T09:30:00Z', priority: 'low' },
    { id: 'proj-004', clientName: 'Yuki Tanaka', partnerName: 'Kenji Tanaka', status: 'action_required', evidenceCount: 65, missingCount: 12, commentsCount: 3, lastActivity: '2026-06-07T11:00:00Z', priority: 'high' }
  ];

  const queueItems = [
    { id: 'q-1', text: 'Approve document v1.2 for Saurav Khanal', project: 'proj-001', due: 'Today', priority: 'high' },
    { id: 'q-2', text: 'Review low quality images (5) for Yuki Tanaka', project: 'proj-004', due: 'Tomorrow', priority: 'high' },
    { id: 'q-3', text: 'Verify de facto timeline gaps for Alice Johnson', project: 'proj-002', due: '2 days', priority: 'medium' }
  ];

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || p.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || p.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Review Dashboard</h1>
            <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
              Reviewer Role
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Overview of assigned partner visa evidence reviews and feedback queues.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', stat.bg)}>
                <Icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assigned projects list */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Assigned Projects</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900"
              />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-50 dark:border-gray-850">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Evidence</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Review Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Priority</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 dark:text-white">{p.clientName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Partner: {p.partnerName}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 dark:text-gray-400">
                      <strong>{p.evidenceCount}</strong> files · <span className="text-amber-600">{p.missingCount} missing info</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize',
                        p.status === 'approved' && 'bg-emerald-50 border-emerald-100 text-emerald-600',
                        p.status === 'under_review' && 'bg-blue-50 border-blue-100 text-blue-600',
                        p.status === 'pending_review' && 'bg-amber-50 border-amber-100 text-amber-600',
                        p.status === 'action_required' && 'bg-red-50 border-red-100 text-red-600'
                      )}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize',
                        p.priority === 'high' && 'bg-red-50 border-red-100 text-red-600',
                        p.priority === 'medium' && 'bg-amber-50 border-amber-100 text-amber-600',
                        p.priority === 'low' && 'bg-gray-50 border-gray-200 text-gray-500'
                      )}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => notify('info', 'Project Selected', `Opening review interface for ${p.clientName}.`)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        Review <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Reviewer task queue */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <CheckSquare className="w-4.5 h-4.5 text-blue-500" />
            My Action Queue
          </h2>

          <div className="space-y-3">
            {queueItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl cursor-pointer hover:bg-gray-100/40 select-none"
              >
                <input
                  type="checkbox"
                  onChange={() => notify('success', 'Task Done', 'Removed queue item.')}
                  className="w-4 h-4 rounded text-blue-600 mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{item.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Due {item.due} · Priority {item.priority}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
