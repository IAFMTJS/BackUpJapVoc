import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useSound } from '../context/SoundContext';
import { useAchievements } from '../context/AchievementContext';
import { Kanji, kanjiList } from '../data/kanjiData';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { analyzeStroke, validateStroke, calculateStrokeOrderScore } from '../utils/strokeValidation';
import { generatePracticeSets, generateWordExercises, calculatePracticeScore, DIFFICULTY_LEVELS } from '../utils/compoundWordPractice';
import { Point, StrokeData, StrokeFeedback, CompoundWordData, KanjiStrokeData } from '../types/stroke';
import { Box, Button, Card, CardContent, Typography, Tabs, Tab, Grid, Paper, List, ListItem, ListItemText, CircularProgress, Tooltip, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Brush, School, Translate, Info, Help, Check, Close, Replay, Timer, EmojiEvents } from '@mui/icons-material';

type QuizMode = 'stroke' | 'compound' | 'meaning' | 'reading';
type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'all';

interface QuizState {
  mode: 'setup' | 'quiz' | 'result' | 'review';
  currentQuestion: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  userInput: string;
  strokes: StrokeData[];
  currentStroke: Point[];
  compoundWordProgress: { [word: string]: { attempts: number; successes: number } };
}

interface QuizSettings {
  mode: QuizMode;
  difficulty: QuizDifficulty;
  questionCount: number;
  useTimer: boolean;
  timeLimit: number;
  showHints: boolean;
  requireStrokeOrder: boolean;
}

interface StrokeValidationResult {
  isCorrect: boolean;
  accuracy: number;
  feedback: string[];
  suggestions: string[];
  expectedStroke: StrokeData;
  actualStroke: StrokeData;
}

interface CompoundWordExercise {
  type: 'reading' | 'meaning' | 'usage' | 'writing';
  question: string;
  answer: string;
  options?: string[];
  hints?: string[];
  context?: string;
  difficulty: number;
  relatedWords?: string[];
}

const QUIZ_SETTINGS: Record<QuizDifficulty, QuizSettings> = {
  easy: {
    mode: 'stroke',
    difficulty: 'easy',
    questionCount: 10,
    useTimer: true,
    timeLimit: 45,
    showHints: true,
    requireStrokeOrder: false
  },
  medium: {
    mode: 'compound',
    difficulty: 'medium',
    questionCount: 15,
    useTimer: true,
    timeLimit: 30,
    showHints: true,
    requireStrokeOrder: true
  },
  hard: {
    mode: 'compound',
    difficulty: 'hard',
    questionCount: 20,
    useTimer: true,
    timeLimit: 20,
    showHints: false,
    requireStrokeOrder: true
  },
  all: {
    mode: 'all',
    difficulty: 'all',
    questionCount: 0,
    useTimer: false,
    timeLimit: 0,
    showHints: false,
    requireStrokeOrder: false
  }
};

