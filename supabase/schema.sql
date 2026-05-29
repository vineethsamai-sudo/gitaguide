-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verses table
CREATE TABLE IF NOT EXISTS verses (
  id BIGINT PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  verse_ref TEXT NOT NULL UNIQUE,
  sanskrit_text TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  word_meanings TEXT NOT NULL,
  translation_hindi TEXT NOT NULL,
  translation_english TEXT NOT NULL,
  mahabharata_context TEXT,
  life_application TEXT,
  keywords TEXT[] DEFAULT '{}',
  keywords_hi TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life Themes table
CREATE TABLE IF NOT EXISTS life_themes (
  id TEXT PRIMARY KEY,
  theme_name_en TEXT NOT NULL,
  theme_name_hi TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description_en TEXT,
  description_hi TEXT,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verse-Theme junction table
CREATE TABLE IF NOT EXISTS verse_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verse_id BIGINT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL REFERENCES life_themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(verse_id, theme_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verse_id BIGINT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  query_text TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query logs table (for analytics)
CREATE TABLE IF NOT EXISTS query_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT NOT NULL,
  matched_theme_id TEXT REFERENCES life_themes(id),
  results_count INTEGER,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verses_chapter_verse ON verses(chapter_number, verse_number);
CREATE INDEX IF NOT EXISTS idx_verses_ref ON verses(verse_ref);
CREATE INDEX IF NOT EXISTS idx_verse_themes_verse_id ON verse_themes(verse_id);
CREATE INDEX IF NOT EXISTS idx_verse_themes_theme_id ON verse_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_feedback_verse_id ON feedback(verse_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON query_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Enable read access for all users" ON verses
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON life_themes
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON verse_themes
  FOR SELECT
  USING (true);

-- RLS Policies for anonymous feedback submission
CREATE POLICY "Enable anonymous feedback insertion" ON feedback
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read access for feedback" ON feedback
  FOR SELECT
  USING (true);

-- RLS Policies for query logs (insert only)
CREATE POLICY "Enable anonymous query logging" ON query_logs
  FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_verses_updated_at
  BEFORE UPDATE ON verses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_themes_updated_at
  BEFORE UPDATE ON life_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
