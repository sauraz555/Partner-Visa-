'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, Phone, User, CheckCircle2,
  Shield, ChevronRight, ChevronLeft, Check,
} from 'lucide-react';
import { useApp } from '@/lib/store';

// ─── Interlace Logo ──────────────────────────────────────────────────────────

function InterlaceLogo({ size = 40, white = false }: { size?: number; white?: boolean }) {
  const primary = white ? '#FFFFFF' : '#2563EB';
  const secondary = white ? 'rgba(255,255,255,0.6)' : '#93C5FD';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Interlace logo">
      <circle cx="20" cy="20" r="18" stroke={primary} strokeWidth="2.5" fill="none" />
      <circle cx="20" cy="20" r="11" stroke={secondary} strokeWidth="2.5" fill="none" />
      <ellipse cx="20" cy="20" rx="18" ry="8" stroke={primary} strokeWidth="2" fill="none" opacity="0.5" transform="rotate(45 20 20)" />
      <ellipse cx="20" cy="20" rx="18" ry="8" stroke={secondary} strokeWidth="2" fill="none" opacity="0.5" transform="rotate(-45 20 20)" />
      <circle cx="20" cy="20" r="3" fill={primary} />
    </svg>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                {stepNum === 1 ? 'Account' : stepNum === 2 ? 'Privacy' : 'Preferences'}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i < current - 1 ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Input Component ─────────────────────────────────────────────────────────

function FormInput({
  id, label, type = 'text', value, onChange, placeholder, error, icon: Icon,
  rightElement, autoComplete,
}: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; icon?: React.ElementType; rightElement?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-2.5 border rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
            error ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-slate-200 hover:border-slate-300'
          }`}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Privacy Notice Text ─────────────────────────────────────────────────────

const PRIVACY_NOTICE = `PRIVACY NOTICE — INTERLACE PARTNER VISA EVIDENCE BUILDER

Last updated: January 2025

1. WHO WE ARE
Interlace is an Australian software service that helps individuals preparing partner visa applications to organise and compile photographic and documentary evidence. References to "we", "us", or "Interlace" mean the Interlace platform and its operators.

2. WHAT INFORMATION WE COLLECT
We collect information you provide directly to us, including: your full name, email address, phone number, and any evidence files (photographs, screenshots, documents) you upload to the platform. We also collect metadata such as upload timestamps, file types, and usage patterns for the purpose of improving the service.

3. HOW WE USE YOUR INFORMATION
Your information is used solely to: (a) provide and improve the Evidence Builder service; (b) compile your uploaded evidence into structured PDF documents; (c) send you service-related notifications and account updates; and (d) comply with legal obligations. We do not sell, rent, or share your personal information with third parties for marketing purposes.

4. IMAGES OF OTHER PEOPLE
By uploading photographs that include images of other individuals (such as your partner, family members, or friends), you confirm that you have obtained appropriate consent from those individuals, or that you have a lawful basis to process their images in connection with your visa application. You accept full responsibility for ensuring compliance with applicable privacy laws.

5. DATA SECURITY
All uploaded files and personal information are encrypted in transit (TLS 1.3) and at rest (AES-256). Access is restricted to authorised personnel only. We follow industry best practices for data security and conduct regular security reviews.

6. DATA RETENTION & DELETION
You may request deletion of your account and all associated data at any time by visiting Account Settings. We offer automatic deletion options at 12 months, 24 months, or manual deletion only. Upon account deletion, all files and personal data are permanently removed within 30 days.

7. YOUR RIGHTS
Under the Australian Privacy Act 1988 and applicable state legislation, you have the right to: access the personal information we hold about you; request correction of inaccurate information; request deletion of your information; and lodge a complaint with the Office of the Australian Information Commissioner (OAIC).

8. SHARING WITH CONSULTANTS
If you choose to share your evidence project with an Interlace registered migration consultant, that consultant will have read-only access to your project. Consultants are bound by their own professional obligations and the Interlace Consultant Agreement. You may revoke consultant access at any time.

9. COOKIES & ANALYTICS
We use functional cookies required for the operation of the service. We do not use advertising or tracking cookies. Basic anonymised analytics help us improve the platform.

10. CONTACT
For privacy enquiries, contact: privacy@interlace.com.au`;

// ─── Step 1: Account Details ──────────────────────────────────────────────────

interface Step1Data {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Step1Errors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function Step1({
  data,
  onChange,
  errors,
}: {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: string) => void;
  errors: Step1Errors;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Create your account</h3>
        <p className="text-sm text-slate-500 mt-1">Start building your partner visa evidence today.</p>
      </div>

      <FormInput
        id="fullName"
        label="Full name"
        value={data.fullName}
        onChange={(v) => onChange('fullName', v)}
        placeholder="Jane Smith"
        error={errors.fullName}
        icon={User}
        autoComplete="name"
      />

      <FormInput
        id="email"
        label="Email address"
        type="email"
        value={data.email}
        onChange={(v) => onChange('email', v)}
        placeholder="you@example.com"
        error={errors.email}
        icon={Mail}
        autoComplete="email"
      />

      <FormInput
        id="phone"
        label="Phone number (optional)"
        type="tel"
        value={data.phone}
        onChange={(v) => onChange('phone', v)}
        placeholder="+61 400 000 000"
        error={errors.phone}
        icon={Phone}
        autoComplete="tel"
      />

      <FormInput
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={data.password}
        onChange={(v) => onChange('password', v)}
        placeholder="••••••••"
        error={errors.password}
        icon={Lock}
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Password strength */}
      {data.password && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[1,2,3,4].map((n) => {
              const strength = Math.min(
                [data.password.length >= 8, /[A-Z]/.test(data.password), /[0-9]/.test(data.password), /[^A-Za-z0-9]/.test(data.password)].filter(Boolean).length,
                4
              );
              return (
                <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= strength ? (strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : strength <= 3 ? 'bg-blue-400' : 'bg-green-500') : 'bg-slate-200'}`} />
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            {(() => {
              const s = [data.password.length >= 8, /[A-Z]/.test(data.password), /[0-9]/.test(data.password), /[^A-Za-z0-9]/.test(data.password)].filter(Boolean).length;
              return s <= 1 ? 'Weak — add uppercase, numbers, and symbols' : s <= 2 ? 'Fair — add more variety' : s <= 3 ? 'Good password' : 'Strong password ✓';
            })()}
          </p>
        </div>
      )}

      <FormInput
        id="confirmPassword"
        label="Confirm password"
        type={showConfirm ? 'text' : 'password'}
        value={data.confirmPassword}
        onChange={(v) => onChange('confirmPassword', v)}
        placeholder="••••••••"
        error={errors.confirmPassword}
        icon={Lock}
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showConfirm ? 'Hide' : 'Show'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
    </div>
  );
}

