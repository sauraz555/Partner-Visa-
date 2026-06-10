'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Calendar,
  Heart,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { generateId } from '@/lib/utils';
import type { Project, RelationshipStatus, VisaSubclass } from '@/lib/types';

const STEPS = [
  { id: 1, label: 'Applicant Details', icon: User },
  { id: 2, label: 'Relationship', icon: Heart },
  { id: 3, label: 'Preferences', icon: FileText },
];

const RELATIONSHIP_TYPES = [
  { value: 'married', label: 'Married' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'de_facto', label: 'De facto (living together)' },
  { value: 'other', label: 'Other' },
];

const VISA_SUBCLASSES = [
  { value: 'unknown', label: "I'm not sure" },
  { value: '820', label: 'Subclass 820 / 801 (Onshore)' },
  { value: '309', label: 'Subclass 309 / 100 (Offshore)' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { dispatch, state } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    applicantName: state.user?.name || '',
    partnerName: '',
    currentCountry: 'Australia',
    partnerCountry: '',
    relationshipStatus: 'de_facto' as RelationshipStatus,
    visaSubclass: 'unknown' as VisaSubclass,
    relationshipStartDate: '',
    marriageDate: '',
    engagementDate: '',
    hasSeparationPeriods: false,
    migrationAgentName: '',
    migrationAgentEmail: '',
    preferredDocumentTitle: 'Relationship Evidence Profile',
    dateFormat: 'australian' as 'australian' | 'international',
    reviewerSharing: false,
    retentionPreference: 'retain_12_months' as Project['retentionPreference'],
  });

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const project: Project = {
      id: generateId('proj'),
      ownerId: state.user?.id || 'user-001',
      title: `${form.applicantName} & ${form.partnerName} — Partner Visa`,
      applicantName: form.applicantName,
      partnerName: form.partnerName,
      relationshipStatus: form.relationshipStatus,
      visaSubclass: form.visaSubclass === 'unknown' ? undefined : form.visaSubclass,
      relationshipStartDate: form.relationshipStartDate || undefined,
      marriageDate: form.marriageDate || undefined,
      engagementDate: form.engagementDate || undefined,
      currentCountry: form.currentCountry,
      partnerCountry: form.partnerCountry || undefined,
      hasSeparationPeriods: form.hasSeparationPeriods,
      migrationAgentName: form.migrationAgentName || undefined,
      migrationAgentEmail: form.migrationAgentEmail || undefined,
      preferredDocumentTitle: form.preferredDocumentTitle,
      dateFormat: form.dateFormat,
      reviewerSharing: form.reviewerSharing,
      retentionPreference: form.retentionPreference,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidenceCount: 0,
      readyCount: 0,
      needsInfoCount: 0,
      duplicateCount: 0,
      excludedCount: 0,
    };

    dispatch({ type: 'ADD_PROJECT', payload: project });
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });

    router.push(`/projects/${project.id}/upload`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Evidence Project</h1>
        <p className="mt-2 text-gray-500">
          Set up your project details to start organising your relationship evidence.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive ? 'text-blue-600' : isDone ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-4 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8"
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Applicant & Partner Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Basic information about the visa applicant and their partner or sponsor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Applicant full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.applicantName}
                  onChange={(e) => update('applicantName', e.target.value)}
                  placeholder="e.g. Saurav Khanal"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Partner or sponsor full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.partnerName}
                  onChange={(e) => update('partnerName', e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Applicant current country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.currentCountry}
                  onChange={(e) => update('currentCountry', e.target.value)}
                  placeholder="e.g. Australia"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Partner current country
                </label>
                <input
                  type="text"
                  value={form.partnerCountry}
                  onChange={(e) => update('partnerCountry', e.target.value)}
                  placeholder="e.g. Australia"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Intended visa subclass
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {VISA_SUBCLASSES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => update('visaSubclass', v.value)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all ${
                      form.visaSubclass === v.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                You can change this later. It is used for the document cover page only.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Relationship Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Key dates and relationship status for the evidence timeline.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current relationship status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {RELATIONSHIP_TYPES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update('relationshipStatus', r.value)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all ${
                      form.relationshipStatus === r.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Relationship commenced (approximate)
                </label>
                <input
                  type="date"
                  value={form.relationshipStartDate}
                  onChange={(e) => update('relationshipStartDate', e.target.value)}
                  className="input"
                />
              </div>

              {(form.relationshipStatus === 'married') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Marriage date
                  </label>
                  <input
                    type="date"
                    value={form.marriageDate}
                    onChange={(e) => update('marriageDate', e.target.value)}
                    className="input"
                  />
                </div>
              )}

              {form.relationshipStatus === 'engaged' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Engagement date
                  </label>
                  <input
                    type="date"
                    value={form.engagementDate}
                    onChange={(e) => update('engagementDate', e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.hasSeparationPeriods}
                    onChange={(e) => update('hasSeparationPeriods', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    This relationship included periods of separation
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    For example, living in different countries, work assignments, or travel
                  </p>
                </div>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Migration agent or reviewer (optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.migrationAgentName}
                  onChange={(e) => update('migrationAgentName', e.target.value)}
                  placeholder="Agent full name"
                  className="input"
                />
                <input
                  type="email"
                  value={form.migrationAgentEmail}
                  onChange={(e) => update('migrationAgentEmail', e.target.value)}
                  placeholder="Agent email address"
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Preferences</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure how your evidence document will be prepared and who can access it.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Document title
              </label>
              <input
                type="text"
                value={form.preferredDocumentTitle}
                onChange={(e) => update('preferredDocumentTitle', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date format in document
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'australian', label: 'Australian (14 June 2026)' },
                  { value: 'international', label: 'International (14 June 2026)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('dateFormat', opt.value)}
                    className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      form.dateFormat === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interlace consultant review
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={form.reviewerSharing}
                  onChange={(e) => update('reviewerSharing', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow assigned Interlace staff to review this project
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    If enabled, your assigned Interlace consultant may review evidence classifications, 
                    suggest caption improvements, and confirm the document before final download.
                    You remain in control of what is included.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data retention preference
              </label>
              <div className="space-y-2">
                {[
                  { value: 'retain_12_months', label: 'Retain for 12 months', desc: 'Evidence files are retained for 12 months after the project is completed.' },
                  { value: 'auto_delete_90', label: 'Auto-delete after 90 days', desc: 'All files will be automatically deleted 90 days after the project is marked complete.' },
                  { value: 'manual', label: 'Manual deletion only', desc: 'Files are only deleted when you explicitly request deletion.' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
                    <input
                      type="radio"
                      name="retention"
                      value={opt.value}
                      checked={form.retentionPreference === opt.value}
                      onChange={() => update('retentionPreference', opt.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Project Summary
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <p><strong>Applicant:</strong> {form.applicantName || '—'}</p>
                <p><strong>Partner:</strong> {form.partnerName || '—'}</p>
                <p><strong>Status:</strong> {RELATIONSHIP_TYPES.find(r => r.value === form.relationshipStatus)?.label}</p>
                <p><strong>Visa:</strong> {VISA_SUBCLASSES.find(v => v.value === form.visaSubclass)?.label}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.push('/dashboard')}
          className="btn-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < STEPS.length ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && (!form.applicantName || !form.partnerName)}
            className="btn-primary disabled:opacity-50"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating project...
              </span>
            ) : (
              <>
                Create Project & Upload Evidence
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
