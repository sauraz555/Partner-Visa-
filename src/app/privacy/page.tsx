'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  Trash2,
  Download,
  FolderX,
  UserX,
  UserMinus,
  History,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Server,
  Activity,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: d },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ── data ── */
const whatWeCollect = [
  {
    category: 'Account information',
    items: ['Email address', 'Name (optional)', 'Password hash (never stored in plaintext)'],
  },
  {
    category: 'Evidence files',
    items: [
      'Photos, screenshots, PDFs you upload',
      'File metadata (name, date, size, EXIF where present)',
      'AI-extracted content (dates, category suggestions)',
    ],
  },
  {
    category: 'Usage data',
    items: [
      'Pages visited within the app',
      'Features used (for product improvement)',
      'Error logs (anonymised where possible)',
    ],
  },
  {
    category: 'Billing data',
    items: [
      'Payment information (processed by Stripe — not stored by Interlace)',
      'Plan type and transaction reference',
    ],
  },
];

const howWeStore = [
  {
    icon: <Lock className="w-5 h-5 text-blue-600" />,
    title: 'Transit encryption',
    description: 'All data is encrypted in transit using TLS 1.3. No unencrypted connections are permitted.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    title: 'At-rest encryption',
    description: 'Files are encrypted at rest using AES-256. Encryption keys are managed separately from file storage.',
  },
  {
    icon: <Server className="w-5 h-5 text-blue-600" />,
    title: 'Australian data residency',
    description: 'Evidence files are stored on servers located in Australia where possible. We aim to keep your data onshore.',
  },
  {
    icon: <Activity className="w-5 h-5 text-blue-600" />,
    title: 'Audit logging',
    description: 'All access to your evidence files is logged. You can view your access history from your account settings.',
  },
];