// ─── Step 2: Consent & Privacy ────────────────────────────────────────────────

interface Step2Data {
  acceptPrivacy: boolean;
  acceptTerms: boolean;
  acceptImageAuthority: boolean;
  reviewPreference: 'self' | 'consultant' | '';
}

interface Step2Errors {
  acceptPrivacy?: string;
  acceptTerms?: string;
  acceptImageAuthority?: string;
  reviewPreference?: string;
}

function Step2({
  data,
  onChange,
  errors,
}: {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: boolean | string) => void;
  errors: Step2Errors;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Consent &amp; Privacy</h3>
        <p className="text-sm text-slate-500 mt-1">Please read and accept before continuing.</p>
      </div>

      {/* Scrollable privacy notice */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Privacy Notice</label>
        <div className="h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-mono scrollbar-thin">
          {PRIVACY_NOTICE}
        </div>
      </div>

      {/* Consent checkboxes */}
      <div className="space-y-3">
        {[
          {
            key: 'acceptPrivacy' as const,
            label: 'I have read and accept the Privacy Notice',
            error: errors.acceptPrivacy,
            checked: data.acceptPrivacy,
          },
          {
            key: 'acceptTerms' as const,
            label: 'I accept the Terms of Service',
            error: errors.acceptTerms,
            checked: data.acceptTerms,
          },
          {
            key: 'acceptImageAuthority' as const,
            label: 'I confirm I have the authority to upload images of other people included in this project',
            error: errors.acceptImageAuthority,
            checked: data.acceptImageAuthority,
          },
        ].map(({ key, label, error, checked }) => (
          <div key={key}>
            <label className={`flex items-start gap-3 cursor-pointer group p-3 rounded-xl border transition-all ${checked ? 'border-blue-200 bg-blue-50' : error ? 'border-red-200 bg-red-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
              <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-blue-600 border-blue-600' : error ? 'border-red-400' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </div>
              <input type="checkbox" checked={checked} onChange={(e) => onChange(key, e.target.checked)} className="sr-only" />
              <span className="text-sm text-slate-700 leading-relaxed select-none">{label}</span>
            </label>
            {error && <p className="mt-1 text-xs text-red-600 pl-1">{error}</p>}
          </div>
        ))}
      </div>

      {/* Evidence review preference */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Evidence review preference <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            {
              value: 'self' as const,
              title: 'Self-service',
              description: 'I\'ll organise and review my own evidence independently.',
            },
            {
              value: 'consultant' as const,
              title: 'Share with Interlace consultant',
              description: 'Allow a registered Interlace migration consultant to review and advise on my evidence. Recommended.',
            },
          ].map(({ value, title, description }) => (
            <label
              key={value}
              className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${data.reviewPreference === value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${data.reviewPreference === value ? 'border-blue-600' : 'border-slate-300'}`}>
                {data.reviewPreference === value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <input
                type="radio"
                name="reviewPreference"
                value={value}
                checked={data.reviewPreference === value}
                onChange={() => onChange('reviewPreference', value)}
                className="sr-only"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.reviewPreference && (
          <p className="mt-1.5 text-xs text-red-600">{errors.reviewPreference}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Preferences ──────────────────────────────────────────────────────

interface Step3Data {
  deletionPreference: '12months' | '24months' | 'manual' | '';
  notifyUploadReminders: boolean;
  notifyMissingItems: boolean;
  notifyDocumentReady: boolean;
  notifyProductUpdates: boolean;
}

interface Step3Errors {
  deletionPreference?: string;
}

function Step3({
  data,
  onChange,
  errors,
}: {
  data: Step3Data;
  onChange: (field: keyof Step3Data, value: boolean | string) => void;
  errors: Step3Errors;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Your Preferences</h3>
        <p className="text-sm text-slate-500 mt-1">Customise how Interlace works for you.</p>
      </div>

      {/* Deletion preference */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Automatic data deletion <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          For your security, choose when your evidence and account data should be automatically deleted.
        </p>
        <div className="space-y-2">
          {[
            { value: '12months' as const, label: 'Delete after 12 months', sub: 'Suitable for most applicants' },
            { value: '24months' as const, label: 'Delete after 24 months', sub: 'If your process may take longer' },
            { value: 'manual' as const, label: 'Manual deletion only', sub: 'I\'ll manage deletion myself' },
          ].map(({ value, label, sub }) => (
            <label
              key={value}
              className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border-2 transition-all ${data.deletionPreference === value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${data.deletionPreference === value ? 'border-blue-600' : 'border-slate-300'}`}>
                {data.deletionPreference === value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <input type="radio" name="deletion" value={value} checked={data.deletionPreference === value} onChange={() => onChange('deletionPreference', value)} className="sr-only" />
              <div>
                <span className="text-sm font-medium text-slate-800">{label}</span>
                <span className="text-xs text-slate-500 ml-2">— {sub}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.deletionPreference && (
          <p className="mt-1.5 text-xs text-red-600">{errors.deletionPreference}</p>
        )}
      </div>

      {/* Email notifications */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Email notification preferences
        </label>
        <div className="space-y-2">
          {[
            { key: 'notifyUploadReminders' as const, label: 'Upload reminders', sub: 'Remind me if I haven\'t uploaded evidence in 2 weeks' },
            { key: 'notifyMissingItems' as const, label: 'Missing evidence alerts', sub: 'Notify me when AI detects gaps in my evidence' },
            { key: 'notifyDocumentReady' as const, label: 'Document ready', sub: 'Tell me when my PDF evidence pack is generated' },
            { key: 'notifyProductUpdates' as const, label: 'Product updates', sub: 'News about new Interlace features (optional)' },
          ].map(({ key, label, sub }) => (
            <label key={key} className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border transition-all ${data[key] ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${data[key] ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                {data[key] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </div>
              <input type="checkbox" checked={data[key]} onChange={(e) => onChange(key, e.target.checked)} className="sr-only" />
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Summary banner */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">You&apos;re almost done!</p>
          <p className="text-xs text-green-700 mt-0.5">
            Click &quot;Complete registration&quot; to create your account and start organising your evidence.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Register Page ───────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 data
  const [step1, setStep1] = useState<Step1Data>({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  // Step 2 data
  const [step2, setStep2] = useState<Step2Data>({
    acceptPrivacy: false, acceptTerms: false, acceptImageAuthority: false, reviewPreference: '',
  });
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});

  // Step 3 data
  const [step3, setStep3] = useState<Step3Data>({
    deletionPreference: '',
    notifyUploadReminders: true,
    notifyMissingItems: true,
    notifyDocumentReady: true,
    notifyProductUpdates: false,
  });
  const [step3Errors, setStep3Errors] = useState<Step3Errors>({});

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const errs: Step1Errors = {};
    if (!step1.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!step1.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!step1.password) {
      errs.password = 'Password is required.';
    } else if (step1.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
    if (!step1.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (step1.password !== step1.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Step2Errors = {};
    if (!step2.acceptPrivacy) errs.acceptPrivacy = 'You must accept the Privacy Notice to continue.';
    if (!step2.acceptTerms) errs.acceptTerms = 'You must accept the Terms of Service to continue.';
    if (!step2.acceptImageAuthority) errs.acceptImageAuthority = 'You must confirm authority to upload images of others.';
    if (!step2.reviewPreference) errs.reviewPreference = 'Please select a review preference.';
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3(): boolean {
    const errs: Step3Errors = {};
    if (!step3.deletionPreference) errs.deletionPreference = 'Please select a data deletion preference.';
    setStep3Errors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 3) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleComplete() {
    if (!validateStep3()) return;
    setIsLoading(true);
    try {
      await login(step1.email.trim(), step1.password);
      router.push('/dashboard');
    } catch {
      // Demo: always succeeds
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Right Branding Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-between p-12 order-last"
        style={{ background: 'linear-gradient(145deg, #1E3A8A 0%, #2563EB 50%, #1D4ED8 100%)' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl" />
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <InterlaceLogo size={44} white />
          <span className="text-white text-2xl font-bold tracking-tight">Interlace</span>
        </motion.div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10"
        >
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start your visa journey with confidence
          </h1>
          <p className="text-blue-100 text-base leading-relaxed mb-8">
            Join hundreds of applicants who have organised their evidence and presented a compelling case.
          </p>

          {/* Step preview */}
          <div className="space-y-3">
            {[
              { num: '01', title: 'Create your account', desc: 'Secure sign-up in under a minute.' },
              { num: '02', title: 'Review privacy terms', desc: 'We\'re transparent about your data.' },
              { num: '03', title: 'Set your preferences', desc: 'Customise notifications and retention.' },
              { num: '04', title: 'Start uploading evidence', desc: 'Add photos, messages, and documents.' },
            ].map(({ num, title, desc }, i) => (
              <div key={i} className={`flex gap-4 p-3.5 rounded-xl transition-all duration-300 ${i + 1 === step ? 'bg-white/15 border border-white/30' : 'opacity-60'}`}>
                <span className="text-lg font-bold text-blue-300 w-8 flex-shrink-0">{num}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 flex items-center gap-2 text-blue-200"
        >
          <Shield className="w-4 h-4" />
          <span className="text-xs">Your data is encrypted and secure</span>
        </motion.div>
      </div>

      {/* ── Left Form Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg py-8"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <InterlaceLogo size={36} />
            <span className="text-slate-800 text-xl font-bold tracking-tight">Interlace</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <StepIndicator current={step} total={3} />

            {/* Animated step content */}
            <AnimatePresence mode="wait" custom={step}>
              <motion.div
                key={step}
                custom={step}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {step === 1 && (
                  <Step1
                    data={step1}
                    onChange={(field, val) => {
                      setStep1((p) => ({ ...p, [field]: val }));
                      setStep1Errors((p) => ({ ...p, [field]: undefined }));
                    }}
                    errors={step1Errors}
                  />
                )}
                {step === 2 && (
                  <Step2
                    data={step2}
                    onChange={(field, val) => {
                      setStep2((p) => ({ ...p, [field]: val }));
                      setStep2Errors((p) => ({ ...p, [field]: undefined }));
                    }}
                    errors={step2Errors}
                  />
                )}
                {step === 3 && (
                  <Step3
                    data={step3}
                    onChange={(field, val) => {
                      setStep3((p) => ({ ...p, [field]: val }));
                      setStep3Errors((p) => ({ ...p, [field]: undefined }));
                    }}
                    errors={step3Errors}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: isLoading ? '#86EFAC' : 'linear-gradient(135deg, #16A34A, #15803D)' }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete registration
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-slate-600 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
