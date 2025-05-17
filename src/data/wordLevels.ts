import { allWords } from './japaneseWords';
import { JapaneseWord, ExampleSentence, WordLevel, LevelRequirement, WordProgress, LevelProgress, QuizAttempt, JLPTTest, ReadingPractice, UserProgress } from './types';
import { levelDistribution, wordBelongsInLevel } from './levelRules';
import { readingMaterials } from './readingMaterials';

// First pass: distribute words based on category and JLPT level rules
const initialWordsByLevel: { [key: number]: JapaneseWord[] } = {};
for (let level = 1; level <= 10; level++) {
  initialWordsByLevel[level] = allWords.filter(word => wordBelongsInLevel(word, level));
}

// Second pass: redistribute words to ensure 100 words per level
const wordsByLevel: { [key: number]: JapaneseWord[] } = {};
const maxWordsPerLevel = 100;
let remainingWords: JapaneseWord[] = [];

// First, fill each level up to maxWordsPerLevel with words that belong there
for (let level = 1; level <= 10; level++) {
  wordsByLevel[level] = initialWordsByLevel[level].slice(0, maxWordsPerLevel);
  remainingWords = [...remainingWords, ...initialWordsByLevel[level].slice(maxWordsPerLevel)];
}

// Then, distribute remaining words to fill up levels that are below maxWordsPerLevel
for (let level = 1; level <= 10; level++) {
  while (wordsByLevel[level].length < maxWordsPerLevel && remainingWords.length > 0) {
    const word = remainingWords.shift();
    if (word) {
      wordsByLevel[level].push(word);
    }
  }
}

// Create the word levels array
export const wordLevels: WordLevel[] = Array.from({ length: 10 }, (_, i) => {
  const level = i + 1;
  const rules = levelDistribution[level];
  const words = wordsByLevel[level];
  
  // Log the number of words in each level
  console.log(`Level ${level}: ${words.length} words`);
  
  return {
    level,
    requiredScore: level === 1 ? 0 : 80,
    description: rules.description,
    unlocked: level === 1,
    jlptLevel: rules.jlptLevels[0] as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
    practiceCategories: rules.categories,
    requiredWordMastery: {
      minWords: Math.max(20, Math.floor(words.length * 0.2)),
      masteryThreshold: 80
    },
    requirements: [
      {
        type: 'quiz',
        description: `Complete ${level} quizzes with 80% or higher score`,
        target: level,
        current: 0,
        completed: false
      },
      {
        type: 'practice',
        description: `Master ${Math.max(20, Math.floor(words.length * 0.2))} words`,
        target: Math.max(20, Math.floor(words.length * 0.2)),
        current: 0,
        completed: false
      },
      {
        type: 'reading',
        description: `Read and understand ${level} texts`,
        target: level,
        current: 0,
        completed: false
      }
    ],
    readingMaterials: readingMaterials[level] || [],
    words
  };
});

// Helper function to calculate word mastery
export const calculateWordMastery = (level: number, userProgress: UserProgress) => {
  const levelData = wordLevels.find(l => l.level === level);
  if (!levelData) {
    return {
      masteredWords: 0,
      totalWords: 0,
      masteryPercentage: 0,
      meetsRequirements: false
    };
  }

  const totalWords = levelData.words.length;
  const masteredWords = levelData.words.filter(word => {
    const progress = userProgress.wordProgress[word.japanese];
    return progress?.mastered || false;
  }).length;

  const masteryPercentage = (masteredWords / totalWords) * 100;
  const meetsRequirements = masteredWords >= levelData.requiredWordMastery.minWords &&
    masteryPercentage >= levelData.requiredWordMastery.masteryThreshold;

  return {
    masteredWords,
    totalWords,
    masteryPercentage,
    meetsRequirements
  };
};

// Helper function to get words for a specific level
export const getWordsForLevel = (level: number): JapaneseWord[] => {
  const levelData = wordLevels.find(l => l.level === level);
  return levelData?.words || [];
};

// Helper function to calculate level score
export const calculateLevelScore = (level: number, userProgress: UserProgress): number => {
  const levelData = wordLevels.find(l => l.level === level);
  if (!levelData) return 0;

  const words = getWordsForLevel(level);
  const totalWords = words.length;
  if (totalWords === 0) return 0;

  const masteredWords = words.filter(word => {
    const progress = userProgress.wordProgress[word.japanese];
    return progress?.mastered || false;
  }).length;

  // Calculate base score from word mastery
  const wordMasteryScore = (masteredWords / totalWords) * 100;

  // Calculate score from completed requirements
  const requirements = levelData.requirements;
  const completedRequirements = requirements.filter(req => req.completed).length;
  const requirementScore = (completedRequirements / requirements.length) * 100;

  // Combine scores (70% word mastery, 30% requirements)
  return (wordMasteryScore * 0.7) + (requirementScore * 0.3);
}; 