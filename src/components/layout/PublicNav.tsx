'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  LogIn,
  ArrowRight,
  Shield,
  FileText,
  Info,
} from 'lucide-react';
import InterlaceLogo from '@/components/InterlaceLogo';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/privacy', label: 'Privacy & Security' },
  { href: '/pricing', label: 'Pricing' },
];

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sticky top-4 z-50 px-4">
      <nav
        className="max-w-7xl mx-auto nav-floating px-5 py-3"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <InterlaceLogo size={30} textSize="text-lg" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/help"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-3 pt-3 border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col gap-1 pb-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/help"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Help
                </Link>
                <div className="flex gap-2 mt-2">
                  <Link
                    href="/login"
                    className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center btn-primary"
                  >
                    Start Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
