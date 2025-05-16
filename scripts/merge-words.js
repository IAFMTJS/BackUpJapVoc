const fs = require('fs');
const path = require('path');

const commonWordsPath = path.join(__dirname, '../src/data/common-words.json');
const processedWordsPath = path.join(__dirname, '../src/data/processed_words.json');

const commonWords = require(commonWordsPath);
const processedWords = require(processedWordsPath);

// Build a set of existing Japanese words (kanji if present, else hiragana)
const existingWords = new Set(
  commonWords.map(w => (w.kanji && w.kanji.trim() !== '' ? w.kanji : w.hiragana || w.kana))
);

let nextId = 1;
while (commonWords.find(w => w.id === `pw-${nextId}`)) nextId++;

const merged = [...commonWords];

for (const word of processedWords) {
  const key = word.kanji && word.kanji.trim() !== '' ? word.kanji : word.kana;
  if (existingWords.has(key)) continue; // skip duplicates

  merged.push({
    id: `pw-${nextId++}`,
    japanese: word.kanji && word.kanji.trim() !== '' ? word.kanji : word.kana,
    hiragana: word.kana,
    kanji: word.kanji || '',
    romaji: word.romaji || '',
    english: word.english || '',
    level: word.level || '',
    category: word.category || '',
    jlpt: '',
    examples: [],
    sheet: word.sheet || ''
  });
  existingWords.add(key);
}

fs.writeFileSync(commonWordsPath, JSON.stringify(merged, null, 2));
console.log(`Merged ${merged.length} words into common-words.json!`); 