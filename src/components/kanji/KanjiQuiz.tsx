import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RestartAlt as RestartIcon,
  Help as HelpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';
import { useProgress } from '../../context/ProgressContext';
import { useKanjiDictionary } from '../../context/KanjiDictionaryContext';

interface KanjiQuizProps {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizQuestion {
  kanji: string;
  meanings: string[];
  readings: {
    on: string[];
    kun: string[];
  };
  correctAnswer: string;
  options: string[];
  type: 'meaning-to-kanji' | 'kanji-to-meaning' | 'reading-to-kanji' | 'kanji-to-reading';
}

const KanjiQuiz: React.FC<KanjiQuizProps> = ({ difficulty = 'beginner' }) => {
  const theme = useTheme();
  const { playAudio } = useAudio();
  const { updateWordProgress, updateSectionProgress, addStudySession, progress } = useProgress();
  const { kanji, isInitialized } = useKanjiDictionary();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [questionType, setQuestionType] = useState<'all' | 'meaning' | 'reading'>('all');

  // Generate questions based on difficulty and type
  useEffect(() => {
    if (quizStarted && !quizCompleted && isInitialized) {
      const newQuestions = generateQuestions(difficulty);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setShowInstructions(false);
    }
  }, [difficulty, quizStarted, isInitialized, selectedLevel, questionType]);

  // Update progress when quiz is completed
  useEffect(() => {
    if (quizCompleted) {
      // Calculate quiz statistics
      const accuracy = (score / questions.length) * 100;
      const duration = Date.now() - quizStartTime;
      const minutes = Math.round(duration / 60000);

      // Update study session
      addStudySession({
        timestamp: Date.now(),
        duration: minutes,
        wordsLearned: score,
        accuracy,
        averageMastery: score / questions.length
      });

      // Update section progress
      updateSectionProgress('kanji', {
        totalItems: questions.length,
        masteredItems: score,
        inProgressItems: questions.length - score,
        notStartedItems: 0,
        lastStudied: Date.now(),
        streak: 1,
        averageMastery: score / questions.length
      });

      // Update individual kanji progress
      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const currentProgress = progress.words[question.kanji] || {
          masteryLevel: 0,
          consecutiveCorrect: 0,
          lastAnswerCorrect: false,
          correctAnswers: 0,
          incorrectAnswers: 0
        };

        updateWordProgress(question.kanji, {
          lastReviewed: Date.now(),
          reviewCount: (currentProgress.reviewCount || 0) + 1,
          nextReviewDate: Date.now() + (isCorrect ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
          category: 'kanji',
          section: 'quiz',
          difficulty,
          lastAnswerCorrect: isCorrect,
          correctAnswers: isCorrect ? (currentProgress.correctAnswers || 0) + 1 : (currentProgress.correctAnswers || 0),
          incorrectAnswers: !isCorrect ? (currentProgress.incorrectAnswers || 0) + 1 : (currentProgress.incorrectAnswers || 0)
        });
      });
    }
  }, [quizCompleted, score, questions, difficulty, answers, addStudySession, updateSectionProgress, updateWordProgress, progress]);

