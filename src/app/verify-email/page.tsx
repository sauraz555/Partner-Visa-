'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, Shield } from 'lucide-react';

// ─── Interlace Logo ──────────────────────────────────────────────────────────

function InterlaceLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Interlace logo">
      <circle cx="20" cy="20" r="18" stroke="#2563EB" strokeWidth="2.5" fill="none" />
      <circle cx="20" cy="20" r="11" stroke="#93C5FD" strokeWidth="2.5" fill="none" />
      <ellipse cx="20" cy="20" rx="18" ry="8" stroke="#2563EB" strokeWidth="2" fill="none" opacity="0.5" transform="rotate(45 20 20)" />
      <ellipse cx="20" cy="20" rx="18" ry="8" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.5" transform="rotate(-45 20 20)" />
      <circle cx="20" cy="20" r="3" fill="#2563EB" />
    </svg>
  );
}

// ─── Animated Email Icon ──────────────────────────────────────────────────────

function AnimatedEmailIcon() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full bg-blue-100 blur-xl scale-150 opacity-60" />
      {/* Icon container */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-300">
        <Mail className="w-11 h-11 text-white" strokeWidth={1.5} />
        {/* Pulse dot */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"
        />
      </div>
    </motion.div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OTPInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
  disabled?: boolean;
}

function OTPInput({ value, onChange, error, disabled }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first empty slot on mount
  useEffect(() => {
    const firstEmpty = value.findIndex((v) => !v);
    const focusIndex = firstEmpty === -1 ? 0 : firstEmpty;
    inputRefs.current[focusIndex]?.focus();
  }, []);

  function handleChange(index: number, char: string) {
    // Only allow digits
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const next = [...value];
        next[index] = '';
        onChange(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...value];
        next[index - 1] = '';
        onChange(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    onChange(next);
    // Focus the next empty slot after paste
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  }

  return (
    <div>
      <div className="flex gap-2.5 justify-center">
        {value.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
              ${error ? 'border-red-400 bg-red-50 text-red-700' :
                digit ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100' :
                'border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:bg-blue-50/50 focus:ring-2 focus:ring-blue-500/20'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            `}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-600 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) { setActive(false); return; }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, active]);

  function reset() {
    setRemaining(seconds);
    setActive(true);
  }

  return { remaining, isActive: active && remaining > 0, reset };
}

// ─── Main Verify Email Page ───────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { remaining, isActive: countdownActive, reset: resetCountdown } = useCountdown(60);

  // Get email from URL params (fallback to demo)
  const [email, setEmail] = useState('your@email.com');
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const e = params.get('email');
      if (e) setEmail(decodeURIComponent(e));
    } catch { /* ignore */ }
  }, []);

  const handleVerify = useCallback(async () => {
    const code = otp.join('');

    // Validate completeness
    if (code.length < 6 || otp.some((d) => !d)) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setOtpError(undefined);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));

    // Demo: accept any 6-digit code
    setVerified(true);
    setIsVerifying(false);

    // Redirect after brief success state
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  }, [otp, router]);

  // Allow Enter key to submit
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' && !isVerifying && !verified) handleVerify();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleVerify, isVerifying, verified]);

  async function handleResend() {
    if (countdownActive || isResending) return;
    setIsResending(true);
    setResendSuccess(false);
    await new Promise((r) => setTimeout(r, 800));
    setIsResending(false);
    setResendSuccess(true);
    resetCountdown();
    setOtp(['', '', '', '', '', '']);
    setOtpError(undefined);
    setTimeout(() => setResendSuccess(false), 4000);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50"
      style={{ fontFamily: "'Instrument Sans', sans-serif" }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-2xl opacity-40" />
      </div>

      {/* Logo header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center gap-2.5 mb-10"
      >
        <InterlaceLogo size={36} />
        <span className="text-slate-800 text-xl font-bold tracking-tight">Interlace</span>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8"
      >
        {verified ? (
          /* ── Success state ──────────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Email verified!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Your account is now active. Redirecting you to the dashboard…
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="animate-spin w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Taking you to your dashboard
            </div>
          </motion.div>
        ) : (
          /* ── Verification form ──────────────────────────────────────────── */
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="mb-7">
              <AnimatedEmailIcon />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Check your email
            </h2>
            <p className="text-slate-500 text-sm text-center leading-relaxed mb-2 max-w-sm">
              We sent a 6-digit verification code to
            </p>
            <div className="flex items-center gap-2 mb-7">
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">{email}</span>
              </div>
            </div>

            {/* Resend success */}
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">Verification email resent successfully.</span>
              </motion.div>
            )}

            {/* OTP input */}
            <div className="w-full mb-7">
              <p className="text-xs font-medium text-slate-500 text-center mb-4 uppercase tracking-wider">
                Enter your 6-digit code
              </p>
              <OTPInput
                value={otp}
                onChange={(val) => { setOtp(val); setOtpError(undefined); }}
                error={otpError}
                disabled={isVerifying}
              />
            </div>

            {/* Verify button */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || otp.some((d) => !d)}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isVerifying || otp.some((d) => !d)
                  ? '#93C5FD'
                  : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              }}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify email
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative w-full mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">Didn&apos;t receive it?</span>
              </div>
            </div>

            {/* Resend */}
            <div className="text-center mb-6">
              {countdownActive ? (
                <p className="text-sm text-slate-500">
                  You can resend in{' '}
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {String(Math.floor(remaining / 60)).padStart(2, '0')}:
                    {String(remaining % 60).padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>

            {/* Demo note */}
            <div className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl mb-5">
              <p className="text-xs text-amber-700 text-center leading-relaxed">
                <span className="font-semibold">Demo mode:</span> Enter any 6 digits (e.g. <span className="font-mono font-bold">123456</span>) and click &quot;Verify email&quot; to continue.
              </p>
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Your verification code expires in 24 hours</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Back link */}
      {!verified && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative z-10 mt-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </motion.div>
      )}

      {/* Background dot pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#CBD5E1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
    </div>
  );
}
