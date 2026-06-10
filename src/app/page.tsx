'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Upload,
  Tag,
  Eye,
  Download,
  Shield,
  Lock,
  Database,
  Users,
  FileCheck,
  Copy,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

const TRUST_ITEMS = [
  { icon: '🔒', label: 'Originals preserved' },
  { icon: '✏️', label: 'Client-controlled redaction' },
  { icon: '🛡️', label: 'Secure document processing' },
  { icon: '👁️', label: 'Review before download' },
  { icon: '✅', label: 'No evidence fabrication' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload',
    description:
      'Drag and drop photos, screenshots, PDFs, and documents. Upload individually or in batches by category.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '02',
    icon: Tag,
    title: 'Organise',
    description:
      'AI automatically categorises evidence, suggests dates and captions, and flags duplicates or low-quality files.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    step: '03',
    icon: Eye,
    title: 'Review',
    description:
      'Confirm details, fill gaps, redact sensitive information, and approve your evidence selection.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    step: '04',
    icon: Download,
    title: 'Download',
    description:
      'Generate and download a clean, searchable PDF with a cover page, timeline, and organised evidence sections.',
    color: 'from-amber-500 to-orange-500',
  },
];

const FEATURES = [
  {
    icon: Tag,
    title: 'Automatic Categorisation',
    description: 'AI analyses and categorises uploaded evidence into financial, household, social, and other categories.',
  },
  {
    icon: Clock,
    title: 'Relationship Timeline Builder',
    description: 'Visualise your relationship chronologically with milestone events, separation periods, and evidence.',
  },
  {
    icon: Copy,
    title: 'Duplicate Detection',
    description: 'Identifies near-duplicate and similar images automatically, helping you choose the best version.',
  },
  {
    icon: Zap,
    title: 'Screenshot Grouping',
    description: 'Groups consecutive screenshots from the same conversation, removing overlaps for cleaner presentation.',
  },
  {
    icon: FileCheck,
    title: 'Caption Assistance',
    description: 'Suggests factual, neutral captions based on detected content. Always client-reviewed before use.',
  },
  {
    icon: Lock,
    title: 'Privacy Redaction',
    description: 'Draw redaction boxes over phone numbers, email addresses, and other sensitive information.',
  },
  {
    icon: Download,
    title: 'Professional PDF Generation',
    description: 'Clean, searchable, bookmarked PDF with cover page, disclaimer, timeline, and evidence sections.',
  },
  {
    icon: Users,
    title: 'Client & Consultant Collaboration',
    description: 'Invite your partner to contribute evidence. Optionally share with an Interlace migration consultant.',
  },
];

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: 'Encrypted in Transit & at Rest',
    description: 'All uploads and storage use industry-standard encryption. No evidence is transmitted unencrypted.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Controls',
    description: 'Only authorised users can access your project. Staff access requires explicit permission and is logged.',
  },
  {
    icon: Database,
    title: 'Your Data, Your Control',
    description: 'Download, delete, or revoke access at any time. Retention periods are configurable and transparent.',
  },
];

// Animated mock dashboard component
function MockDashboard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-violet-600/20 blur-3xl rounded-3xl" />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Mock nav bar */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="text-xs text-gray-400 font-mono">interlace.app/dashboard</div>
        </div>

        {/* Mock content */}
        <div className="p-5 space-y-4">
          {/* Project header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Saurav & Jane</div>
              <div className="text-xs text-gray-500 mt-0.5">Partner Visa 820/801</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Active</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Uploaded', value: '146', color: 'text-gray-900' },
              { label: 'Ready', value: '112', color: 'text-emerald-600' },
              { label: 'Review', value: '18', color: 'text-amber-600' },
              { label: 'Dupes', value: '9', color: 'text-orange-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Evidence ready</span>
              <span>77%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: '77%' }} />
            </div>
          </div>

          {/* Evidence thumbs */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden"
                style={{
                  backgroundImage: `url(https://picsum.photos/seed/${i + 50}/100/100)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
          </div>

          {/* Next action */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Next action</div>
              <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Confirm dates for 18 items</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <ArrowRight className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicNav />

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-950 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-page relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div {...fadeUp} className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 font-medium mb-6">
                <span>🇦🇺</span>
                <span>Built for Australian partner visa evidence preparation</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Turn relationship evidence into a{' '}
                <span className="text-blue-600">clear, organised visa document.</span>
              </h1>

              <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Securely upload photographs and screenshots, organise your relationship timeline, review important details, and generate a professional PDF evidence profile.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start">
                <Link href="/register" className="btn-primary text-base px-7 py-3">
                  Start Evidence Project
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/how-it-works" className="btn-secondary text-base px-7 py-3">
                  See How It Works
                </Link>
              </div>

              <p className="mt-5 text-xs text-gray-400 dark:text-gray-600">
                No credit card required · Evidence stays private · Delete anytime
              </p>
            </motion.div>

            {/* Right: Mock dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <MockDashboard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST BAR
          ============================================================ */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-8">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section className="py-24">
        <div className="container-page">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-label mb-3">Process</div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              From evidence to document in four steps
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              A guided, structured process that organises hundreds of files into a polished, reviewable PDF.
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative group"
                >
                  {/* Connector line */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 z-0 -translate-x-1/2" />
                  )}

                  <div className="card card-hover relative z-10 h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Step {step.step}</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FEATURES
          ============================================================ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container-page">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="section-label mb-3">Features</div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need to organise your evidence
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Purpose-built tools for partner visa evidence preparation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="card card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECURITY
          ============================================================ */}
      <section className="py-24">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <div className="section-label mb-3">Security</div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Built with security at its core
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Relationship evidence is sensitive. Interlace treats your files with care, implementing enterprise-grade security throughout.
              </p>

              <div className="mt-8 space-y-5">
                {SECURITY_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link href="/privacy" className="mt-8 inline-flex btn-secondary">
                Read our privacy & security policy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-4"
            >
              {[
                'Encryption in transit and at rest',
                'Role-based access control',
                'Multi-factor authentication',
                'Session expiry and device history',
                'Rate limiting and malware scanning',
                'Complete audit logs',
                'Client-controlled deletion',
                'Evidence never used to train AI models',
                'Staff access logged and permission-based',
                'Protection against CSRF, XSS, injection',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
          ============================================================ */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="container-page text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl font-bold text-white">
              Start organising your evidence today
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-xl mx-auto">
              No credit card required. Upload your first evidence file in minutes.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors text-base"
              >
                Start Evidence Project
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-3.5 rounded-lg bg-blue-700/50 text-white font-semibold hover:bg-blue-700 transition-colors text-base border border-blue-500"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          DISCLAIMER
          ============================================================ */}
      <section className="py-10 bg-amber-50 dark:bg-amber-900/10 border-y border-amber-100 dark:border-amber-900/30">
        <div className="container-page">
          <div className="flex gap-4 items-start max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                Important Disclaimer
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 leading-relaxed">
                Interlace is not the Department of Home Affairs. This tool organises and presents evidence supplied or approved by the client for document preparation purposes only. It does not provide migration or legal advice, determine visa eligibility, or guarantee any visa outcome. Clients are responsible for confirming the accuracy and authenticity of all included information. Always seek advice from a registered migration agent or Australian legal practitioner before lodging a visa application.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
