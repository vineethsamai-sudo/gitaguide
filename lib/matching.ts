import { MatchResult, SearchResult, BestMatch } from './types';
import { getAllVerses, getAllThemes } from './verses';

// ═══════════════════════════════════════════════════════
// COMPREHENSIVE SYNONYM & PHRASE MAP
// Maps natural language words/phrases → theme IDs
// This is the KEY to making the search work with real queries
// ═══════════════════════════════════════════════════════
const THEME_SYNONYMS: Record<string, string[]> = {
  anxiety_worry: [
    // English
    'anxiety', 'anxious', 'worry', 'worried', 'worrying', 'nervous', 'nerves',
    'stressed', 'stress', 'tense', 'tension', 'panic', 'panicking', 'overthink',
    'overthinking', 'restless', 'uneasy', 'uncertain', 'uncertainty', 'scared',
    'what if', 'cant sleep', 'insomnia', 'sleepless', 'future', 'tomorrow',
    'afraid', 'dread', 'apprehensive', 'jittery', 'unsettled', 'troubled',
    'disturbed', 'agitated', 'fretful', 'result', 'results', 'outcome',
    'exam', 'interview', 'presentation', 'performance', 'pressure',
    // Hindi
    'चिंता', 'परेशान', 'बेचैन', 'घबराहट', 'तनाव', 'फिक्र', 'डर',
    'नींद नहीं', 'भविष्य', 'क्या होगा', 'परेशानी', 'व्याकुल',
  ],
  anger_frustration: [
    'anger', 'angry', 'frustrated', 'frustration', 'rage', 'furious',
    'irritated', 'irritation', 'annoyed', 'annoying', 'mad', 'resentment',
    'bitter', 'bitterness', 'hate', 'hatred', 'temper', 'outburst',
    'revenge', 'hostile', 'hostile', 'upset', 'pissed', 'fed up',
    'losing patience', 'cant stand', 'infuriating', 'explosive',
    'short temper', 'snap', 'snapped', 'yelling', 'shouting', 'fight',
    'argument', 'conflict', 'heated', 'blood boiling', 'fuming',
    'क्रोध', 'गुस्सा', 'चिड़चिड़ा', 'नाराज', 'खीझ', 'आक्रोश', 'रोष',
    'झगड़ा', 'लड़ाई', 'गुस्से',
  ],
  grief_loss: [
    'grief', 'grieving', 'loss', 'lost', 'death', 'died', 'dead',
    'mourning', 'mourn', 'sad', 'sadness', 'heartbroken', 'heartbreak',
    'missing', 'miss', 'passed away', 'bereavement', 'pain', 'suffering',
    'sorrow', 'sorrowful', 'devastated', 'devastation', 'tragedy',
    'someone died', 'loved one', 'gone', 'departed', 'crying', 'tears',
    'depressed', 'depression', 'empty', 'emptiness', 'void', 'hollow',
    'broken', 'shattered', 'hopeless', 'despair',
    'शोक', 'दुख', 'हानि', 'मृत्यु', 'विछोह', 'रोना', 'दुखी', 'उदास',
    'खोना', 'गम', 'मरना', 'बिछड़ना',
  ],
  confusion_decisions: [
    'confused', 'confusion', 'decision', 'decide', 'deciding', 'indecisive',
    'lost', 'uncertain', 'dilemma', 'choice', 'choices', 'direction',
    'purpose', 'stuck', 'clarity', 'which path', 'dont know', "don't know",
    'what to do', 'what should i', 'torn', 'crossroads', 'conflicted',
    'ambivalent', 'unsure', 'unclear', 'options', 'paralyzed', 'paralysis',
    'which way', 'right or wrong', 'good or bad', 'should i',
    'life direction', 'path', 'way forward', 'guidance', 'guide me',
    'help me decide', 'cant choose', 'difficult choice', 'mixed signals',
    'भ्रम', 'उलझन', 'निर्णय', 'क्या करूं', 'समझ नहीं', 'कौन सा रास्ता',
    'दुविधा', 'असमंजस',
  ],
  self_doubt: [
    'self doubt', 'not good enough', 'imposter', 'impostor', 'confidence',
    'worthless', 'failure', 'failed', 'failing', 'cant do', "can't do",
    'weak', 'weakness', 'insecure', 'insecurity', 'comparison', 'inferior',
    'low self esteem', 'esteem', 'useless', 'hopeless', 'inadequate',
    'unworthy', 'loser', 'stupid', 'dumb', 'incompetent', 'not smart',
    'not talented', 'mediocre', 'average', 'behind', 'falling behind',
    'everyone else', 'better than me', 'why bother', 'give up', 'giving up',
    'quit', 'quitting', 'capable', 'believe in myself', 'not enough',
    'आत्मविश्वास', 'कमज़ोर', 'असफल', 'लायक नहीं', 'हार', 'निराशा',
    'खुद पर भरोसा', 'मैं नहीं कर सकता',
  ],
  relationships: [
    'relationship', 'relationships', 'family', 'friend', 'friends', 'friendship',
    'partner', 'spouse', 'husband', 'wife', 'parent', 'parents', 'mother',
    'father', 'brother', 'sister', 'child', 'children', 'son', 'daughter',
    'conflict', 'betrayal', 'betrayed', 'trust', 'breakup', 'break up',
    'divorce', 'lonely', 'love', 'hurt', 'toxic', 'manipulation',
    'cheating', 'cheated', 'lying', 'lied', 'argument', 'fighting',
    'misunderstanding', 'communication', 'distance', 'growing apart',
    'expectations', 'disappointed', 'disappointment', 'boundaries',
    'in laws', 'boss', 'coworker', 'colleague', 'roommate', 'neighbor',
    'रिश्ता', 'रिश्ते', 'परिवार', 'विश्वासघात', 'दोस्त', 'दोस्ती',
    'प्यार', 'पति', 'पत्नी', 'माता', 'पिता', 'झगड़ा',
  ],
  career_purpose: [
    'career', 'job', 'work', 'working', 'purpose', 'meaning', 'meaningful',
    'calling', 'passion', 'profession', 'professional', 'success',
    'promotion', 'salary', 'boss', 'office', 'corporate', 'business',
    'startup', 'entrepreneur', 'resign', 'quit job', 'fired', 'laid off',
    'unemployed', 'unemployment', 'what to do with life', 'life purpose',
    'destiny', 'dharma', 'duty', 'vocation', 'ambition', 'goals',
    'dream job', 'switch career', 'career change', 'meaningless',
    'pointless', 'why am i doing this', 'hate my job', 'wrong career',
    'करियर', 'नौकरी', 'काम', 'उद्देश्य', 'मतलब', 'जीवन का उद्देश्य',
    'धर्म', 'कर्तव्य',
  ],
  fear_courage: [
    'fear', 'afraid', 'scared', 'courage', 'brave', 'bravery', 'phobia',
    'dread', 'panic', 'frightened', 'terrified', 'terror', 'timid',
    'coward', 'cowardly', 'risk', 'risky', 'dangerous', 'step up',
    'bold', 'fearless', 'confront', 'face', 'facing', 'overcome',
    'stage fright', 'public speaking', 'standing up', 'taking action',
    'भय', 'डर', 'साहस', 'हिम्मत', 'कायर', 'घबराना', 'डरना', 'हौसला',
  ],
  attachment: [
    'attachment', 'attached', 'letting go', 'let go', 'obsession', 'obsessed',
    'possessive', 'clingy', 'move on', 'moving on', 'cant move on',
    'holding on', 'material', 'materialistic', 'desire', 'craving',
    'addiction', 'want', 'wanting', 'need', 'needing', 'clinging',
    'detach', 'detachment', 'release', 'surrender', 'hoard', 'hoarding',
    'control', 'controlling', 'obsess', 'fixated', 'fixation',
    'मोह', 'लगाव', 'छोड़ना', 'जाने देना', 'आसक्ति', 'ममता', 'त्याग',
  ],
  stress_overwhelm: [
    'stress', 'stressed', 'overwhelmed', 'overwhelming', 'burnout', 'burnt out',
    'exhausted', 'exhaustion', 'too much', 'pressure', 'peace', 'calm',
    'overworked', 'cant cope', "can't cope", 'breaking point', 'mental health',
    'balance', 'imbalance', 'workload', 'busy', 'hectic', 'chaotic',
    'drowning', 'suffocating', 'no time', 'juggling', 'stretched thin',
    'running on empty', 'tired', 'fatigue', 'worn out', 'drained',
    'तनाव', 'थकान', 'शांति', 'बहुत ज़्यादा', 'थका हुआ', 'आराम',
  ],
  laziness: [
    'lazy', 'laziness', 'procrastinate', 'procrastination', 'procrastinating',
    'unmotivated', 'motivation', 'stuck', 'inaction', 'delay', 'delaying',
    'putting off', 'cant start', "can't start", 'no energy', 'distracted',
    'wasting time', 'time waste', 'productive', 'productivity', 'focus',
    'discipline', 'undisciplined', 'slacking', 'idle', 'idling',
    'postpone', 'postponing', 'tomorrow', 'later', 'avoidance', 'avoiding',
    'आलस्य', 'टालमटोल', 'सुस्ती', 'प्रेरणा नहीं', 'काम नहीं', 'आलसी',
  ],
  jealousy: [
    'jealous', 'jealousy', 'envy', 'envious', 'comparison', 'comparing',
    'why not me', 'unfair', 'others have', 'resentment', 'resentful',
    'competitive', 'insecure', 'inadequate', 'bitter', 'covet',
    'green with envy', 'they have', 'i dont have', 'left behind',
    'everyone else is', 'social media', 'instagram', 'showing off',
    'ईर्ष्या', 'जलन', 'तुलना', 'क्यों मेरे साथ नहीं', 'दूसरों के पास',
  ],
  forgiveness: [
    'forgive', 'forgiveness', 'forgiving', 'grudge', 'grudges', 'resentment',
    'let go', 'letting go', 'anger', 'revenge', 'hurt', 'hurt me',
    'betrayed', 'betrayal', 'apologize', 'apology', 'sorry', 'regret',
    'mistake', 'wrong', 'wronged', 'hold on', 'bitterness', 'healing',
    'moving past', 'past', 'old wounds', 'cant forget',
    'क्षमा', 'माफ', 'माफी', 'बदला', 'गलती', 'भूलना',
  ],
  patience: [
    'patience', 'patient', 'impatient', 'impatience', 'waiting', 'wait',
    'perseverance', 'persist', 'persistence', 'endurance', 'endure',
    'tolerance', 'tolerate', 'bear', 'bearing', 'suffering', 'long time',
    'slow', 'slow progress', 'when will', 'how long', 'frustrating',
    'taking forever', 'no results', 'not working', 'keep going',
    'give up', 'quitting', 'persevere', 'hang in', 'stay strong',
    'धैर्य', 'सब्र', 'इंतज़ार', 'सहन', 'रुकना', 'हार मत मानो',
  ],
  loneliness: [
    'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'no one',
    'nobody', 'no friends', 'left out', 'excluded', 'abandoned',
    'disconnected', 'empty', 'solitude', 'misunderstood', 'outsider',
    'dont belong', "don't belong", 'no one understands', 'invisible',
    'ignored', 'neglected', 'unwanted', 'rejected', 'rejection',
    'अकेला', 'अकेलापन', 'कोई नहीं', 'अलग', 'तन्हा', 'तन्हाई',
  ],
  gratitude: [
    'grateful', 'gratitude', 'thankful', 'content', 'contentment',
    'satisfied', 'satisfaction', 'appreciate', 'appreciation', 'blessed',
    'counting blessings', 'happy with', 'enough', 'abundance',
    'positive', 'joy', 'fulfillment', 'fulfilled', 'peace', 'serene',
    'what i have', 'simple life', 'minimalism',
    'संतोष', 'कृतज्ञ', 'आभार', 'शुक्र', 'खुश', 'संतुष्ट',
  ],
  addiction: [
    'addiction', 'addicted', 'habit', 'habits', 'bad habit', 'bad habits',
    'craving', 'cravings', 'temptation', 'tempted', 'urge', 'urges',
    'compulsion', 'compulsive', 'obsession', 'substance', 'alcohol',
    'drinking', 'smoking', 'drugs', 'gambling', 'phone addiction',
    'social media', 'scrolling', 'binge', 'overeating', 'porn',
    'cant stop', "can't stop", 'willpower', 'self control', 'discipline',
    'relapse', 'recovery', 'withdraw', 'withdrawal',
    'लत', 'बुरी आदत', 'आदत', 'नशा', 'शराब', 'छोड़ना', 'रुक नहीं पाता',
  ],
  spiritual_growth: [
    'spiritual', 'spirituality', 'god', 'divine', 'meditation', 'meditate',
    'prayer', 'pray', 'soul', 'atman', 'enlightenment', 'moksha',
    'liberation', 'self realization', 'inner peace', 'consciousness',
    'awakening', 'yoga', 'dharma', 'karma', 'bhakti', 'devotion',
    'krishna', 'guru', 'teaching', 'wisdom', 'truth', 'seeking',
    'purpose of life', 'meaning of life', 'why are we here', 'higher self',
    'आध्यात्मिक', 'भगवान', 'ध्यान', 'प्रार्थना', 'आत्मा', 'मोक्ष',
    'कर्म', 'भक्ति', 'गुरु', 'ज्ञान',
  ],
};

