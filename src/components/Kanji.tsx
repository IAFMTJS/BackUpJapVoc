import React, { useState, useEffect, useRef } from 'react';
import { Kanji, kanjiList } from '../data/kanjiData';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { useApp } from '../context/AppContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { ProgressItem } from '../types';
import { useAchievements } from '../context/AchievementContext';

type Mode = 'flashcards' | 'meaning-quiz' | 'reading-quiz' | 'writing-quiz';
type QuizDifficulty = 'easy' | 'medium' | 'hard';

interface QuizSettings {
  timeLimit: number;
  streakBonus: number;
  requiredStreak: number;
  maxQuestions: number;
}

const QUIZ_SETTINGS: Record<QuizDifficulty, QuizSettings> = {
  easy: {
    timeLimit: 45,
    streakBonus: 1,
    requiredStreak: 3,
    maxQuestions: 10
  },
  medium: {
    timeLimit: 30,
    streakBonus: 2,
    requiredStreak: 5,
    maxQuestions: 15
  },
  hard: {
    timeLimit: 20,
    streakBonus: 3,
    requiredStreak: 7,
    maxQuestions: 20
  }
};

const KanjiPractice: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings } = useApp();
  const [mode, setMode] = useState<Mode>('flashcards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showReadings, setShowReadings] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredKanji, setFilteredKanji] = useState<Kanji[]>(kanjiList);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [readingType, setReadingType] = useState<'onyomi' | 'kunyomi'>('onyomi');
  const [writingMode, setWritingMode] = useState<'meaning' | 'reading'>('meaning');
  const [quizDifficulty, setQuizDifficulty] = useState<QuizDifficulty>('medium');
  const [questionsRemaining, setQuestionsRemaining] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [romajiMap, setRomajiMap] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateProgress, progress } = useProgress();
  const { checkAchievements } = useAchievements();
  const [searchTerm, setSearchTerm] = useState('');

  // Sound effects
  const correctSound = new Audio('/sounds/correct.mp3');
  const incorrectSound = new Audio('/sounds/incorrect.mp3');
  const timeUpSound = new Audio('/sounds/time-up.mp3');

  // Add logging for component state
  useEffect(() => {
    console.log('KanjiPractice State:', {
      mode,
      currentIndex,
      filteredKanjiCount: filteredKanji.length,
      currentKanji: filteredKanji[currentIndex],
      settings: {
        showKanjiGames: settings.showKanjiGames,
        showRomajiGames: settings.showRomajiGames
      }
    });
  }, [mode, currentIndex, filteredKanji, settings]);

  // Initialize filtered kanji
  useEffect(() => {
    console.log('Initializing filtered kanji...');
    let filtered = kanjiList;

    // Apply difficulty filter only if explicitly set
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(kanji => kanji.difficulty === selectedDifficulty);
      console.log(`Filtered by difficulty ${selectedDifficulty}:`, filtered.length);
    }

    // Apply category filter only if explicitly set
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(kanji => kanji.category === selectedCategory);
      console.log(`Filtered by category ${selectedCategory}:`, filtered.length);
    }

    setFilteredKanji(filtered);
    console.log('Final filtered kanji count:', filtered.length);
  }, [selectedDifficulty, selectedCategory]);

  // Ensure kanji are displayed by default
  useEffect(() => {
    if (settings.showKanjiGames === undefined) {
      console.log('Setting showKanjiGames to true by default');
      settings.showKanjiGames = true;
    }
  }, [settings]);

  // Function to get romaji for a given text
  const getRomaji = async (text: string) => {
    if (romajiMap[text]) return romajiMap[text];
    try {
      const romaji = await kuroshiroInstance.convert(text);
      setRomajiMap(prev => ({ ...prev, [text]: romaji }));
      return romaji;
    } catch (error) {
      console.error('Error converting to romaji:', error);
      return text;
    }
  };

  // Update romaji when settings change
  useEffect(() => {
    if (settings.showRomajiGames) {
      const updateRomaji = async () => {
        const currentKanji = filteredKanji[currentIndex];
        if (!romajiMap[currentKanji.character]) {
          await getRomaji(currentKanji.character);
        }
        // Update romaji for examples
        for (const example of currentKanji.examples) {
          if (!romajiMap[example.word]) {
            await getRomaji(example.word);
          }
        }
      };
      updateRomaji();
    }
  }, [currentIndex, settings.showRomajiGames, filteredKanji]);

  useEffect(() => {
    filterKanji();
  }, [searchTerm, selectedDifficulty, selectedCategory]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeLeft === 0) {
      timeUpSound.play();
      setTimerActive(false);
      setIsCorrect(false);
      setStreak(0);
      setShowResult(true);
    }
  }, [timeLeft, timerActive]);

  const filterKanji = () => {
    let filtered = kanjiList;

    // Apply difficulty filter only if explicitly set
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(kanji => kanji.difficulty === selectedDifficulty);
    }

    // Apply category filter only if explicitly set
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(kanji => kanji.category === selectedCategory);
    }

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(kanji => {
        // Search in character
        if (kanji.character.toLowerCase().includes(searchLower)) return true;

        // Search in meaning
        if (kanji.meaning.toLowerCase().includes(searchLower)) return true;

        // Search in readings
        if (kanji.onyomi.some(reading => reading.toLowerCase().includes(searchLower))) return true;
        if (kanji.kunyomi.some(reading => reading.toLowerCase().includes(searchLower))) return true;

        // Search in examples
        if (kanji.examples.some(example => 
          example.word.toLowerCase().includes(searchLower) ||
          example.reading.toLowerCase().includes(searchLower) ||
          example.meaning.toLowerCase().includes(searchLower)
        )) return true;

        return false;
      });
    }

    setFilteredKanji(filtered);
    setCurrentIndex(0);
    setShowMeaning(false);
    setShowReadings(false);
    setShowExamples(false);
  };

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-dark-lighter',
        text: 'text-text-primary',
        input: 'bg-dark-lighter border-dark-border text-text-primary',
        card: 'bg-dark-hover',
        border: 'border-dark-border',
      };
    }

    switch (theme) {
      case 'blue':
        return {
          container: 'bg-blue-card',
          text: 'text-blue-text',
          input: 'bg-white border-blue-border text-blue-text',
          card: 'bg-blue-hover',
          border: 'border-blue-border',
        };
      case 'green':
        return {
          container: 'bg-green-card',
          text: 'text-green-text',
          input: 'bg-white border-green-border text-green-text',
          card: 'bg-green-hover',
          border: 'border-green-border',
        };
      default:
        return {
          container: 'bg-white',
          text: 'text-gray-800',
          input: 'bg-white border-gray-200 text-gray-800',
          card: 'bg-gray-50',
          border: 'border-gray-200',
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredKanji.length);
    setShowMeaning(false);
    setShowReadings(false);
    setShowExamples(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredKanji.length) % filteredKanji.length);
    setShowMeaning(false);
    setShowReadings(false);
    setShowExamples(false);
  };

  const startQuiz = () => {
    const settings = QUIZ_SETTINGS[quizDifficulty];
    setScore(0);
    setTotalQuestions(0);
    setShowResult(false);
    setUserAnswer('');
    setIsCorrect(null);
    setTimeLeft(settings.timeLimit);
    setTimerActive(true);
    setStreak(0);
    setQuestionsRemaining(settings.maxQuestions);
    setQuizComplete(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const checkAnswer = (answer: string, correctAnswer: string | string[]): boolean => {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(correct => 
        answer.toLowerCase().trim() === correct.toLowerCase().trim()
      );
    }
    return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  const calculateScore = (isCorrect: boolean, streak: number): number => {
    const settings = QUIZ_SETTINGS[quizDifficulty];
    let points = isCorrect ? 1 : 0;
    
    if (isCorrect && streak >= settings.requiredStreak) {
      points += settings.streakBonus;
    }
    
    return points;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerActive) return;

    const currentKanji = filteredKanji[currentIndex];
    let isAnswerCorrect = false;

    switch (mode) {
      case 'meaning-quiz':
        isAnswerCorrect = checkAnswer(userAnswer, currentKanji.meaning);
        break;
      case 'reading-quiz':
        isAnswerCorrect = checkAnswer(userAnswer, readingType === 'onyomi' ? currentKanji.onyomi : currentKanji.kunyomi);
        break;
      case 'writing-quiz':
        isAnswerCorrect = checkAnswer(userAnswer, writingMode === 'meaning' ? currentKanji.character : currentKanji.onyomi[0]);
        break;
    }

    const pointsEarned = calculateScore(isAnswerCorrect, streak);

    if (isAnswerCorrect) {
      correctSound.play();
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
    } else {
      incorrectSound.play();
      setStreak(0);
    }

    setTotalQuestions(prev => prev + 1);
    setQuestionsRemaining(prev => prev - 1);
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setTimerActive(false);
    setUserAnswer('');

    // Update progress
    updateProgress('kanji', {
      totalQuestions: totalQuestions + 1,
      correctAnswers: isAnswerCorrect ? (score + 1) : score,
      bestStreak: Math.max(streak, streak + (isAnswerCorrect ? 1 : 0)),
      averageTime: ((averageTime * totalQuestions) + (30 - timeLeft)) / (totalQuestions + 1)
    });

    // Check achievements for kanji progress
    const masteredKanji = Object.values(progress)
      .filter(p => p.section === 'kanji' && p.correct >= 3)
      .length;
    checkAchievements('kanji', masteredKanji);

    if (questionsRemaining <= 1) {
      setQuizComplete(true);
    }
  };

  const nextQuestion = () => {
    if (quizComplete) {
      setMode('flashcards');
      return;
    }

    const settings = QUIZ_SETTINGS[quizDifficulty];
    setCurrentIndex(prev => (prev + 1) % filteredKanji.length);
    setShowResult(false);
    setIsCorrect(null);
    setUserAnswer('');
    setTimeLeft(settings.timeLimit);
    setTimerActive(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const currentKanji = filteredKanji[currentIndex];

  // --- Progress tracking for Kanji section ---
  const kanjiProgressItems = kanjiList.map(kanji => {
    const key = `kanji-${kanji.character}`;
    return progress[key] as ProgressItem | undefined;
  });
  const totalKanji = kanjiList.length;
  const mastered = kanjiProgressItems.filter(item => item && item.correct >= 3).length;
  const inProgress = kanjiProgressItems.filter(item => item && item.correct > 0 && item.correct < 3).length;
  const notStarted = kanjiProgressItems.filter(item => !item || item.correct === 0).length;
  const kanjiProgressPercent = totalKanji > 0 ? Math.round((mastered / totalKanji) * 100) : 0;

  const renderQuizContent = () => {
    if (quizComplete) {
      return (
        <div className="text-center">
          <div className={`text-3xl mb-6 ${themeClasses.text}`}>Quiz Complete! 🎉</div>
          <div className={`text-2xl mb-4 ${themeClasses.text}`}>
            Final Score: {score} / {totalQuestions}
          </div>
          <div className={`text-xl mb-4 ${themeClasses.text}`}>
            Difficulty: {quizDifficulty.charAt(0).toUpperCase() + quizDifficulty.slice(1)}
          </div>
          <div className={`text-lg mb-6 ${themeClasses.text}`}>
            {score === totalQuestions ? 'Perfect Score! 🌟' : 
             score >= totalQuestions * 0.8 ? 'Great Job! 🎯' :
             score >= totalQuestions * 0.6 ? 'Good Work! 👍' :
             'Keep Practicing! 💪'}
          </div>
          <button
            onClick={() => setMode('flashcards')}
            className={`px-6 py-3 rounded-lg ${themeClasses.card} ${themeClasses.text}`}
          >
            Return to Flashcards
          </button>
        </div>
      );
    }

    if (!showResult) {
      return (
        <>
          <div className="text-center mb-8">
            {mode === 'meaning-quiz' && (
              <>
                {settings.showKanjiGames ? (
                  <div className="text-8xl mb-4">{currentKanji.character}</div>
                ) : (
                  <div className="text-8xl mb-4">{currentKanji.kunyomi[0]}</div>
                )}
                {settings.showRomajiGames && (
                  <div className={`text-xl mb-4 ${themeClasses.text}`}>
                    {romajiMap[currentKanji.character] || 'Loading...'}
                  </div>
                )}
                <div className="text-2xl mb-4">What is the meaning of this kanji?</div>
              </>
            )}
            {mode === 'reading-quiz' && (
              <>
                {settings.showKanjiGames ? (
                  <div className="text-8xl mb-4">{currentKanji.character}</div>
                ) : (
                  <div className="text-8xl mb-4">{currentKanji.meaning}</div>
                )}
                {settings.showRomajiGames && (
                  <div className={`text-xl mb-4 ${themeClasses.text}`}>
                    {romajiMap[currentKanji.character] || 'Loading...'}
                  </div>
                )}
                <div className="text-2xl mb-4">
                  What is the {readingType === 'onyomi' ? 'onyomi' : 'kunyomi'} reading?
                </div>
              </>
            )}
            {mode === 'writing-quiz' && (
              <>
                <div className="text-2xl mb-4">
                  {writingMode === 'meaning' 
                    ? `Write the kanji for: ${currentKanji.meaning}`
                    : `Write the kanji for the reading: ${currentKanji.onyomi[0]}`
                  }
                </div>
                {settings.showRomajiGames && writingMode === 'reading' && (
                  <div className={`text-xl mb-4 ${themeClasses.text}`}>
                    {romajiMap[currentKanji.onyomi[0]] || 'Loading...'}
                  </div>
                )}
              </>
            )}
            <div className="text-xl mb-4">Time left: {timeLeft}s</div>
            <div className="text-lg mb-4">
              Questions remaining: {questionsRemaining}
            </div>
            {streak > 0 && (
              <div className="text-lg text-green-600 mb-4">
                Streak: {streak} 🔥
                {streak >= QUIZ_SETTINGS[quizDifficulty].requiredStreak && (
                  <span className="ml-2">(+{QUIZ_SETTINGS[quizDifficulty].streakBonus} bonus points!)</span>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={mode === 'writing-quiz' ? "Enter the kanji..." : "Enter your answer..."}
              className={`w-full p-4 rounded-lg ${themeClasses.input}`}
              disabled={!timerActive}
            />
            <button
              type="submit"
              className={`w-full p-4 rounded-lg ${
                timerActive
                  ? 'bg-primary text-white'
                  : `${themeClasses.card} ${themeClasses.text}`
              }`}
              disabled={!timerActive}
            >
              Submit
            </button>
          </form>
        </>
      );
    }

    return (
      <div className="text-center">
        <div className={`text-2xl mb-4 ${themeClasses.text}`}>
          {isCorrect ? 'Correct! 🎉' : 'Incorrect 😕'}
        </div>
        {mode === 'meaning-quiz' && (
          <>
            <div className="text-xl mb-4">
              The meaning is: {currentKanji.meaning}
            </div>
            {settings.showKanjiGames && (
              <div className="text-8xl mb-4">{currentKanji.character}</div>
            )}
            {settings.showRomajiGames && (
              <div className={`text-xl mb-4 ${themeClasses.text}`}>
                {romajiMap[currentKanji.character] || 'Loading...'}
              </div>
            )}
            <div className="text-lg mb-4">
              Onyomi: {currentKanji.onyomi.join(', ')}
            </div>
            <div className="text-lg mb-4">
              Kunyomi: {currentKanji.kunyomi.join(', ')}
            </div>
          </>
        )}
        {mode === 'reading-quiz' && (
          <>
            <div className="text-xl mb-4">
              {readingType === 'onyomi' ? 'Onyomi' : 'Kunyomi'} readings: {
                readingType === 'onyomi' ? currentKanji.onyomi.join(', ') : currentKanji.kunyomi.join(', ')
              }
            </div>
            <div className="text-lg mb-4">
              Meaning: {currentKanji.meaning}
            </div>
          </>
        )}
        {mode === 'writing-quiz' && (
          <>
            <div className="text-xl mb-4">
              The kanji is: {currentKanji.character}
            </div>
            <div className="text-lg mb-4">
              Meaning: {currentKanji.meaning}
            </div>
            <div className="text-lg mb-4">
              Readings: {currentKanji.onyomi.join(', ')} / {currentKanji.kunyomi.join(', ')}
            </div>
          </>
        )}
        <div className="text-lg mb-4">
          Score: {score} / {totalQuestions}
        </div>
        <button
          onClick={nextQuestion}
          className={`px-6 py-3 rounded-lg ${themeClasses.card} ${themeClasses.text}`}
        >
          {questionsRemaining > 0 ? 'Next Question' : 'Finish Quiz'}
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Kanji Practice</h1>
        
        {/* Mode Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('flashcards')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'flashcards' 
                ? 'bg-primary text-white' 
                : `${themeClasses.card} ${themeClasses.text}`
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setMode('meaning-quiz')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'meaning-quiz' 
                ? 'bg-primary text-white' 
                : `${themeClasses.card} ${themeClasses.text}`
            }`}
          >
            Meaning Quiz
          </button>
          <button
            onClick={() => setMode('reading-quiz')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'reading-quiz' 
                ? 'bg-primary text-white' 
                : `${themeClasses.card} ${themeClasses.text}`
            }`}
          >
            Reading Quiz
          </button>
          <button
            onClick={() => setMode('writing-quiz')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'writing-quiz' 
                ? 'bg-primary text-white' 
                : `${themeClasses.card} ${themeClasses.text}`
            }`}
          >
            Writing Quiz
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${themeClasses.input}`}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${themeClasses.input}`}
          >
            <option value="all">All Categories</option>
            <option value="nature">Nature</option>
            <option value="people">People</option>
            <option value="body">Body</option>
            <option value="numbers">Numbers</option>
            <option value="time">Time</option>
            <option value="position">Position</option>
            <option value="size">Size</option>
            <option value="currency">Currency</option>
          </select>
        </div>

        {/* Content */}
        {filteredKanji.length > 0 ? (
          mode === 'flashcards' ? (
            <div className={`${themeClasses.card} rounded-lg p-8 border ${themeClasses.border} text-center`}>
              {settings.showKanjiGames ? (
                <div className="text-8xl mb-8 font-japanese">{currentKanji.character}</div>
              ) : (
                <div className="text-8xl mb-8 font-japanese">{currentKanji.kunyomi[0]}</div>
              )}
              {settings.showRomajiGames && (
                <div className={`text-xl mb-4 ${themeClasses.text}`}>
                  {romajiMap[currentKanji.character] || 'Loading...'}
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowMeaning(!showMeaning)}
                  className={`w-full p-4 rounded-lg ${
                    showMeaning 
                      ? 'bg-primary text-white' 
                      : `${themeClasses.card} ${themeClasses.text}`
                  }`}
                >
                  {showMeaning ? currentKanji.english : 'Show Meaning'}
                </button>

                <button
                  onClick={() => setShowReadings(!showReadings)}
                  className={`w-full p-4 rounded-lg ${
                    showReadings 
                      ? 'bg-primary text-white' 
                      : `${themeClasses.card} ${themeClasses.text}`
                  }`}
                >
                  {showReadings ? (
                    <div>
                      <div>Onyomi: {currentKanji.onyomi.join(', ')}</div>
                      <div>Kunyomi: {currentKanji.kunyomi.join(', ')}</div>
                    </div>
                  ) : (
                    'Show Readings'
                  )}
                </button>

                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className={`w-full p-4 rounded-lg ${
                    showExamples 
                      ? 'bg-primary text-white' 
                      : `${themeClasses.card} ${themeClasses.text}`
                  }`}
                >
                  {showExamples ? (
                    <div className="space-y-2">
                      {currentKanji.examples?.map((example, index) => (
                        <div key={index}>
                          {settings.showKanjiGames ? example.word : example.reading} 
                          {settings.showRomajiGames && (
                            <span className={`${themeClasses.text} ml-2`}>
                              ({romajiMap[example.word] || 'Loading...'})
                            </span>
                          )}
                          {' - '}{example.meaning}
                        </div>
                      ))}
                    </div>
                  ) : (
                    'Show Examples'
                  )}
                </button>

                {currentKanji.hint && (
                  <div className={`mt-4 text-sm ${themeClasses.text}`}>
                    Hint: {currentKanji.hint}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  className={`px-4 py-2 rounded-lg ${themeClasses.card} ${themeClasses.text}`}
                >
                  Previous
                </button>
                <div className={themeClasses.text}>
                  {currentIndex + 1} / {filteredKanji.length}
                </div>
                <button
                  onClick={handleNext}
                  className={`px-4 py-2 rounded-lg ${themeClasses.card} ${themeClasses.text}`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className={`${themeClasses.card} rounded-lg p-8 border ${themeClasses.border}`}>
              {renderQuizContent()}
            </div>
          )
        ) : (
          <div className={`text-center ${themeClasses.text}`}>
            No kanji found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default KanjiPractice; 