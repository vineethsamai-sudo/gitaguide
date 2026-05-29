'use client';

import Link from 'next/link';
import { Theme } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

const themeEmojis: Record<string, string> = {
  anxiety_worry: '😰',
  anger_frustration: '😠',
  grief_loss: '😢',
  confusion_decisions: '🤔',
  self_doubt: '😕',
  relationships: '💑',
  career_purpose: '🎯',
  fear_courage: '🦁',
  attachment: '🔗',
  stress_overwhelm: '😫',
  laziness: '😴',
  jealousy: '😒',
  forgiveness: '🙏',
  patience: '⏳',
  loneliness: '🌑',
  gratitude: '🙌',
  addiction: '🚫',
  spiritual_growth: '✨',
};

interface ThemeGridProps {
  themes: Theme[];
}

export default function ThemeGrid({ themes }: ThemeGridProps) {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {themes.map((theme) => (
        <Link
          key={theme.id}
          href={`/theme/${theme.id}`}
          className="group"
        >
          <div className="card-warm p-4 h-full hover:shadow-lg hover:scale-105 transform transition-all duration-300">
            <div className="text-4xl mb-3 text-center">
              {themeEmojis[theme.id] || '📖'}
            </div>
            <h3 className="font-bold text-sm md:text-base text-maroon text-center group-hover:text-saffron transition-colors mb-2 devanagari">
              {language === 'en' ? theme.name : theme.name_hi}
            </h3>
            <p className="text-xs text-gray-600 text-center">
              {theme.verse_count || 0} {language === 'en' ? 'verses' : 'श्लोक'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
