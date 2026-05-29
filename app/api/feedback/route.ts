import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const feedback = await req.json();

    const { verse_id, query_text, rating, feedback_text } = feedback;

    // Validation
    if (!verse_id || typeof verse_id !== 'number') {
      return NextResponse.json(
        { error: 'verse_id is required and must be a number' },
        { status: 400 }
      );
    }

    if (rating !== 'up' && rating !== 'down') {
      return NextResponse.json(
        { error: 'rating must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Log feedback for now (would save to Supabase later)
    console.log('Feedback received:', {
      verse_id,
      query_text,
      rating,
      feedback_text,
      timestamp: new Date().toISOString(),
    });

    // Store in localStorage via the client, or in a database
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback_id: `feedback_${verse_id}_${Date.now()}`,
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
