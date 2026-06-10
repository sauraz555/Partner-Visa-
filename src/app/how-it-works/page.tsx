'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Sparkles,
  Eye,
  FileDown,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ImagePlus,
  FolderOpen,
  FileText,
  Download,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
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

/* ── detailed steps ── */
const steps = [
  {
    number: '01',
    icon: <Upload className="w-7 h-7 text-blue-600" />,
    mockIcon: <ImagePlus className="w-12 h-12 text-blue-300" />,
    title: 'Upload your evidence',
    tagline: 'Drag, drop, done.',
    description:
      'Upload photographs, screenshots, PDF documents, bank statements, travel records, and any other evidence of your relationship. Interlace accepts JPG, PNG, PDF, HEIC and more. Your originals are preserved exactly as you upload them — we never modify your source files.',
    details: [
      'Batch upload hundreds of files at once',
      'Drag and drop or click to browse',
      'Supports photos, screenshots, PDFs, HEIC',
      'Originals stored unchanged',
      'Upload from desktop, mobile, or cloud storage',
    ],
    color: 'bg-blue-50',
    borderColor: 'border-blue-100',
    dotColor: 'bg-blue-600',
  },
  {
    number: '02',
    icon: <Sparkles className="w-7 h-7 text-purple-600" />,
    mockIcon: <FolderOpen className="w-12 h-12 text-purple-300" />,
    title: 'Organise your timeline',
    tagline: 'AI does the heavy lifting.',
    description:
      'Interlace automatically reads dates from photos, screenshots, and documents, then categorises each piece of evidence (financial, social, cohabitation, travel, communication, etc.). Your relationship timeline is built automatically — you just confirm and adjust.',
    details: [
      'Automatic date extraction from EXIF and content',
      'AI categorisation into visa evidence categories',
      'Relationship timeline built chronologically',
      'Duplicate detection flags repeated files',
      'Screenshot conversations grouped by platform',
    ],
    color: 'bg-purple-50',
    borderColor: 'border-purple-100',
    dotColor: 'bg-purple-600',
  },
  {
    number: '03',
    icon: <Eye className="w-7 h-7 text-green-600" />,
    mockIcon: <Eye className="w-12 h-12 text-green-300" />,
    title: 'Review and refine',
    tagline: 'You\'re always in control.',
    description:
      'Review every piece of evidence before it reaches your PDF. Correct AI-suggested dates and categories, add captions, exclude files you don\'t want included, and apply privacy redactions to hide sensitive information like account numbers or third-party details.',
    details: [
      'Review each file before it enters your document',
      'Correct dates, categories, and captions',
      'Exclude files from the PDF without deleting them',
      'Apply privacy redactions to sensitive content',
      'Check evidence quality and flag low-resolution files',
    ],
    color: 'bg-green-50',
    borderColor: 'border-green-100',
    dotColor: 'bg-green-600',
  },
  {
    number: '04',
    icon: <FileDown className="w-7 h-7 text-amber-600" />,
    mockIcon: <FileText className="w-12 h-12 text-amber-300" />,
    title: 'Generate your PDF',
    tagline: 'Professional and structured.',
    description:
      'Generate a professional, bookmarked PDF evidence profile. Evidence is organised into clear sections with a cover page, table of contents, and index. You can preview the full document before downloading and generate multiple versions with different evidence selections.',
    details: [
      'Bookmarked, structured PDF with cover page',
      'Table of contents and section index',
      'Preview before final download',
      'Generate multiple PDF versions',
      'Consultant review option available',
    ],
    color: 'bg-amber-50',
    borderColor: 'border-amber-100',
    dotColor: 'bg-amber-500',
  },
  {
    number: '05',
    icon: <Download className="w-7 h-7 text-rose-600" />,
    mockIcon: <Download className="w-12 h-12 text-rose-300" />,
    title: 'Submit with confidence',
    tagline: 'Ready when you are.',
    description:
      'Download your completed evidence document and submit it as part of your partner visa application. Share access with your migration agent for their review. Your evidence project and files remain securely stored for 12 months so you can return at any time.',
    details: [
      'Download your PDF immediately',
      'Share with your migration agent via access invite',
      'Project stored securely for 12 months',
      'Return and generate new versions at any time',
      'Export your raw evidence files any time',
    ],
    color: 'bg-rose-50',
    borderColor: 'border-rose-100',
    dotColor: 'bg-rose-600',
  },
];