  const generateQuestions = (difficulty: string): QuizQuestion[] => {
    if (!isInitialized || !kanji.length) return [];

    let filteredKanji = kanji;
    if (difficulty === 'beginner') {
      filteredKanji = kanji.filter(k => k.jlpt === 5);
    } else if (difficulty === 'intermediate') {
      filteredKanji = kanji.filter(k => k.jlpt === 3 || k.jlpt === 4);
    } else if (difficulty === 'advanced') {
      filteredKanji = kanji.filter(k => k.jlpt === 1 || k.jlpt === 2);
    }

    if (selectedLevel !== 'all') {
      filteredKanji = filteredKanji.filter(k => k.jlpt?.toString() === selectedLevel.replace('N', ''));
    }

    const questions: QuizQuestion[] = [];
    const numQuestions = 10;

    for (let i = 0; i < numQuestions; i++) {
      const correctKanji = filteredKanji[Math.floor(Math.random() * filteredKanji.length)];
      
      // Determine question type
      let questionType: QuizQuestion['type'];
      if (questionType === 'all') {
        const types: QuizQuestion['type'][] = ['meaning-to-kanji', 'kanji-to-meaning', 'reading-to-kanji', 'kanji-to-reading'];
        questionType = types[Math.floor(Math.random() * types.length)];
      } else if (questionType === 'meaning') {
        questionType = Math.random() < 0.5 ? 'meaning-to-kanji' : 'kanji-to-meaning';
      } else {
        questionType = Math.random() < 0.5 ? 'reading-to-kanji' : 'kanji-to-reading';
      }

      // Generate options based on question type
      let options: string[] = [];
      let correctAnswer: string;

      switch (questionType) {
        case 'meaning-to-kanji':
          correctAnswer = correctKanji.character;
          options = [correctAnswer];
          while (options.length < 4) {
            const randomKanji = filteredKanji[Math.floor(Math.random() * filteredKanji.length)];
            if (!options.includes(randomKanji.character)) {
              options.push(randomKanji.character);
            }
          }
          break;

        case 'kanji-to-meaning':
          correctAnswer = correctKanji.meanings[0];
          options = [correctAnswer];
          while (options.length < 4) {
            const randomKanji = filteredKanji[Math.floor(Math.random() * filteredKanji.length)];
            const randomMeaning = randomKanji.meanings[Math.floor(Math.random() * randomKanji.meanings.length)];
            if (!options.includes(randomMeaning)) {
              options.push(randomMeaning);
            }
          }
          break;

        case 'reading-to-kanji':
          const allReadings = [...correctKanji.readings.on, ...correctKanji.readings.kun];
          correctAnswer = correctKanji.character;
          const correctReading = allReadings[Math.floor(Math.random() * allReadings.length)];
          options = [correctAnswer];
          while (options.length < 4) {
            const randomKanji = filteredKanji[Math.floor(Math.random() * filteredKanji.length)];
            if (!options.includes(randomKanji.character)) {
              options.push(randomKanji.character);
            }
          }
          break;

        case 'kanji-to-reading':
          const allReadings2 = [...correctKanji.readings.on, ...correctKanji.readings.kun];
          correctAnswer = allReadings2[Math.floor(Math.random() * allReadings2.length)];
          options = [correctAnswer];
          while (options.length < 4) {
            const randomKanji = filteredKanji[Math.floor(Math.random() * filteredKanji.length)];
            const randomReadings = [...randomKanji.readings.on, ...randomKanji.readings.kun];
            const randomReading = randomReadings[Math.floor(Math.random() * randomReadings.length)];
            if (!options.includes(randomReading)) {
              options.push(randomReading);
            }
          }
          break;
      }

      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      questions.push({
        kanji: correctKanji.character,
        meanings: correctKanji.meanings,
        readings: correctKanji.readings,
        correctAnswer,
        options: shuffledOptions,
        type: questionType,
      });
    }

    return questions;
  };

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
      const correct = answer === questions[currentQuestionIndex].correctAnswer;
      setIsCorrect(correct);
      setIsAnswered(true);
      setShowFeedback(true);
      if (correct) {
        setScore(prev => prev + 1);
      }
      // Play audio for feedback
      playAudio(correct ? 'correct' : 'incorrect');
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      setQuizCompleted(true);
      // Play completion sound
      playAudio(score >= questions.length * 0.7 ? 'success' : 'try_again');
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setAnswers({});
    setIsAnswered(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setShowInstructions(true);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizStartTime(Date.now());
  };

