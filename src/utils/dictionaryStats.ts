import { openDB } from 'idb';

export interface DictionaryStats {
  totalWords: number;
  japaneseWords: number;
  englishWords: number;
  categories: { [key: string]: number };
  levels: { [key: string]: number };
  jlptLevels: { [key: string]: number };
}

export async function getDictionaryStats(): Promise<DictionaryStats> {
  try {
    const db = await openDB("DictionaryDB", 2);
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    
    const allWords = await store.getAll();
    
    const stats: DictionaryStats = {
      totalWords: allWords.length,
      japaneseWords: 0,
      englishWords: 0,
      categories: {},
      levels: {},
      jlptLevels: {}
    };

    // Count words by category, level, and JLPT level
    allWords.forEach(word => {
      // Count Japanese and English words
      if (word.japanese && word.japanese.trim() !== '') {
        stats.japaneseWords++;
      }
      if (word.english && word.english.trim() !== '') {
        stats.englishWords++;
      }
      
      // Count by category (handle undefined/null categories)
      const category = word.category || 'Uncategorized';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
      
      // Count by level (handle undefined/null levels)
      const level = word.level || 0;
      stats.levels[`Level ${level}`] = (stats.levels[`Level ${level}`] || 0) + 1;
      
      // Count by JLPT level (handle undefined/null JLPT levels)
      const jlptLevel = word.jlptLevel || 'Not Specified';
      stats.jlptLevels[jlptLevel] = (stats.jlptLevels[jlptLevel] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('[Dictionary] Error getting dictionary stats:', error);
    throw error;
  }
} 