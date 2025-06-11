import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Paper,
  Divider,
  Switch,
  FormGroup,
  Checkbox,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Refresh as RefreshIcon,
  SkipNext as SkipNextIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  MenuBook as MenuBookIcon,
  Translate as TranslateIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useDictionary } from '../../context/DictionaryContext';
import { useLearning } from '../../context/LearningContext';
import { useAudio } from '../../context/AudioContext';
import { DictionaryItem } from '../../types/dictionary';
import { QuizState, QuizMode, Difficulty } from '../../types/quiz';
import { useTheme } from '../../context/ThemeContext';
import { useProgress } from '../../context/ProgressContext';

// Language settings type
type LanguageSettings = {
  showJapanese: boolean;
  showRomaji: boolean;
  showEnglish: boolean;
};

// Quiz modes
const QUIZ_MODES = [
  { value: 'japanese-to-english', label: 'Japanese → English', requires: { japanese: true, english: true } },
  { value: 'english-to-japanese', label: 'English → Japanese', requires: { japanese: true, english: true } },
  { value: 'romaji-to-japanese', label: 'Romaji → Japanese', requires: { japanese: true, romaji: true } },
  { value: 'japanese-to-romaji', label: 'Japanese → Romaji', requires: { japanese: true, romaji: true } },
  { value: 'listening', label: 'Listening Practice', requires: { japanese: true, romaji: true } },
  { value: 'examples', label: 'Example Usage', requires: { japanese: true, english: true } },
] as const;

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy (N5-N4)', maxLevel: 4 },
  { value: 'medium', label: 'Medium (N3-N2)', maxLevel: 6 },
  { value: 'hard', label: 'Hard (N1)', maxLevel: 7 },
  { value: 'expert', label: 'Expert (All Levels)', maxLevel: 10 },
] as const;

const QUESTIONS_PER_QUIZ = 10;