  const handleLevelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLevel(event.target.value as string);
  };

  const handleQuestionTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setQuestionType(event.target.value as 'all' | 'meaning' | 'reading');
  };

  if (showInstructions) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Kanji Quiz Instructions
          </Typography>
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1" gutterBottom>
              • You will be presented with 10 questions
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Questions can be of the following types:
            </Typography>
            <Typography variant="body1" sx={{ pl: 2 }} gutterBottom>
              - Meaning to Kanji: Select the correct kanji for the given meaning
            </Typography>
            <Typography variant="body1" sx={{ pl: 2 }} gutterBottom>
              - Kanji to Meaning: Select the correct meaning for the given kanji
            </Typography>
            <Typography variant="body1" sx={{ pl: 2 }} gutterBottom>
              - Reading to Kanji: Select the correct kanji for the given reading
            </Typography>
            <Typography variant="body1" sx={{ pl: 2 }} gutterBottom>
              - Kanji to Reading: Select the correct reading for the given kanji
            </Typography>
            <Typography variant="body1" gutterBottom>
              • You can listen to the readings by clicking the speaker icon
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Your progress will be tracked and saved
            </Typography>
            <Typography variant="body1">
              • Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Typography>
          </Alert>
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200, mb: 2 }}>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={questionType}
                onChange={handleQuestionTypeChange}
                label="Question Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="meaning">Meaning Only</MenuItem>
                <MenuItem value="reading">Reading Only</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200, ml: 2 }}>
              <InputLabel>JLPT Level</InputLabel>
              <Select
                value={selectedLevel}
                onChange={handleLevelChange}
                label="JLPT Level"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="N5">N5</MenuItem>
                <MenuItem value="N4">N4</MenuItem>
                <MenuItem value="N3">N3</MenuItem>
                <MenuItem value="N2">N2</MenuItem>
                <MenuItem value="N1">N1</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStartQuiz}
            startIcon={<ArrowForwardIcon />}
          >
            Start Quiz
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!quizStarted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Kanji Quiz
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Test your knowledge of kanji characters.
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStartQuiz}
            startIcon={<ArrowForwardIcon />}
          >
            Start Quiz
          </Button>
        </Paper>
      </Box>
    );
  }

  if (quizCompleted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Quiz Completed!
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: theme.palette.primary.main }}>
            Score: {score}/{questions.length}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {score === questions.length 
              ? 'Perfect score! Excellent work!' 
              : score >= questions.length * 0.7 
                ? 'Great job! Keep practicing!' 
                : 'Keep practicing to improve your score!'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRestart}
              startIcon={<RestartIcon />}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowInstructions(true)}
              startIcon={<HelpIcon />}
            >
              View Instructions
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
          <Typography variant="h6" color="primary">
            Score: {score}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestionIndex / questions.length) * 100} 
          sx={{ mb: 4, height: 8, borderRadius: 4 }}
        />

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            mb: 2, 
            fontFamily: currentQuestion.type === 'kanji-to-meaning' || currentQuestion.type === 'kanji-to-reading' 
              ? 'Noto Sans JP, sans-serif' 
              : 'inherit'
          }}>
            {currentQuestion.type === 'meaning-to-kanji' 
              ? currentQuestion.meanings[0]
              : currentQuestion.type === 'reading-to-kanji'
                ? currentQuestion.readings.on[0] // Use first on-reading as example
                : currentQuestion.kanji}
          </Typography>
          {(currentQuestion.type === 'kanji-to-reading' || currentQuestion.type === 'reading-to-kanji') && (
            <Tooltip title="Listen to reading">
              <IconButton 
                onClick={() => playAudio(currentQuestion.readings.on[0])}
                size="large"
                color="primary"
                sx={{ mb: 2 }}
              >
                <VolumeIcon />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="subtitle1" color="text.secondary">
            {currentQuestion.type === 'meaning-to-kanji' 
              ? 'Select the correct kanji for this meaning'
              : currentQuestion.type === 'kanji-to-meaning'
                ? 'Select the correct meaning for this kanji'
                : currentQuestion.type === 'reading-to-kanji'
                  ? 'Select the correct kanji for this reading'
                  : 'Select the correct reading for this kanji'}
          </Typography>
        </Box>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup>
            <Grid container spacing={2}>
              {currentQuestion.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      cursor: isAnswered ? 'default' : 'pointer',
                      border: 2,
                      borderColor: isAnswered
                        ? option === currentQuestion.correctAnswer
                          ? 'success.main'
                          : option === selectedAnswer
                            ? 'error.main'
                            : 'transparent'
                        : 'transparent',
                      '&:hover': !isAnswered ? {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease-in-out'
                      } : {},
                    }}
                    onClick={() => !isAnswered && handleAnswerSelect(option)}
                  >
                    <FormControlLabel
                      value={option}
                      control={<Radio checked={selectedAnswer === option} />}
                      label={
                        <Typography variant="h6" sx={{ 
                          fontFamily: currentQuestion.type === 'meaning-to-kanji' || currentQuestion.type === 'reading-to-kanji'
                            ? 'Noto Sans JP, sans-serif'
                            : 'inherit'
                        }}>
                          {option}
                        </Typography>
                      }
                      disabled={isAnswered}
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>

        {isAnswered && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Alert 
              severity={isCorrect ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {isCorrect ? (
                  <>
                    <CheckCircleIcon /> Correct!
                  </>
                ) : (
                  <>
                    <CancelIcon /> Incorrect. The correct answer is: {currentQuestion.correctAnswer}
                  </>
                )}
              </Typography>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextQuestion}
              size="large"
              endIcon={<ArrowForwardIcon />}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default KanjiQuiz; 