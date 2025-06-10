import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  Refresh as RefreshIcon,
  SkipNext as SkipNextIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useDictionary } from '../../context/DictionaryContext';
import { useLearning } from '../../context/LearningContext';
import { useAudio } from '../../context/AudioContext';
import { DictionaryItem } from '../../types/dictionary';
import { QuizState, QuizMode, Difficulty } from '../../types/quiz';
import { useTheme } from '../../context/ThemeContext';

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
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRomajiQuestion, setShowRomajiQuestion] = useState(false);
  const [showRomajiAnswers, setShowRomajiAnswers] = useState(false);
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    showJapanese: true,
    showRomaji: true,
    showEnglish: true,
  });

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
    playAudio('クイズを始めましょう！', 'word', 'happy');
  };

  // Play audio for question skip
  const playSkipAudio = () => {
    playAudio('スキップしました', 'word', 'neutral');
  };

  // Play audio for next question
  const playNextQuestionAudio = () => {
    playAudio('次の問題', 'word', 'neutral');
  };

  // Generate quiz questions based on selected mode and difficulty
  const generateQuiz = useCallback(() => {
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
      switch (quizState.mode) {
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
      setError(`Not enough words available for ${quizState.mode} mode at ${difficulty} difficulty. Try a different mode or difficulty.`);
      setIsLoading(false);
      return;
    }

    // Shuffle and select questions
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, QUESTIONS_PER_QUIZ);

    setQuizState(prev => ({
      ...prev,
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
  }, [words, difficulty, quizState.mode, playQuizStartAudio]);

  // Initialize quiz
  useEffect(() => {
    if (!isDictionaryLoading) {
      generateQuiz();
    }
  }, [isDictionaryLoading, generateQuiz]);

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (quizState.showFeedback) return;

    const currentWord = quizState.currentWord;
    if (!currentWord) return;

    let isCorrect = false;
    switch (quizState.mode) {
      case 'japanese-to-english':
        isCorrect = answer === currentWord.english;
        break;
      case 'english-to-japanese':
        isCorrect = answer === currentWord.japanese;
        break;
      case 'romaji-to-japanese':
        isCorrect = answer === currentWord.japanese;
        break;
      case 'japanese-to-romaji':
        isCorrect = answer === currentWord.romaji;
        break;
      case 'listening':
        isCorrect = answer === currentWord.japanese;
        break;
      case 'examples':
        isCorrect = answer === currentWord.examples?.[0]?.translation;
        break;
    }

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showFeedback: true,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      mistakes: isCorrect ? prev.mistakes : [...prev.mistakes, { word: currentWord, userAnswer: answer }],
    }));

    // Update learning progress
    updateProgress(currentWord.id, isCorrect);

    // Play audio feedback for correct/incorrect answers
    playAnswerFeedback(isCorrect);
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
    if (currentWord) {
      // Try to play the word audio first
      if (currentWord.audioUrl) {
        playAudio(currentWord.audioUrl, 'word', 'neutral');
      } else if (currentWord.japanese) {
        // Fallback to TTS if no audio file
        playAudio(currentWord.japanese, 'word', 'neutral');
      }
    }
  };

  // Play audio feedback for correct/incorrect answers
  const playAnswerFeedback = (isCorrect: boolean) => {
    if (isCorrect) {
      playAudio('正解です！', 'word', 'happy');
    } else {
      playAudio('不正解です', 'word', 'neutral');
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
      playAudio('素晴らしい！', 'word', 'happy');
    } else if (percentage >= 60) {
      playAudio('よくできました！', 'word', 'happy');
    } else {
      playAudio('もう一度頑張りましょう', 'word', 'neutral');
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

    switch (quizState.mode) {
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
    switch (quizState.mode) {
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
      
      switch (quizState.mode) {
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

  // Update loading check to include error state
  if (isLoading || isDictionaryLoading) {
    console.log('[QuizPage] Loading state:', { isLoading, isDictionaryLoading });
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {isDictionaryLoading ? 'Loading dictionary...' : 'Preparing quiz...'}
        </Typography>
      </Box>
    );
  }

  if (error || dictionaryError) {
    console.error('[QuizPage] Error state:', { error, dictionaryError });
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
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={languageSettings.showJapanese}
                          onChange={(e) => setLanguageSettings(prev => ({
                            ...prev,
                            showJapanese: e.target.checked
                          }))}
                        />
                      }
                      label="Show Japanese"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={languageSettings.showRomaji}
                          onChange={(e) => setLanguageSettings(prev => ({
                            ...prev,
                            showRomaji: e.target.checked
                          }))}
                        />
                      }
                      label="Show Romaji"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={languageSettings.showEnglish}
                          onChange={(e) => setLanguageSettings(prev => ({
                            ...prev,
                            showEnglish: e.target.checked
                          }))}
                        />
                      }
                      label="Show English"
                    />
                  </FormGroup>
                </Box>

                {/* Quiz Mode and Difficulty */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <FormControl sx={{ minWidth: 200 }}>
                    <FormLabel>Quiz Mode</FormLabel>
                    <Select
                      value={quizState.mode}
                      onChange={(e) => {
                        const newMode = e.target.value as QuizMode;
                        if (validateQuizMode(newMode)) {
                          setQuizState(prev => ({ ...prev, mode: newMode }));
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

                {/* Romaji toggles */}
                <FormGroup row sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={showRomajiQuestion} onChange={() => setShowRomajiQuestion(v => !v)} />}
                    label="Show Romaji for Question"
                  />
                  <FormControlLabel
                    control={<Switch checked={showRomajiAnswers} onChange={() => setShowRomajiAnswers(v => !v)} />}
                    label="Show Romaji for Answers"
                  />
                </FormGroup>

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

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={quizState.selectedAnswer || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                  >
                    {generateOptions().map((option, index) => {
                      const isCorrectAnswer = (() => {
                        switch (quizState.mode) {
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