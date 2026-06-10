'use client';

import { useState, useRef } from 'react';
import {
  User,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Smartphone,
  Monitor,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Copy,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'security' | 'notifications' | 'privacy';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginEvent {
  date: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SESSIONS: Session[] = [
  { id: 's1', device: 'Chrome on Windows 11', location: 'Sydney, NSW, AU', lastActive: 'Now (current session)', isCurrent: true },
  { id: 's2', device: 'Safari on iPhone 15', location: 'Sydney, NSW, AU', lastActive: '2 hours ago', isCurrent: false },
  { id: 's3', device: 'Firefox on MacBook Pro', location: 'Melbourne, VIC, AU', lastActive: '3 days ago', isCurrent: false },
];

const MOCK_LOGIN_HISTORY: LoginEvent[] = [
  { date: '2026-06-10 14:22', device: 'Chrome on Windows 11', location: 'Sydney, NSW, AU', status: 'success' },
  { date: '2026-06-10 08:15', device: 'Safari on iPhone 15', location: 'Sydney, NSW, AU', status: 'success' },
  { date: '2026-06-09 19:40', device: 'Firefox on MacBook Pro', location: 'Melbourne, VIC, AU', status: 'success' },
  { date: '2026-06-08 22:11', device: 'Unknown Browser', location: 'Singapore', status: 'failed' },
  { date: '2026-06-07 09:30', device: 'Chrome on Windows 11', location: 'Sydney, NSW, AU', status: 'success' },
];

const BACKUP_CODES = [
  'AAAA-BBBB-1111',
  'CCCC-DDDD-2222',
  'EEEE-FFFF-3333',
  'GGGG-HHHH-4444',
  'IIII-JJJJ-5555',
  'KKKK-LLLL-6666',
  'MMMM-NNNN-7777',
  'OOOO-PPPP-8888',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ label, icon: Icon, active, onClick }: { label: string; icon: React.ElementType; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
        }`}
      />
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const [name, setName] = useState('Saurav Khanal');
  const [email, setEmail] = useState('saurav@interlacestudies.com');
  const [phone, setPhone] = useState('+61 400 000 000');
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Profile Photo">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
            >
              <Camera size={13} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Upload new photo
            </button>
            {avatarUrl && (
              <button
                onClick={() => setAvatarUrl(null)}
                className="ml-3 mt-2 text-xs text-red-500 hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full name" value={name} onChange={setName} placeholder="Your full name" />
          <InputField label="Email address" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
          <InputField label="Phone number" type="tel" value={phone} onChange={setPhone} placeholder="+61 400 000 000" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account created</label>
            <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500">
              15 January 2026
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Save profile
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle size={15} />
              Changes saved successfully
            </span>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleMfaToggle = () => {
    if (!mfaEnabled) {
      setShowMfaSetup(true);
    } else {
      setMfaEnabled(false);
      setShowMfaSetup(false);
    }
  };

  const handleMfaConfirm = () => {
    setMfaEnabled(true);
    setShowMfaSetup(false);
  };

  const handlePasswordSave = () => {
    if (!currentPassword) { setPasswordError('Please enter your current password.'); return; }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setPasswordError('');
    setPasswordSaved(true);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const revokeSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));

  const PasswordInput = ({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <SectionCard title="Change Password">
        <div className="space-y-4 max-w-md">
          <PasswordInput label="Current password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(p => !p)} />
          <PasswordInput label="New password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(p => !p)} />
          <PasswordInput label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
          {newPassword && (
            <div className="text-xs text-gray-500 space-y-1">
              <p className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>✓ At least 8 characters</p>
              <p className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>✓ One uppercase letter</p>
              <p className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>✓ One number</p>
              <p className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>✓ One special character</p>
            </div>
          )}
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          <div className="flex items-center gap-3">
            <button onClick={handlePasswordSave} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
              Update password
            </button>
            {passwordSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={15} /> Password updated
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* MFA */}
      <SectionCard title="Two-Factor Authentication (2FA)">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Add an extra layer of security to your account by requiring a verification code when you sign in.</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {mfaEnabled ? '● Enabled' : '○ Disabled'}
            </span>
          </div>
          <button
            onClick={handleMfaToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${mfaEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mfaEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {showMfaSetup && (
          <div className="mt-5 border border-blue-100 bg-blue-50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Scan QR code with your authenticator app</h4>
            <div className="flex gap-6 items-start flex-wrap">
              {/* QR Code Placeholder */}
              <div className="w-36 h-36 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-5 gap-0.5 p-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-2">Or enter this code manually:</p>
                <code className="text-xs font-mono bg-white border border-gray-200 px-3 py-1.5 rounded-lg block">JBSWY3DPEHPK3PXP</code>
                <p className="text-xs text-gray-500 mt-3 mb-1">Backup codes (save these somewhere safe):</p>
                {codesRevealed ? (
                  <div className="grid grid-cols-2 gap-1">
                    {BACKUP_CODES.map(code => (
                      <code key={code} className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded">{code}</code>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setCodesRevealed(true)} className="text-xs text-blue-600 hover:underline">Reveal backup codes</button>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleMfaConfirm} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                Confirm & enable 2FA
              </button>
              <button onClick={() => setShowMfaSetup(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Active Sessions */}
      <SectionCard title="Active Sessions">
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg border ${session.isCurrent ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                {session.device.includes('iPhone') || session.device.includes('Android') ? <Smartphone size={18} className="text-gray-500" /> : <Monitor size={18} className="text-gray-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {session.device}
                    {session.isCurrent && <span className="ml-2 text-xs text-blue-600 font-semibold">(This device)</span>}
                  </p>
                  <p className="text-xs text-gray-500">{session.location} · {session.lastActive}</p>
                </div>
              </div>
              {!session.isCurrent && (
                <button onClick={() => revokeSession(session.id)} className="text-xs text-red-600 hover:underline font-medium">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Login History */}
      <SectionCard title="Login History">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Device</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_LOGIN_HISTORY.map((event, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="py-2.5 px-3 text-gray-700 font-mono text-xs">{event.date}</td>
                  <td className="py-2.5 px-3 text-gray-700">{event.device}</td>
                  <td className="py-2.5 px-3 text-gray-500">{event.location}</td>
                  <td className="py-2.5 px-3">
                    {event.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                        <XCircle size={11} /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [settings, setSettings] = useState({
    reviewerComment: true,
    processingComplete: true,
    documentReady: true,
    marketing: false,
  });

  const toggle = (key: keyof typeof settings) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const NotifRow = ({ label, description, checked, onToggle }: { label: string; description: string; checked: boolean; onToggle: () => void }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-6">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Email Notifications">
        <div>
          <NotifRow
            label="Reviewer adds a comment"
            description="Get notified by email when a staff reviewer adds a comment to your project."
            checked={settings.reviewerComment}
            onToggle={() => toggle('reviewerComment')}
          />
          <NotifRow
            label="Processing complete"
            description="Receive an email when evidence processing (categorisation and captioning) is finished."
            checked={settings.processingComplete}
            onToggle={() => toggle('processingComplete')}
          />
          <NotifRow
            label="Document ready for review"
            description="Get notified when a PDF document draft is ready for your review."
            checked={settings.documentReady}
            onToggle={() => toggle('documentReady')}
          />
          <NotifRow
            label="Marketing emails"
            description="Occasional product updates, tips, and news from Interlace. You can unsubscribe at any time."
            checked={settings.marketing}
            onToggle={() => toggle('marketing')}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
            Save preferences
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle size={15} /> Preferences saved
            </span>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Privacy & Data Tab ───────────────────────────────────────────────────────

function PrivacyTab() {
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const canDelete = deleteInput === 'DELETE';

  return (
    <div className="space-y-6">
      {/* Download data */}
      <SectionCard title="Your Data">
        <p className="text-sm text-gray-600 mb-4">
          Download a complete copy of all your data stored in Interlace, including your profile information, evidence metadata, captions, reviewer comments, and document history. The export is provided as a JSON file.
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
          <Download size={15} />
          Download all my data
        </button>
      </SectionCard>

      {/* Manage evidence */}
      <SectionCard title="Manage Evidence Files">
        <p className="text-sm text-gray-600 mb-4">
          You can delete individual evidence files from your project at any time through the Evidence Library. Deleting a file is permanent and will remove it from all generated documents.
        </p>
        <a href="/dashboard/evidence" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
          Go to Evidence Library <ChevronRight size={14} />
        </a>
      </SectionCard>

      {/* Delete account */}
      <div className="bg-white rounded-xl border-2 border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-red-700">Delete Account</h3>
            <p className="text-sm text-red-600 mt-1">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
          <p className="text-sm font-semibold text-red-700 mb-2">The following will be permanently deleted:</p>
          <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
            <li>Your profile and account information</li>
            <li>All uploaded evidence files and photos</li>
            <li>All AI-generated captions and categories</li>
            <li>All PDF documents and drafts</li>
            <li>Project history and reviewer comments</li>
          </ul>
          <p className="text-sm font-semibold text-red-700 mt-3 mb-2">The following will be retained for legal and compliance purposes:</p>
          <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
            <li>Audit logs (anonymised, 7-year retention as required by Australian law)</li>
            <li>Billing records (7-year retention for tax compliance)</li>
          </ul>
        </div>

        {!deleteConfirmed ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono">DELETE</code> to confirm
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />
            <br />
            <button
              disabled={!canDelete}
              onClick={() => setDeleteConfirmed(true)}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition ${
                canDelete
                  ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Trash2 size={15} />
              Permanently delete account
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle size={16} />
            Account deletion request submitted. You will receive a confirmation email.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy & Data', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-[Instrument_Sans,sans-serif]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Security</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information, security settings, and privacy preferences.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1.5 mb-6">
          {tabs.map(tab => (
            <TabButton key={tab.key} label={tab.label} icon={tab.icon} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </div>
    </div>
  );
}
