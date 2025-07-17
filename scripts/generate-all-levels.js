// Node.js script om 40 levels te genereren voor Japans leren
const fs = require('fs');

const categories = [
  { name: 'kana', label: 'Hiragana', count: 10 },
  { name: 'katakana', label: 'Katakana', count: 10 },
  { name: 'vocab', label: 'Vocabulary', count: 10 },
  { name: 'kanji', label: 'Kanji', count: 5 },
  { name: 'grammar', label: 'Grammar', count: 5 },
];

let id = 1;
const levels = [];

categories.forEach(cat => {
  for (let i = 1; i <= cat.count; i++) {
    const levelId = id;
    const nextUnlocks = id < 40 ? [id + 1] : [];
    const title = `${cat.label} ${i}`;
    const description = `Learn ${cat.label.toLowerCase()} part ${i} with basic practice.`;
    const estimatedTime = '5 min';
    const minScore = 80;
    const exercises = [
      {
        title: `${cat.label} Recognition`,
        instruction: `Select the correct ${cat.label.toLowerCase()} for each question.`,
        exerciseType: "multipleChoice",
        pointsPerItem: 1,
        items: [
          { question: `Which one is '${cat.label[0]}${i}'?`, options: [cat.label[0]+i, cat.label[0]+(i+1), cat.label[0]+(i+2)], answer: cat.label[0]+i },
          { question: `Which one is '${cat.label[0]}${i+1}'?`, options: [cat.label[0]+(i+1), cat.label[0]+i, cat.label[0]+(i+2)], answer: cat.label[0]+(i+1) },
        ]
      },
      {
        title: `${cat.label} Typing`,
        instruction: `Type the correct ${cat.label.toLowerCase()} for each prompt.`,
        exerciseType: "typeAnswer",
        pointsPerItem: 2,
        items: [
          { question: `Type '${cat.label[0]}${i}'`, answer: cat.label[0]+i },
          { question: `Type '${cat.label[0]}${i+1}'`, answer: cat.label[0]+(i+1) },
        ]
      }
    ];
    levels.push({
      id: levelId,
      title,
      description,
      category: cat.name,
      estimatedTime,
      minScore,
      nextUnlocks,
      exercises
    });
    id++;
  }
});

const output = 'export const levels = ' + JSON.stringify(levels, null, 2) + ';\n';
fs.writeFileSync('levels.generated.ts', output);
console.log('levels.generated.ts aangemaakt!'); 