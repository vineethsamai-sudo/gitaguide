'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  const placeholder =
    language === 'en'
      ? 'Tell Krishna what troubles you...'
      : 'कृष्ण को बताएं क्या परेशान कर रहा है...';

  const buttonText = language === 'en' ? 'Seek Guidance' : 'मार्गदर्शन माँगें';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      router.push(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 bg-cream border-2 border-saffron rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2 resize-none text-base devanagari"
          rows={4}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="button-saffron w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">&#9203;</span>
              {language === 'en' ? 'Seeking wisdom...' : 'ज्ञान की खोज...'}
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
}
