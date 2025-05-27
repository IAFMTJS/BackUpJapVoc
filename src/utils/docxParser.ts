import mammoth from 'mammoth';
import { ImportedWord } from './importNewWords';
import { EmotionalCategory, EmotionalContext } from '../types/dictionary';

// Regular expressions to match different word formats
const WORD_PATTERNS = [
  // Pattern: 日本語 (romaji) - English
  /([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)\s*\(([a-zA-Z\s'-]+)\)\s*-\s*([^\n]+)/g,
  
  // Pattern: 日本語 - romaji - English
  /([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)\s*-\s*([a-zA-Z\s'-]+)\s*-\s*([^\n]+)/g,
  
  // Pattern: 日本語 (romaji) English
  /([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)\s*\(([a-zA-Z\s'-]+)\)\s*([^\n]+)/g
];

// Emotional context detection patterns
const EMOTIONAL_PATTERNS: Record<EmotionalCategory, RegExp[]> = {
  flirting: [
    /flirt/i, /romantic/i, /love/i, /kiss/i, /date/i, /sweet/i, /cute/i, /attractive/i,
    /beautiful/i, /handsome/i, /charming/i, /seductive/i, /passionate/i,
    /好き/i, /愛/i, /恋/i, /デート/i, /可愛い/i, /美しい/i, /魅力的/i
  ],
  anger: [
    /angry/i, /mad/i, /furious/i, /rage/i, /irritated/i, /annoyed/i, /upset/i,
    /frustrated/i, /hate/i, /disgusted/i, /outraged/i,
    /怒/i, /腹立/i, /激怒/i, /憤/i, /嫌/i, /憎/i
  ],
  love: [
    /love/i, /adore/i, /cherish/i, /affection/i, /fond/i, /devotion/i, /passion/i,
    /heart/i, /soul/i, /romance/i,
    /愛/i, /大好き/i, /恋/i, /愛情/i, /心/i, /魂/i
  ],
  happiness: [
    /happy/i, /joy/i, /delight/i, /pleased/i, /glad/i, /cheerful/i, /excited/i,
    /thrilled/i, /wonderful/i, /amazing/i, /great/i,
    /嬉/i, /楽/i, /幸/i, /喜/i, /笑/i, /明るい/i
  ],
  sadness: [
    /sad/i, /unhappy/i, /depressed/i, /gloomy/i, /miserable/i, /heartbroken/i,
    /disappointed/i, /regret/i, /sorry/i, /tear/i,
    /悲/i, /寂/i, /辛/i, /苦/i, /涙/i, /後悔/i
  ],
  surprise: [
    /surprise/i, /shock/i, /amaze/i, /astonish/i, /unexpected/i, /sudden/i,
    /wow/i, /incredible/i, /unbelievable/i,
    /驚/i, /意外/i, /突然/i, /びっくり/i, /信じられない/i
  ],
  fear: [
    /fear/i, /afraid/i, /scared/i, /terrified/i, /anxious/i, /worried/i,
    /nervous/i, /frightened/i, /horror/i, /panic/i,
    /怖/i, /恐/i, /不安/i, /心配/i, /緊張/i, /恐怖/i
  ],
  disgust: [
    /disgust/i, /gross/i, /nasty/i, /repulsive/i, /revolting/i, /vile/i,
    /horrible/i, /awful/i, /terrible/i,
    /嫌/i, /汚/i, /臭/i, /不快/i, /気持ち悪い/i
  ],
  respect: [
    /respect/i, /honor/i, /revere/i, /admire/i, /esteem/i, /dignity/i,
    /尊敬/i, /敬意/i, /尊/i, /敬/i, /誇り/i
  ],
  shame: [
    /shame/i, /ashamed/i, /embarrassed/i, /humiliated/i, /guilty/i,
    /恥/i, /恥ずかしい/i, /申し訳ない/i, /後ろめたい/i
  ],
  gratitude: [
    /gratitude/i, /thankful/i, /appreciate/i, /grateful/i, /thanks/i,
    /感謝/i, /ありがとう/i, /お礼/i, /謝意/i
  ],
  pride: [
    /pride/i, /proud/i, /dignity/i, /self-respect/i, /confidence/i,
    /誇り/i, /自慢/i, /自信/i, /自尊心/i
  ],
  embarrassment: [
    /embarrassed/i, /awkward/i, /uncomfortable/i, /shy/i, /bashful/i,
    /恥ずかしい/i, /照れ/i, /気まずい/i, /照れる/i
  ],
  excitement: [
    /excited/i, /thrilled/i, /enthusiastic/i, /eager/i, /passionate/i,
    /興奮/i, /ワクワク/i, /熱中/i, /情熱/i
  ],
  loneliness: [
    /lonely/i, /alone/i, /isolated/i, /solitary/i, /lonesome/i,
    /寂しい/i, /孤独/i, /一人/i, /独り/i
  ],
  nostalgia: [
    /nostalgic/i, /memories/i, /remember/i, /reminisce/i, /miss/i,
    /懐かしい/i, /思い出/i, /追憶/i, /郷愁/i
  ],
  determination: [
    /determined/i, /resolute/i, /committed/i, /dedicated/i, /persistent/i,
    /決意/i, /覚悟/i, /意欲/i, /頑張/i
  ],
  relief: [
    /relief/i, /relieved/i, /relaxed/i, /calm/i, /peaceful/i,
    /安心/i, /安堵/i, /落ち着/i, /平和/i
  ],
  neutral: [
    /neutral/i, /normal/i, /regular/i, /usual/i, /common/i, /standard/i,
    /typical/i, /ordinary/i,
    /普通/i, /通常/i, /一般的/i, /平凡/i
  ]
};

// Emotional category emoji mapping
const EMOTIONAL_EMOJIS: Record<EmotionalCategory, string> = {
  flirting: '😘',
  anger: '😠',
  love: '❤️',
  happiness: '😊',
  sadness: '😢',
  surprise: '😲',
  fear: '😨',
  disgust: '🤢',
  respect: '🙏',
  shame: '😳',
  gratitude: '🙇‍♂️',
  pride: '💪',
  embarrassment: '😳',
  excitement: '🤩',
  loneliness: '😔',
  nostalgia: '🥺',
  determination: '💪',
  relief: '😌',
  neutral: '😐'
};

// Emotional category color mapping
const EMOTIONAL_COLORS: Record<EmotionalCategory, string> = {
  flirting: '#ff69b4', // Hot pink
  anger: '#ff4444',    // Red
  love: '#ff1493',     // Deep pink
  happiness: '#ffd700', // Gold
  sadness: '#4169e1',  // Royal blue
  surprise: '#ffa500', // Orange
  fear: '#800080',     // Purple
  disgust: '#556b2f',  // Dark olive green
  respect: '#9370db',  // Medium purple
  shame: '#ff69b4',    // Hot pink
  gratitude: '#32cd32', // Lime green
  pride: '#ff4500',    // Orange red
  embarrassment: '#ff69b4', // Hot pink
  excitement: '#ff8c00', // Dark orange
  loneliness: '#4682b4', // Steel blue
  nostalgia: '#daa520', // Goldenrod
  determination: '#b22222', // Firebrick
  relief: '#98fb98',   // Pale green
  neutral: '#808080'   // Gray
};

function detectEmotionalContext(english: string): EmotionalContext | undefined {
  const matches: Record<EmotionalCategory, number> = {
    flirting: 0,
    anger: 0,
    love: 0,
    happiness: 0,
    sadness: 0,
    surprise: 0,
    fear: 0,
    disgust: 0,
    respect: 0,
    shame: 0,
    gratitude: 0,
    pride: 0,
    embarrassment: 0,
    excitement: 0,
    loneliness: 0,
    nostalgia: 0,
    determination: 0,
    relief: 0,
    neutral: 0
  };

  // Count matches for each emotional category
  Object.entries(EMOTIONAL_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(english)) {
        matches[category as EmotionalCategory]++;
      }
    });
  });

  // Find the category with the most matches
  let maxCategory: EmotionalCategory = 'neutral';
  let maxMatches = 0;

  Object.entries(matches).forEach(([category, count]) => {
    if (count > maxMatches) {
      maxMatches = count;
      maxCategory = category as EmotionalCategory;
    }
  });

  // Only return emotional context if we found significant matches
  if (maxMatches > 0) {
    // Calculate intensity based on number of matches and word length (1-5 scale)
    const baseIntensity = Math.min(5, Math.max(1, Math.ceil(maxMatches / 2)));
    const wordLength = english.split(/\s+/).length;
    const intensity = Math.min(5, Math.max(1, baseIntensity + Math.floor(wordLength / 5)));

    // Find related emotions (categories with at least half the matches of the main category)
    const relatedEmotions = Object.entries(matches)
      .filter(([category, count]) => 
        count >= maxMatches / 2 && category !== maxCategory
      )
      .map(([category]) => category as EmotionalCategory);

    // Extract Japanese-specific usage notes
    const usageNotes = extractUsageNotes(english);
    const japaneseNotes = extractJapaneseNotes(english);

    return {
      category: maxCategory,
      intensity,
      emoji: EMOTIONAL_EMOJIS[maxCategory],
      relatedEmotions: relatedEmotions.length > 0 ? relatedEmotions : undefined,
      usageNotes: japaneseNotes || usageNotes
    };
  }

  return undefined;
}

function extractUsageNotes(english: string): string | undefined {
  // Look for usage notes in parentheses or after a dash
  const usageMatch = english.match(/[-(]([^)]+)\)|\s*-\s*([^-]+)$/);
  if (usageMatch) {
    return usageMatch[1] || usageMatch[2];
  }
  return undefined;
}

function extractJapaneseNotes(english: string): string | undefined {
  // Look for Japanese usage notes in parentheses or brackets
  const japaneseMatch = english.match(/[（(]([^）)]+)[）)]|\s*[［\[]([^］\]]+)[］\]]/);
  if (japaneseMatch) {
    return japaneseMatch[1] || japaneseMatch[2];
  }
  return undefined;
}

export async function parseDocxContent(file: File): Promise<ImportedWord[]> {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert docx to HTML using mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Extract words using different patterns
    const words: ImportedWord[] = [];
    const seenWords = new Set<string>();

    for (const pattern of WORD_PATTERNS) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const [, japanese, romaji, english] = match;
        
        // Skip if we've already seen this word
        const wordKey = `${japanese}-${romaji}-${english}`.toLowerCase();
        if (seenWords.has(wordKey)) continue;
        seenWords.add(wordKey);

        // Clean up the extracted text
        const cleanJapanese = japanese.trim();
        const cleanRomaji = romaji.trim();
        const cleanEnglish = english.trim()
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

        // Only add if we have all required fields
        if (cleanJapanese && cleanRomaji && cleanEnglish) {
          // Detect emotional context
          const emotionalContext = detectEmotionalContext(cleanEnglish);

          words.push({
            japanese: cleanJapanese,
            romaji: cleanRomaji,
            english: cleanEnglish,
            emotionalContext
          });
        }
      }
    }

    // Sort words by Japanese text
    words.sort((a, b) => a.japanese.localeCompare(b.japanese, 'ja'));

    return words;
  } catch (error) {
    console.error('Error parsing docx file:', error);
    throw new Error('Failed to parse docx file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Helper function to validate the parsed words
export function validateParsedWords(words: ImportedWord[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenJapanese = new Set<string>();
  const seenRomaji = new Set<string>();

  words.forEach((word, index) => {
    // Check for required fields
    if (!word.japanese) {
      errors.push(`Word at index ${index} is missing Japanese text`);
    }
    if (!word.romaji) {
      errors.push(`Word at index ${index} is missing romaji`);
    }
    if (!word.english) {
      errors.push(`Word at index ${index} is missing English translation`);
    }

    // Check for duplicates
    if (word.japanese && seenJapanese.has(word.japanese)) {
      errors.push(`Duplicate Japanese word found: ${word.japanese}`);
    }
    if (word.romaji && seenRomaji.has(word.romaji)) {
      errors.push(`Duplicate romaji found: ${word.romaji}`);
    }

    // Add to seen sets
    if (word.japanese) seenJapanese.add(word.japanese);
    if (word.romaji) seenRomaji.add(word.romaji);

    // Validate Japanese text (should only contain Japanese characters)
    if (word.japanese && !/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s]+$/.test(word.japanese)) {
      errors.push(`Word at index ${index} contains invalid Japanese characters: ${word.japanese}`);
    }

    // Validate romaji (should only contain Latin characters, spaces, and hyphens)
    if (word.romaji && !/^[a-zA-Z\s'-]+$/.test(word.romaji)) {
      errors.push(`Word at index ${index} contains invalid romaji characters: ${word.romaji}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
} 