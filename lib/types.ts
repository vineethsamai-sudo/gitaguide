export interface Verse {
  id: number;
  chapter_number: number;
  verse_number: number;
  verse_ref: string;
  sanskrit_text: string;
  transliteration: string;
  word_meanings: string;
  translation_hindi: string;
  translation_english: string;
  mahabharata_context: string;
  life_application: string;
  keywords: string[];
  keywords_hi: string[];
  themes: string[];
}

export interface Theme {
  id: string;
  name: string;
  name_hi: string;
  icon?: string;
  color?: string;
  description_en?: string;
  description_hi?: string;
  keywords?: string[];
  verse_count?: number;
}

export interface VerseTheme {
  verse_id: number;
  theme_id: string;
}

export type FeedbackRating = 'up' | 'down';

export interface Feedback {
  id?: string;
  verse_id: number;
  query_text: string;
  rating: FeedbackRating;
  feedback_text?: string;
  created_at?: string;
}

export interface SearchResult {
  verse: Verse;
  relevance_score: number;
  matched_theme: Theme;
  match_reason?: string;
}

export interface MatchResult {
  themes: Array<{
    theme: Theme;
    verses: Array<SearchResult>;
    total_score: number;
  }>;
  query: string;
  has_matches: boolean;
}

export interface BestMatch {
  verse: Verse;
  theme: Theme;
  score: number;
  has_match: boolean;
  allVerses: SearchResult[];
}
