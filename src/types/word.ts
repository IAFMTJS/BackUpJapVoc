export interface Example {
  japanese: string;
  english: string;
  romaji: string;
}

export interface Word {
  japanese: string;
  english: string;
  romaji: string;
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'particle' | 'conjunction' | 'interjection';
  examples: Example[];
} 