const QuizPage: React.FC = () => {
  const { words, isLoading: isDictionaryLoading, error: dictionaryError } = useDictionary();
  const { updateProgress } = useLearning();
  const { playAudio } = useAudio();
  const { theme } = useTheme();
  const { progress, updateWordProgress, trackQuizCompletion, updateStreak } = useProgress();
  
  // Separate state for mode to prevent infinite loop
  const [currentMode, setCurrentMode] = useState<QuizMode>('japanese-to-english');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    showJapanese: true,
    showRomaji: true,
    showEnglish: true,
  });

  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'japanese-to-english',
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    showCorrect: false,
    currentWord: null,
    questions: [],
    score: 0,
    totalQuestions: QUESTIONS_PER_QUIZ,
    completed: false,
    markedForReview: new Set(),
    skippedQuestions: new Set(),
    mistakes: [],
    practiceMode: false,
    wordStats: {},
    showExamples: true,
    pronunciationPractice: null,
    currentComparison: null,
  });

  // Add ref to track if quiz has been initialized
  const quizInitializedRef = useRef(false);

  // Add state for showRomajiAnswers
  const [showRomajiAnswers, setShowRomajiAnswers] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log('[QuizPage] Dictionary state:', {
      wordsCount: words?.length || 0,
      isLoading: isDictionaryLoading,
      error: dictionaryError
    });
  }, [words, isDictionaryLoading, dictionaryError]);

  // Validate quiz mode based on language settings
  const validateQuizMode = useCallback((mode: QuizMode) => {
    const modeConfig = QUIZ_MODES.find(m => m.value === mode);
    if (!modeConfig) return false;

    const { requires } = modeConfig;
    return (
      (!requires.japanese || languageSettings.showJapanese) &&
      (!requires.romaji || languageSettings.showRomaji) &&
      (!requires.english || languageSettings.showEnglish)
    );
  }, [languageSettings]);

  // Update quiz mode if current mode becomes invalid
  useEffect(() => {
    if (!validateQuizMode(quizState.mode)) {
      // Find first valid mode
      const validMode = QUIZ_MODES.find(mode => validateQuizMode(mode.value));
      if (validMode) {
        setQuizState(prev => ({ ...prev, mode: validMode.value }));
      }
    }
  }, [languageSettings, validateQuizMode]);

  // Play audio for quiz start
  const playQuizStartAudio = () => {
    playAudio('クイズを始めましょう！');
  };

  // Play audio for question skip
  const playSkipAudio = () => {
    playAudio('スキップしました');
  };

  // Play audio for next question
  const playNextQuestionAudio = () => {
    playAudio('次の問題');
  };

  // Generate quiz questions based on selected mode and difficulty
  const generateQuiz = useCallback(() => {
    console.log('[QuizPage] Generating quiz with mode:', currentMode);
    
    // Safety check to ensure words array exists and has items
    if (!words || !Array.isArray(words) || words.length === 0) {
      console.warn('[QuizPage] Words array is undefined, empty, or not an array');
      setError('No words available for quiz. Please try again later.');
      setIsLoading(false);
      return;
    }

    const maxLevel = DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.maxLevel || 4;
    
    // Filter words based on mode and difficulty
    let filteredWords = words.filter(word => {
      // Basic level filter
      const levelMatch = word.level <= maxLevel;
      
      // Mode-specific filters
      switch (currentMode) {
        case 'listening':
          return levelMatch && word.audioUrl; // Only include words with audio
        case 'examples':
          return levelMatch && word.examples && Array.isArray(word.examples) && word.examples.length > 0; // Only include words with examples
        case 'romaji-to-japanese':
          return levelMatch && word.romaji; // Only include words with romaji
        default:
          return levelMatch;
      }
    });
    
    if (filteredWords.length < QUESTIONS_PER_QUIZ) {
      setError(`Not enough words available for ${currentMode} mode at ${difficulty} difficulty. Try a different mode or difficulty.`);
      setIsLoading(false);
      return;
    }

    // Shuffle and select questions
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, QUESTIONS_PER_QUIZ);

    setQuizState(prev => ({
      ...prev,
      mode: currentMode,
      questions: selectedWords,
      currentQuestion: 0,
      currentWord: selectedWords[0],
      score: 0,
      completed: false,
      markedForReview: new Set(),
      skippedQuestions: new Set(),
      mistakes: [],
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
    }));
    setIsLoading(false);
    
    // Play quiz start audio
    playQuizStartAudio();
  }, [words, difficulty, currentMode, playAudio]);

  // Initialize quiz only once when dictionary loads
  useEffect(() => {
    if (!isDictionaryLoading && !quizInitializedRef.current) {
      generateQuiz();
      quizInitializedRef.current = true;
    }
  }, [isDictionaryLoading, generateQuiz]);

  // Reset quiz when mode or difficulty changes
  useEffect(() => {
    if (!isDictionaryLoading) {
      quizInitializedRef.current = false;
      generateQuiz();
      quizInitializedRef.current = true;
    }
  }, [currentMode, difficulty]);

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (quizState.isAnswered) return;

    const isCorrect = selectedAnswer === quizState.currentWord?.correctAnswer;
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;
    const newTotalAnswered = quizState.totalAnswered + 1;

    // Update progress for the current word
    if (quizState.currentWord) {
      const wordId = quizState.currentWord.id || quizState.currentWord.japanese;
      updateWordProgress(wordId, {
        lastReviewed: Date.now(),
        reviewCount: (progress.words[wordId]?.reviewCount || 0) + 1,
        lastAnswerCorrect: isCorrect,
        correctAnswers: (progress.words[wordId]?.correctAnswers || 0) + (isCorrect ? 1 : 0),
        incorrectAnswers: (progress.words[wordId]?.incorrectAnswers || 0) + (isCorrect ? 0 : 1),
        consecutiveCorrect: isCorrect ? 
          (progress.words[wordId]?.consecutiveCorrect || 0) + 1 : 0,
        masteryLevel: Math.min(5, Math.max(0, 
          ((progress.words[wordId]?.correctAnswers || 0) + (isCorrect ? 1 : 0)) / 
          ((progress.words[wordId]?.correctAnswers || 0) + (progress.words[wordId]?.incorrectAnswers || 0) + 1) * 5
        ))
      });
    }

    setQuizState(prev => ({
      ...prev,
      isAnswered: true,
      selectedAnswer,
      score: newScore,
      totalAnswered: newTotalAnswered,
      isCorrect
    }));

    // Auto-advance after a delay
    setTimeout(() => {
      if (newTotalAnswered < quizState.totalQuestions) {
        nextQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  // Handle next question
  const handleNext = () => {
    if (quizState.currentQuestion < quizState.totalQuestions - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        currentWord: prev.questions[prev.currentQuestion + 1],
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
        showCorrect: false,
      }));
      
      // Play next question audio
      playNextQuestionAudio();
    } else {
      setQuizState(prev => ({
        ...prev,
        completed: true,
      }));
    }
  };

  // Handle skip question
  const handleSkip = () => {
    setQuizState(prev => ({
      ...prev,
      skippedQuestions: new Set([...prev.skippedQuestions, prev.currentQuestion]),
    }));
    handleNext();
    playSkipAudio();
  };

  // Handle mark for review
  const handleMarkForReview = () => {
    setQuizState(prev => ({
      ...prev,
      markedForReview: new Set([...prev.markedForReview, prev.currentQuestion]),
    }));
  };

  // Play audio for current word
  const handlePlayAudio = () => {
    const currentWord = quizState.currentWord;
    if (!currentWord) return;

    let textToPlay = '';

    // Determine what audio to play based on quiz mode
    switch (currentMode) {
      case 'japanese-to-english':
        // Play the Japanese word being asked about
        textToPlay = currentWord.japanese;
        break;
      case 'english-to-japanese':
        // Play the English word being asked about
        textToPlay = currentWord.english;
        break;
      case 'romaji-to-japanese':
        // Play the romaji being asked about
        textToPlay = currentWord.romaji;
        break;
      case 'japanese-to-romaji':
        // Play the Japanese word being asked about
        textToPlay = currentWord.japanese;
        break;
      case 'listening':
        // Play the Japanese word for listening practice
        textToPlay = currentWord.japanese;
        break;
      case 'examples':
        // Play the example sentence
        textToPlay = currentWord.examples?.[0]?.example || currentWord.japanese;
        break;
      default:
        // Fallback to Japanese word
        textToPlay = currentWord.japanese;
        break;
    }

    if (textToPlay) {
      // Try to play the word audio first if available
      if (currentWord.audioUrl) {
        playAudio(currentWord.audioUrl);
      } else {
        // Fallback to TTS
        playAudio(textToPlay);
      }
    }
  };

  // Play audio for quiz completion only once
  useEffect(() => {
    if (quizState.completed) {
      playQuizCompletionAudio(quizState.score, quizState.totalQuestions);
    }
  }, [quizState.completed, quizState.score, quizState.totalQuestions]);

  // Play audio for quiz completion
  const playQuizCompletionAudio = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) {
      playAudio('素晴らしい！');
    } else if (percentage >= 60) {
      playAudio('よくできました！');
    } else {
      playAudio('もう一度頑張りましょう');
    }
  };

  // Render question based on quiz mode
  const renderQuestion = () => {
    const currentWord = quizState.currentWord;
    if (!currentWord) return null;

    const renderLanguageContent = (content: string, type: keyof LanguageSettings) => {
      if (!languageSettings[type]) return null;
      return (
        <Typography 
          variant={type === 'showJapanese' ? 'h4' : 'subtitle1'} 
          color={type === 'showJapanese' ? 'textPrimary' : 'textSecondary'} 
          gutterBottom
        >
          {content}
        </Typography>
      );
    };

    const renderAudioButton = () => (
      <Tooltip title="Play pronunciation">
        <IconButton 
          onClick={handlePlayAudio} 
          size="large"
          color="primary"
          sx={{ mb: 2 }}
        >
          <VolumeUpIcon />
        </IconButton>
      </Tooltip>
    );

    switch (currentMode) {
      case 'japanese-to-english':
        return (
          <Box>
            {renderLanguageContent(currentWord.japanese, 'showJapanese')}
            {renderLanguageContent(currentWord.romaji, 'showRomaji')}
            {renderAudioButton()}
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Translate to English
            </Typography>
          </Box>
        );
      case 'english-to-japanese':
        return (
          <Box>
            {renderLanguageContent(currentWord.english, 'showEnglish')}
            {renderLanguageContent(currentWord.romaji, 'showRomaji')}
            {renderAudioButton()}
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Translate to Japanese
            </Typography>
          </Box>
        );
      case 'romaji-to-japanese':
        return (
          <Box>
            {renderLanguageContent(currentWord.romaji, 'showRomaji')}
            {renderLanguageContent(currentWord.english, 'showEnglish')}
            {renderAudioButton()}
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Type the Japanese word
            </Typography>
          </Box>
        );
      case 'japanese-to-romaji':
        return (
          <Box>
            {renderLanguageContent(currentWord.japanese, 'showJapanese')}
            {renderLanguageContent(currentWord.english, 'showEnglish')}
            {renderAudioButton()}
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Type the romaji
            </Typography>
          </Box>
        );
      case 'listening':
        return (
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Listen to the pronunciation:
            </Typography>
            {renderAudioButton()}
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              What word did you hear?
            </Typography>
            {renderLanguageContent(currentWord.romaji, 'showRomaji')}
            {renderLanguageContent(currentWord.english, 'showEnglish')}
          </Box>
        );
      case 'examples':
        return (
          <Box>
            {renderLanguageContent(currentWord.examples?.[0]?.example || 'No example available', 'showJapanese')}
            {renderLanguageContent(currentWord.examples?.[0]?.context || '', 'showRomaji')}
            {renderAudioButton()}
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Translate the example
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  // Generate answer options
  const generateOptions = () => {
    const currentWord = quizState.currentWord;
    if (!currentWord) return [];

    // Safety check to ensure words array exists and has items
    if (!words || !Array.isArray(words) || words.length === 0) {
      console.warn('[QuizPage] Words array is undefined, empty, or not an array in generateOptions');
      return ['No options available'];
    }

    const allWords = [...words];
    const options = new Set<string>();
    
    // Add correct answer based on mode and language settings
    switch (currentMode) {
      case 'japanese-to-english':
        if (languageSettings.showEnglish) {
          options.add(currentWord.english);
        }
        break;
      case 'english-to-japanese':
        if (languageSettings.showJapanese) {
          options.add(currentWord.japanese);
        }
        break;
      case 'romaji-to-japanese':
        if (languageSettings.showJapanese) {
          options.add(currentWord.japanese);
        }
        break;
      case 'japanese-to-romaji':
        if (languageSettings.showRomaji) {
          options.add(currentWord.romaji);
        }
        break;
      case 'listening':
        if (languageSettings.showJapanese) {
          options.add(currentWord.japanese);
        }
        break;
      case 'examples':
        const correctTranslation = currentWord.examples?.[0]?.translation;
        if (correctTranslation && languageSettings.showEnglish) {
          options.add(correctTranslation);
        }
        break;
    }

    // Add random options based on enabled languages
    while (options.size < 4) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      if (!randomWord) continue; // Skip if randomWord is undefined
      
      let option = '';
      
      switch (currentMode) {
        case 'japanese-to-english':
          if (languageSettings.showEnglish) {
            option = randomWord.english;
          }
          break;
        case 'english-to-japanese':
          if (languageSettings.showJapanese) {
            option = randomWord.japanese;
          }
          break;
        case 'romaji-to-japanese':
          if (languageSettings.showJapanese) {
            option = randomWord.japanese;
          }
          break;
        case 'japanese-to-romaji':
          if (languageSettings.showRomaji) {
            option = randomWord.romaji;
          }
          break;
        case 'listening':
          if (languageSettings.showJapanese) {
            option = randomWord.japanese;
          }
          break;
        case 'examples':
          if (languageSettings.showEnglish) {
            option = randomWord.examples?.[0]?.translation || '';
          }
          break;
      }

      // Only add valid options
      if (option && !options.has(option)) {
        options.add(option);
      }
    }

    // If we don't have enough options due to language settings, add some fallback options
    if (options.size < 4) {
      const fallbackOptions = [
        'Not enough options available',
        'Please enable more languages',
        'Try different settings',
        'Adjust language preferences'
      ];
      
      while (options.size < 4) {
        const fallback = fallbackOptions[options.size];
        if (fallback) options.add(fallback);
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const finishQuiz = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - quizState.startTime) / 1000); // in seconds
    const score = quizState.score;
    const totalQuestions = quizState.totalQuestions;
    const accuracy = score / totalQuestions;

    // Track quiz completion
    trackQuizCompletion({
      quizType: currentMode,
      score: accuracy,
      totalQuestions,
      timeSpent,
      wordsUsed: quizState.usedWords.map(word => word.id || word.japanese),
      category: selectedCategory || 'general'
    });

    // Update streak
    updateStreak();

    setQuizState(prev => ({
      ...prev,
      isFinished: true,
      endTime,
      timeSpent,
      accuracy
    }));
  };

  // Loading state
  if (isLoading || isDictionaryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {isDictionaryLoading ? 'Loading dictionary...' : 'Preparing quiz...'}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error || dictionaryError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || dictionaryError || 'An error occurred while loading the quiz.'}
        </Alert>
        <Button variant="contained" onClick={generateQuiz}>
          Try Again
        </Button>
      </Container>
    );
  }

  // Quiz completed state
  if (quizState.completed) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Quiz Completed!
            </Typography>
            <Typography variant="h5" gutterBottom>
              Score: {quizState.score} / {quizState.totalQuestions}
            </Typography>
            {quizState.mistakes.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Words to Review:
                </Typography>
                <Stack spacing={2}>
                  {quizState.mistakes.map((mistake, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Typography variant="subtitle1">
                        {mistake.word.japanese} ({mistake.word.romaji})
                      </Typography>
                      <Typography color="textSecondary">
                        Correct: {mistake.word.english}
                      </Typography>
                      <Typography color="error">
                        Your answer: {mistake.userAnswer}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateQuiz}
                startIcon={<RefreshIcon />}
              >
                Start New Quiz
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Main quiz interface
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                {/* Language Settings */}
                <Box>
                  <Typography variant="h6" gutterBottom>Language Settings</Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      mb: 3,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Display Languages:
                      </Typography>
                      <Tooltip title="Japanese (日本語)">
                        <IconButton
                          onClick={() => setLanguageSettings(prev => ({
                            ...prev,
                            showJapanese: !prev.showJapanese
                          }))}
                          color={languageSettings.showJapanese ? 'primary' : 'default'}
                          sx={{ 
                            bgcolor: languageSettings.showJapanese ? 'primary.light' : 'transparent',
                            '&:hover': {
                              bgcolor: languageSettings.showJapanese ? 'primary.light' : 'action.hover'
                            }
                          }}
                        >
                          <MenuBookIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Romaji (ローマ字)">
                        <IconButton
                          onClick={() => setLanguageSettings(prev => ({
                            ...prev,
                            showRomaji: !prev.showRomaji
                          }))}
                          color={languageSettings.showRomaji ? 'primary' : 'default'}
                          sx={{ 
                            bgcolor: languageSettings.showRomaji ? 'primary.light' : 'transparent',
                            '&:hover': {
                              bgcolor: languageSettings.showRomaji ? 'primary.light' : 'action.hover'
                            }
                          }}
                        >
                          <TranslateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="English">
                        <IconButton
                          onClick={() => setLanguageSettings(prev => ({
                            ...prev,
                            showEnglish: !prev.showEnglish
                          }))}
                          color={languageSettings.showEnglish ? 'primary' : 'default'}
                          sx={{ 
                            bgcolor: languageSettings.showEnglish ? 'primary.light' : 'transparent',
                            '&:hover': {
                              bgcolor: languageSettings.showEnglish ? 'primary.light' : 'action.hover'
                            }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Toggle languages to display. At least one language must be active for quiz modes to work properly.
                    </Typography>
                  </Paper>
                </Box>

                {/* Quiz Mode and Difficulty */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <FormControl sx={{ minWidth: 200 }}>
                    <FormLabel>Quiz Mode</FormLabel>
                    <Select
                      value={currentMode}
                      onChange={(e) => {
                        const newMode = e.target.value as QuizMode;
                        if (validateQuizMode(newMode)) {
                          setCurrentMode(newMode);
                        }
                      }}
                    >
                      {QUIZ_MODES.map(mode => (
                        <MenuItem 
                          key={mode.value} 
                          value={mode.value}
                          disabled={!validateQuizMode(mode.value)}
                        >
                          {mode.label}
                          {!validateQuizMode(mode.value) && ' (Disabled)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 200 }}>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    >
                      {DIFFICULTY_LEVELS.map(level => (
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Question {quizState.currentQuestion + 1} of {quizState.totalQuestions}
                  </Typography>
                  <Typography variant="h6">
                    Score: {quizState.score}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box textAlign="center" my={4}>
                  {renderQuestion()}
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showRomajiAnswers}
                      onChange={e => setShowRomajiAnswers(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show romaji under answer options"
                  sx={{ mb: 2 }}
                />

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={quizState.selectedAnswer || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                  >
                    {generateOptions().map((option, index) => {
                      const isCorrectAnswer = (() => {
                        switch (currentMode) {
                          case 'japanese-to-english':
                            return option === quizState.currentWord?.english;
                          case 'english-to-japanese':
                            return option === quizState.currentWord?.japanese;
                          case 'romaji-to-japanese':
                            return option === quizState.currentWord?.japanese;
                          case 'japanese-to-romaji':
                            return option === quizState.currentWord?.romaji;
                          case 'listening':
                            return option === quizState.currentWord?.japanese;
                          case 'examples':
                            return option === quizState.currentWord?.examples?.[0]?.translation;
                          default:
                            return false;
                        }
                      })();

                      const isSelectedAnswer = option === quizState.selectedAnswer;
                      const showFeedback = quizState.showFeedback;

                      let background = 'transparent';
                      if (showFeedback) {
                        if (isCorrectAnswer) {
                          background = 'success.light';
                        } else if (isSelectedAnswer) {
                          background = 'error.light';
                        }
                      }

                      // Find the romaji for this option if available
                      let optionRomaji: string | undefined = undefined;
                      if (showRomajiAnswers && quizState.currentWord) {
                        // Try to find the word in the dictionary
                        const wordObj = words.find(w =>
                          w.english === option ||
                          w.japanese === option ||
                          w.romaji === option ||
                          (w.examples && w.examples.some(ex => ex.translation === option))
                        );
                        if (wordObj) {
                          optionRomaji = wordObj.romaji;
                        } else if (/^[a-zA-Z\s]+$/.test(option)) {
                          // If the option is already romaji or English, just show it
                          optionRomaji = option;
                        }
                      }

                      return (
                        <Box key={index}>
                          <FormControlLabel
                            value={option}
                            control={<Radio />}
                            label={option}
                            disabled={showFeedback}
                            sx={{
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: background,
                              '&:hover': {
                                bgcolor: background !== 'transparent' ? background : 'action.hover',
                              },
                            }}
                          />
                          {showRomajiAnswers && optionRomaji && (
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 5, mb: 1 }}>
                              {optionRomaji}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </RadioGroup>
                </FormControl>

                {quizState.showFeedback && (
                  <Box mt={2} textAlign="center">
                    {quizState.isCorrect ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Correct!
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Incorrect. The correct answer is: {quizState.currentWord?.english}
                      </Alert>
                    )}
                  </Box>
                )}

                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Box>
                    <Tooltip title="Skip Question">
                      <IconButton onClick={handleSkip} disabled={quizState.showFeedback}>
                        <SkipNextIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark for Review">
                      <IconButton
                        onClick={handleMarkForReview}
                        color={quizState.markedForReview.has(quizState.currentQuestion) ? 'primary' : 'default'}
                      >
                        <FlagIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!quizState.showFeedback}
                  >
                    {quizState.currentQuestion < quizState.totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuizPage; 