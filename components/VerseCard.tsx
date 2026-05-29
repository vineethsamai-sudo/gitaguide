'use client';

import { useState } from 'react';
import { Verse, Theme } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import FeedbackModal from './FeedbackModal';

interface VerseCardProps {
  verse: Verse;
  theme?: Theme;
}

export default function VerseCard({ verse, theme }: VerseCardProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  const title =
    language === 'en'
      ? `Chapter ${verse.chapter_number}, Verse ${verse.verse_number}`
      : `अध्याय ${verse.chapter_number}, श्लोक ${verse.verse_number}`;

  const translation =
    language === 'en'
      ? verse.translation_english
      : verse.translation_hindi;

  const expandLabel = language === 'en' ? 'Story & How It Helps' : 'कहानी और सहायता';
  const contextLabel = language === 'en' ? 'Story from Mahabharata' : 'महाभारत की कहानी';
  const applicationLabel = language === 'en' ? 'How It Helps' : 'यह कैसे मदद करता है';

  const handleUpvote = () => {
    if (!hasUpvoted && !hasDownvoted) {
      setHasUpvoted(true);
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse_id: verse.id,
          query_text: '',
          rating: 'up',
          feedback_text: '',
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

  return (
    <>
      <div className="card-warm p-6 mb-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-saffron uppercase tracking-wide">
              {verse.verse_ref}
            </p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
          {theme && (
            <span className="text-2xl">
              {theme.icon || '📖'}
            </span>
          )}
        </div>

        {/* Sanskrit text */}
        <div className="bg-cream-dark rounded-lg p-4 mb-4">
          <p className="text-lg md:text-xl prose-devanagari text-center text-maroon font-semibold leading-relaxed">
            {verse.sanskrit_text}
          </p>
        </div>

        {/* Transliteration */}
        <p className="text-xs text-gray-500 italic text-center mb-4 px-2">
          {verse.transliteration}
        </p>

        {/* Translation */}
        <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-4 devanagari">
          {translation}
        </p>

        {/* Expandable section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mb-4 py-2 px-3 bg-saffron text-white rounded-lg font-medium text-sm hover:bg-orange-500 transition-colors duration-200"
        >
          {isExpanded ? '▼' : '▶'} {expandLabel}
        </button>

        {isExpanded && (
          <div className="bg-cream-dark rounded-lg p-4 mb-4 space-y-4 animate-fadeIn">
            {/* Mahabharata Context */}
            <div>
              <p className="text-sm font-bold text-maroon mb-2 devanagari">
                📜 {contextLabel}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {verse.mahabharata_context}
              </p>
            </div>

            {/* Life Application */}
            <div className="border-t border-gray-300 pt-4">
              <p className="text-sm font-bold text-maroon mb-2 devanagari">
                💡 {applicationLabel}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {verse.life_application}
              </p>
            </div>
          </div>
        )}

        {/* Feedback buttons */}
        <div className="flex items-center justify-between gap-4 border-t border-cream-dark pt-4">
          <p className="text-xs text-gray-500">
            {language === 'en' ? 'Was this helpful?' : 'क्या यह मददगार था?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpvote}
              disabled={hasDownvoted}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                hasUpvoted
                  ? 'bg-green-500 text-white'
                  : 'border-2 border-green-500 text-green-600 hover:bg-green-50'
              } disabled:opacity-50`}
              title={language === 'en' ? 'Helpful' : 'मददगार'}
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
              title={language === 'en' ? 'Not helpful' : 'सहायक नहीं'}
            >
              👎 {language === 'en' ? 'No' : 'नहीं'}
            </button>
          </div>
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          verseId={verse.id}
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
