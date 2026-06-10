import Link from 'next/link';
import InterlaceLogo from '@/components/InterlaceLogo';

const FOOTER_LINKS = {
  Product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Upload Evidence', href: '/dashboard' },
    { label: 'Evidence Library', href: '/dashboard' },
    { label: 'PDF Builder', href: '/dashboard' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Resources: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Privacy & Security', href: '/privacy' },
    { label: 'Help Centre', href: '/help' },
    { label: 'Disclaimer', href: '/privacy#disclaimer' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/privacy#terms' },
    { label: 'Cookie Policy', href: '/privacy#cookies' },
    { label: 'Contact', href: '/help' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-gray-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <InterlaceLogo showText size={30} textSize="text-lg" className="[&_span]:text-white" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              Organise your relationship evidence, professionally.
            </p>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-xs">
              Secure document preparation tools for Australian partner visa applicants.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://twitter.com/interlacestudies"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/interlace-studies"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Interlace. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 max-w-2xl md:text-right">
              Interlace is not the Department of Home Affairs. This tool does not provide legal advice, determine visa eligibility, or guarantee any visa outcome. Always seek advice from a registered migration agent or Australian legal practitioner.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
