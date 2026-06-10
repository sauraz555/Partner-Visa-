'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Star,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  Building2,
  Zap,
  Users,
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

/* ── plan data ── */
const plans = [
  {
    id: 'self-service',
    icon: <Zap className="w-5 h-5 text-gray-600" />,
    name: 'Self-Service',
    price: '$149',
    priceSub: 'AUD, one-time per project',
    tagline: 'Everything you need to organise your evidence yourself.',
    highlight: false,
    cta: 'Join Waitlist',
    ctaHref: '/waitlist?plan=self-service',
    features: [
      'Upload up to 250 evidence files',
      'AI categorisation and date extraction',
      'Relationship timeline builder',
      'Duplicate detection',
      'Screenshot grouping by platform',
      'Caption assistance (AI-suggested)',
      'Privacy redaction tools',
      'Generate up to 3 PDF versions',
      '12 months evidence storage',
      'Export all files at any time',
      'Email support',
    ],
    notIncluded: [
      'Interlace staff review',
      'Priority support',
      'Revision requests',
    ],
  },
  {
    id: 'consultant-reviewed',
    icon: <Star className="w-5 h-5 text-blue-600" />,
    name: 'Consultant Reviewed',
    price: '$349',
    priceSub: 'AUD, one-time per project',
    tagline: 'Interlace staff review and approve your evidence document.',
    highlight: true,
    badge: 'Most popular',
    cta: 'Join Waitlist',
    ctaHref: '/waitlist?plan=consultant-reviewed',
    features: [
      'Everything in Self-Service',
      'Interlace staff document review',
      'Presentation and quality check',
      'Written feedback on your evidence',
      'Up to 2 revision requests after review',
      'Priority email and chat support',
      'Faster turnaround guarantee',
      'Staff-approved PDF sign-off',
    ],
    notIncluded: [],
    note: 'Staff review is a document quality and presentation review — not legal or migration advice.',
  },
  {
    id: 'enterprise',
    icon: <Building2 className="w-5 h-5 text-gray-600" />,
    name: 'Enterprise',
    price: 'Custom',
    priceSub: 'Contact us for pricing',
    tagline: 'For migration agents managing multiple clients.',
    highlight: false,
    cta: 'Contact Us',
    ctaHref: '/contact?plan=enterprise',
    features: [
      'Unlimited client projects',
      'White-label branding options',
      'API access for integrations',
      'Bulk upload tools',
      'Agent dashboard for all clients',
      'Role-based access per client',
      'Priority dedicated support',
      'Custom data retention terms',
      'SLA agreement available',
      'Invoice billing',
    ],
    notIncluded: [],
  },
];

