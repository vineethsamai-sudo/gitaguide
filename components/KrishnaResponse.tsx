'use client';

import { useState, useEffect } from 'react';
import { Verse, Theme } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { krishnaOpenings, krishnaClosings } from '@/lib/krishna-responses';
import FeedbackModal from './FeedbackModal';

interface KrishnaResponseProps {
  verse: Verse;
  theme: Theme;
  query: string;
  allVerses?: Array<{ verse: Verse; relevance_score: number; matched_theme: Theme }>;
}

interface AiKrishna {
  opening: string;
  guidance: string;
  closing: string;
}

export default function KrishnaResponse({ verse, theme, query, allVerses = [] }: KrishnaResponseProps) {
  const { language } = useLanguage();
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVerse, setAiVerse] = useState<Verse | null>(null);
  const [aiTheme, setAiTheme] = useState<Theme | null>(null);
  const [aiKrishna, setAiKrishna] = useState<AiKrishna | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAttempted, setAiAttempted] = useState(false);

  // Call Krishna AI on mount
  useEffect(() => {
    const fetchAiResponse = async () => {
      setAiLoading(true);
      setAiError(null);
      try {
        const res = await fetch('/api/krishna', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, language }),
        });
        const data = await res.json();

        if (data.success && data.verse && data.krishna) {
          setAiVerse(data.verse);
          setAiTheme(data.theme);
          setAiKrishna(data.krishna);
        } else if (data.rate_limited) {
          setAiError(data.error);
        }
        // If AI fails silently, we still have the keyword-matched result
      } catch {
        // Silently fall back to keyword match
      } finally {
        setAiLoading(false);
        setAiAttempted(true);
      }
    };

    fetchAiResponse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Determine which verse/response to show
  const isAiResponse = aiAttempted && aiVerse && aiKrishna && !aiError;
  const displayVerse = isAiResponse ? aiVerse! : (currentVerseIndex === 0 ? verse : (allVerses[currentVerseIndex]?.verse || verse));
  const displayTheme = isAiResponse ? (aiTheme || theme) : (currentVerseIndex === 0 ? theme : (allVerses[currentVerseIndex]?.matched_theme || theme));

  // Opening/closing text
  const fallbackOpening = krishnaOpenings[displayTheme.id] || krishnaOpenings.anxiety_worry;
  const fallbackClosing = krishnaClosings[displayTheme.id] || krishnaClosings.anxiety_worry;

  const openingText = isAiResponse ? aiKrishna!.opening : (language === 'en' ? fallbackOpening.en : fallbackOpening.hi);
  const guidanceText = isAiResponse ? aiKrishna!.guidance : displayVerse.life_application;
  const closingText = isAiResponse ? aiKrishna!.closing : (language === 'en' ? fallbackClosing.en : fallbackClosing.hi);

  const translation = language === 'en' ? displayVerse.translation_english : displayVerse.translation_hindi;
  const verseRef = language === 'en'
    ? `Chapter ${displayVerse.chapter_number}, Verse ${displayVerse.verse_number}`
    : `अध्याय ${displayVerse.chapter_number}, श्लोक ${displayVerse.verse_number}`;

  const battlefieldLabel = language === 'en' ? 'From the Battlefield' : 'रणभूमि से';
  const guidanceLabel = language === 'en' ? "Krishna's Guidance for You" : 'आपके लिए कृष्ण का मार्गदर्शन';
  const helpfulLabel = language === 'en' ? 'Was this helpful?' : 'क्या यह मददगार था?';
  const anotherVerseLabel = language === 'en' ? 'Show me another verse' : 'एक और श्लोक दिखाएं';
  const noMoreLabel = language === 'en' ? 'No more verses for this topic' : 'इस विषय के लिए और श्लोक नहीं हैं';

  const handleUpvote = () => {
    if (!hasUpvoted && !hasDownvoted) {
      setHasUpvoted(true);
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse_id: displayVerse.id,
          query_text: query,
          rating: 'up',
          feedback_text: isAiResponse ? 'ai_response' : 'keyword_response',
        }),
      }).catch(console.error);
    }
  };

  const handleDownvote = () => {
    if (!hasDownvoted && !hasUpvoted) {
      setHasDownvoted(true);
      setShowFeedbackModal(true);
    }
  };

  const handleShowAnother = () => {
    // When showing another, revert to keyword matches
    const nextIndex = currentVerseIndex + 1;
    if (nextIndex < allVerses.length) {
      setCurrentVerseIndex(nextIndex);
      setAiVerse(null);
      setAiKrishna(null);
      setAiTheme(null);
      setHasUpvoted(false);
      setHasDownvoted(false);
    }
  };

  const canShowAnother = !isAiResponse ? (currentVerseIndex + 1 < allVerses.length) : allVerses.length > 0;

  // Loading state
  if (aiLoading && !aiAttempted) {
    return (
      <div className="krishna-chat-container">
        <div className="flex justify-end mb-6 animate-fadeInUp">
          <div className="chat-bubble-user">
            <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'You asked:' : 'आपने पूछा:'}</p>
            <p className="text-base font-medium text-maroon devanagari">{query}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 mb-6">
          <div className="krishna-avatar flex-shrink-0">
            <span className="text-lg">K</span>
          </div>
          <div className="chat-bubble-krishna flex-1">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-saffron rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-saffron rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-saffron rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-sm text-gray-500 devanagari italic">
                {language === 'en' ? 'Krishna is contemplating your question...' : 'कृष्ण आपके प्रश्न पर विचार कर रहे हैं...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rate limit error
  if (aiError) {
    return (
      <div className="krishna-chat-container">
        <div className="flex justify-end mb-6 animate-fadeInUp">
          <div className="chat-bubble-user">
            <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'You asked:' : 'आपने पूछा:'}</p>
            <p className="text-base font-medium text-maroon devanagari">{query}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 mb-6">
          <div className="krishna-avatar flex-shrink-0"><span className="text-lg">K</span></div>
          <div className="chat-bubble-krishna flex-1">
            <p className="text-base text-gray-700 devanagari">{aiError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="krishna-chat-container">
        {/* User's question bubble */}
        <div className="flex justify-end mb-6 animate-fadeInUp">
          <div className="chat-bubble-user">
            <p className="text-sm text-gray-500 mb-1">
              {language === 'en' ? 'You asked:' : 'आपने पूछा:'}
            </p>
            <p className="text-base font-medium text-maroon devanagari">{query}</p>
          </div>
        </div>

        {/* Krishna's response bubble */}
        <div className="flex items-start gap-3 mb-6 krishna-response-appear">
          <div className="krishna-avatar flex-shrink-0">
            <span className="text-lg">K</span>
          </div>

          <div className="chat-bubble-krishna flex-1">
            {/* AI badge */}
            {isAiResponse && (
              <div className="flex items-center gap-1 mb-3">
                <span className="inline-block bg-saffron/20 text-saffron text-xs px-2 py-0.5 rounded-full font-medium">
                  ✨ {language === 'en' ? 'Personalized for you' : 'आपके लिए व्यक्तिगत'}
                </span>
              </div>
            )}

            {/* Opening line */}
            <p className="text-base text-gray-800 leading-relaxed mb-5 devanagari italic">
              {openingText}
            </p>

            {/* Verse reference */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block bg-saffron/20 text-saffron font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                {displayVerse.verse_ref}
              </span>
              <span className="text-sm text-gray-500 devanagari">{verseRef}</span>
            </div>

            {/* Sanskrit shloka */}
            <div className="sanskrit-block mb-4">
              <p className="text-lg md:text-xl prose-devanagari text-center text-maroon font-semibold leading-relaxed">
                {displayVerse.sanskrit_text}
              </p>
            </div>

            {/* Transliteration */}
            <p className="text-xs text-gray-500 italic text-center mb-4 px-2">
              {displayVerse.transliteration}
            </p>

            {/* Translation */}
            <div className="bg-cream/80 rounded-lg p-4 mb-5 border-l-4 border-saffron">
              <p className="text-base md:text-lg text-gray-800 leading-relaxed devanagari">
                {translation}
              </p>
            </div>

            {/* From the Battlefield */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-maroon mb-2 devanagari flex items-center gap-2">
                <span>⚔️</span> {battlefieldLabel}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {displayVerse.mahabharata_context}
              </p>
            </div>

            {/* Krishna's Guidance */}
            <div className="mb-5 bg-gradient-to-r from-saffron/10 to-gold/10 rounded-lg p-4">
              <h3 className="text-sm font-bold text-maroon mb-2 devanagari flex items-center gap-2">
                <span>💡</span> {guidanceLabel}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed devanagari">
                {guidanceText}
              </p>
            </div>

            {/* Closing line */}
            <p className="text-sm text-gray-600 italic text-center devanagari border-t border-cream-dark pt-4 mb-4">
              {closingText}
            </p>

            {/* Feedback buttons */}
            <div className="flex items-center justify-between gap-4 border-t border-cream-dark pt-4">
              <p className="text-xs text-gray-500 devanagari">{helpfulLabel}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleUpvote}
                  disabled={hasDownvoted}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    hasUpvoted
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-green-500 text-green-600 hover:bg-green-50'
                  } disabled:opacity-50`}
                >
                  👍 {language === 'en' ? 'Yes' : 'हां'}
                </button>
                <button
                  onClick={handleDownvote}
                  disabled={hasUpvoted}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    hasDownvoted
                      ? 'bg-red-500 text-white'
                      : 'border-2 border-red-500 text-red-600 hover:bg-red-50'
                  } disabled:opacity-50`}
                >
                  👎 {language === 'en' ? 'No' : 'नहीं'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Show another verse button */}
        <div className="text-center mt-6">
          {canShowAnother ? (
            <button
              onClick={handleShowAnother}
              className="button-saffron px-6 py-3 text-sm"
            >
              {anotherVerseLabel}
            </button>
          ) : (
            <p className="text-sm text-gray-400 devanagari">{noMoreLabel}</p>
          )}
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          verseId={displayVerse.id}
          onClose={() => {
            setShowFeedbackModal(false);
            setHasDownvoted(false);
          }}
          onSubmit={() => {
            setShowFeedbackModal(false);
          }}
        />
      )}
    </>
  );
}
