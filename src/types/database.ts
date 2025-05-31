import { DBSchema } from 'idb';
import { DictionaryItem } from './dictionary';

// Define all database schemas
export interface JapVocDB extends DBSchema {
  words: {
    key: string;
    value: DictionaryItem;
    indexes: {
      'by-japanese': string;
      'by-english': string;
      'by-romaji': string;
      'by-level': number;
      'by-category': string;
      'by-jlpt': string;
      'by-frequency': number;
      'by-mastery': number;
      'by-last-viewed': Date;
      'by-emotional-context': string;
    };
  };
  // ... rest of the schema definitions
}

export type StoreName = keyof JapVocDB; 