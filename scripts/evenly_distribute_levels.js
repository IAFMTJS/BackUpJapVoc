const fs = require('fs');
const path = require('path');

const processedWordsPath = path.join(__dirname, '../src/data/processed_words.json');
const wordLevelsPath = (() => {
  try { return require.resolve('../src/data/wordLevels'); } catch (e) { return '../src/data/wordLevels'; }
})();

// Read the current processed words (from processed_words.json)
const words = JSON.parse(fs.readFileSync(processedWordsPath, 'utf8'));

// Read the level words (from the LEVEL page) from wordLevels.ts (using require)
const { wordLevels } = require(wordLevelsPath);

// Assign levels to words in processed_words.json so that each word's level (in processed_words) is the same as its level on the LEVEL page.
// (We do this by matching the "japanese" property.)
for (let i = 0; i < words.length; i++) {
  const word = words[i];
  const levelWord = wordLevels.find(level => level.words.some(w => w.japanese === word.japanese));
  if (levelWord) {
    word.level = levelWord.level;
  } else {
    // (If no matching level is found, assign a fallback level (e.g. 1) or leave as is.)
    word.level = word.level || 1;
  }
}

// Write the updated words (with levels matching the LEVEL page) back to processed_words.json.
fs.writeFileSync(processedWordsPath, JSON.stringify(words, null, 2), 'utf8');
console.log("Updated processed_words.json so that levels match the LEVEL page."); 