'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  ShieldCheck,
  History,
  Trash2,
  Download,
  AlertTriangle,
  Mail,
  CheckCircle,
  X,
  Lock
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatDate, formatDateShort, cn } from '@/lib/utils';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Partner/Collaborator' | 'Staff Reviewer' | 'Viewer';
  addedDate: string;
  status: 'active' | 'pending';
}

export default function SharingPage() {
  const { notify } = useApp();

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'partner' | 'viewer'>('partner');

  // Mock members
  const [members, setMembers] = useState<Member[]>([
    { id: 'mem-1', name: 'Saurav Khanal', email: 'saurav@interlacestudies.com', role: 'Partner/Collaborator', addedDate: '2026-05-01', status: 'active' },
    { id: 'mem-2', name: 'Jane Smith', email: 'jane.smith@gmail.com', role: 'Partner/Collaborator', addedDate: '2026-05-02', status: 'active' },
    { id: 'mem-3', name: 'Michael Chen', email: 'mchen@migrationlaw.com.au', role: 'Staff Reviewer', addedDate: '2026-06-01', status: 'active' },
    { id: 'mem-4', name: 'Emma Williams', email: 'emma.williams@yahoo.co.uk', role: 'Viewer', addedDate: '2026-06-08', status: 'pending' }
  ]);

  // Consultant states
  const [allowConsultant, setAllowConsultant] = useState(true);

  // Mock logs
  const accessLogs = [
    { time: '2026-06-10 14:22', name: 'Saurav Khanal', action: 'Generated PDF v1.2 Draft', ip: '203.185.x.x' },
    { time: '2026-06-10 11:15', name: 'Jane Smith', action: 'Uploaded 12 files', ip: '120.142.x.x' },
    { time: '2026-06-09 16:30', name: 'Michael Chen (Staff)', action: 'Viewed Evidence Library', ip: '101.192.x.x' },
    { time: '2026-06-08 10:05', name: 'Emma Williams', action: 'Accepted pending invite', ip: '198.112.x.x' }
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      notify('error', 'Error', 'Please enter a valid email address.');
      return;
    }

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole === 'partner' ? 'Partner/Collaborator' : 'Viewer',
      addedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    notify('success', 'Invitation Sent', `Sent invite link to ${inviteEmail}.`);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    notify('info', 'Member Removed', 'Successfully revoked collaborator access.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sharing & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage collaborator settings and Department review access.
          </p>
        </div>
      </div>

      {/* Project Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Invite collaborator form */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-blue-500" />
            Invite Collaborator
          </h2>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                placeholder="partner@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role & Permissions</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              >
                <option value="partner">Partner / Collaborator (Full edit)</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Send Invitation
            </button>
          </form>
        </div>

        {/* Members Table */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-blue-500" />
            Project Members
          </h2>

          <div className="overflow-x-auto border border-gray-50 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Name / Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-gray-900 dark:text-white capitalize">{m.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{m.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">{m.role}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{formatDateShort(m.addedDate)}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold border',
                        m.status === 'active'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-amber-50 border-amber-100 text-amber-600'
                      )}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {m.email !== 'saurav@interlacestudies.com' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Consultant Settings & Access Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Consultant share permissions */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            Interlace Consultant Reviewer
          </h2>

          <div className="space-y-3.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <p>
              Your project is currently shared with registered reviewer <strong>Michael Chen</strong>.
            </p>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl">
              <div>
                <p className="font-bold text-gray-700 dark:text-gray-300">Allow reviewer access</p>
                <p className="text-[10px] text-gray-400">Enables consultant to inspect evidence and comments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowConsultant}
                  onChange={(e) => setAllowConsultant(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              onClick={() => notify('success', 'Review Requested', 'Successfully requested consultant feedback.')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              Request Consultant Review
            </button>
          </div>
        </div>

        {/* Access History */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-gray-400" />
            Access History Log
          </h2>

          <div className="divide-y divide-gray-100 dark:divide-gray-850 space-y-3">
            {accessLogs.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-700 dark:text-gray-300">{log.name}</p>
                  <p className="text-[10px] text-gray-450 mt-0.5">{log.action}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{log.time}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{log.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Controls Section */}
      <div className="bg-red-50/20 border-2 border-red-200/50 dark:bg-red-950/10 dark:border-red-900/40 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
          Data Controls & Deletion
        </h3>

        <p className="text-xs text-red-800 dark:text-red-300/80 leading-relaxed">
          Permanent actions on your project and account storage. Back up your evidence first to avoid data loss.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => notify('success', 'Download Initiated', 'Compiling evidence data export JSON.')}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Download All Data
          </button>
          <button
            onClick={() => notify('warning', 'Project Deleted', 'This action requires confirmation.')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete This Project
          </button>
        </div>
      </div>
    </div>
  );
}
