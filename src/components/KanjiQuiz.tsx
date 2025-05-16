import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useSound } from '../context/SoundContext';
import { Kanji, kanjiList } from '../data/kanjiData';
import { playAudio, playDynamicAudio } from '../utils/audio';

type Difficulty = 'easy' | 'medium' | 'hard';
type AnswerType = 'kanji' | 'meaning' | 'reading';

interface QuizState {
  mode: 'setup' | 'quiz' | 'result';
  currentQuestion: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  userInput: string;
}

interface QuizSettings {
  difficulty: Difficulty;
  answerType: AnswerType;
  questionCount: number;
  useTimer: boolean;
  timeLimit: number;
}

const KanjiQuiz: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings: appSettings } = useApp();
  const { progress, updateProgress } = useProgress();
  const { playSound } = useSound();

  const [settings, setSettings] = useState<QuizSettings>({
    difficulty: 'easy',
    answerType: 'meaning',
    questionCount: 10,
    useTimer: true,
    timeLimit: 30
  });

  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'setup',
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    showCorrect: false,
    userInput: ''
  });

  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(settings.timeLimit);
  const [questions, setQuestions] = useState<Kanji[]>([]);

  const getFilteredKanji = useCallback(() => {
    return kanjiList.filter(kanji => {
      switch (settings.difficulty) {
        case 'easy':
          return kanji.jlptLevel === 'N5';
        case 'medium':
          return kanji.jlptLevel === 'N4';
        case 'hard':
          return kanji.jlptLevel === 'N3';
        default:
          return true;
      }
    });
  }, [settings.difficulty]);

  const startQuiz = useCallback(() => {
    const filteredKanji = getFilteredKanji();
    const shuffled = [...filteredKanji].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, settings.questionCount));
    setQuizState(prev => ({ ...prev, mode: 'quiz', currentQuestion: 0 }));
    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setTimeRemaining(settings.timeLimit);
  }, [getFilteredKanji, settings.questionCount, settings.timeLimit]);

  const checkAnswer = useCallback((answer: string) => {
    if (quizState.showFeedback) return;

    const currentKanji = questions[quizState.currentQuestion];
    let isCorrect = false;

    switch (settings.answerType) {
      case 'meaning':
        isCorrect = answer.toLowerCase().trim() === currentKanji.english.toLowerCase().trim();
        break;
      case 'reading':
        const allReadings = [...currentKanji.onyomi, ...currentKanji.kunyomi];
        isCorrect = allReadings.some(reading => 
          answer.toLowerCase().trim() === reading.toLowerCase().trim()
        );
        break;
      case 'kanji':
        isCorrect = answer.trim() === currentKanji.character;
        break;
    }

    const newStreak = isCorrect ? currentStreak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);

    setScore(prev => prev + (isCorrect ? 1 : 0));
    setCurrentStreak(newStreak);
    setBestStreak(newBestStreak);
    setQuizState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect,
      showCorrect: !isCorrect
    }));

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }

    // Update progress
    const currentProgress = progress.kanji || {
      totalQuestions: 0,
      correctAnswers: 0,
      bestStreak: 0,
      highScore: 0,
      lastAttempt: new Date().toISOString()
    };

    updateProgress('kanji', {
      totalQuestions: currentProgress.totalQuestions + 1,
      correctAnswers: currentProgress.correctAnswers + (isCorrect ? 1 : 0),
      bestStreak: Math.max(currentProgress.bestStreak, newBestStreak),
      highScore: Math.max(currentProgress.highScore, score + (isCorrect ? 1 : 0)),
      lastAttempt: new Date().toISOString()
    });
  }, [quizState, questions, settings.answerType, currentStreak, bestStreak, score, progress, updateProgress, playSound]);

  const handleNext = useCallback(() => {
    if (quizState.currentQuestion + 1 >= questions.length) {
      setQuizState(prev => ({ ...prev, mode: 'result' }));
      playSound('complete');
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showFeedback: false,
        isCorrect: null,
        showCorrect: false
      }));
      setTimeRemaining(settings.timeLimit);
    }
  }, [quizState.currentQuestion, questions.length, settings.timeLimit, playSound]);

  useEffect(() => {
    if (settings.useTimer && quizState.mode === 'quiz' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      checkAnswer('');
      handleNext();
    }
  }, [settings.useTimer, quizState.mode, timeRemaining, checkAnswer, handleNext]);

  const handlePlayAudio = (text: string, id?: string) => {
    if (id) {
      // Use pre-generated audio if we have an ID
      playAudio(id);
    } else {
      // Fallback to dynamic audio for content without an ID
      playDynamicAudio(text);
    }
  };

  const renderQuizContent = () => {
    if (quizState.mode === 'setup') {
      return (
        <div className="space-y-6">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Select Difficulty:
            </label>
            <select
              value={settings.difficulty}
              onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              <option value="easy">Easy (N5)</option>
              <option value="medium">Medium (N4)</option>
              <option value="hard">Hard (N3)</option>
            </select>
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Answer Type:
            </label>
            <select
              value={settings.answerType}
              onChange={(e) => setSettings(prev => ({ ...prev, answerType: e.target.value as AnswerType }))}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              <option value="meaning">Meaning (Kanji → English)</option>
              <option value="reading">Reading (Kanji → Reading)</option>
              <option value="kanji">Kanji (English/Reading → Kanji)</option>
            </select>
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Number of Questions:
            </label>
            <select
              value={settings.questionCount}
              onChange={(e) => setSettings(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
              className={`w-full p-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useTimer"
              checked={settings.useTimer}
              onChange={(e) => setSettings(prev => ({ ...prev, useTimer: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="useTimer" className={isDarkMode ? 'text-white' : 'text-gray-800'}>
              Use Timer
            </label>
          </div>

          <button
            onClick={startQuiz}
            className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Start Quiz
          </button>
        </div>
      );
    }

    if (quizState.mode === 'result') {
      return (
        <div className="text-center">
          <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Quiz Complete! 🎉
          </h2>
          <div className={`text-2xl mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Score: {score} / {questions.length}
          </div>
          <div className={`text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Best Streak: {bestStreak} 🔥
          </div>
          <button
            onClick={() => setQuizState(prev => ({ ...prev, mode: 'setup' }))}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    const currentKanji = questions[quizState.currentQuestion];

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Question {quizState.currentQuestion + 1} of {questions.length}
          </div>
          <div className="flex justify-between items-center">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Score: {score}/{quizState.currentQuestion + 1}
            </div>
            {settings.useTimer && (
              <div className={`text-sm font-bold ${
                timeRemaining <= 10 
                  ? 'text-red-500' 
                  : isDarkMode 
                    ? 'text-gray-300' 
                    : 'text-gray-700'
              }`}>
                Time: {timeRemaining}s
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {settings.answerType === 'kanji' ? (
              <>
                {currentKanji.english}
                {appSettings.showRomaji && (
                  <div className="text-xl text-gray-600 mt-2">
                    {currentKanji.onyomi[0]}
                  </div>
                )}
              </>
            ) : (
              currentKanji.character
            )}
          </h3>
          <div className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {settings.answerType === 'meaning' 
              ? 'What is the meaning of this kanji?'
              : settings.answerType === 'reading'
                ? 'What is the reading of this kanji?'
                : 'Write this kanji:'}
          </div>
        </div>

        {!quizState.showFeedback ? (
          <div className="space-y-4">
            <input
              type="text"
              value={quizState.userInput || ''}
              onChange={(e) => setQuizState(prev => ({ ...prev, userInput: e.target.value }))}
              placeholder={
                settings.answerType === 'meaning'
                  ? "Enter the meaning..."
                  : settings.answerType === 'reading'
                    ? "Enter the reading..."
                    : "Enter the kanji..."
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !quizState.showFeedback) {
                  checkAnswer(quizState.userInput || '');
                }
              }}
            />
            <button
              onClick={() => checkAnswer(quizState.userInput || '')}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        ) : (
          <div className={`p-4 rounded-lg ${
            quizState.isCorrect 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <p className="font-semibold mb-2">
              {quizState.isCorrect ? 'Correct! 🎉' : 'Incorrect 😕'}
            </p>
            {!quizState.isCorrect && (
              <div className="mt-2">
                <p>Correct answer(s):</p>
                {settings.answerType === 'meaning' ? (
                  <p>{currentKanji.english}</p>
                ) : settings.answerType === 'reading' ? (
                  <>
                    <p>Onyomi: {currentKanji.onyomi.join(', ')}</p>
                    <p>Kunyomi: {currentKanji.kunyomi.join(', ')}</p>
                  </>
                ) : (
                  <p>{currentKanji.character}</p>
                )}
              </div>
            )}
            <button
              onClick={handleNext}
              className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {quizState.currentQuestion + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}

        {currentStreak > 0 && (
          <div className={`text-center text-lg ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`}>
            Streak: {currentStreak} 🔥
          </div>
        )}

        <button
          onClick={() => handlePlayAudio(currentKanji.character, currentKanji.id)}
          className="ml-2 p-2 rounded-full hover:bg-opacity-10"
          title="Play Audio"
        >
          🔊
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {renderQuizContent()}
    </div>
  );
};

export default KanjiQuiz; 