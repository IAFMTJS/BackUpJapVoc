// Centralized level rules for Japanese vocabulary levels
// This module should be imported by all scripts and wordLevels.ts

import { JapaneseWord } from './types';

export const levelDistribution: { [level: number]: {
  categories: string[];
  jlptLevels: string[];
  description: string;
} } = {
  1: {
    categories: ['greeting', 'number', 'pronoun', 'question', 'hiragana', 'katakana'],
    jlptLevels: ['N5'],
    description: 'Essential Survival Japanese - Basic greetings, numbers, and everyday expressions',
  },
  2: {
    categories: ['verb', 'adjective', 'adverb', 'particle'],
    jlptLevels: ['N5', 'N4'],
    description: 'Basic Communication - Common verbs, adjectives, and simple sentence patterns',
  },
  3: {
    categories: ['time', 'food', 'drink', 'transportation', 'shopping'],
    jlptLevels: ['N5', 'N4'],
    description: 'Daily Life Basics - Food, shopping, transportation, and time expressions',
  },
  4: {
    categories: ['family', 'emotion', 'body', 'health', 'housing'],
    jlptLevels: ['N4', 'N3'],
    description: 'Social Interactions - Family, relationships, and polite expressions',
  },
  5: {
    categories: ['work', 'education', 'hobby', 'travel', 'money'],
    jlptLevels: ['N3'],
    description: 'Practical Japanese - Work, school, and common situations',
  },
  6: {
    categories: ['verb', 'adjective', 'adverb', 'conjunction'],
    jlptLevels: ['N3', 'N2'],
    description: 'Intermediate Communication - Complex verbs, compound expressions',
  },
  7: {
    categories: ['idiom', 'proverb', 'onomatopoeia'],
    jlptLevels: ['N2'],
    description: 'Cultural Context - Idioms, proverbs, and cultural references',
  },
  8: {
    categories: ['technology', 'business', 'academic'],
    jlptLevels: ['N2', 'N1'],
    description: 'Advanced Topics - Business, technology, and specialized vocabulary',
  },
  9: {
    categories: ['literature', 'formal', 'advanced'],
    jlptLevels: ['N1'],
    description: 'Academic Japanese - Formal writing, literature, and complex grammar',
  },
  10: {
    categories: ['slang', 'colloquial', 'nuanced'],
    jlptLevels: ['N1'],
    description: 'Mastery Level - Native-level expressions and nuanced vocabulary',
  },
};

export function wordBelongsInLevel(word: JapaneseWord, level: number): boolean {
  const rules = levelDistribution[level];
  return rules.categories.includes(word.category);
} 