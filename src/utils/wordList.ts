import { Word } from '../types/word';

// Basic word list for testing
const basicWords: Word[] = [
  {
    japanese: '私',
    english: 'I, me',
    romaji: 'watashi',
    type: 'pronoun',
    examples: [
      {
        japanese: '私は学生です。',
        english: 'I am a student.',
        romaji: 'Watashi wa gakusei desu.'
      }
    ]
  },
  {
    japanese: 'あなた',
    english: 'you',
    romaji: 'anata',
    type: 'pronoun',
    examples: [
      {
        japanese: 'あなたは先生ですか？',
        english: 'Are you a teacher?',
        romaji: 'Anata wa sensei desu ka?'
      }
    ]
  },
  {
    japanese: '本',
    english: 'book',
    romaji: 'hon',
    type: 'noun',
    examples: [
      {
        japanese: 'この本は面白いです。',
        english: 'This book is interesting.',
        romaji: 'Kono hon wa omoshiroi desu.'
      }
    ]
  },
  {
    japanese: '水',
    english: 'water',
    romaji: 'mizu',
    type: 'noun',
    examples: [
      {
        japanese: '水を飲みます。',
        english: 'I drink water.',
        romaji: 'Mizu wo nomimasu.'
      }
    ]
  },
  {
    japanese: '食べる',
    english: 'to eat',
    romaji: 'taberu',
    type: 'verb',
    examples: [
      {
        japanese: 'ご飯を食べます。',
        english: 'I eat rice.',
        romaji: 'Gohan wo tabemasu.'
      }
    ]
  },
  {
    japanese: '飲む',
    english: 'to drink',
    romaji: 'nomu',
    type: 'verb',
    examples: [
      {
        japanese: 'お茶を飲みます。',
        english: 'I drink tea.',
        romaji: 'Ocha wo nomimasu.'
      }
    ]
  },
  {
    japanese: '大きい',
    english: 'big, large',
    romaji: 'ookii',
    type: 'adjective',
    examples: [
      {
        japanese: 'この家は大きいです。',
        english: 'This house is big.',
        romaji: 'Kono ie wa ookii desu.'
      }
    ]
  },
  {
    japanese: '小さい',
    english: 'small, little',
    romaji: 'chiisai',
    type: 'adjective',
    examples: [
      {
        japanese: 'この猫は小さいです。',
        english: 'This cat is small.',
        romaji: 'Kono neko wa chiisai desu.'
      }
    ]
  }
];

/**
 * Get the list of words for the quiz
 * @returns Array of words
 */
export const getWordList = (): Word[] => {
  // In the future, this could load from a database or API
  return basicWords;
}; 