const KanjiQuiz: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { settings } = useApp();
  const { updateProgress, progress } = useProgress();
  const { checkAchievements } = useAchievements();
  const { playCorrect, playIncorrect } = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'setup',
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    showCorrect: false,
    userInput: '',
    strokes: [],
    currentStroke: [],
    compoundWordProgress: {}
  });
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(QUIZ_SETTINGS.medium);
  const [currentKanji, setCurrentKanji] = useState<KanjiStrokeData | null>(null);
  const [compoundWords, setCompoundWords] = useState<CompoundWordData[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStrokeGuide, setShowStrokeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [strokeValidationResult, setStrokeValidationResult] = useState<StrokeValidationResult | null>(null);
  const [strokeGuideOpacity, setStrokeGuideOpacity] = useState(0.3);
  const [currentExercise, setCurrentExercise] = useState<CompoundWordExercise | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<CompoundWordExercise[]>([]);
  const [learningContext, setLearningContext] = useState<string[]>([]);

  // Initialize canvas for stroke input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set up canvas styles
    ctx.strokeStyle = themeClasses.text.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [themeClasses]);

  // Handle stroke input
  const handleStrokeStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: Date.now()
    };

    setQuizState(prev => ({
      ...prev,
      currentStroke: [point]
    }));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handleStrokeMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (quizState.currentStroke.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: Date.now()
    };

    setQuizState(prev => ({
      ...prev,
      currentStroke: [...prev.currentStroke, point]
    }));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handleStrokeEnd = () => {
    if (quizState.currentStroke.length < 2) return;

    const strokeData = analyzeStroke(quizState.currentStroke);
    setQuizState(prev => ({
      ...prev,
      strokes: [...prev.strokes, strokeData],
      currentStroke: []
    }));

    // Validate stroke if in stroke mode
    if (quizSettings.mode === 'stroke' && currentKanji) {
      const expectedStroke = currentKanji.strokes[prev.strokes.length];
      const validationResult = validateStrokeEnhanced(strokeData, expectedStroke);
      setStrokeValidationResult(validationResult);
      
      if (validationResult.isCorrect) {
        playCorrect();
        setStreak(prev => prev + 1);
        // Gradually reduce stroke guide opacity as user improves
        setStrokeGuideOpacity(prev => Math.max(0.1, prev - 0.05));
      } else {
        playIncorrect();
        setStreak(0);
        // Increase stroke guide opacity when user makes mistakes
        setStrokeGuideOpacity(prev => Math.min(0.5, prev + 0.1));
      }

      // Show feedback
      setQuizState(prev => ({
        ...prev,
        showFeedback: true,
        isCorrect: validationResult.isCorrect
      }));

      // Check if kanji is complete
      if (prev.strokes.length + 1 === currentKanji.strokes.length) {
        const score = calculateStrokeOrderScore([...prev.strokes, strokeData], currentKanji.strokes);
        handleQuizComplete(score);
      }
    }
  };

  // Start quiz
  const startQuiz = () => {
    const settings = QUIZ_SETTINGS[quizSettings.difficulty];
    setQuizState({
      mode: 'quiz',
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      userInput: '',
      strokes: [],
      currentStroke: [],
      compoundWordProgress: {}
    });
    setScore(0);
    setStreak(0);
    setTimeLeft(settings.timeLimit);
    setShowStrokeGuide(false);

    // Load first question
    loadQuestion(0);
  };

  // Load question
  const loadQuestion = (index: number) => {
    // Get all available kanji
    let availableKanji = kanjiList;

    // Apply difficulty filter only if explicitly set
    if (quizSettings.difficulty !== 'all') {
      availableKanji = availableKanji.filter(k => {
        const progress = getKanjiProgress(k.character);
        const requiredLevel = quizSettings.difficulty === 'easy' ? 0 :
                             quizSettings.difficulty === 'medium' ? 1 : 2;
        return progress.masteryLevel >= requiredLevel;
      });
    }

    // If no kanji available after filtering, show all kanji
    if (availableKanji.length === 0) {
      availableKanji = kanjiList;
    }

    const kanji = availableKanji[index % availableKanji.length];
    setCurrentKanji({
      character: kanji.character,
      strokes: [], // We'll need to implement stroke order data separately
      compoundWords: kanji.examples?.map(e => ({
        word: e.word,
        reading: e.reading,
        meaning: e.meaning,
        kanji: [kanji.character],
        difficulty: calculateWordDifficulty(e),
        examples: [],
        relatedWords: []
      })) || [],
      difficulty: calculateKanjiDifficulty(kanji),
      radicals: kanji.radicals,
      meanings: [kanji.english], // Using english instead of meaning
      readings: {
        onyomi: kanji.onyomi,
        kunyomi: kanji.kunyomi
      }
    });

    // Generate compound words for practice
    if (quizSettings.mode === 'compound') {
      const words = generatePracticeSets(
        [{
          character: kanji.character,
          strokes: [], // We'll need to implement stroke order data separately
          compoundWords: kanji.examples?.map(e => ({
            word: e.word,
            reading: e.reading,
            meaning: e.meaning,
            kanji: [kanji.character],
            difficulty: calculateWordDifficulty(e),
            examples: [],
            relatedWords: []
          })) || [],
          difficulty: calculateKanjiDifficulty(kanji),
          radicals: kanji.radicals,
          meanings: [kanji.english], // Using english instead of meaning
          readings: {
            onyomi: kanji.onyomi,
            kunyomi: kanji.kunyomi
          }
        }],
        { [kanji.character]: getKanjiProgress(kanji.character).masteryLevel },
        DIFFICULTY_LEVELS[quizSettings.difficulty.toUpperCase()]
      );
      setCompoundWords(words);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    setQuizState(prev => ({ ...prev, mode: 'result' }));

    // Update progress
    if (currentKanji) {
      updateProgress('kanji', {
        kanji: currentKanji.character,
        score: finalScore,
        strokes: quizState.strokes,
        timestamp: Date.now()
      });

      // Check achievements
      checkAchievements('kanji', {
        character: currentKanji.character,
        score: finalScore,
        streak: streak,
        mode: quizSettings.mode
      });
    }
  };

  // Render quiz content based on mode
  const renderQuizContent = () => {
    if (!currentKanji) return null;

    switch (quizSettings.mode) {
      case 'stroke':
        return renderStrokeQuiz();
      case 'compound':
        return renderCompoundQuiz();
      case 'meaning':
        return renderMeaningQuiz();
      case 'reading':
        return renderReadingQuiz();
      default:
        return null;
    }
  };

  // Render stroke practice quiz
  const renderStrokeQuiz = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
          {currentKanji.character}
        </Typography>
        
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, height: 400 }}>
          <canvas
            ref={canvasRef}
            style={{
              border: `2px solid ${themeClasses.border}`,
              borderRadius: 8,
              touchAction: 'none'
            }}
            onMouseDown={handleStrokeStart}
            onMouseMove={handleStrokeMove}
            onMouseUp={handleStrokeEnd}
            onMouseLeave={handleStrokeEnd}
          />
          
          {showStrokeGuide && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                opacity: strokeGuideOpacity,
                transition: 'opacity 0.3s ease'
              }}
            >
              {/* Render stroke guide overlay with current stroke highlighted */}
              {currentKanji.strokes.map((stroke, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: index === quizState.strokes.length ? 1 : 0.3
                  }}
                >
                  {/* Render stroke guide SVG */}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowStrokeGuide(!showStrokeGuide)}
            startIcon={<Help />}
          >
            {showStrokeGuide ? 'Hide Guide' : 'Show Guide'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setQuizState(prev => ({ ...prev, strokes: [] }));
              setStrokeValidationResult(null);
            }}
            startIcon={<Replay />}
          >
            Clear
          </Button>
        </Box>

        {strokeValidationResult && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: strokeValidationResult.isCorrect ? 'success.light' : 'error.light',
                  color: 'white',
                  maxWidth: 400
                }}
              >
                <Typography>
                  {strokeValidationResult.isCorrect ? 'Correct stroke!' : 'Try again!'}
                </Typography>
                {!strokeValidationResult.isCorrect && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Accuracy: {Math.round(strokeValidationResult.accuracy * 100)}%
                    </Typography>
                    {strokeValidationResult.suggestions.map((suggestion, index) => (
                      <Typography key={index} variant="body2" sx={{ mt: 0.5 }}>
                        • {suggestion}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </motion.div>
          </AnimatePresence>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Progress</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {currentKanji.strokes.map((_, index) => (
              <Tooltip key={index} title={`Stroke ${index + 1}`}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: index < quizState.strokes.length
                      ? 'success.main'
                      : 'grey.300',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  // Render compound word quiz
  const renderCompoundQuiz = () => {
    if (!currentExercise) return null;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5">
          {currentExercise.question}
        </Typography>

        {currentExercise.context && (
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary">
              {currentExercise.context}
            </Typography>
          </Paper>
        )}

        {currentExercise.type === 'reading' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentExercise.options?.map((option, index) => (
              <Button
                key={index}
                variant={quizState.selectedAnswer === index ? 'contained' : 'outlined'}
                onClick={() => {
                  setQuizState(prev => ({ ...prev, selectedAnswer: index }));
                  const isCorrect = option === currentExercise.answer;
                  if (isCorrect) {
                    playCorrect();
                    setStreak(prev => prev + 1);
                  } else {
                    playIncorrect();
                    setStreak(0);
                  }
                  setQuizState(prev => ({
                    ...prev,
                    showFeedback: true,
                    isCorrect
                  }));
                }}
                disabled={quizState.showFeedback}
              >
                {option}
              </Button>
            ))}
          </Box>
        )}

        {quizState.showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: quizState.isCorrect ? 'success.light' : 'error.light',
                  color: 'white'
                }}
              >
                <Typography>
                  {quizState.isCorrect
                    ? 'Correct!'
                    : `Incorrect. The correct answer is: ${currentExercise.answer}`}
                </Typography>
                {!quizState.isCorrect && currentExercise.hints && (
                  <Box sx={{ mt: 1 }}>
                    {currentExercise.hints.map((hint, index) => (
                      <Typography key={index} variant="body2">
                        • {hint}
                      </Typography>
                    ))}
                  </Box>
                )}
                {currentExercise.relatedWords && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Related words: {currentExercise.relatedWords.join(', ')}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </AnimatePresence>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography>
            Question {quizState.currentQuestion + 1} of {compoundWords.length}
          </Typography>
          <Typography>
            Score: {score}
          </Typography>
        </Box>

        {quizState.showFeedback && (
          <Button
            variant="contained"
            onClick={() => {
              if (quizState.currentQuestion + 1 < compoundWords.length) {
                setQuizState(prev => ({
                  ...prev,
                  currentQuestion: prev.currentQuestion + 1,
                  selectedAnswer: null,
                  showFeedback: false,
                  isCorrect: null
                }));
                loadQuestion(quizState.currentQuestion + 1);
              } else {
                handleQuizComplete(score);
              }
            }}
          >
            {quizState.currentQuestion + 1 < compoundWords.length ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </Box>
    );
  };

  // Render meaning quiz
  const renderMeaningQuiz = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
          {currentKanji.character}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentKanji.meanings.map((meaning, index) => (
            <Button
              key={index}
              variant={quizState.selectedAnswer === index ? 'contained' : 'outlined'}
              onClick={() => {
                setQuizState(prev => ({ ...prev, selectedAnswer: index }));
                const isCorrect = meaning === currentKanji.meanings[0];
                if (isCorrect) {
                  playCorrect();
                  setStreak(prev => prev + 1);
                } else {
                  playIncorrect();
                  setStreak(0);
                }
                setQuizState(prev => ({
                  ...prev,
                  showFeedback: true,
                  isCorrect
                }));
              }}
              disabled={quizState.showFeedback}
            >
              {meaning}
            </Button>
          ))}
        </Box>

        {quizState.showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: quizState.isCorrect ? 'success.light' : 'error.light',
                  color: 'white'
                }}
              >
                <Typography>
                  {quizState.isCorrect
                    ? 'Correct!'
                    : `Incorrect. The correct meaning is: ${currentKanji.meanings[0]}`}
                </Typography>
              </Paper>
            </motion.div>
          </AnimatePresence>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography>
            Question {quizState.currentQuestion + 1} of {quizSettings.questionCount}
          </Typography>
          <Typography>
            Score: {score}
          </Typography>
        </Box>

        {quizState.showFeedback && (
          <Button
            variant="contained"
            onClick={() => {
              if (quizState.currentQuestion + 1 < quizSettings.questionCount) {
                setQuizState(prev => ({
                  ...prev,
                  currentQuestion: prev.currentQuestion + 1,
                  selectedAnswer: null,
                  showFeedback: false,
                  isCorrect: null
                }));
                loadQuestion(quizState.currentQuestion + 1);
              } else {
                handleQuizComplete(score);
              }
            }}
          >
            {quizState.currentQuestion + 1 < quizSettings.questionCount ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </Box>
    );
  };

  // Render reading quiz
  const renderReadingQuiz = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
          {currentKanji.character}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...currentKanji.readings.onyomi, ...currentKanji.readings.kunyomi].map((reading, index) => (
            <Button
              key={index}
              variant={quizState.selectedAnswer === index ? 'contained' : 'outlined'}
              onClick={() => {
                setQuizState(prev => ({ ...prev, selectedAnswer: index }));
                const isCorrect = reading === currentKanji.readings.onyomi[0];
                if (isCorrect) {
                  playCorrect();
                  setStreak(prev => prev + 1);
                } else {
                  playIncorrect();
                  setStreak(0);
                }
                setQuizState(prev => ({
                  ...prev,
                  showFeedback: true,
                  isCorrect
                }));
              }}
              disabled={quizState.showFeedback}
            >
              {reading}
            </Button>
          ))}
        </Box>

        {quizState.showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: quizState.isCorrect ? 'success.light' : 'error.light',
                  color: 'white'
                }}
              >
                <Typography>
                  {quizState.isCorrect
                    ? 'Correct!'
                    : `Incorrect. The correct reading is: ${currentKanji.readings.onyomi[0]}`}
                </Typography>
              </Paper>
            </motion.div>
          </AnimatePresence>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography>
            Question {quizState.currentQuestion + 1} of {quizSettings.questionCount}
          </Typography>
          <Typography>
            Score: {score}
          </Typography>
        </Box>

        {quizState.showFeedback && (
          <Button
            variant="contained"
            onClick={() => {
              if (quizState.currentQuestion + 1 < quizSettings.questionCount) {
                setQuizState(prev => ({
                  ...prev,
                  currentQuestion: prev.currentQuestion + 1,
                  selectedAnswer: null,
                  showFeedback: false,
                  isCorrect: null
                }));
                loadQuestion(quizState.currentQuestion + 1);
              } else {
                handleQuizComplete(score);
              }
            }}
          >
            {quizState.currentQuestion + 1 < quizSettings.questionCount ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </Box>
    );
  };

  // Render quiz setup
  const renderQuizSetup = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5">Quiz Settings</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Brush />} label="Stroke Practice" />
            <Tab icon={<School />} label="Compound Words" />
            <Tab icon={<Translate />} label="Meaning Quiz" />
            <Tab icon={<Info />} label="Reading Quiz" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Practice writing kanji with stroke order validation</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'stroke' }));
                    startQuiz();
                  }}
                >
                  Start Stroke Practice
                </Button>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Practice compound words using the kanji</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'compound' }));
                    startQuiz();
                  }}
                >
                  Start Compound Word Practice
                </Button>
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Test your knowledge of kanji meanings</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'meaning' }));
                    startQuiz();
                  }}
                >
                  Start Meaning Quiz
                </Button>
              </Box>
            )}

            {activeTab === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Test your knowledge of kanji readings</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'reading' }));
                    startQuiz();
                  }}
                >
                  Start Reading Quiz
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // Render quiz result
  const renderQuizResult = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Typography variant="h4">
          Quiz Complete!
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">
            Final Score: {score}
          </Typography>
          <Typography>
            {score >= 90 ? 'Excellent! 🌟' :
             score >= 80 ? 'Great job! 🎯' :
             score >= 70 ? 'Good work! 👍' :
             'Keep practicing! 💪'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setQuizState(prev => ({ ...prev, mode: 'setup' }))}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // Navigate to progress page or show detailed results
            }}
          >
            View Progress
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          {quizState.mode === 'setup' && renderQuizSetup()}
          {quizState.mode === 'quiz' && renderQuizContent()}
          {quizState.mode === 'result' && renderQuizResult()}
        </CardContent>
      </Card>
    </Box>
  );
};

