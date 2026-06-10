'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Upload,
  FolderOpen,
  FileText,
  Lock,
  MessageSquare,
  ChevronDown,
  Mail,
  Clock,
  ArrowRight,
  Sparkles,
  Send,
  Check,
  Loader2,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: d },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── FAQ data ── */
interface FAQ {
  id: number;
  category: string;
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    id: 1,
    category: 'Upload',
    q: 'What types of files can I upload?',
    a: 'Interlace supports standard image formats including JPEG, PNG, HEIC, and WebP, as well as PDF documents. Individual files can be up to 50MB. We recommend uploading screenshots of text messages in PNG or JPEG, and multi-page documents (like bank statements or rental agreements) as PDFs for optimal rendering.',
  },
  {
    id: 2,
    category: 'AI Processing',
    q: 'How does automatic categorisation work?',
    a: 'When you upload a file, Interlace extracts metadata (like timestamps and geolocation) and performs private analysis of the content. Based on this, it categorises the evidence into primary relationship categories required for Australian partner visas (such as financial aspects, nature of the household, social aspects, and nature of the commitment). You can manually re-categorise any item at any time.',
  },
  {
    id: 3,
    category: 'Editing',
    q: 'Can I edit AI-suggested captions?',
    a: 'Yes, absolutely. The automated captions are suggested templates designed to state objective facts (e.g., date, location, and key context). You can fully edit, rewrite, or completely remove any AI-suggested captions in the Redaction Workspace or PDF Builder before exporting your document.',
  },
  {
    id: 4,
    category: 'Privacy',
    q: 'What happens to my evidence files?',
    a: 'Your uploaded files are stored in a secure, isolated cloud repository. They are used exclusively to compile your evidence document. Your files are never shared, sold, or used to train public machine learning models. You can download your raw files or permanently delete them at any time.',
  },
  {
    id: 5,
    category: 'Security',
    q: 'Who can see my uploaded files?',
    a: 'By default, only you can access your project and files. If you choose to, you can invite your partner to collaborate, or share access with a registered migration agent or Interlace reviewer. Staff review is only initiated when you explicitly request it under a Consultant-Reviewed plan.',
  },
  {
    id: 6,
    category: 'Collaboration',
    q: 'How do I invite my partner to collaborate?',
    a: 'Go to the "Sharing & Permissions" page in your project dashboard. Enter your partner\'s email address and select their permission level. They will receive an email invite to join your project, allowing you both to upload evidence, write captions, and build your shared timeline together.',
  },
  {
    id: 7,
    category: 'Privacy',
    q: 'Can I delete my evidence after downloading the PDF?',
    a: 'Yes. You have complete ownership of your data. Once you have compiled and downloaded your final PDF document, you can use the "Delete All Project Data" option in your settings. This immediately and permanently deletes all uploaded images, metadata, and generated PDFs from our servers.',
  },
  {
    id: 8,
    category: 'General',
    q: 'Does Interlace provide migration advice?',
    a: 'No, Interlace is not a registered migration agency and does not provide legal or migration advice. The application is an evidence organisation and document formatting assistant. If you require legal advice or representation, we recommend consulting a registered migration agent (MARA) or qualified legal professional.',
  },
  {
    id: 9,
    category: 'AI Processing',
    q: 'What if I disagree with an AI-suggested category?',
    a: 'If the system suggests an incorrect category or date, you can easily change it. Simply click on the evidence card in your library or timeline and select the correct category from the dropdown menu, or edit the date field manually. Your manual corrections override all system suggestions.',
  },
  {
    id: 10,
    category: 'Privacy',
    q: 'How long are files kept after I delete my account?',
    a: 'When you delete your project or account, all files, metadata, and cache records are deleted immediately and permanently from our active database. Backup copies in our secure disaster recovery storage are fully overwritten within 30 days in accordance with our retention policy.',
  },
  {
    id: 11,
    category: 'Security',
    q: 'Is my data encrypted?',
    a: 'Yes. All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We employ strict logical separation between client databases to ensure that your private photographs and personal details remain completely secure.',
  },
  {
    id: 12,
    category: 'General',
    q: 'Can I use Interlace without an Interlace migration agent?',
    a: 'Yes, definitely. The Interlace Evidence Builder is designed as a self-service tool. You can use it to build your document, download it, and upload it yourself as part of your partner visa application, or share it with any external registered migration agent of your choice.',
  },
];

