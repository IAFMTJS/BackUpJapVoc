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
  const { theme, getThemeClasses } = useTheme();
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
    <div className={`min-h-screen ${themeClasses.container}`}>
      <div className="container mx-auto px-4 py-8">
        <div className={`max-w-2xl mx-auto ${themeClasses.card}`}>
          <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>
            {mode === 'hiragana' ? 'Hiragana' : 'Katakana'} Practice
          </h2>

          <div className="space-y-6">
            <div className={`${themeClasses.card} border ${themeClasses.border} p-6 rounded-xl`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
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
                      className={`form-radio h-5 w-5 ${theme === 'dark' ? 'text-neon-blue' : 'text-blue-500'}`}
                    />
                    <span className={themeClasses.text.primary}>
                      {practiceMode === 'recognition' && 'Recognition (Kana → Romaji)'}
                      {practiceMode === 'writing' && 'Writing (Romaji → Kana)'}
                      {practiceMode === 'listening' && 'Listening (Audio → Kana)'}
                      {practiceMode === 'matching' && 'Matching (Romaji ↔ Kana)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={`${themeClasses.card} border ${themeClasses.border} p-6 rounded-xl`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>
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
                      className={`form-radio h-5 w-5 ${theme === 'dark' ? 'text-neon-blue' : 'text-blue-500'}`}
                    />
                    <span className={themeClasses.text.primary}>
                      {diff === 'easy' && 'Easy (Basic Characters)'}
                      {diff === 'medium' && 'Medium (Common Words)'}
                      {diff === 'hard' && 'Hard (Sentences)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={`${themeClasses.card} border ${themeClasses.border} p-6 rounded-xl`}>
              <div className="mb-6">
                <h2 className={`text-3xl font-bold mb-4 ${themeClasses.text.primary}`}>
                  {currentKana?.kana || ''}
                </h2>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handlePlayAudio(currentKana?.kana || '')}
                    className={`p-3 rounded-lg ${themeClasses.button.secondary} transition-all duration-300 ${
                      theme === 'dark' ? 'hover:shadow-[0_0_10px_rgba(0,149,255,0.4)]' : ''
                    }`}
                  >
                    🔊 Play
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={handleCheck}
                  className={themeClasses.button.primary}
                  disabled={!userInput.trim()}
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className={themeClasses.button.secondary}
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>

              {showResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  isCorrect 
                    ? theme === 'dark' 
                      ? 'bg-neon-blue/20 border-neon-blue/30' 
                      : 'bg-green-100 border-green-200'
                    : theme === 'dark' 
                      ? 'bg-neon-pink/20 border-neon-pink/30' 
                      : 'bg-red-100 border-red-200'
                } border`}>
                  <div className={`text-lg font-medium mb-2 ${
                    isCorrect 
                      ? theme === 'dark' 
                        ? 'text-neon-blue' 
                        : 'text-green-800'
                      : theme === 'dark' 
                        ? 'text-neon-pink' 
                        : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </div>
                  {!isCorrect && (
                    <div className={`${themeClasses.text.secondary} mb-2`}>
                      Correct Answer: {getCorrectAnswer(currentKana)}
                    </div>
                  )}
                </div>
              )}

              {showHint && (
                <div className={`mt-6 p-4 rounded-lg ${themeClasses.card}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                    Hint
                  </h3>
                  <p className={themeClasses.text.secondary}>
                    {getHint(currentKana)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                    Progress
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 ${themeClasses.text.secondary}`}>
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
      </div>
    </div>
  );
};

export default KanaPractice; 