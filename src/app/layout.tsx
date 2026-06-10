import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: {
    default: 'Interlace Partner Visa Evidence Builder',
    template: '%s | Interlace',
  },
  description:
    'Securely organise relationship photographs and screenshots into a professional PDF evidence profile for Australian partner visa applications.',
  keywords: [
    'partner visa',
    'Australia',
    'visa evidence',
    'relationship evidence',
    'migration',
    'de facto',
    'subclass 820',
    'subclass 309',
  ],
  openGraph: {
    title: 'Interlace Partner Visa Evidence Builder',
    description:
      'Organise your relationship evidence into a professional PDF document for Australian partner visa applications.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('interlace-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
