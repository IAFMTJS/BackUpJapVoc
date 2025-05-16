// This script now uses the shared level logic from src/data/levelRules.ts
// Do not duplicate level rules here—always update src/data/levelRules.ts if changes are needed.

const fs = require('fs');
const path = require('path');
const tsNode = require('ts-node');
tsNode.register();

// Import shared level logic
const { levelDistribution, wordBelongsInLevel } = require('../src/data/levelRules.ts');

// Read the processed words
const processedWordsPath = path.join(__dirname, '../src/data/processed_words.json');
const words = JSON.parse(fs.readFileSync(processedWordsPath, 'utf8'));

// Distribute words to levels
const wordsByLevel = {};
for (let level = 1; level <= 10; level++) {
  wordsByLevel[level] = [];
}

// First pass: distribute words based on shared logic
words.forEach(word => {
  for (let level = 1; level <= 10; level++) {
    if (wordBelongsInLevel(word, level)) {
      wordsByLevel[level].push(word);
      break;
    }
  }
});

// (Optional) Second pass: fill remaining slots if needed, using the same logic
// ...

// Update the word levels file as before
const wordLevelsPath = path.join(__dirname, '../src/data/wordLevels.ts');
let wordLevelsContent = fs.readFileSync(wordLevelsPath, 'utf8');

Object.entries(wordsByLevel).forEach(([level, words]) => {
  const wordsArray = JSON.stringify(words, null, 2)
    .split('\n')
    .map(line => '    ' + line)
    .join('\n');
  const regex = new RegExp(`level: ${level},[^}]*words: \\[\\]`, 'g');
  wordLevelsContent = wordLevelsContent.replace(
    regex,
    `level: ${level},\n    requiredScore: ${level === 1 ? 0 : 80},\n    description: "${levelDistribution[level].description}",\n    unlocked: ${level === 1},\n    words: [\n${wordsArray}\n    ]`
  );
});

fs.writeFileSync(wordLevelsPath, wordLevelsContent, 'utf8');

console.log('Distributed words across levels successfully.'); 