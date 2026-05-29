'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { Verse } from '@/lib/types';
import { getThemeById, getVersesByTheme } from '@/lib/verses';
import { krishnaOpenings, krishnaClosings } from '@/lib/krishna-responses';
import FeedbackModal from '@/components/FeedbackModal';

function KrishnaVerseTeaching({ verse }: { verse: Verse }) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const translation = language === 'en' ? verse.translation_english : verse.translation_hindi;
  const verseRef = language === 'en'
    ? `Chapter ${verse.chapter_number}, Verse ${verse.verse_number}`
    : `अध्याय ${verse.chapter_number}, श्लोक ${verse.verse_number}`;
  const expandLabel = language === 'en' ? "Krishna's Teaching" : 'कृष्ण की शिक्षा';
  const battlefieldLabel = language === 'en' ? 'From the Battlefield' : 'रणभूमि से';
  const guidanceLabel = language === 'en' ? "Krishna's Guidance" : 'कृष्ण का मार्गदर्शन';

  const handleUpvote = () => {
    if (!hasUpvoted && !hasDownvoted) {
      setHasUpvoted(true);
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verse_id: verse.id, query_text: '', rating: 'up', feedback_text: '' }),
      }).catch(console.error);
    }
  };

  const handleDownvote = () => {
    if (!hasDownvoted && !hasUpvoted) {
      setHasDownvoted(true);
      setShowFeedbackModal(true);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3 mb-6 animate-fadeInUp">
        <div className="krishna-avatar-sm flex-shrink-0 mt-1">
          <span className="text-xs">K</span>
        </div>
        <div className="chat-bubble-krishna flex-1">
          {/* Verse reference */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-saffron/20 text-saffron font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
              {verse.verse_ref}
            </span>
            <span className="text-sm text-gray-500 devanagari">{verseRef}</span>
          </div>

          {/* Sanskrit */}
          <div className="sanskrit-block mb-3">
            <p className="text-base md:text-lg prose-devanagari text-center text-maroon font-semibold leading-relaxed">
              {verse.sanskrit_text}
            </p>
          </div>

          <p className="text-xs text-gray-500 italic text-center mb-3">{verse.transliteration}</p>

          {/* Translation */}
          <div className="bg-cream/80 rounded-lg p-3 mb-4 border-l-4 border-saffron">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed devanagari">{translation}</p>
          </div>

          {/* Expandable teaching */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mb-3 py-2 px-3 bg-saffron text-white rounded-lg font-medium text-sm hover:bg-orange-500 transition-colors duration-200"
          >
            {isExpanded ? '&#9660;' : '&#9654;'} {expandLabel}
          </button>

          {isExpanded && (
            <div className="bg-cream-dark rounded-lg p-4 mb-4 space-y-4 animate-fadeIn">
              <div>
                <p className="text-sm font-bold text-maroon mb-2 devanagari">&#9876;&#65039; {battlefieldLabel}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{verse.mahabharata_context}</p>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <p className="text-sm font-bold text-maroon mb-2 devanagari">&#128161; {guidanceLabel}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{verse.life_application}</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="flex items-center justify-between gap-4 border-t border-cream-dark pt-3">
            <p className="text-xs text-gray-500">{language === 'en' ? 'Helpful?' : 'मददगार?'}</p>
            <div className="flex gap-2">
              <button onClick={handleUpvote} disabled={hasDownvoted}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 ${hasUpvoted ? 'bg-green-500 text-white' : 'border border-green-500 text-green-600 hover:bg-green-50'} disabled:opacity-50`}>
                &#128077;
              </button>
              <button onClick={handleDownvote} disabled={hasUpvoted}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 ${hasDownvoted ? 'bg-red-500 text-white' : 'border border-red-500 text-red-600 hover:bg-red-50'} disabled:opacity-50`}>
                &#128078;
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          verseId={verse.id}
          onClose={() => { setShowFeedbackModal(false); setHasDownvoted(false); }}
          onSubmit={() => { setShowFeedbackModal(false); }}
        />
      )}
    </>
  );
}

const themeEmojis: Record<string, string> = {
  anxiety_worry: '😰', anger_frustration: '😠', grief_loss: '😢',
  confusion_decisions: '🤔', self_doubt: '😕', relationships: '💑',
  career_purpose: '🎯', fear_courage: '🦁', attachment: '🔗',
  stress_overwhelm: '😫', laziness: '😴', jealousy: '😒',
  forgiveness: '🙏', patience: '⏳', loneliness: '🌑',
  gratitude: '🙌', addiction: '🚫', spiritual_growth: '✨',
};

export default function ThemePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();

  const themeId = params.id as string;
  const theme = getThemeById(themeId);
  const verses = getVersesByTheme(themeId);

  if (!theme) {
    return (
      <div className="container-warm min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-maroon mb-4">
          {language === 'en' ? 'Theme not found' : 'विषय नहीं मिला'}
        </h1>
        <button onClick={() => router.push('/')} className="button-saffron">
          {language === 'en' ? 'Go Home' : 'घर जाएं'}
        </button>
      </div>
    );
  }

  const backLabel = language === 'en' ? 'Back' : 'वापस';
  const opening = krishnaOpenings[themeId];
  const closing = krishnaClosings[themeId];
  const openingText = opening ? (language === 'en' ? opening.en : opening.hi) : '';
  const closingText = closing ? (language === 'en' ? closing.en : closing.hi) : '';

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-warm pb-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-saffron hover:text-orange-600 font-medium py-4 transition-colors duration-200"
        >
          ← {backLabel}
        </button>

        {/* Theme Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-fadeInUp">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{themeEmojis[themeId] || '📖'}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-maroon mb-2 devanagari">
                {language === 'en' ? theme.name : theme.name_hi}
              </h1>
              <p className="text-gray-600 devanagari">
                {verses.length} {language === 'en' ? 'verses' : 'श्लोक'}
              </p>
            </div>
          </div>
          {openingText && (
            <p className="text-sm text-gray-600 italic devanagari leading-relaxed">{openingText}</p>
          )}
        </div>

        {/* Verses as Krishna teachings */}
        <div className="space-y-4">
          {verses.length > 0 ? (
            verses.map((verse) => (
              <KrishnaVerseTeaching key={verse.id} verse={verse} />
            ))
          ) : (
            <div className="card-warm p-6 text-center">
              <p className="text-gray-600 devanagari">
                {language === 'en' ? 'No verses found for this theme' : 'इस विषय के लिए कोई श्लोक नहीं मिला'}
              </p>
            </div>
          )}
        </div>

        {/* Closing */}
        {closingText && verses.length > 0 && (
          <div className="text-center mt-8 p-4">
            <p className="text-sm text-gray-600 italic devanagari">{closingText}</p>
          </div>
        )}
      </div>

      <footer className="bg-maroon text-white py-8 text-center">
        <div className="container-warm">
          <p className="text-base text-white/80 devanagari">
            {language === 'en' ? 'May these teachings guide your path.' : 'ये शिक्षाएं आपका मार्ग दिखाएं।'}
          </p>
        </div>
      </footer>
    </div>
  );
}
