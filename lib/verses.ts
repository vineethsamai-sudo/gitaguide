import versesData from '@/data/verses.json';
import { Verse, Theme, SearchResult } from './types';

let cachedVerses: Verse[] | null = null;
let cachedThemes: Theme[] | null = null;

export function getAllVerses(): Verse[] {
  if (cachedVerses) {
    return cachedVerses;
  }

  cachedVerses = versesData.verses as Verse[];
  return cachedVerses;
}

export function getAllThemes(): Theme[] {
  if (cachedThemes) {
    return cachedThemes;
  }

  const themes = versesData.themes as Theme[];
  const verses = getAllVerses();

  cachedThemes = themes.map((theme) => {
    const verseCount = verses.filter((verse) =>
      verse.themes.includes(theme.id)
    ).length;

    return {
      ...theme,
      verse_count: verseCount,
    };
  });

  return cachedThemes;
}

export function getThemeById(id: string): Theme | null {
  const themes = getAllThemes();
  const theme = themes.find((t) => t.id === id);
  return theme || null;
}

export function getVersesByTheme(themeId: string): Verse[] {
  const verses = getAllVerses();
  return verses.filter((verse) => verse.themes.includes(themeId));
}

export function searchVerses(query: string): SearchResult[] {
  const verses = getAllVerses();
  const themes = getAllThemes();
  const normalizedQuery = query.toLowerCase().trim();

  const results: SearchResult[] = [];
  const scoreMap = new Map<number, number>();

  // Search through verses and themes
  verses.forEach((verse) => {
    let score = 0;

    // Check keywords (English and Hindi)
    if (verse.keywords && verse.keywords.length > 0) {
      verse.keywords.forEach((keyword) => {
        if (
          normalizedQuery.includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(normalizedQuery)
        ) {
          score += 3;
        }
      });
    }

    if (verse.keywords_hi && verse.keywords_hi.length > 0) {
      verse.keywords_hi.forEach((keyword) => {
        if (
          normalizedQuery.includes(keyword) ||
          keyword.includes(normalizedQuery)
        ) {
          score += 3;
        }
      });
    }

    // Check theme names
    verse.themes.forEach((themeId) => {
      const theme = themes.find((t) => t.id === themeId);
      if (theme) {
        if (
          normalizedQuery.includes(theme.name.toLowerCase()) ||
          normalizedQuery.includes(theme.name_hi)
        ) {
          score += 2;
        }
      }
    });

    // Check in the life application and context
    if (verse.life_application) {
      if (verse.life_application.toLowerCase().includes(normalizedQuery)) {
        score += 1;
      }
    }

    if (verse.mahabharata_context) {
      if (verse.mahabharata_context.toLowerCase().includes(normalizedQuery)) {
        score += 1;
      }
    }

    if (score > 0) {
      scoreMap.set(verse.id, score);
    }
  });

  // Create results with theme information
  scoreMap.forEach((score, verseId) => {
    const verse = verses.find((v) => v.id === verseId);
    if (verse) {
      // Use the first theme for the matched theme
      const firstThemeId = verse.themes[0];
      const matchedTheme = themes.find((t) => t.id === firstThemeId);

      if (matchedTheme) {
        results.push({
          verse,
          relevance_score: score,
          matched_theme: matchedTheme,
        });
      }
    }
  });

  // Sort by relevance score
  results.sort((a, b) => b.relevance_score - a.relevance_score);

  return results;
}

export function getVersesByIds(ids: number[]): Verse[] {
  const verses = getAllVerses();
  return verses.filter((verse) => ids.includes(verse.id));
}
