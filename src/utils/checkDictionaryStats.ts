import { getDictionaryStats } from './dictionaryStats';

export async function logDictionaryStats() {
  try {
    const stats = await getDictionaryStats();
    
    console.log('\n=== Dictionary Statistics ===');
    console.log(`Total Words: ${stats.totalWords}`);
    
    console.log('\nWords by Category:');
    Object.entries(stats.categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} words`);
      });
    
    console.log('\nWords by Level:');
    Object.entries(stats.levels)
      .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
      .forEach(([level, count]) => {
        console.log(`  ${level}: ${count} words`);
      });
    
    console.log('\nWords by JLPT Level:');
    Object.entries(stats.jlptLevels)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([level, count]) => {
        console.log(`  ${level}: ${count} words`);
      });
    
    console.log('\n===========================\n');
  } catch (error) {
    console.error('Failed to get dictionary stats:', error);
  }
} 