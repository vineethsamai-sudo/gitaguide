'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function Header() {
  const { language, toggle } = useLanguage();

  const title = language === 'en' ? 'GitaGuide' : 'गीता गाइड';
  const tagline =
    language === 'en'
      ? 'Your guide through life\'s battlefield'
      : 'जीवन के रणभूमि में आपका मार्गदर्शक';
  const toggleLabel = language === 'en' ? 'हिंदी' : 'EN';

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-cream-dark shadow-sm">
      <div className="container-warm flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 py-4 hover:opacity-80 transition-opacity">
          <div className="krishna-avatar-sm flex-shrink-0">
            <span className="text-sm">K</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-maroon">{title}</h1>
            <p className="text-xs text-saffron font-medium devanagari">{tagline}</p>
          </div>
        </Link>

        <button
          onClick={toggle}
          className="px-3 py-2 bg-saffron text-white rounded-lg font-medium text-sm hover:bg-orange-500 transition-colors duration-200"
          aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
        >
          {toggleLabel}
        </button>
      </div>
    </header>
  );
}
