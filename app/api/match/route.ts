import { matchByKeywords } from '@/lib/matching';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const results = matchByKeywords(query);

    return NextResponse.json({
      success: true,
      query,
      results: {
        themes: results.themes.map((tr) => ({
          theme: {
            id: tr.theme.id,
            name: tr.theme.name,
            name_hi: tr.theme.name_hi,
          },
          verses: tr.verses.map((v) => ({
            id: v.verse.id,
            verse_ref: v.verse.verse_ref,
            relevance_score: v.relevance_score,
          })),
          total_score: tr.total_score,
        })),
        has_matches: results.has_matches,
      },
    });
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
