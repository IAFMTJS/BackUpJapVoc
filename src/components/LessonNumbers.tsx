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

interface NumberItem {
  japanese: string;
  romaji: string;
  english: string;
  mastered: boolean;
}

interface PracticeMode {
  id: string;
  name: string;
  description: string;
  type: 'listening' | 'reading' | 'writing' | 'matching' | 'quiz';
}

const LessonNumbers: React.FC = () => {
  const { playAudio } = useAudio();
  const { updateWordProgress } = useProgress();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [numbers, setNumbers] = useState<NumberItem[]>([
    { japanese: '一', romaji: 'ichi', english: '1', mastered: false },
    { japanese: '二', romaji: 'ni', english: '2', mastered: false },
    { japanese: '三', romaji: 'san', english: '3', mastered: false },
    { japanese: '四', romaji: 'yon', english: '4', mastered: false },
    { japanese: '五', romaji: 'go', english: '5', mastered: false },
    { japanese: '六', romaji: 'roku', english: '6', mastered: false },
    { japanese: '七', romaji: 'nana', english: '7', mastered: false },
    { japanese: '八', romaji: 'hachi', english: '8', mastered: false },
    { japanese: '九', romaji: 'kyuu', english: '9', mastered: false },
    { japanese: '十', romaji: 'juu', english: '10', mastered: false },
  ]);

  const [currentMode, setCurrentMode] = useState<string>('intro');
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimedMode, setIsTimedMode] = useState(false);

  const practiceModes: PracticeMode[] = [
    {
      id: 'listening',
      name: 'Listening Practice',
      description: 'Listen to numbers and identify them',
      type: 'listening'
    },
    {
      id: 'reading',
      name: 'Reading Practice',
      description: 'Read Japanese numbers and match to English',
      type: 'reading'
    },
    {
      id: 'writing',
      name: 'Writing Practice',
      description: 'Write the romaji for Japanese numbers',
      type: 'writing'
    },
    {
      id: 'matching',
      name: 'Matching Game',
      description: 'Match Japanese, romaji, and English',
      type: 'matching'
    },
    {
      id: 'quiz',
      name: 'Timed Quiz',
      description: 'Quick quiz with time pressure',
      type: 'quiz'
    }
  ];

  const [currentPracticeMode, setCurrentPracticeMode] = useState<PracticeMode | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const generateListeningQuestion = () => {
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const options = [...numbers].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!options.find(opt => opt.japanese === randomNumber.japanese)) {
      options[0] = randomNumber;
    }
    
    return {
      type: 'listening',
      question: randomNumber,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer: randomNumber.japanese
    };
  };

  const generateReadingQuestion = () => {
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const options = [...numbers].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!options.find(opt => opt.english === randomNumber.english)) {
      options[0] = randomNumber;
    }
    
    return {
      type: 'reading',
      question: randomNumber,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer: randomNumber.english
    };
  };

  const generateWritingQuestion = () => {
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    return {
      type: 'writing',
      question: randomNumber,
      correctAnswer: randomNumber.romaji
    };
  };

  const generateMatchingPairs = () => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5).slice(0, 6);
    return shuffled.map((num, index) => ({
      id: index,
      japanese: num.japanese,
      romaji: num.romaji,
      english: num.english,
      matched: false
    }));
  };

  const startPractice = (mode: PracticeMode) => {
    setCurrentPracticeMode(mode);
    setScore(0);
    setTotalQuestions(0);
    setShowResults(false);
    setCurrentQuestionIndex(0);

    let questions: any[] = [];
    
    switch (mode.type) {
      case 'listening':
        questions = Array.from({ length: 10 }, () => generateListeningQuestion());
        break;
      case 'reading':
        questions = Array.from({ length: 10 }, () => generateReadingQuestion());
        break;
      case 'writing':
        questions = Array.from({ length: 10 }, () => generateWritingQuestion());
        break;
      case 'matching':
        questions = [generateMatchingPairs()];
        break;
      case 'quiz':
        questions = Array.from({ length: 15 }, () => {
          const types = ['listening', 'reading', 'writing'];
          const type = types[Math.floor(Math.random() * types.length)];
          switch (type) {
            case 'listening': return generateListeningQuestion();
            case 'reading': return generateReadingQuestion();
            case 'writing': return generateWritingQuestion();
            default: return generateListeningQuestion();
          }
        });
        setIsTimedMode(true);
        setTimeLeft(60); // 60 seconds for quiz
        break;
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
      // Mark number as mastered if answered correctly
      const numberItem = numbers.find(n => 
        n.japanese === currentQ.question.japanese ||
        n.english === currentQ.question.english ||
        n.romaji === currentQ.question.romaji
      );
      if (numberItem) {
        setNumbers(prev => prev.map(n => 
          n.japanese === numberItem.japanese 
            ? { ...n, mastered: true }
            : n
        ));
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

  const progress = (currentStep / (numbers.length + practiceModes.length)) * 100;
  const masteredCount = numbers.filter(n => n.mastered).length;

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
                    Listen and choose the correct number:
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
                    {currentQ.options.map((option: any, index: number) => (
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
                    What number is this?
                  </Typography>
                  <Typography variant="h3" sx={{ textAlign: 'center', mb: 3 }}>
                    {currentQ.question.japanese}
                  </Typography>
                  <Grid container spacing={2}>
                    {currentQ.options.map((option: any, index: number) => (
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
                    Write the romaji for this number:
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
                Mastered Numbers: {masteredCount} / {numbers.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(score / totalQuestions) * 100} 
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCurrentPracticeMode(null)}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <img src="/sensai.png" alt="VSensei" style={{ width: 80, height: 80, borderRadius: '50%', marginRight: 24 }} />
        <Box>
          <Typography variant="h3" gutterBottom>
            Numbers & Counting
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Learn to count from 1 to 10 in Japanese
          </Typography>
        </Box>
      </Box>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />

      {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome to Numbers Lesson! 🎯
              </Typography>
              <Typography variant="body1" paragraph>
                In this lesson, you'll learn to count from 1 to 10 in Japanese. You'll practice:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">Reading Japanese numbers (一, 二, 三...)</Typography>
                <Typography component="li">Writing romaji (ichi, ni, san...)</Typography>
                <Typography component="li">Listening and pronunciation</Typography>
                <Typography component="li">Matching exercises</Typography>
                <Typography component="li">Timed quizzes</Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => setCurrentStep(1)}
                sx={{ mt: 2 }}
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" gutterBottom>
            Japanese Numbers 1-10
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {numbers.map((number, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    border: number.mastered ? '2px solid #4caf50' : '1px solid #ddd'
                  }}
                >
                  <Typography variant="h3" gutterBottom>
                    {number.japanese}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {number.romaji}
                  </Typography>
                  <Typography variant="body1">
                    {number.english}
                  </Typography>
                  <IconButton 
                    onClick={() => handlePlayAudio(number.romaji)}
                    sx={{ mt: 1 }}
                  >
                    <VolumeUp />
                  </IconButton>
                  {number.mastered && (
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(0)}>
              <ArrowBack /> Back
            </Button>
            <Button variant="contained" onClick={() => setCurrentStep(2)}>
              Practice <ArrowForward />
            </Button>
          </Box>
        </motion.div>
      )}

      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" gutterBottom>
            Choose Your Practice Mode
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {practiceModes.map((mode) => (
              <Grid item xs={12} sm={6} md={4} key={mode.id}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                  }}
                  onClick={() => startPractice(mode)}
                >
                  <Typography variant="h6" gutterBottom>
                    {mode.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {mode.description}
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Start Practice
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(1)}>
              <ArrowBack /> Back
            </Button>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default LessonNumbers; 