// Helper functions
const calculateKanjiDifficulty = (kanji: Kanji): number => {
  // Calculate difficulty based on stroke count, frequency, and JLPT level
  const strokeCount = kanji.strokeOrder.length;
  const jlptLevel = kanji.jlptLevel === 'N5' ? 1 :
                   kanji.jlptLevel === 'N4' ? 2 :
                   kanji.jlptLevel === 'N3' ? 3 :
                   kanji.jlptLevel === 'N2' ? 4 : 5;
  
  return (strokeCount * 0.3) + (jlptLevel * 0.7);
};

const calculateWordDifficulty = (example: { word: string; reading: string; meaning: string }): number => {
  // Calculate difficulty based on word length, kanji count, and reading complexity
  const kanjiCount = (example.word.match(/[\u4E00-\u9FAF]/g) || []).length;
  const readingLength = example.reading.length;
  
  return (kanjiCount * 0.4) + (readingLength * 0.2) + (example.meaning.split(' ').length * 0.4);
};

const getKanjiProgress = (character: string) => {
  const key = `kanji-${character}`;
  const progressData = progress[key];
  
  if (!progressData) {
    return {
      masteryLevel: 0,
      lastPracticed: 0,
      practiceHistory: [],
      compoundWordProgress: {},
      strokeOrderProgress: {
        correctStrokes: 0,
        totalStrokes: 0,
        lastScore: 0
      }
    };
  }

  // Calculate mastery level based on correct answers and streak
  const masteryLevel = progressData.correct >= 5 ? 2 :
                      progressData.correct >= 3 ? 1 :
                      progressData.correct >= 1 ? 0.5 : 0;

  return {
    masteryLevel,
    lastPracticed: progressData.lastAttempted || 0,
    practiceHistory: progressData.history || [],
    compoundWordProgress: progressData.compoundWordProgress || {},
    strokeOrderProgress: progressData.strokeOrderProgress || {
      correctStrokes: 0,
      totalStrokes: 0,
      lastScore: 0
    }
  };
};

