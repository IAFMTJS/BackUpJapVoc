import { DictionaryItem } from '../types';

// Types for answer validation
export interface AnswerValidationResult {
  isCorrect: boolean;
  accuracy: number;  // 0-1 score indicating how close the answer was
  feedback: string;
  matchedMeaning?: string;  // The meaning that matched
  suggestions?: string[];   // Suggested corrections if close but not exact
}

// Common variations and synonyms mapping
const COMMON_VARIATIONS: Record<string, string[]> = {
  'hello': ['hi', 'hey', 'greetings'],
  'goodbye': ['bye', 'see you', 'farewell'],
  'thank you': ['thanks', 'thank you very much', 'arigatou'],
  'sorry': ['excuse me', 'pardon', 'apologies'],
  'yes': ['yeah', 'sure', 'okay', 'ok'],
  'no': ['nope', 'nah', 'negative'],
  'please': ['kindly', 'if you would', 'if you please'],
  'good morning': ['morning', 'good day'],
  'good evening': ['evening'],
  'good night': ['night', 'sleep well'],
  'how are you': ['how do you do', 'how\'s it going', 'how are you doing'],
  'i understand': ['i see', 'got it', 'understood'],
  'i don\'t understand': ['i don\'t get it', 'i\'m not sure', 'i\'m confused'],
  'what is this': ['what\'s this', 'what is that', 'what\'s that'],
  'where is': ['where\'s', 'location of', 'place of'],
  'when is': ['when\'s', 'time of', 'date of'],
  'who is': ['who\'s', 'person of', 'identity of'],
  'why is': ['why\'s', 'reason for', 'cause of'],
  'how is': ['how\'s', 'method of', 'way of']
};

// Helper function to normalize text
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // Normalize spaces
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')  // Remove punctuation
    .replace(/\s{2,}/g, ' ');  // Remove extra spaces
};

// Helper function to calculate string similarity (Levenshtein distance)
const calculateSimilarity = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (track[str2.length][str1.length] / maxLength);
};

// Helper function to check for common variations
const checkVariations = (answer: string, correctAnswer: string): boolean => {
  const normalizedAnswer = normalizeText(answer);
  const normalizedCorrect = normalizeText(correctAnswer);

  // Check exact match first
  if (normalizedAnswer === normalizedCorrect) return true;

  // Check common variations
  const variations = COMMON_VARIATIONS[normalizedCorrect] || [];
  return variations.some(variation => normalizeText(variation) === normalizedAnswer);
};

// Main validation function
export const validateAnswer = (
  userAnswer: string,
  word: DictionaryItem,
  options: {
    allowRomaji?: boolean;
    allowPartialMatch?: boolean;
    minSimilarity?: number;
  } = {}
): AnswerValidationResult => {
  const {
    allowRomaji = true,
    allowPartialMatch = true,
    minSimilarity = 0.8
  } = options;

  const normalizedAnswer = normalizeText(userAnswer);
  let bestMatch: { meaning: string; similarity: number } | null = null;
  let suggestions: string[] = [];

  // Check each meaning
  for (const meaning of word.meanings || []) {
    const normalizedMeaning = normalizeText(meaning);
    
    // Check exact match
    if (normalizedAnswer === normalizedMeaning) {
      return {
        isCorrect: true,
        accuracy: 1,
        feedback: 'Perfect!',
        matchedMeaning: meaning
      };
    }

    // Check variations
    if (checkVariations(normalizedAnswer, normalizedMeaning)) {
      return {
        isCorrect: true,
        accuracy: 0.9,
        feedback: 'Correct! (with common variation)',
        matchedMeaning: meaning
      };
    }

    // Check romaji if enabled
    if (allowRomaji && word.romaji) {
      const normalizedRomaji = normalizeText(word.romaji);
      if (normalizedAnswer === normalizedRomaji) {
        return {
          isCorrect: true,
          accuracy: 0.9,
          feedback: 'Correct! (romaji)',
          matchedMeaning: meaning
        };
      }
    }

    // Calculate similarity for partial matching
    if (allowPartialMatch) {
      const similarity = calculateSimilarity(normalizedAnswer, normalizedMeaning);
      if (similarity > (bestMatch?.similarity || 0)) {
        bestMatch = { meaning, similarity };
      }
    }
  }

  // Handle partial match if enabled and we found a close match
  if (allowPartialMatch && bestMatch && bestMatch.similarity >= minSimilarity) {
    // Generate suggestions for close matches
    if (bestMatch.similarity >= 0.7 && bestMatch.similarity < 0.9) {
      suggestions = [
        bestMatch.meaning,
        ...(word.meanings || []).filter(m => m !== bestMatch?.meaning).slice(0, 2)
      ];
    }

    return {
      isCorrect: bestMatch.similarity >= 0.9,
      accuracy: bestMatch.similarity,
      feedback: bestMatch.similarity >= 0.9 
        ? 'Close enough!'
        : 'Almost correct, but not quite.',
      matchedMeaning: bestMatch.meaning,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  // No match found
  return {
    isCorrect: false,
    accuracy: 0,
    feedback: 'Incorrect. Please try again.',
    suggestions: word.meanings?.slice(0, 2)
  };
};

// Helper function to get feedback based on accuracy
export const getAccuracyFeedback = (accuracy: number): string => {
  if (accuracy >= 0.95) return 'Excellent!';
  if (accuracy >= 0.9) return 'Very good!';
  if (accuracy >= 0.8) return 'Good!';
  if (accuracy >= 0.7) return 'Close!';
  if (accuracy >= 0.5) return 'Getting there!';
  return 'Try again!';
}; 