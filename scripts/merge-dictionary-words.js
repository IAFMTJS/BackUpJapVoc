const fs = require('fs');
const path = require('path');

// File paths
const commonWordsPath = path.join(__dirname, '../public/data/common-words.json');
const processedWordsPath = path.join(__dirname, '../public/data/processed_words.json');
const outputPath = path.join(__dirname, '../public/data/dictionary_words.json');

// Read the word files
const commonWords = require(commonWordsPath);
const processedWords = require(processedWordsPath);

// Create a Set to track unique Japanese words (using kanji if available, else hiragana)
const uniqueWords = new Set();

// Function to generate a unique ID
let nextId = 1;
function generateId() {
  return `dict-${nextId++}`;
}

// Function to standardize word format
function standardizeWord(word, source) {
  // Determine the Japanese text (prefer kanji if available)
  const japanese = word.kanji || word.japanese || word.kana;
  const hiragana = word.hiragana || word.kana;
  
  // Skip if we've already processed this word
  const key = word.kanji || word.kana;
  if (uniqueWords.has(key)) {
    return null;
  }
  uniqueWords.add(key);

  // Create standardized word object
  return {
    id: generateId(),
    japanese: japanese,
    english: word.english,
    hiragana: hiragana,
    kanji: word.kanji || (word.japanese && word.japanese !== hiragana ? word.japanese : ''),
    romaji: word.romaji,
    level: word.level || 1,
    category: word.category || 'noun',
    jlptLevel: word.jlpt || word.jlptLevel || 'N5',
    examples: word.examples || [],
    notes: word.notes || ''
  };
}

// Process and merge words
console.log('Processing words...');
const mergedWords = [];

// Process common words first (they have more complete data)
commonWords.forEach(word => {
  const standardized = standardizeWord(word, 'common');
  if (standardized) {
    mergedWords.push(standardized);
  }
});

// Process additional words
processedWords.forEach(word => {
  const standardized = standardizeWord(word, 'processed');
  if (standardized) {
    mergedWords.push(standardized);
  }
});

// Sort words by level and then by Japanese text
mergedWords.sort((a, b) => {
  if (a.level !== b.level) {
    return a.level - b.level;
  }
  return a.japanese.localeCompare(b.japanese);
});

// Write the merged file
console.log(`Writing ${mergedWords.length} words to dictionary_words.json...`);
fs.writeFileSync(outputPath, JSON.stringify(mergedWords, null, 2));

console.log('Done!');
console.log(`Total unique words: ${mergedWords.length}`);
console.log(`Output file: ${outputPath}`); 