/* ── FAQ data ── */
const faqs = [
  {
    q: 'What types of files can I upload?',
    a: 'Interlace accepts JPEG, PNG, HEIC/HEIF, PDF, GIF, and WebP files. Bank statements and documents should be uploaded as PDFs where possible. There is no single file size limit, though individual files larger than 50 MB may take longer to process.',
  },
  {
    q: 'Does Interlace use my evidence to train AI models?',
    a: 'No. Your evidence is never used to train AI models. Your files are processed to extract dates and context for categorisation within your project only, and this processing is governed by strict access controls. We take this commitment very seriously.',
  },
  {
    q: 'Can my migration agent access my project?',
    a: 'Yes. You can invite your migration agent or consultant to your project with a read-only or collaborative role. They will be able to view your evidence, leave comments, and review your PDF — but cannot modify or delete your files unless you grant that permission.',
  },
  {
    q: 'What happens to my evidence after 12 months?',
    a: 'Your evidence project is stored for 12 months from your last activity. Before expiry, you will receive email reminders and can export all your files at any time. You can also choose to extend storage or delete your project early — you are always in control.',
  },
  {
    q: 'How many PDF versions can I generate?',
    a: 'Self-Service plans include 3 PDF versions. If you need to update your evidence after generating your initial PDF — for example, adding new photos — you can generate a new version. The Consultant Reviewed plan includes additional revision requests.',
  },
  {
    q: 'Is Interlace suitable for all Australian partner visa subclasses?',
    a: 'Interlace is designed for evidence preparation relevant to Australian partner visa applications broadly — including subclasses 820/801 (onshore) and 309/100 (offshore) and de facto partner visas. It organises relationship evidence according to the types of evidence commonly requested. It does not give legal advice about your specific circumstances.',
  },
  {
    q: 'What does the Consultant Reviewed plan include?',
    a: 'The Consultant Reviewed plan adds a review step where an Interlace staff member checks that your evidence document is well-organised, clearly labelled, and professionally presented before you download it. This is a document review for quality and presentation — not legal or migration advice.',
  },
  {
    q: 'Can I delete my account and all my data?',
    a: 'Yes. You can delete your evidence project, individual files, or your entire account at any time from your account settings. Deletion is permanent and cannot be undone. We provide an export-before-delete option so you can download everything first.',
  },
];

/* ── FAQ accordion ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Step mockup card ── */
function StepMockup({ step }: { step: (typeof steps)[number] }) {
  return (
    <div
      className={`relative rounded-2xl border ${step.borderColor} ${step.color} p-8 flex items-center justify-center min-h-[260px] overflow-hidden`}
    >
      {/* Background number */}
      <span className="absolute top-4 right-5 text-8xl font-black opacity-[0.06] text-gray-900 select-none pointer-events-none">
        {step.number}
      </span>

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="opacity-60">{step.mockIcon}</div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          {[80, 65, 72, 55].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-current opacity-10"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function HowItWorksPage() {
  return (
    <div
      className="min-h-screen bg-[#fdfdfc] text-gray-900"
      style={{ fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <PublicNav />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/30 py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4"
              >
                The process
              </motion.p>
              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5"
              >
                A simple, guided process from{' '}
                <span className="text-blue-600">upload to PDF</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8"
              >
                Interlace walks you through every step of preparing your relationship
                evidence document — no guesswork required.
              </motion.p>
              <motion.div variants={fadeUp} custom={0.15}>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all duration-150 shadow-md shadow-blue-600/25"
                >
                  Start Your Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Detailed steps ── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    i % 2 === 1 ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  {/* Text side */}
                  <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl ${step.color} border ${step.borderColor}`}
                      >
                        {step.icon}
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                        Step {step.number}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                      {step.title}
                    </h2>
                    <p className="text-blue-600 font-medium mb-4">{step.tagline}</p>
                    <p className="text-gray-500 leading-relaxed mb-6">{step.description}</p>
                    <ul className="space-y-2.5">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-600">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mock side */}
                  <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    <StepMockup step={step} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 bg-gray-50/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3"
              >
                FAQ
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={0.05}
                className="text-4xl font-bold text-gray-900 tracking-tight"
              >
                Common questions
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="mt-4 text-gray-500"
              >
                Everything you need to know about using Interlace.
              </motion.p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <FAQItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-5"
              >
                Ready to start your project?
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={0.05}
                className="text-lg text-gray-500 mb-8"
              >
                Join the waitlist or start organising your evidence today.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={0.1}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all duration-150 shadow-md shadow-blue-600/25"
                >
                  Start Evidence Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-150"
                >
                  View Pricing
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
