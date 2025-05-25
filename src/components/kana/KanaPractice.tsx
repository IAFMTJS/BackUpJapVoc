import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { useProgress } from '../../context/ProgressContext';
import { playAudio } from '../../utils/audio';
import { basicKana } from './BasicKana';
import { yōonKana } from './YōonKana';
import { dakuonKana } from './DakuonKana';

type PracticeMode = 'recognition' | 'writing' | 'listening' | 'matching';
type Difficulty = 'easy' | 'medium' | 'hard';

interface PracticeQuestion {
  question: string;
  correctAnswer: string;
  options?: string[];
  type: 'hiragana' | 'katakana' | 'romaji';
  audio?: string;
}

interface KanaPracticeProps {
  mode?: PracticeMode;
  difficulty?: Difficulty;
  onComplete?: () => void;
}

const KanaPractice: React.FC<KanaPracticeProps> = ({ 
  mode: initialMode = 'recognition',
  difficulty: initialDifficulty = 'easy',
  onComplete 
}) => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { playSound } = useSound();
  const { updateProgress } = useProgress();

  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [currentKana, setCurrentKana] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const generateQuestion = () => {
    let questionPool: any[] = [];
    
    // Combine kana based on selected type
    if (difficulty === 'easy') questionPool = [...questionPool, ...basicKana];
    else if (difficulty === 'medium') questionPool = [...questionPool, ...yōonKana];
    else if (difficulty === 'hard') questionPool = [...questionPool, ...dakuonKana];

    // Randomly select a question type and kana
    const questionType = Math.random() < 0.5 ? 'hiragana' : 'katakana';
    const kana = questionPool[Math.floor(Math.random() * questionPool.length)];
    
    let question: PracticeQuestion;

    switch (mode) {
      case 'recognition':
        question = {
          question: questionType === 'hiragana' ? kana.hiragana : kana.katakana,
          correctAnswer: kana.romaji,
          type: 'romaji',
          audio: kana.audio
        };
        break;
      case 'writing':
        question = {
          question: kana.romaji,
          correctAnswer: questionType === 'hiragana' ? kana.hiragana : kana.katakana,
          type: questionType,
          audio: kana.audio
        };
        break;
      case 'listening':
        // For listening mode, we'll show romaji and ask for kana
        question = {
          question: kana.romaji,
          correctAnswer: questionType === 'hiragana' ? kana.hiragana : kana.katakana,
          type: questionType,
          audio: kana.audio
        };
        break;
      case 'matching':
        // For matching mode, we'll show multiple options
        const options = questionPool
          .filter(k => k !== kana)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(k => questionType === 'hiragana' ? k.hiragana : k.katakana);
        
        question = {
          question: kana.romaji,
          correctAnswer: questionType === 'hiragana' ? kana.hiragana : kana.katakana,
          options: [...options, questionType === 'hiragana' ? kana.hiragana : kana.katakana].sort(() => Math.random() - 0.5),
          type: questionType,
          audio: kana.audio
        };
        break;
      default:
        question = {
          question: kana.hiragana,
          correctAnswer: kana.romaji,
          type: 'romaji',
          audio: kana.audio
        };
    }

    setCurrentKana(question.question);
    setUserInput('');
    setIsCorrect(null);
    setScore(prev => prev + (isCorrect ? 1 : 0));
    setAttempts(prev => prev + 1);
    setShowHint(false);
  };

  useEffect(() => {
    generateQuestion();
  }, [mode, difficulty]);

  const checkAnswer = () => {
    if (!currentKana) return;

    const isCorrect = userInput.toLowerCase() === currentKana.toLowerCase();
    setIsCorrect(isCorrect);
    setScore(prev => prev + (isCorrect ? 1 : 0));

    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  const nextKana = () => {
    generateQuestion();
  };

  const getCorrectAnswer = (kana: string) => {
    // Implement the logic to get the correct answer based on the kana
    return '';
  };

  const getHint = (kana: string) => {
    // Implement the logic to get a hint for the kana
    return '';
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 ${themeClasses.container}`}>
      <div className={`mb-6 ${themeClasses.card} border ${themeClasses.border} p-6 rounded-xl ${isDarkMode ? 'shadow-[0_0_20px_rgba(0,149,255,0.2)]' : ''}`}>
        <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''}`}>
          Kana Practice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''}`}>
              Practice Mode
            </h3>
            <div className="space-y-3">
              {['recognition', 'writing', 'listening', 'matching'].map((practiceMode) => (
                <label key={practiceMode} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={practiceMode}
                    checked={mode === practiceMode}
                    onChange={(e) => setMode(e.target.value as PracticeMode)}
                    className={`form-radio h-5 w-5 ${isDarkMode ? 'text-neon-blue' : 'text-blue-500'}`}
                  />
                  <span className={themeClasses.text}>
                    {practiceMode === 'recognition' && 'Recognition (Kana → Romaji)'}
                    {practiceMode === 'writing' && 'Writing (Romaji → Kana)'}
                    {practiceMode === 'listening' && 'Listening (Audio → Kana)'}
                    {practiceMode === 'matching' && 'Matching (Romaji ↔ Kana)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''}`}>
              Difficulty
            </h3>
            <div className="space-y-3">
              {['easy', 'medium', 'hard'].map((diff) => (
                <label key={diff} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={diff}
                    checked={difficulty === diff}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className={`form-radio h-5 w-5 ${isDarkMode ? 'text-neon-blue' : 'text-blue-500'}`}
                  />
                  <span className={themeClasses.text}>
                    {diff === 'easy' && 'Easy (Basic Characters)'}
                    {diff === 'medium' && 'Medium (Common Words)'}
                    {diff === 'hard' && 'Hard (Sentences)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${themeClasses.card} border ${themeClasses.border} p-6 rounded-xl ${isDarkMode ? 'shadow-[0_0_20px_rgba(0,149,255,0.2)]' : ''}`}>
        <div className="mb-6">
          <h2 className={`text-3xl font-bold mb-4 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''}`}>
            {currentKana}
          </h2>
          {mode === 'listening' && (
            <button
              onClick={() => playAudio(currentKana)}
              className={`p-3 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-neon-blue hover:bg-neon-blue/90 text-white shadow-[0_0_10px_rgba(0,149,255,0.4)] hover:shadow-[0_0_20px_rgba(0,149,255,0.6)]' 
                  : themeClasses.button.secondary
              }`}
            >
              🔊 Play Audio
            </button>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={
              mode === 'recognition' ? 'Enter romaji...' :
              mode === 'writing' ? 'Enter kana...' :
              mode === 'listening' ? 'Enter kana or romaji...' :
              'Enter matching kana...'
            }
            className={`w-full p-4 rounded-lg ${themeClasses.input}`}
            disabled={isCorrect !== null}
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={checkAnswer}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-neon-pink hover:bg-neon-pink/90 text-white shadow-[0_0_10px_rgba(255,0,128,0.4)] hover:shadow-[0_0_20px_rgba(255,0,128,0.6)]' 
                : themeClasses.button.primary
            }`}
          >
            Check Answer
          </button>
          <button
            onClick={nextKana}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-neon-blue hover:bg-neon-blue/90 text-white shadow-[0_0_10px_rgba(0,149,255,0.4)] hover:shadow-[0_0_20px_rgba(0,149,255,0.6)]' 
                : themeClasses.button.secondary
            }`}
          >
            Next
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 hover:shadow-[0_0_10px_rgba(0,149,255,0.2)]' 
                : themeClasses.button.secondary
            }`}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>

        {isCorrect !== null && (
          <div className={`mt-6 p-4 rounded-lg ${
            isCorrect 
              ? isDarkMode 
                ? 'bg-neon-blue/20 border-neon-blue/30' 
                : 'bg-green-100 border-green-200'
              : isDarkMode 
                ? 'bg-neon-pink/20 border-neon-pink/30' 
                : 'bg-red-100 border-red-200'
          } border`}>
            <div className={`text-lg font-medium mb-2 ${
              isCorrect 
                ? isDarkMode 
                  ? 'text-neon-blue' 
                  : 'text-green-800'
                : isDarkMode 
                  ? 'text-neon-pink' 
                  : 'text-red-800'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </div>
            {!isCorrect && (
              <div className={`${themeClasses.text} mb-2`}>
                Correct Answer: {getCorrectAnswer(currentKana)}
              </div>
            )}
          </div>
        )}

        {showHint && (
          <div className={`mt-6 p-4 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''}`}>
              Hint
            </h3>
            <p className={themeClasses.text}>
              {getHint(currentKana)}
            </p>
          </div>
        )}

        <div className={`mt-6 p-4 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''}`}>
                Progress
              </h3>
              <div className={`grid grid-cols-2 gap-4 ${themeClasses.text}`}>
                <div>
                  <div className="text-sm opacity-75">Score</div>
                  <div className="text-xl font-bold">{score}</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Attempts</div>
                  <div className="text-xl font-bold">{attempts}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanaPractice; 