/* ── FAQ Accordion Item ── */
function FAQItem({ faq, open, onToggle }: { faq: FAQ; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            {faq.category}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{faq.q}</span>
        </div>
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
            <div className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  /* Contact Form State */
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* Extract unique FAQ categories */
  const categories = useMemo(() => {
    return Array.from(new Set(FAQS.map((faq) => faq.category)));
  }, []);

  /* Filter FAQs based on query and selected category */
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesQuery =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset success banner after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const quickLinks = [
    {
      title: 'Getting started',
      description: 'Learn the basics and set up your partner visa project.',
      icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      onClick: () => {
        setSelectedCategory('General');
        setSearchQuery('');
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'Upload guide',
      description: 'Recommended image specifications and troubleshooting files.',
      icon: <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      onClick: () => {
        setSelectedCategory('Upload');
        setSearchQuery('');
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'Evidence categories explained',
      description: 'Understanding Australian Home Affairs categories.',
      icon: <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />,
      onClick: () => {
        setSelectedCategory('AI Processing');
        setSearchQuery('');
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'PDF document guide',
      description: 'Customising section ordering, captions, and formats.',
      icon: <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      onClick: () => {
        setSelectedCategory('Editing');
        setSearchQuery('');
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'Privacy & security',
      description: 'How we encrypt and protect your sensitive evidence files.',
      icon: <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      onClick: () => {
        setSelectedCategory('Security');
        setSearchQuery('');
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'Contact support',
      description: 'Get directly in touch with our support and review team.',
      icon: <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      onClick: () => {
        document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#fdfdfc] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"
      style={{ fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <PublicNav />

      <main>
        {/* ── Hero section with search ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/20 dark:from-zinc-900 dark:to-zinc-950 py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-4"
              >
                Help & Support
              </motion.p>
              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6 text-gray-900 dark:text-white"
              >
                How can we help?
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto mb-10"
              >
                Search our knowledge base or browse frequently asked questions about building your visa evidence PDF.
              </motion.p>

              {/* Dynamic Search Box */}
              <motion.div
                variants={fadeUp}
                custom={0.15}
                className="max-w-2xl mx-auto relative group"
              >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search help articles, categories, or questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-16 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Quick Links Grid ── */}
        <section className="py-12 bg-white dark:bg-zinc-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, idx) => (
                <motion.button
                  key={link.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  onClick={link.onClick}
                  className="flex items-start text-left p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-white/10 transition-all duration-200"
                >
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 mr-4 shrink-0">
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                      {link.title}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ Accordion Section ── */}
        <section id="faq-section" className="py-20 bg-gray-50/50 dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Browse our comprehensive support articles categorised by project steps.
              </p>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion container */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <FAQItem
                        faq={faq}
                        open={openFaqId === faq.id}
                        onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No support articles found matching your query.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Reset filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── Contact Section ── */}
        <section id="contact-section" className="py-20 bg-white dark:bg-zinc-900/20 border-t border-gray-100 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
              {/* Contact info column */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Get in touch
                  </h2>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Have any technical issues, or want to check custom integration details? Our support crew is here to assist you with document formatting questions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Email address</p>
                      <a
                        href="mailto:support@interlacestudies.com"
                        className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                      >
                        support@interlacestudies.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Support hours</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Mon – Fri, 9am – 5pm AEST
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Note for migration advice
                  </h4>
                  <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                    Please note that our support staff cannot answer questions regarding visa eligibility, subclass selection, or Department of Home Affairs rules. All support is strictly limited to evidence organization software and tool functionality.
                  </p>
                </div>
              </div>

              {/* Form column */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10 flex flex-col items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Message sent!</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                          Thanks for reaching out. Our support team will review your message and reply via email within 24 hours.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="What can we help you with?"
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Message
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Please provide details about your support request..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl transition-all duration-150 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
