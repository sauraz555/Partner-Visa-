'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle2, Shield, FileText, Users } from 'lucide-react';
import { useApp } from '@/lib/store';

// ─── Interlace Logo ──────────────────────────────────────────────────────────

function InterlaceLogo({ size = 40, white = false }: { size?: number; white?: boolean }) {
  const primary = white ? '#FFFFFF' : '#2563EB';
  const secondary = white ? 'rgba(255,255,255,0.6)' : '#93C5FD';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Interlace logo">
      {/* Outer ring */}
      <circle cx="20" cy="20" r="18" stroke={primary} strokeWidth="2.5" fill="none" />
      {/* Inner ring offset */}
      <circle cx="20" cy="20" r="11" stroke={secondary} strokeWidth="2.5" fill="none" />
      {/* Interlace cross rings */}
      <ellipse cx="20" cy="20" rx="18" ry="8" stroke={primary} strokeWidth="2" fill="none" opacity="0.5" transform="rotate(45 20 20)" />
      <ellipse cx="20" cy="20" rx="18" ry="8" stroke={secondary} strokeWidth="2" fill="none" opacity="0.5" transform="rotate(-45 20 20)" />
      {/* Center dot */}
      <circle cx="20" cy="20" r="3" fill={primary} />
    </svg>
  );
}

// ─── Decorative Preview Card ──────────────────────────────────────────────────

function DecorativeCard() {
  return (
    <div className="relative w-full max-w-xs mx-auto mt-8">
      {/* Shadow card behind */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-white/10 backdrop-blur-sm" />
      {/* Main card */}
      <div className="relative rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="h-2.5 w-24 bg-white/60 rounded-full" />
            <div className="h-2 w-16 bg-white/30 rounded-full mt-1.5" />
          </div>
          <div className="ml-auto">
            <span className="text-xs font-semibold text-green-300 bg-green-400/20 px-2 py-0.5 rounded-full">Active</span>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {[80, 55, 68, 40].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-white/40 flex-shrink-0" />
              <div className="h-2 rounded-full bg-white/30" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="border-t border-white/20 pt-3 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {['#60A5FA','#34D399','#F472B6'].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white/30" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="h-2 w-20 bg-white/30 rounded-full" />
          <div className="h-6 w-16 bg-white/30 rounded-full" />
        </div>
      </div>
      {/* Floating stat badge */}
      <div className="absolute -top-3 -right-3 bg-white rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        <span className="text-xs font-semibold text-slate-700">147 items organised</span>
      </div>
    </div>
  );
}

// ─── Trust Badge ─────────────────────────────────────────────────────────────

function TrustBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-blue-200 flex-shrink-0" />
      <span className="text-sm text-blue-100">{text}</span>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.push('/dashboard');
      } else {
        setErrors({ general: 'Invalid credentials. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Left Branding Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 40%, #3B82F6 70%, #1D4ED8 100%)' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-400/10 blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo + wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <InterlaceLogo size={44} white />
          <span className="text-white text-2xl font-bold tracking-tight">Interlace</span>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10"
        >
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-sm">
            Your partner visa evidence is organised, secure, and ready when you need it.
          </p>

          <div className="space-y-3 mb-8">
            <TrustBadge icon={Shield} text="End-to-end encrypted storage" />
            <TrustBadge icon={FileText} text="Professional PDF evidence packs" />
            <TrustBadge icon={CheckCircle2} text="Trusted by 500+ visa applicants" />
          </div>

          <DecorativeCard />
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 text-blue-200 text-xs"
        >
          © {new Date().getFullYear()} Interlace. Australian partner visa support.
        </motion.p>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <InterlaceLogo size={36} />
            <span className="text-slate-800 text-xl font-bold tracking-tight">Interlace</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Log in to your account</h2>
              <p className="text-slate-500 text-sm mt-1">Enter your details below to continue.</p>
            </div>

            {/* General error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {errors.general}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      errors.email ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 border rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      errors.password ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: isLoading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Log in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">or</span>
              </div>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Create one for free
              </Link>
            </p>

            {/* Demo note */}
            <div className="mt-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 text-center leading-relaxed">
                <span className="font-semibold">Demo mode:</span> Use any email address and any password (6+ characters) to log in instantly.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
