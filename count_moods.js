const fs = require('fs');

// Count hardcoded mood words
const hardcodedCount = 10; // From the grep search results

// Count JSON mood words
const jsonData = JSON.parse(fs.readFileSync('./public/data/mood_words.json', 'utf8'));
const jsonCount = jsonData.length;

// Count categories in JSON
const categories = {};
jsonData.forEach(word => {
  const cat = word.category;
  categories[cat] = (categories[cat] || 0) + 1;
});

console.log('=== MOOD WORDS STATISTICS ===');
console.log(`Hardcoded mood words: ${hardcodedCount}`);
console.log(`JSON mood words: ${jsonCount}`);
console.log(`Total mood words: ${hardcodedCount + jsonCount}`);
console.log(`\nJSON Categories found: ${Object.keys(categories).length}`);
console.log('\nCategory breakdown:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} words`);
});

console.log('\nTotal categories available: 20');
console.log('Categories: happiness, sadness, anger, love, fear, surprise, disgust, neutral, gratitude, empathy, respect, determination, romantic, angry, annoyed, empathetic, motivational, playful, positive, indifferent'); 