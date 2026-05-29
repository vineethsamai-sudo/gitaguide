'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import SearchBox from '@/components/SearchBox';
import ThemeGrid from '@/components/ThemeGrid';
import { getAllThemes } from '@/lib/verses';

export default function Home() {
  const { language } = useLanguage();
  const themes = getAllThemes();

  const heroTitle =
    language === 'en'
      ? 'Share what troubles you, and I shall guide you as I guided Arjun'
      : 'जो आपको परेशान करता है वह बताएं, मैं आपका मार्गदर्शन करूंगा जैसे मैंने अर्जुन का किया';

  const topQuote =
    language === 'en'
      ? '"Whenever dharma declines, I manifest Myself to guide and protect." - Krishna'
      : '"जब-जब धर्म की हानि होती है, मैं स्वयं प्रकट होता हूँ मार्गदर्शन और रक्षा के लिए।" - कृष्ण';

  const topicTitle =
    language === 'en'
      ? 'Or choose a path that calls to you'
      : 'या वह मार्ग चुनें जो आपको बुलाता है';

  const footerQuote =
    language === 'en'
      ? '"You have the right to perform your duty, but not to the fruits of your actions." - Bhagavad Gita 2.47'
      : '"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।" - भगवद्गीता 2.47';

  return (
    <div className="min-h-screen bg-cream">
      {/* Subtle top quote */}
      <div className="bg-gradient-to-r from-saffron/5 via-gold/10 to-saffron/5 py-3 text-center">
        <p className="text-xs md:text-sm text-gray-500 italic devanagari max-w-xl mx-auto px-4">
          {topQuote}
        </p>
      </div>

      {/* Hero Section */}
      <section className="container-warm text-center py-8 md:py-12">
        <div className="krishna-avatar mx-auto mb-5 animate-fadeInUp" style={{ width: 72, height: 72, fontSize: 32 }}>
          <span>K</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-maroon mb-6 animate-fadeInUp devanagari leading-snug">
          {heroTitle}
        </h1>
        <div className="animate-fadeInUp">
          <SearchBox />
        </div>
      </section>

      {/* Divider */}
      <div className="container-warm">
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-saffron opacity-30"></div>
          <span className="text-saffron font-medium text-sm devanagari">
            {topicTitle}
          </span>
          <div className="flex-1 h-px bg-saffron opacity-30"></div>
        </div>
      </div>

      {/* Theme Grid */}
      <section className="container-warm pb-12">
        <ThemeGrid themes={themes} />
      </section>

      {/* Footer Quote */}
      <footer className="bg-maroon text-white py-8 text-center">
        <div className="container-warm">
          <p className="text-base md:text-lg leading-relaxed italic devanagari">
            {footerQuote}
          </p>
        </div>
      </footer>
    </div>
  );
}
