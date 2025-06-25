import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { 
  VolumeUp, 
  Check, 
  Close, 
  ArrowForward, 
  ArrowBack,
  Celebration,
  Timer,
  Shuffle,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import { useProgress } from '../context/ProgressContext';
import { Lesson, getLessonById } from '../data/senseiLessons';

interface LessonComponentProps {
  lessonId: string;
  onBack: () => void;
}

interface PracticeMode {
  id: string;
  name: string;
  description: string;
  type: 'listening' | 'reading' | 'writing' | 'matching' | 'quiz';
}

interface PracticeQuestion {
  type: 'listening' | 'reading' | 'writing' | 'matching';
  question: any;
  correctAnswer: string;
  options?: any[];
}

const LessonComponent: React.FC<LessonComponentProps> = ({ lessonId, onBack }) => {
  const { playAudio } = useAudio();
  const { updateWordProgress, markLessonCompleted } = useProgress();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPracticeMode, setCurrentPracticeMode] = useState<PracticeMode | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userInput, setUserInput] = useState('');
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());

  // Get lesson data
  const lesson = getLessonById(lessonId);
  
  if (!lesson) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Lesson not found: {lessonId}
        </Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Extract vocabulary words from lesson content
  const vocabularyWords = lesson.content
    .filter(content => content.type === 'vocabulary')
    .flatMap(content => content.content.words || []);

  // Define practice modes based on lesson content
  const practiceModes: PracticeMode[] = [
    {
      id: 'listening',
      name: 'Listening Practice',
      description: 'Listen to the pronunciation and choose the correct word',
      type: 'listening'
    },
    {
      id: 'reading',
      name: 'Reading Practice',
      description: 'Read the Japanese text and choose the correct meaning',
      type: 'reading'
    },
    {
      id: 'writing',
      name: 'Writing Practice',
      description: 'Write the romaji for the Japanese text',
      type: 'writing'
    },
    {
      id: 'matching',
      name: 'Matching Game',
      description: 'Match Japanese words with their meanings',
      type: 'matching'
    }
  ];

  const generateListeningQuestion = (): PracticeQuestion => {
    const word = vocabularyWords[Math.floor(Math.random() * vocabularyWords.length)];
    const options = vocabularyWords
      .filter(w => w !== word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return {
      type: 'listening',
      question: word,
      correctAnswer: word.japanese,
      options: [word, ...options].sort(() => Math.random() - 0.5)
    };
  };

  const generateReadingQuestion = (): PracticeQuestion => {
    const word = vocabularyWords[Math.floor(Math.random() * vocabularyWords.length)];
    const options = vocabularyWords
      .filter(w => w !== word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return {
      type: 'reading',
      question: word,
      correctAnswer: word.english,
      options: [word, ...options].sort(() => Math.random() - 0.5)
    };
  };

  const generateWritingQuestion = (): PracticeQuestion => {
    const word = vocabularyWords[Math.floor(Math.random() * vocabularyWords.length)];
    return {
      type: 'writing',
      question: word,
      correctAnswer: word.romaji
    };
  };

  const generateMatchingPairs = (): PracticeQuestion => {
    const shuffledWords = [...vocabularyWords].sort(() => Math.random() - 0.5);
    return {
      type: 'matching',
      question: shuffledWords,
      correctAnswer: 'matching'
    };
  };

  const startPractice = (mode: PracticeMode) => {
    setCurrentPracticeMode(mode);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setUserInput('');

    const questions: PracticeQuestion[] = [];
    const questionCount = Math.min(10, vocabularyWords.length);

    for (let i = 0; i < questionCount; i++) {
      switch (mode.type) {
        case 'listening':
          questions.push(generateListeningQuestion());
          break;
        case 'reading':
          questions.push(generateReadingQuestion());
          break;
        case 'writing':
          questions.push(generateWritingQuestion());
          break;
        case 'matching':
          questions.push(generateMatchingPairs());
          break;
      }
    }

    if (mode.id === 'quiz') {
      setIsTimedMode(true);
      setTimeLeft(60);
    }

    setPracticeQuestions(questions);
    setTotalQuestions(questions.length);
  };

  const handleAnswer = (answer: string) => {
    const currentQ = practiceQuestions[currentQuestionIndex];
    let isCorrect = false;

    if (currentQ.type === 'listening' || currentQ.type === 'reading') {
      isCorrect = answer === currentQ.correctAnswer;
    } else if (currentQ.type === 'writing') {
      isCorrect = answer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase();
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
      // Mark word as mastered if answered correctly
      const word = vocabularyWords.find(w => w.japanese === currentQ.question.japanese);
      if (word) {
        setMasteredWords(prev => new Set(prev).add(word.japanese));
      }
    }

    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
      setIsTimedMode(false);
    }
  };

  const handlePlayAudio = (text: string) => {
    playAudio(text, 'ja');
  };

  useEffect(() => {
    if (isTimedMode && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isTimedMode && timeLeft === 0) {
      setShowResults(true);
      setIsTimedMode(false);
    }
  }, [isTimedMode, timeLeft]);

  const progress = (currentStep / (vocabularyWords.length + practiceModes.length)) * 100;
  const masteredCount = Array.from(masteredWords).length;

  // Mark lesson as completed if all words are mastered
  useEffect(() => {
    if (masteredCount === vocabularyWords.length && masteredCount > 0) {
      markLessonCompleted(lessonId);
    }
  }, [masteredCount, vocabularyWords.length, markLessonCompleted, lessonId]);

  if (currentPracticeMode) {
    const currentQ = practiceQuestions[currentQuestionIndex];
    
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <img src="/sensai.png" alt="VSensei" style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 16 }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              {currentPracticeMode.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentPracticeMode.description}
            </Typography>
          </Box>
        </Box>

        {isTimedMode && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Time remaining: {timeLeft} seconds
          </Alert>
        )}

        <LinearProgress 
          variant="determinate" 
          value={(currentQuestionIndex / practiceQuestions.length) * 100} 
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" gutterBottom>
          Question {currentQuestionIndex + 1} of {practiceQuestions.length}
        </Typography>

        {currentQ && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {currentQ.type === 'listening' && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Listen and choose the correct word:
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <IconButton 
                      size="large" 
                      onClick={() => handlePlayAudio(currentQ.question.romaji)}
                      sx={{ fontSize: '2rem' }}
                    >
                      <VolumeUp />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    {currentQ.options?.map((option: any, index: number) => (
                      <Grid item xs={6} key={index}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleAnswer(option.japanese)}
                          sx={{ p: 2, fontSize: '1.2rem' }}
                        >
                          {option.japanese} ({option.romaji})
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {currentQ.type === 'reading' && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    What is the meaning of this word?
                  </Typography>
                  <Typography variant="h3" sx={{ textAlign: 'center', mb: 3 }}>
                    {currentQ.question.japanese}
                  </Typography>
                  <Grid container spacing={2}>
                    {currentQ.options?.map((option: any, index: number) => (
                      <Grid item xs={6} key={index}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleAnswer(option.english)}
                          sx={{ p: 2, fontSize: '1.2rem' }}
                        >
                          {option.english}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {currentQ.type === 'writing' && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Write the romaji for this word:
                  </Typography>
                  <Typography variant="h3" sx={{ textAlign: 'center', mb: 3 }}>
                    {currentQ.question.japanese}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Romaji"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleAnswer(userInput)}
                    disabled={!userInput.trim()}
                  >
                    Check Answer
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {showResults && (
          <Dialog open={showResults} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Celebration sx={{ mr: 1, color: 'gold' }} />
                Practice Complete!
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Your Score: {score} / {totalQuestions}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Mastered Words: {masteredCount} / {vocabularyWords.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(score / totalQuestions) * 100} 
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {score / totalQuestions >= 0.8 
                  ? "Excellent! You're mastering this lesson!" 
                  : "Good effort! Keep practicing to improve."
                }
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setCurrentPracticeMode(null);
                // Mark lesson as completed if score is good enough
                if (score / totalQuestions >= 0.8) {
                  markLessonCompleted(lessonId);
                }
              }}>
                Back to Menu
              </Button>
              <Button 
                variant="contained" 
                onClick={() => startPractice(currentPracticeMode)}
              >
                Try Again
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          Back to Lessons
        </Button>
        <img src="/sensai.png" alt="VSensei" style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 16 }} />
        <Box>
          <Typography variant="h3" gutterBottom>
            {lesson.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {lesson.description}
          </Typography>
        </Box>
      </Box>

      {/* Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lesson Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(masteredCount / vocabularyWords.length) * 100} 
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {masteredCount} of {vocabularyWords.length} words mastered
          </Typography>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Lesson Content
              </Typography>
              
              {lesson.content.map((content, index) => (
                <Box key={content.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {content.content.title}
                  </Typography>
                  
                  {content.type === 'vocabulary' && (
                    <Grid container spacing={2}>
                      {content.content.words.map((word: any, wordIndex: number) => (
                        <Grid item xs={12} sm={6} md={4} key={wordIndex}>
                          <Card 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              border: masteredWords.has(word.japanese) ? '2px solid #4caf50' : '1px solid #ddd'
                            }}
                          >
                            <Typography variant="h4" gutterBottom>
                              {word.japanese}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {word.romaji}
                            </Typography>
                            <Typography variant="body1">
                              {word.english}
                            </Typography>
                            <IconButton 
                              onClick={() => handlePlayAudio(word.romaji)}
                              sx={{ mt: 1 }}
                            >
                              <VolumeUp />
                            </IconButton>
                            {masteredWords.has(word.japanese) && (
                              <Chip 
                                label="Mastered" 
                                color="success" 
                                size="small" 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  
                  {content.type === 'grammar' && (
                    <Box>
                      <Typography variant="body1" paragraph>
                        {content.content.explanation}
                      </Typography>
                      {content.content.examples && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Examples:
                          </Typography>
                          {content.content.examples.map((example: any, exampleIndex: number) => (
                            <Card key={exampleIndex} sx={{ mb: 1, p: 2 }}>
                              <Typography variant="body2">
                                <strong>{example.japanese}</strong> ({example.romaji}) - {example.english}
                              </Typography>
                            </Card>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Practice Modes */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Practice Modes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a practice mode to test your knowledge
              </Typography>
              
              <Grid container spacing={2}>
                {practiceModes.map((mode) => (
                  <Grid item xs={12} key={mode.id}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => startPractice(mode)}
                      sx={{ 
                        p: 2, 
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {mode.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mode.description}
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LessonComponent; 