/* ── FAQ data ── */
const pricingFaqs = [
  {
    q: 'When will Interlace be available?',
    a: 'Interlace is currently in development. Join the waitlist to be notified when it launches and to get early-access pricing. Waitlist members will receive a discount on their first project.',
  },
  {
    q: 'Do I pay per visa application or per project?',
    a: 'You pay per evidence project. One project typically corresponds to one visa application. If you need to prepare evidence for a second application in the future, you would create a new project.',
  },
  {
    q: 'What happens if I need more than 250 files?',
    a: 'The Self-Service plan includes 250 files. If you have a larger evidence collection, contact us — we can accommodate larger projects. The Consultant Reviewed plan has higher limits.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes. If you have not yet generated your final PDF, you can request a full refund within 14 days of payment. Once your PDF has been downloaded, refunds are not available as the service has been delivered. Contact support@interlace.com.au for any billing concerns.',
  },
  {
    q: 'Can I upgrade from Self-Service to Consultant Reviewed?',
    a: 'Yes. You can upgrade your plan at any time and pay the difference. Your existing evidence and project data carries over seamlessly.',
  },
  {
    q: 'Is the Consultant Reviewed plan legal advice?',
    a: 'No. The Consultant Reviewed plan is a document quality and presentation review — an Interlace staff member checks that your evidence is well-organised, clearly labelled, and professionally structured. This is not legal advice, migration advice, or a determination of visa eligibility.',
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

/* ── Plan card ── */
function PlanCard({ plan, delay }: { plan: (typeof plans)[number]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative flex flex-col rounded-2xl border p-7 ${
        plan.highlight
          ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/20 scale-[1.02]'
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow'
      }`}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 text-blue-600 text-xs font-bold rounded-full shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div
          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
            plan.highlight ? 'bg-white/20' : 'bg-gray-50 border border-gray-100'
          }`}
        >
          <span className={plan.highlight ? 'text-white' : ''}>{plan.icon}</span>
        </div>
        <h3
          className={`text-lg font-bold mb-1 ${
            plan.highlight ? 'text-white' : 'text-gray-900'
          }`}
        >
          {plan.name}
        </h3>
        <p
          className={`text-sm leading-relaxed ${
            plan.highlight ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {plan.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span
            className={`text-4xl font-bold tracking-tight ${
              plan.highlight ? 'text-white' : 'text-gray-900'
            }`}
          >
            {plan.price}
          </span>
        </div>
        <p
          className={`text-xs mt-1 ${
            plan.highlight ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {plan.priceSub}
        </p>
      </div>

      {/* Coming soon notice */}
      <div
        className={`rounded-lg px-4 py-2.5 mb-6 text-xs font-medium flex items-center gap-2 ${
          plan.highlight
            ? 'bg-white/15 text-white'
            : 'bg-amber-50 border border-amber-100 text-amber-700'
        }`}
      >
        <span>⏳</span>
        Coming soon — join the waitlist for early access
      </div>

      {/* CTA button */}
      <Link
        href={plan.ctaHref}
        className={`w-full text-center px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-150 mb-6 ${
          plan.highlight
            ? 'bg-white text-blue-600 hover:bg-blue-50 active:scale-95 shadow-sm'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm'
        }`}
      >
        {plan.cta}
      </Link>

      {/* Feature list */}
      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                plan.highlight ? 'text-blue-200' : 'text-blue-600'
              }`}
            />
            <span
              className={`text-sm ${
                plan.highlight ? 'text-blue-50' : 'text-gray-600'
              }`}
            >
              {f}
            </span>
          </li>
        ))}
        {plan.notIncluded.map((f) => (
          <li key={f} className="flex items-start gap-2.5 opacity-40">
            <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-gray-400 text-xs">
              —
            </span>
            <span className="text-sm text-gray-400 line-through">{f}</span>
          </li>
        ))}
      </ul>

      {/* Staff note */}
      {plan.note && (
        <p
          className={`text-xs mt-6 pt-4 border-t leading-relaxed ${
            plan.highlight
              ? 'border-blue-500 text-blue-200'
              : 'border-gray-100 text-gray-400'
          }`}
        >
          {plan.note}
        </p>
      )}
    </motion.div>
  );
}

/* ── Page ── */
export default function PricingPage() {
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
                  ⏳ Coming soon — join the waitlist
                </span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5"
              >
                Simple, transparent{' '}
                <span className="text-blue-600">pricing</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto"
              >
                One-time pricing per evidence project. No subscriptions, no
                surprise fees. Join the waitlist to receive early-access pricing.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Plan cards ── */}
        <section className="py-16 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {plans.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} delay={i * 0.1} />
              ))}
            </div>

            {/* Money back note */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 text-center"
            >
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">14-day refund policy</span> — if
                you haven&apos;t downloaded your PDF, we&apos;ll refund you. No questions asked.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Enterprise section ── */}
        <section className="py-20 bg-gray-50/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8 justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 shrink-0">
                  <Users className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Are you a migration agent?
                  </h2>
                  <p className="text-gray-500 max-w-lg leading-relaxed">
                    Interlace Enterprise is designed for registered migration agents managing
                    multiple clients. White-label branding, API access, a client management
                    dashboard, and flexible billing — all on a custom plan.
                  </p>
                </div>
              </div>
              <Link
                href="/contact?plan=enterprise"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 active:scale-95 rounded-xl transition-all duration-150"
              >
                Contact us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Pricing FAQs ── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                FAQ
              </motion.p>
              <motion.h2 variants={fadeUp} custom={0.05} className="text-4xl font-bold text-gray-900 tracking-tight">
                Pricing questions
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.1} className="mt-4 text-gray-500">
                Everything you need to know about plans and billing.
              </motion.p>
            </motion.div>

            <div className="space-y-3">
              {pricingFaqs.map((faq, i) => (
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

        {/* ── Disclaimer ── */}
        <section className="py-8 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-6"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> Interlace is not the Department of Home Affairs.
                This tool organises evidence for document preparation only. It does not provide
                migration or legal advice, determine visa eligibility, or guarantee a visa
                outcome. Always seek advice from a registered migration agent or Australian legal
                practitioner.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 bg-gradient-to-b from-blue-50/30 to-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-5">
                Get early access
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.05} className="text-lg text-gray-500 mb-8">
                Join the waitlist and be first to know when Interlace launches.
                Waitlist members receive discounted early-access pricing.
              </motion.p>
              <motion.div variants={fadeUp} custom={0.1} className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all duration-150 shadow-md shadow-blue-600/25"
                >
                  Join the Waitlist
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 px-7 py-4 text-base font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-150"
                >
                  How it works
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
