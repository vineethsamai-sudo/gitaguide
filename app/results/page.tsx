'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import SearchBox from '@/components/SearchBox';
import KrishnaResponse from '@/components/KrishnaResponse';
import ThemeGrid from '@/components/ThemeGrid';
import { getBestMatch } from '@/lib/matching';
import { getAllThemes } from '@/lib/verses';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const query = searchParams.get('q') || '';
  const result = query ? getBestMatch(query) : { verse: null, theme: null, score: 0, has_match: false, allVerses: [] };
  const allThemes = getAllThemes();

  const backLabel = language === 'en' ? '← Back' : '← वापस';
  const noResultsTitle = language === 'en' ? 'Krishna is listening...' : 'कृष्ण सुन रहे हैं...';
  const noResultsSubtitle =
    language === 'en'
      ? 'I could not find a specific verse for your words, but explore these paths — your answer may be within:'
      : 'मुझे आपके शब्दों के लिए कोई विशेष श्लोक नहीं मिला, लेकिन इन मार्गों को देखें — आपका उत्तर इनमें हो सकता है:';
  const anotherQuestion =
    language === 'en' ? 'Ask Krishna Another Question' : 'कृष्ण से एक और प्रश्न पूछें';

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-warm">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-saffron hover:text-orange-600 font-medium py-4 transition-colors duration-200"
        >
          {backLabel}
        </button>

        {result.has_match && result.verse && result.theme ? (
          <div className="mb-12">
            <KrishnaResponse
              verse={result.verse}
              theme={result.theme}
              query={query}
              allVerses={result.allVerses}
            />
          </div>
        ) : (
          <div className="mb-12 text-center py-8">
            <div className="krishna-avatar mx-auto mb-4" style={{ width: 64, height: 64, fontSize: 28 }}>
              <span>K</span>
            </div>
            <h2 className="text-2xl font-bold text-maroon mb-4 devanagari">{noResultsTitle}</h2>
            <p className="text-gray-600 mb-8 devanagari">{noResultsSubtitle}</p>
            <ThemeGrid themes={allThemes} />
          </div>
        )}

        <div className="mb-12">
          <h3 className="text-lg font-bold text-maroon mb-4 devanagari text-center">{anotherQuestion}</h3>
          <SearchBox />
        </div>
      </div>

      <footer className="bg-maroon text-white py-8 text-center">
        <div className="container-warm">
          <p className="text-base text-white/80 devanagari">
            {language === 'en'
              ? 'May you find your path to wisdom and peace.'
              : 'आपको ज्ञान और शांति का मार्ग मिले।'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="krishna-avatar mx-auto mb-4" style={{ width: 56, height: 56, fontSize: 24 }}>
            <span>K</span>
          </div>
          <p className="text-gray-500 devanagari">
            Krishna is contemplating...
          </p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
