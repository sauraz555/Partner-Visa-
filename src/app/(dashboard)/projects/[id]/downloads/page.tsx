'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Download,
  Share2,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  Trash2,
  Calendar,
  Lock,
  ArrowRight,
  Info,
  History
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatDate, formatDateShort, formatFileSize, cn, generateId } from '@/lib/utils';

interface PDFVersion {
  version: string;
  date: string;
  status: 'draft' | 'client_review' | 'approved' | 'final';
  pages: number;
  size: number;
}

interface ShareLink {
  id: string;
  recipient: string;
  expiry: string;
  created: string;
  visits: number;
}

export default function DownloadsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject, notify } = useApp();

  const project = getProject(projectId);

  // States
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiryOption, setExpiryOption] = useState<'24h' | '7d' | '30d'>('7d');
  
  // Mock data for links
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    { id: 'link-1', recipient: 'Michael Chen (Agent)', expiry: '2026-06-17', created: '2026-06-10', visits: 4 },
    { id: 'link-2', recipient: 'Emma Williams (Sponsor)', expiry: '2026-06-15', created: '2026-06-08', visits: 12 }
  ]);

  // Mock versions
  const versions: PDFVersion[] = [
    { version: 'v1.2', date: '2026-06-10T04:22:00Z', status: 'client_review', pages: 47, size: 1024 * 1024 * 14.2 },
    { version: 'v1.1', date: '2026-06-08T11:15:00Z', status: 'draft', pages: 45, size: 1024 * 1024 * 13.8 },
    { version: 'v1.0', date: '2026-06-05T09:00:00Z', status: 'draft', pages: 42, size: 1024 * 1024 * 12.1 }
  ];

  const currentVersion = versions[0];

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      notify('error', 'Validation Error', 'Please enter a recipient name or email.');
      return;
    }

    const expiryDates = {
      '24h': new Date(Date.now() + 24 * 60 * 60 * 1000),
      '7d': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const newLink: ShareLink = {
      id: generateId('share'),
      recipient: recipientEmail,
      expiry: expiryDates[expiryOption].toISOString().split('T')[0],
      created: new Date().toISOString().split('T')[0],
      visits: 0
    };

    setShareLinks(prev => [newLink, ...prev]);
    setRecipientEmail('');
    notify('success', 'Sharing Link Generated', `Link created for ${recipientEmail}.`);
  };

  const handleRevokeLink = (id: string) => {
    setShareLinks(prev => prev.filter(l => l.id !== id));
    notify('info', 'Link Revoked', 'The sharing link is no longer accessible.');
  };

  const handleApproveDocument = () => {
    notify('success', 'Document Approved', 'The PDF v1.2 has been approved for submission.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Downloads & Versions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Download your relationship evidence document or review previous drafts.
          </p>
        </div>
      </div>

      {/* Current Draft Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Current Version ({currentVersion.version})</h3>
              <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded-full capitalize">
                {currentVersion.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Generated {formatDate(currentVersion.date)} · {currentVersion.pages} pages · {formatFileSize(currentVersion.size)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => notify('success', 'Download Started', 'Downloading screen-optimised version.')}
            className="flex-1 md:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/10"
          >
            <Download className="w-3.5 h-3.5" />
            Screen-Optimised PDF
          </button>
          <button
            onClick={() => notify('success', 'Download Started', 'Downloading print-quality version.')}
            className="flex-1 md:flex-initial px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Print-Quality PDF
          </button>
          {currentVersion.status === 'client_review' && (
            <button
              onClick={handleApproveDocument}
              className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve Document
            </button>
          )}
        </div>
      </div>

      {/* Version History Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          Version History
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-50 dark:border-gray-800/40 bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Version</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Generated</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Pages</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Size</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {versions.map((v) => (
                <tr key={v.version} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                  <td className="px-5 py-3.5 font-bold text-gray-950 dark:text-white">{v.version}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(v.date)}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{v.pages} pages</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">{formatFileSize(v.size)}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[9px] font-bold border',
                      v.status === 'client_review'
                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                        : v.status === 'approved'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => notify('success', 'Download Started', `Downloading version ${v.version}`)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Download <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sharing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Generate Link */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-blue-500" />
            Generate Shareable Link
          </h2>

          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Recipient Label</label>
              <input
                type="text"
                placeholder="e.g. Michael Chen (Migration Agent)"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Expiry Time</label>
              <div className="grid grid-cols-3 gap-2">
                {(['24h', '7d', '30d'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setExpiryOption(opt)}
                    className={cn(
                      'py-2 border text-xs font-semibold rounded-lg transition-all',
                      expiryOption === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    )}
                  >
                    {opt === '24h' ? '24 Hours' : opt === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              Generate Sharing URL
            </button>
          </form>
        </div>

        {/* Active Links */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Active Sharing Links</h2>

          {shareLinks.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">No active sharing links generated yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {shareLinks.map((link) => (
                <div key={link.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-850 dark:text-white truncate">{link.recipient}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Created {formatDateShort(link.created)} · Expires {formatDateShort(link.expiry)} · {link.visits} downloads
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://interlace.com.au/share/proj-001?key=${link.id}`);
                        notify('success', 'Link Copied', 'Share URL copied to clipboard.');
                      }}
                      className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-600 dark:text-gray-400"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleRevokeLink(link.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Revoke access link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Warning Notice */}
      <div className="bg-gray-50 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 flex gap-3.5">
        <Lock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Document Security Guidelines
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
            Downloaded evidence PDF documents contain sensitive identification, finance, and contact info. We recommend encrypting files or storing them securely. Anyone with an active sharing URL will be able to access and download the corresponding PDF version without logging in until the link is revoked.
          </p>
        </div>
      </div>
    </div>
  );
}
