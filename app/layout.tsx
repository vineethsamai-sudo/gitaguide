import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { LanguageProvider } from '@/lib/language-context';

export const metadata: Metadata = {
  title: 'GitaGuide - Bhagavad Gita Wisdom for Every Problem',
  description:
    'Find timeless wisdom from the Bhagavad Gita for modern life challenges. Get guidance on anxiety, relationships, career, spirituality, and more.',
  keywords: [
    'Bhagavad Gita',
    'wisdom',
    'spirituality',
    'life guidance',
    'Sanskrit',
    'Hindu philosophy',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-gray-900 font-sans">
        <LanguageProvider>
          <Header />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