const whoCanAccess = [
  {
    who: 'You',
    description: 'Full access to all your evidence, projects, and account settings.',
    level: 'Full',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    who: 'Invited consultants',
    description: 'Read-only or collaborative access, only if you explicitly invite them. Can be revoked at any time.',
    level: 'Invited only',
    color: 'bg-purple-50 text-purple-700 border-purple-100',
  },
  {
    who: 'Interlace staff',
    description: 'Access only when needed for Consultant Reviewed plan delivery or to resolve a support ticket you have raised. All access is logged.',
    level: 'Logged access',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    who: 'Third parties / AI providers',
    description: 'No third party has access to your evidence files. AI processing is done using models where your data is not used for training.',
    level: 'No access',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
];

const dataControls = [
  {
    icon: <Download className="w-5 h-5 text-blue-600" />,
    title: 'Download your data',
    description: 'Export all your evidence files and project data as a ZIP archive at any time.',
  },
  {
    icon: <Trash2 className="w-5 h-5 text-rose-600" />,
    title: 'Delete evidence',
    description: 'Permanently delete individual files from your project. Deletion is immediate and irreversible.',
  },
  {
    icon: <FolderX className="w-5 h-5 text-rose-600" />,
    title: 'Delete project',
    description: 'Delete an entire evidence project and all files within it. Your account is retained.',
  },
  {
    icon: <UserX className="w-5 h-5 text-rose-600" />,
    title: 'Delete account',
    description: 'Delete your account and all associated data permanently. Requires email confirmation.',
  },
  {
    icon: <UserMinus className="w-5 h-5 text-amber-600" />,
    title: 'Revoke access',
    description: 'Remove any consultant or collaborator access to your project at any time, instantly.',
  },
  {
    icon: <History className="w-5 h-5 text-gray-600" />,
    title: 'View access history',
    description: 'Review a complete log of who has accessed your project and when.',
  },
];

const securityMeasures = [
  { icon: <Lock className="w-4 h-4" />, label: 'TLS 1.3 transit encryption' },
  { icon: <ShieldCheck className="w-4 h-4" />, label: 'AES-256 at-rest encryption' },
  { icon: <KeyRound className="w-4 h-4" />, label: 'Multi-factor authentication (MFA)' },
  { icon: <Eye className="w-4 h-4" />, label: 'Role-based access control (RBAC)' },
  { icon: <Activity className="w-4 h-4" />, label: 'Comprehensive audit logging' },
  { icon: <Server className="w-4 h-4" />, label: 'Rate limiting and DDoS protection' },
  { icon: <FileCheck className="w-4 h-4" />, label: 'Regular security assessments' },
  { icon: <History className="w-4 h-4" />, label: 'Automated backup and recovery' },
];

/* ── Page ── */
export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-[#fdfdfc] text-gray-900"
      style={{ fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <PublicNav />

      <main>
        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-white to-blue-50/30 py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  Privacy & Security
                </span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5"
              >
                Your evidence is{' '}
                <span className="text-blue-600">deeply personal.</span>
                <br />
                We treat it that way.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto"
              >
                Interlace is built with security-first architecture and gives you
                full control over your data at every step.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── AI commitment callout ── */}
        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8"
            >
              <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">
                  Commitment: Your evidence will never train AI models
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Your evidence files — photographs, screenshots, documents — are never
                  used to train, fine-tune, or evaluate any AI model. Processing is
                  strictly limited to extracting dates and contextual information within
                  your own project, and governed by contractual restrictions with any
                  AI service providers we use.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── What we collect ── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Data collection
              </motion.p>
              <motion.h2 variants={fadeUp} custom={0.05} className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                What we collect
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.1} className="text-gray-500 max-w-xl">
                We collect only what is necessary to operate the service.
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whatWeCollect.map((cat, i) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{cat.category}</h3>
                  <ul className="space-y-2">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How we store it ── */}
        <section className="py-20 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Storage
              </motion.p>
              <motion.h2 variants={fadeUp} custom={0.05} className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                How we store it
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.1} className="text-gray-500 max-w-xl">
                Security is applied at every layer of storage and transmission.
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {howWeStore.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-start gap-4"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who can access ── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Access
              </motion.p>
              <motion.h2 variants={fadeUp} custom={0.05} className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                Who can access it
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.1} className="text-gray-500 max-w-xl">
                You control who sees your evidence, always.
              </motion.p>
            </motion.div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Who</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Access level</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700 hidden md:table-cell">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {whoCanAccess.map((row, i) => (
                    <tr key={row.who} className={i !== whoCanAccess.length - 1 ? 'border-b border-gray-50' : ''}>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.who}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.color}`}>
                          {row.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden md:table-cell leading-relaxed">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Your controls ── */}
        <section className="py-20 bg-blue-50/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Your rights
              </motion.p>
              <motion.h2 variants={fadeUp} custom={0.05} className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                Your data controls
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.1} className="text-gray-500 max-w-xl">
                You have full control over your data at any time — no friction, no delays.
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataControls.map((ctrl, i) => (
                <motion.div
                  key={ctrl.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 shrink-0 mt-0.5">
                    {ctrl.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{ctrl.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{ctrl.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Security measures ── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Security
              </motion.p>
              <motion.h2 variants={fadeUp} custom={0.05} className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                Security measures
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.1} className="text-gray-500 max-w-xl">
                A layered approach to protecting your evidence.
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {securityMeasures.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 shadow-sm"
                >
                  <span className="text-blue-600">{m.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Retention policy ── */}
        <section className="py-20 bg-gray-50/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Retention
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-5">
                Data retention policy
              </h2>
              <div className="prose prose-sm max-w-none text-gray-500 space-y-4">
                <p>
                  Evidence projects and all associated files are retained for{' '}
                  <strong className="text-gray-700">12 months from your last activity</strong>{' '}
                  on the project. You will receive email reminders at 30 days and 7 days before
                  your project is scheduled for deletion.
                </p>
                <p>
                  You can export all your files at any time via the{' '}
                  <strong className="text-gray-700">Download your data</strong> function in account
                  settings. You can also delete your project early — deletion is permanent and
                  immediate.
                </p>
                <p>
                  Account information (email, billing history) is retained for as long as your
                  account exists and for a short period after deletion as required for legal and
                  financial compliance.
                </p>
                <p>
                  Interlace complies with the{' '}
                  <strong className="text-gray-700">Privacy Act 1988 (Cth)</strong> and the
                  Australian Privacy Principles (APPs). You have the right to request access to,
                  correction of, or deletion of your personal information.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8"
            >
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">
                  Important Disclaimer
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Interlace is not the Department of Home Affairs. This tool organises evidence
                  for document preparation only. It does not provide migration or legal advice,
                  determine visa eligibility, or guarantee a visa outcome. Always seek advice
                  from a registered migration agent or Australian legal practitioner.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900 tracking-tight mb-5">
                Start with confidence
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.05} className="text-lg text-gray-500 mb-8">
                Your evidence is protected. Your controls are clear.
              </motion.p>
              <motion.div variants={fadeUp} custom={0.1} className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all duration-150 shadow-md shadow-blue-600/25"
                >
                  Start Evidence Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/legal/privacy"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-150"
                >
                  Read Privacy Policy
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