// Enhance stroke validation
const validateStrokeEnhanced = (stroke: StrokeData, expectedStroke: StrokeData): StrokeValidationResult => {
  const basicValidation = validateStroke(stroke, expectedStroke);
  const accuracy = calculateStrokeAccuracy(stroke, expectedStroke);
  const suggestions = generateStrokeSuggestions(stroke, expectedStroke);
  
  return {
    ...basicValidation,
    accuracy,
    suggestions,
    expectedStroke,
    actualStroke: stroke
  };
};

// Add new helper functions for stroke validation
const calculateStrokeAccuracy = (stroke: StrokeData, expectedStroke: StrokeData): number => {
  const directionMatch = Math.abs(stroke.direction - expectedStroke.direction) < 0.2;
  const lengthMatch = Math.abs(stroke.length - expectedStroke.length) / expectedStroke.length < 0.3;
  const typeMatch = stroke.type === expectedStroke.type;
  
  let accuracy = 0;
  if (directionMatch) accuracy += 0.4;
  if (lengthMatch) accuracy += 0.3;
  if (typeMatch) accuracy += 0.3;
  
  return accuracy;
};

const generateStrokeSuggestions = (stroke: StrokeData, expectedStroke: StrokeData): string[] => {
  const suggestions: string[] = [];
  
  if (Math.abs(stroke.direction - expectedStroke.direction) >= 0.2) {
    suggestions.push(`Try to draw the stroke more ${stroke.direction > expectedStroke.direction ? 'horizontally' : 'vertically'}`);
  }
  
  if (Math.abs(stroke.length - expectedStroke.length) / expectedStroke.length >= 0.3) {
    suggestions.push(`The stroke should be ${stroke.length > expectedStroke.length ? 'shorter' : 'longer'}`);
  }
  
  if (stroke.type !== expectedStroke.type) {
    suggestions.push(`This should be a ${expectedStroke.type} stroke`);
  }
  
  return suggestions;
};

