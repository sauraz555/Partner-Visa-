'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FolderOpen,
  Database,
  Activity,
  AlertTriangle,
  History,
  TrendingUp,
  Settings,
  HardDrive,
  Clock,
  Shield,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatDate, formatDateShort, cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { notify } = useApp();
  const [retentionPeriod, setRetentionPeriod] = useState('12');

  const stats = [
    { label: 'Total Users', value: '847', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Active Projects', value: '234', icon: FolderOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Evidence Files Stored', value: '45,892', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Storage Used', value: '2.3 TB', icon: HardDrive, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' }
  ];

  const systemHealth = [
    { label: 'Processing Queue', value: '12 items', status: 'normal' },
    { label: 'Avg processing time', value: '3.2 seconds', status: 'normal' },
    { label: 'System Error rate', value: '0.1%', status: 'normal' },
    { label: 'Uptime', value: '99.98%', status: 'normal' },
    { label: 'Last backup', value: '2 hours ago', status: 'normal' }
  ];

  const recentUsers = [
    { name: 'Saurav Khanal', email: 'saurav@interlace.com', date: '2026-06-10', status: 'active' },
    { name: 'John Doe', email: 'johndoe@gmail.com', date: '2026-06-10', status: 'pending' },
    { name: 'Jane Smith', email: 'janesmith@gmail.com', date: '2026-06-09', status: 'active' },
    { name: 'Emma Watson', email: 'emma@yahoo.com', date: '2026-06-09', status: 'active' }
  ];

  const recentProjects = [
    { title: 'Partner Visa 820', owner: 'Saurav Khanal', files: 146, status: 'active' },
    { title: 'Partner Visa 309', owner: 'Jane Smith', files: 23, status: 'draft' },
    { title: 'Partner Visa 820', owner: 'John Doe', files: 8, status: 'draft' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold rounded-full">
              System Admin
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time platform metrics, system health logs, and data retention configurations.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* System Health + Retention policy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Health */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-blue-500" />
            System Health
          </h2>

          <div className="divide-y divide-gray-50 dark:divide-gray-850 space-y-3">
            {systemHealth.map((h, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                <span className="text-gray-500 dark:text-gray-450">{h.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{h.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Policy settings */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Settings className="w-4.5 h-4.5 text-blue-500" />
            Retention & Auto-Deletion Policies
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl">
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Evidence Project Expiry</p>
                <p className="text-[10px] text-gray-450 mt-0.5">Time after last activity before raw evidence deletion</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={retentionPeriod}
                  onChange={(e) => {
                    setRetentionPeriod(e.target.value);
                    notify('success', 'Policy Updated', `Project expiry changed to ${e.target.value} months.`);
                  }}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900"
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (Default)</option>
                  <option value="24">24 Months</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex gap-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Auto-Deletion Warnings Enabled</p>
                <p className="mt-0.5 leading-relaxed">
                  System sends automated email reminders to client owners at 30 days and 7 days prior to evidence deletion dates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users + Projects Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent users */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Registrations</h2>

          <div className="overflow-x-auto border border-gray-50 dark:border-gray-850 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-850 dark:text-white">{u.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDateShort(u.date)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold border',
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      )}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent projects */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Active Projects</h2>

          <div className="overflow-x-auto border border-gray-50 dark:border-gray-850 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase">Project Title</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase">Owner</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase">Evidence Files</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentProjects.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-850 dark:text-white">{p.title}</td>
                    <td className="px-4 py-3 text-gray-650 dark:text-gray-400">{p.owner}</td>
                    <td className="px-4 py-3 text-gray-650 dark:text-gray-400">{p.files} items</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
