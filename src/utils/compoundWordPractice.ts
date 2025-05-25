import { CompoundWordData, KanjiStrokeData } from '../types/stroke';

// Difficulty levels for compound words
export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4
};

// Generate practice sets based on user's progress
export const generatePracticeSets = (
  kanjiData: KanjiStrokeData[],
  userProgress: { [kanji: string]: number },
  difficulty: number = DIFFICULTY_LEVELS.INTERMEDIATE
): CompoundWordData[] => {
  // Filter kanji based on user's progress
  const availableKanji = kanjiData.filter(k => 
    userProgress[k.character] >= difficulty - 1
  );

  // Generate compound words from available kanji
  const compoundWords: CompoundWordData[] = [];
  
  // Add words that use only the available kanji
  kanjiData.forEach(kanji => {
    kanji.compoundWords.forEach(word => {
      if (word.kanji.every(k => availableKanji.some(ak => ak.character === k))) {
        compoundWords.push(word);
      }
    });
  });

  // Sort by difficulty and filter out words that are too easy or too hard
  return compoundWords
    .filter(word => word.difficulty >= difficulty - 0.5 && word.difficulty <= difficulty + 0.5)
    .sort((a, b) => a.difficulty - b.difficulty);
};

// Generate practice exercises for a compound word
export const generateWordExercises = (
  word: CompoundWordData,
  kanjiData: KanjiStrokeData[]
): {
  type: 'reading' | 'meaning' | 'writing' | 'usage';
  question: string;
  answer: string;
  options?: string[];
  hints?: string[];
}[] => {
  const exercises = [];

  // Reading exercise
  exercises.push({
    type: 'reading',
    question: `What is the reading of ${word.word}?`,
    answer: word.reading,
    options: generateReadingOptions(word, kanjiData),
    hints: [`This word uses the kanji: ${word.kanji.join(', ')}`]
  });

  // Meaning exercise
  exercises.push({
    type: 'meaning',
    question: `What is the meaning of ${word.word} (${word.reading})?`,
    answer: word.meaning,
    options: generateMeaningOptions(word, kanjiData),
    hints: word.examples.slice(0, 2)
  });

  // Writing exercise
  exercises.push({
    type: 'writing',
    question: `Write the word that means "${word.meaning}" (${word.reading})`,
    answer: word.word,
    hints: [
      `This word uses ${word.kanji.length} kanji`,
      `The first kanji is ${word.kanji[0]}`,
      ...word.kanji.slice(1).map(k => `The next kanji is ${k}`)
    ]
  });

  // Usage exercise
  if (word.examples.length > 0) {
    const example = word.examples[Math.floor(Math.random() * word.examples.length)];
    exercises.push({
      type: 'usage',
      question: `Complete the sentence: ${example.replace(word.word, '_____')}`,
      answer: word.word,
      hints: [
        `The word means "${word.meaning}"`,
        `It's read as ${word.reading}`,
        `Related words: ${word.relatedWords.join(', ')}`
      ]
    });
  }

  return exercises;
};

// Generate reading options for multiple choice
const generateReadingOptions = (
  word: CompoundWordData,
  kanjiData: KanjiStrokeData[]
): string[] => {
  const options = [word.reading];
  const allReadings = new Set<string>();

  // Collect readings from other compound words
  word.kanji.forEach(kanji => {
    const kanjiInfo = kanjiData.find(k => k.character === kanji);
    if (kanjiInfo) {
      kanjiInfo.readings.onyomi.forEach(r => allReadings.add(r));
      kanjiInfo.readings.kunyomi.forEach(r => allReadings.add(r));
    }
  });

  // Add random readings until we have 4 options
  while (options.length < 4 && allReadings.size > 0) {
    const readings = Array.from(allReadings);
    const randomReading = readings[Math.floor(Math.random() * readings.length)];
    if (!options.includes(randomReading)) {
      options.push(randomReading);
    }
    allReadings.delete(randomReading);
  }

  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
};

// Generate meaning options for multiple choice
const generateMeaningOptions = (
  word: CompoundWordData,
  kanjiData: KanjiStrokeData[]
): string[] => {
  const options = [word.meaning];
  const allMeanings = new Set<string>();

  // Collect meanings from other compound words
  word.kanji.forEach(kanji => {
    const kanjiInfo = kanjiData.find(k => k.character === kanji);
    if (kanjiInfo) {
      kanjiInfo.meanings.forEach(m => allMeanings.add(m));
    }
  });

  // Add random meanings until we have 4 options
  while (options.length < 4 && allMeanings.size > 0) {
    const meanings = Array.from(allMeanings);
    const randomMeaning = meanings[Math.floor(Math.random() * meanings.length)];
    if (!options.includes(randomMeaning)) {
      options.push(randomMeaning);
    }
    allMeanings.delete(randomMeaning);
  }

  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
};

// Calculate practice score
export const calculatePracticeScore = (
  exercises: { type: string; answer: string }[],
  userAnswers: { [key: number]: string }
): {
  score: number;
  feedback: { [key: number]: { correct: boolean; message: string } };
} => {
  let correctCount = 0;
  const feedback: { [key: number]: { correct: boolean; message: string } } = {};

  exercises.forEach((exercise, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === exercise.answer;
    
    if (isCorrect) {
      correctCount++;
    }

    feedback[index] = {
      correct: isCorrect,
      message: isCorrect
        ? 'Correct!'
        : `Incorrect. The correct answer is: ${exercise.answer}`
    };
  });

  return {
    score: (correctCount / exercises.length) * 100,
    feedback
  };
};

// Generate practice recommendations
export const generatePracticeRecommendations = (
  userProgress: { [word: string]: { attempts: number; successes: number } },
  compoundWords: CompoundWordData[]
): CompoundWordData[] => {
  // Calculate success rate for each word
  const wordStats = compoundWords.map(word => ({
    word,
    successRate: userProgress[word.word]
      ? userProgress[word.word].successes / userProgress[word.word].attempts
      : 0,
    lastPracticed: userProgress[word.word]?.lastPracticed || 0
  }));

  // Sort by success rate (ascending) and last practiced (ascending)
  return wordStats
    .sort((a, b) => {
      if (a.successRate === b.successRate) {
        return a.lastPracticed - b.lastPracticed;
      }
      return a.successRate - b.successRate;
    })
    .map(stat => stat.word)
    .slice(0, 10); // Return top 10 words that need practice
}; 