// ═══════════════════════════════════════════════════════
// MATCHING ENGINE
// ═══════════════════════════════════════════════════════

export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\sऀ-ॿ'-]/g, '') // Keep English, Devanagari, apostrophes, hyphens
    .replace(/\s+/g, ' ');
}

export function matchByKeywords(query: string): MatchResult {
  const normalizedQuery = normalizeQuery(query);
  const verses = getAllVerses();
  const themes = getAllThemes();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return { themes: [], query, has_matches: false };
  }

  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
  const themeScores = new Map<string, number>();

  // ── Step 1: Score themes using synonym map ──
  Object.entries(THEME_SYNONYMS).forEach(([themeId, synonyms]) => {
    let score = 0;

    synonyms.forEach(synonym => {
      const normalizedSynonym = synonym.toLowerCase();

      // Exact phrase match in query (highest score)
      if (normalizedQuery.includes(normalizedSynonym)) {
        score += normalizedSynonym.split(/\s+/).length > 1 ? 10 : 5;
        return;
      }

      // Individual word matching
      const synonymWords = normalizedSynonym.split(/\s+/);
      synonymWords.forEach(synWord => {
        queryWords.forEach(qWord => {
          // Exact word match
          if (qWord === synWord) {
            score += 4;
          }
          // Word starts with synonym (e.g., "worrying" matches "worry")
          else if (qWord.startsWith(synWord) || synWord.startsWith(qWord)) {
            if (Math.min(qWord.length, synWord.length) >= 4) {
              score += 3;
            }
          }
          // Partial containment for longer words
          else if (qWord.length >= 5 && synWord.length >= 5) {
            if (qWord.includes(synWord) || synWord.includes(qWord)) {
              score += 2;
            }
          }
        });
      });
    });

    if (score > 0) {
      themeScores.set(themeId, score);
    }
  });

  // ── Step 2: Also score based on verse keywords ──
  verses.forEach(verse => {
    let verseScore = 0;

    // Check verse keywords
    const allKeywords = [
      ...(verse.keywords || []),
      ...(verse.keywords_hi || []),
    ];

    allKeywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      queryWords.forEach(qWord => {
        if (qWord === normalizedKeyword || normalizedQuery.includes(normalizedKeyword)) {
          verseScore += 2;
        } else if (qWord.length >= 4 && normalizedKeyword.length >= 4) {
          if (qWord.startsWith(normalizedKeyword) || normalizedKeyword.startsWith(qWord)) {
            verseScore += 1;
          }
        }
      });
    });

    // Check life_application and context for query words
    if (verse.life_application) {
      const appLower = verse.life_application.toLowerCase();
      queryWords.forEach(qWord => {
        if (qWord.length >= 4 && appLower.includes(qWord)) {
          verseScore += 1;
        }
      });
    }

    // Distribute score to verse's themes
    if (verseScore > 0) {
      verse.themes.forEach(themeId => {
        const current = themeScores.get(themeId) || 0;
        themeScores.set(themeId, current + verseScore);
      });
    }
  });

  // ── Step 3: Rank themes and get top matches ──
  const rankedThemes = Array.from(themeScores.entries())
    .filter(([, score]) => score >= 3) // Minimum threshold
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3 themes

  if (rankedThemes.length === 0) {
    return { themes: [], query, has_matches: false };
  }

  // ── Step 4: Get verses for matched themes and score them ──
  const resultThemes = rankedThemes.map(([themeId, themeScore]) => {
    const theme = themes.find(t => t.id === themeId)!;
    const themeVerses = verses.filter(v => v.themes.includes(themeId));

    // Score individual verses within the theme
    const scoredVerses: SearchResult[] = themeVerses.map(verse => {
      let relevance = 0;

      // Verse keyword matches
      const allKeywords = [...(verse.keywords || []), ...(verse.keywords_hi || [])];
      allKeywords.forEach(kw => {
        const kwLower = kw.toLowerCase();
        if (normalizedQuery.includes(kwLower)) relevance += 3;
        queryWords.forEach(qw => {
          if (qw === kwLower) relevance += 2;
          else if (qw.length >= 4 && kwLower.length >= 4 &&
                   (qw.startsWith(kwLower) || kwLower.startsWith(qw))) {
            relevance += 1;
          }
        });
      });

      // Life application relevance
      if (verse.life_application) {
        const appLower = verse.life_application.toLowerCase();
        queryWords.forEach(qw => {
          if (qw.length >= 4 && appLower.includes(qw)) relevance += 1;
        });
      }

      return {
        verse,
        relevance_score: relevance,
        matched_theme: theme,
      };
    });

    // Sort verses by relevance, show top 5
    scoredVerses.sort((a, b) => b.relevance_score - a.relevance_score);

    return {
      theme,
      verses: scoredVerses.slice(0, 5),
      total_score: themeScore,
    };
  });

  return {
    themes: resultThemes,
    query,
    has_matches: true,
  };
}

export function getBestMatch(query: string): BestMatch {
  const result = matchByKeywords(query);

  if (!result.has_matches || result.themes.length === 0) {
    return {
      verse: null as unknown as import('./types').Verse,
      theme: null as unknown as import('./types').Theme,
      score: 0,
      has_match: false,
      allVerses: [],
    };
  }

  const topTheme = result.themes[0];
  const bestVerse = topTheme.verses[0];

  // Collect all verses across all themes for "show another" feature
  const allVerses: SearchResult[] = [];
  result.themes.forEach((t) => {
    t.verses.forEach((v) => {
      if (!allVerses.find((av) => av.verse.id === v.verse.id)) {
        allVerses.push(v);
      }
    });
  });

  return {
    verse: bestVerse.verse,
    theme: topTheme.theme,
    score: topTheme.total_score,
    has_match: true,
    allVerses,
  };
}
