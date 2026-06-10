'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  Info,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = 'All' | 'Upload' | 'Edit' | 'Delete' | 'View' | 'Generate' | 'Download' | 'Login' | 'Settings';

interface AuditRow {
  id: string;
  datetime: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  ip: string;
  actionType: ActionType;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const ALL_AUDIT_ROWS: AuditRow[] = [
  { id: 'a01', datetime: '2026-06-10 14:22', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'evidence_045.jpg', details: 'Category: Social', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a02', datetime: '2026-06-10 14:20', user: 'Saurav Khanal', action: 'Confirmed caption', entity: 'evidence_032.jpg', details: 'Changed from AI suggested to client confirmed', ip: '203.x.x.x', actionType: 'Edit' },
  { id: 'a03', datetime: '2026-06-09 11:15', user: 'Michael Chen (Staff)', action: 'Added reviewer comment', entity: 'Project proj-001', details: 'Comment: Please confirm the date on this photo.', ip: '101.x.x.x', actionType: 'Edit' },
  { id: 'a04', datetime: '2026-06-09 10:00', user: 'Saurav Khanal', action: 'Generated PDF draft', entity: 'Document v1.0', details: 'Type: Standard, 47 pages', ip: '203.x.x.x', actionType: 'Generate' },
  { id: 'a05', datetime: '2026-06-09 09:45', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'evidence_044.jpg', details: 'Category: Financial', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a06', datetime: '2026-06-09 09:30', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'evidence_043.png', details: 'Category: Communication', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a07', datetime: '2026-06-08 16:55', user: 'Jane Smith (Staff)', action: 'Viewed project', entity: 'Project proj-001', details: 'Read-only access', ip: '112.x.x.x', actionType: 'View' },
  { id: 'a08', datetime: '2026-06-08 15:30', user: 'Michael Chen (Staff)', action: 'Updated review status', entity: 'Project proj-001', details: 'Status changed to: In Review', ip: '101.x.x.x', actionType: 'Edit' },
  { id: 'a09', datetime: '2026-06-08 14:00', user: 'Saurav Khanal', action: 'Edited caption', entity: 'evidence_028.jpg', details: 'Caption updated manually by client', ip: '203.x.x.x', actionType: 'Edit' },
  { id: 'a10', datetime: '2026-06-08 13:22', user: 'Saurav Khanal', action: 'Deleted file', entity: 'evidence_012.jpg', details: 'File permanently removed', ip: '203.x.x.x', actionType: 'Delete' },
  { id: 'a11', datetime: '2026-06-08 10:11', user: 'Saurav Khanal', action: 'Downloaded document', entity: 'Document v0.9', details: 'Format: PDF, Draft', ip: '203.x.x.x', actionType: 'Download' },
  { id: 'a12', datetime: '2026-06-07 17:45', user: 'Saurav Khanal', action: 'Logged in', entity: 'Account', details: 'Device: Chrome on Windows 11', ip: '203.x.x.x', actionType: 'Login' },
  { id: 'a13', datetime: '2026-06-07 14:20', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'evidence_040.jpg', details: 'Category: Travel', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a14', datetime: '2026-06-07 14:18', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'evidence_039.jpg', details: 'Category: Travel', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a15', datetime: '2026-06-07 11:00', user: 'Michael Chen (Staff)', action: 'Added reviewer comment', entity: 'evidence_035.jpg', details: 'Comment: Caption looks good, approved.', ip: '101.x.x.x', actionType: 'Edit' },
  { id: 'a16', datetime: '2026-06-06 16:33', user: 'Saurav Khanal', action: 'Changed notification settings', entity: 'Account settings', details: 'Toggled: Email on comment → OFF', ip: '203.x.x.x', actionType: 'Settings' },
  { id: 'a17', datetime: '2026-06-06 15:00', user: 'Saurav Khanal', action: 'Viewed evidence file', entity: 'evidence_020.jpg', details: 'Thumbnail and metadata viewed', ip: '203.x.x.x', actionType: 'View' },
  { id: 'a18', datetime: '2026-06-06 12:45', user: 'Jane Smith (Staff)', action: 'Requested missing info', entity: 'Project proj-001', details: 'Requested bank statement for April 2026', ip: '112.x.x.x', actionType: 'Edit' },
  { id: 'a19', datetime: '2026-06-05 10:30', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'bank_statement_apr26.pdf', details: 'Category: Financial', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a20', datetime: '2026-06-05 09:55', user: 'Saurav Khanal', action: 'Logged in', entity: 'Account', details: 'Device: Safari on iPhone 15', ip: '203.x.x.x', actionType: 'Login' },
  { id: 'a21', datetime: '2026-06-04 18:10', user: 'Saurav Khanal', action: 'Generated PDF draft', entity: 'Document v0.9', details: 'Type: Standard, 43 pages', ip: '203.x.x.x', actionType: 'Generate' },
  { id: 'a22', datetime: '2026-06-04 17:30', user: 'Saurav Khanal', action: 'Confirmed caption', entity: 'evidence_025.jpg', details: 'AI caption accepted without changes', ip: '203.x.x.x', actionType: 'Edit' },
  { id: 'a23', datetime: '2026-06-04 14:00', user: 'Michael Chen (Staff)', action: 'Viewed project', entity: 'Project proj-001', details: 'Full project review', ip: '101.x.x.x', actionType: 'View' },
  { id: 'a24', datetime: '2026-06-03 11:22', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'evidence_030.jpg', details: 'Category: Cohabitation', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a25', datetime: '2026-06-03 10:00', user: 'Saurav Khanal', action: 'Uploaded file', entity: 'lease_agreement.pdf', details: 'Category: Cohabitation', ip: '203.x.x.x', actionType: 'Upload' },
  { id: 'a26', datetime: '2026-06-02 16:40', user: 'Saurav Khanal', action: 'Edited caption', entity: 'evidence_018.jpg', details: 'Caption corrected: wrong date removed', ip: '203.x.x.x', actionType: 'Edit' },
  { id: 'a27', datetime: '2026-06-02 14:55', user: 'Jane Smith (Staff)', action: 'Approved document section', entity: 'Document v0.8 – Section 3', details: 'Social evidence section approved', ip: '112.x.x.x', actionType: 'Edit' },
  { id: 'a28', datetime: '2026-06-01 09:30', user: 'Saurav Khanal', action: 'Logged in', entity: 'Account', details: 'Device: Chrome on Windows 11', ip: '203.x.x.x', actionType: 'Login' },
  { id: 'a29', datetime: '2026-05-31 20:15', user: 'Saurav Khanal', action: 'Downloaded document', entity: 'Document v0.8', details: 'Format: PDF, Draft review copy', ip: '203.x.x.x', actionType: 'Download' },
  { id: 'a30', datetime: '2026-05-30 13:00', user: 'Saurav Khanal', action: 'Created project', entity: 'Project proj-001', details: 'New partner visa project initialised', ip: '203.x.x.x', actionType: 'Settings' },
];

const PAGE_SIZE = 20;

const ACTION_COLORS: Record<string, string> = {
  Upload: 'bg-blue-50 text-blue-700',
  Edit: 'bg-amber-50 text-amber-700',
  Delete: 'bg-red-50 text-red-700',
  View: 'bg-gray-50 text-gray-600',
  Generate: 'bg-purple-50 text-purple-700',
  Download: 'bg-green-50 text-green-700',
  Login: 'bg-indigo-50 text-indigo-700',
  Settings: 'bg-teal-50 text-teal-700',
};

function getActionColor(action: string): string {
  for (const [key, cls] of Object.entries(ACTION_COLORS)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return 'bg-gray-50 text-gray-600';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionType>('All');
  const [userFilter, setUserFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const ACTION_TYPES: ActionType[] = ['All', 'Upload', 'Edit', 'Delete', 'View', 'Generate', 'Download', 'Login', 'Settings'];

  const filtered = useMemo(() => {
    return ALL_AUDIT_ROWS.filter(row => {
      if (actionFilter !== 'All' && row.actionType !== actionFilter) return false;
      if (userFilter && !row.user.toLowerCase().includes(userFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!row.action.toLowerCase().includes(q) && !row.entity.toLowerCase().includes(q) && !row.details.toLowerCase().includes(q)) return false;
      }
      if (dateFrom && row.datetime < dateFrom) return false;
      if (dateTo && row.datetime.slice(0, 10) > dateTo) return false;
      return true;
    });
  }, [actionFilter, userFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = ['Date & Time', 'User', 'Action', 'Entity', 'Details', 'IP Address'];
    const rows = filtered.map(r => [r.datetime, r.user, r.action, r.entity, r.details, r.ip].map(v => `"${v}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Instrument_Sans,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Audit History</h1>
          <p className="text-sm text-gray-500 mt-1">A complete record of all actions taken in this account.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Date range */}
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Action type</label>
              <select
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value as ActionType); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {ACTION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* User filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">User</label>
              <input
                type="text"
                placeholder="Filter by user..."
                value={userFilter}
                onChange={e => { setUserFilter(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions, entities..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition h-[38px]"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Filter size={12} />
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date & Time', 'User', 'Action', 'Entity', 'Details', 'IP Address'].map(col => (
                    <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-gray-400">No audit records match the current filters.</td>
                  </tr>
                ) : (
                  currentRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">{row.datetime}</td>
                      <td className="py-3 px-4 text-gray-800 font-medium whitespace-nowrap">{row.user}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${getActionColor(row.action)}`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-mono text-xs whitespace-nowrap">{row.entity}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate" title={row.details}>{row.details}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400 whitespace-nowrap">{row.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    p === page ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Compliance notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Compliance notice:</span> This audit log records all significant actions for privacy and compliance purposes. It cannot be manually edited or deleted. Logs are retained for 7 years as required by applicable Australian privacy and migration regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
