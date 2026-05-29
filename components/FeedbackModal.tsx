'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';

interface FeedbackModalProps {
  verseId: number;
  onClose: () => void;
  onSubmit: () => void;
}

type FeedbackOption = 'not_relevant' | 'too_hard' | 'translation' | 'other';

export default function FeedbackModal({
  verseId,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const { language } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<FeedbackOption | ''>('');
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackOptions = [
    {
      id: 'not_relevant' as FeedbackOption,
      en: 'Not relevant to my problem',
      hi: 'मेरी समस्या के लिए प्रासंगिक नहीं',
    },
    {
      id: 'too_hard' as FeedbackOption,
      en: 'Too hard to understand',
      hi: 'समझने में मुश्किल',
    },
    {
      id: 'translation' as FeedbackOption,
      en: 'Translation not clear',
      hi: 'अनुवाद स्पष्ट नहीं है',
    },
    {
      id: 'other' as FeedbackOption,
      en: 'Other',
      hi: 'अन्य',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    setIsSubmitting(true);

    try {
      const feedbackText =
        selectedOption === 'other'
          ? customText
          : feedbackOptions.find((opt) => opt.id === selectedOption)
            ? language === 'en'
              ? feedbackOptions.find((opt) => opt.id === selectedOption)?.en || ''
              : feedbackOptions.find((opt) => opt.id === selectedOption)?.hi || ''
            : '';

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse_id: verseId,
          query_text: '',
          rating: 'down',
          feedback_text: feedbackText,
        }),
      });

      onSubmit();
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = language === 'en' ? 'Help us improve' : 'हमें बेहतर बनाने में मदद करें';
  const submitLabel = language === 'en' ? 'Submit Feedback' : 'प्रतिक्रिया सबमिट करें';
  const cancelLabel = language === 'en' ? 'Cancel' : 'रद्द करें';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 card-warm">
        <h2 className="text-lg font-bold text-maroon mb-4 devanagari">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {feedbackOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-cream-dark hover:border-saffron cursor-pointer transition-colors duration-200"
              >
                <input
                  type="radio"
                  name="feedback"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) =>
                    setSelectedOption(e.target.value as FeedbackOption)
                  }
                  className="w-4 h-4 text-saffron cursor-pointer"
                />
                <span className="text-sm text-gray-700 devanagari">
                  {language === 'en' ? option.en : option.hi}
                </span>
              </label>
            ))}
          </div>

          {selectedOption === 'other' && (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Tell us more...'
                  : 'हमें और बताएं...'
              }
              className="w-full p-3 border-2 border-saffron rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron resize-none text-sm devanagari"
              rows={3}
            />
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={!selectedOption || (selectedOption === 'other' && !customText.trim()) || isSubmitting}
              className="flex-1 button-saffron disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? language === 'en'
                  ? 'Submitting...'
                  : 'सबमिट किया जा रहा है...'
                : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
