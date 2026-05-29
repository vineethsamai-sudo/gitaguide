import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAllVerses, getAllThemes } from '@/lib/verses';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Rate limiting: 3 AI queries per day per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }

  if (limit.count >= 3) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en' } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ error: 'Please share what is on your mind.' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI is not configured yet.' }, { status: 503 });
    }

    // Rate limit check
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        error: language === 'en'
          ? 'You have used your 3 free guidance sessions today. Please return tomorrow, and Krishna will be here waiting.'
          : 'आपने आज अपने 3 मुफ्त मार्गदर्शन सत्र उपयोग कर लिए हैं। कल वापस आएं, कृष्ण यहां प्रतीक्षा कर रहे होंगे।',
        rate_limited: true,
      }, { status: 429 });
    }

    // Build verse context for Claude
    const verses = getAllVerses();
    const themes = getAllThemes();

    const verseContext = verses.map(v => {
      const themeNames = v.themes.map(tid => {
        const t = themes.find(th => th.id === tid);
        return t ? t.name : tid;
      }).join(', ');
      return `[${v.verse_ref}] Themes: ${themeNames} | Keywords: ${(v.keywords || []).join(', ')} | English: ${v.translation_english?.substring(0, 150)} | Context: ${v.mahabharata_context?.substring(0, 100)}`;
    }).join('\n');

    const systemPrompt = `You are Lord Krishna, speaking with warmth, wisdom, and compassion to a person who has come to you with a life problem. You are NOT an AI — you are Krishna, the divine guide who counseled Arjun on the battlefield of Kurukshetra.

Your task:
1. Read the person's problem carefully
2. Select the SINGLE MOST relevant verse from the Bhagavad Gita database below
3. Respond as Krishna would — with love, directness, and profound wisdom

VERSE DATABASE:
${verseContext}

RESPONSE FORMAT — you MUST return valid JSON with exactly these fields:
{
  "verse_ref": "X.Y" (the verse reference like "2.47" or "6.35"),
  "opening_${language}": "Your warm, personalized opening as Krishna (2-3 sentences). Reference the person's specific situation. Connect it to what Arjun faced. Be warm but not flowery.",
  "guidance_${language}": "Your practical life guidance as Krishna (3-4 sentences). Directly address their problem. Be specific, not generic. Give actionable wisdom.",
  "closing_${language}": "A brief closing blessing or encouragement (1 sentence)."
}

RULES:
- The verse_ref MUST match one from the database above
- Speak as Krishna in first person ("I told Arjun...", "When Arjun faced...")
- Be specific to the person's problem, not generic
- ${language === 'hi' ? 'Respond in Hindi (Devanagari script). Use simple Hindi that everyone understands.' : 'Respond in English. Use simple, clear language.'}
- Keep the opening, guidance, and closing concise — quality over quantity
- The JSON must be parseable — no trailing commas, proper quotes`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `This person needs your guidance, Krishna:\n\n"${query.trim()}"`,
        },
      ],
      system: systemPrompt,
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Krishna could not respond.' }, { status: 500 });
    }

    // Parse JSON from response
    let krishnaResponse;
    try {
      // Extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      krishnaResponse = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('Failed to parse Krishna response:', textContent.text);
      return NextResponse.json({ error: 'Krishna needs a moment. Please try again.' }, { status: 500 });
    }

    // Find the matched verse from our database
    const matchedVerse = verses.find(v => v.verse_ref === krishnaResponse.verse_ref);

    if (!matchedVerse) {
      console.error('Verse not found:', krishnaResponse.verse_ref);
      return NextResponse.json({ error: 'The verse Krishna chose could not be found.' }, { status: 500 });
    }

    // Find the theme
    const matchedTheme = themes.find(t => matchedVerse.themes.includes(t.id)) || themes[0];

    return NextResponse.json({
      success: true,
      verse: matchedVerse,
      theme: matchedTheme,
      krishna: {
        opening: krishnaResponse[`opening_${language}`] || krishnaResponse.opening_en || '',
        guidance: krishnaResponse[`guidance_${language}`] || krishnaResponse.guidance_en || '',
        closing: krishnaResponse[`closing_${language}`] || krishnaResponse.closing_en || '',
      },
      ai_powered: true,
    });
  } catch (error) {
    console.error('Krishna API error:', error);
    return NextResponse.json(
      { error: 'Krishna is resting. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