// Enhance compound word practice
const generateEnhancedExercises = (word: CompoundWordData, kanji: KanjiStrokeData): CompoundWordExercise[] => {
  const exercises: CompoundWordExercise[] = [];
  
  // Reading exercise
  exercises.push({
    type: 'reading',
    question: `How do you read this word: ${word.word}?`,
    answer: word.reading,
    options: generateReadingOptions(word, kanji),
    hints: [`The word contains the kanji ${kanji.character}`, `It's a ${word.difficulty < 2 ? 'common' : 'less common'} word`],
    difficulty: word.difficulty,
    context: `This word appears in: ${word.examples[0]?.sentence || 'common usage'}`
  });
  
  // Meaning exercise
  exercises.push({
    type: 'meaning',
    question: `What does ${word.word} (${word.reading}) mean?`,
    answer: word.meaning,
    options: generateMeaningOptions(word),
    hints: [`The word is related to ${word.relatedWords?.[0] || 'common concepts'}`],
    difficulty: word.difficulty,
    context: `Usage example: ${word.examples[0]?.sentence || 'common in daily conversation'}`
  });
  
  // Usage exercise
  if (word.examples.length > 0) {
    exercises.push({
      type: 'usage',
      question: `Complete the sentence: ${word.examples[0].sentence.replace(word.word, '_____')}`,
      answer: word.word,
      options: [word.word, ...word.relatedWords?.slice(0, 3) || []],
      hints: [`The word is used to express ${word.meaning}`],
      difficulty: word.difficulty + 0.5,
      context: `This is a ${word.examples[0].context || 'common'} usage of the word`
    });
  }
  
  return exercises;
};

export default KanjiQuiz; 