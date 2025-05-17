import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, TextField, RadioGroup, Radio, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import { VolumeUp, Check, Close } from '@mui/icons-material';
import { basicKana } from './BasicKana';
import { yōonKana } from './YōonKana';
import { dakuonKana } from './DakuonKana';

type PracticeMode = 'recognition' | 'writing' | 'listening' | 'matching';
type KanaType = 'basic' | 'yōon' | 'dakuon' | 'all';

interface PracticeQuestion {
  question: string;
  correctAnswer: string;
  options?: string[];
  type: 'hiragana' | 'katakana' | 'romaji';
  audio?: string;
}

const KanaPractice: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState<PracticeMode>('recognition');
  const [kanaType, setKanaType] = useState<KanaType>('basic');
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  const generateQuestion = () => {
    setIsLoading(true);
    let questionPool: any[] = [];
    
    // Combine kana based on selected type
    if (kanaType === 'basic' || kanaType === 'all') questionPool = [...questionPool, ...basicKana];
    if (kanaType === 'yōon' || kanaType === 'all') questionPool = [...questionPool, ...yōonKana];
    if (kanaType === 'dakuon' || kanaType === 'all') questionPool = [...questionPool, ...dakuonKana];

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

    setCurrentQuestion(question);
    setUserAnswer('');
    setFeedback(null);
    setIsLoading(false);
  };

  useEffect(() => {
    generateQuestion();
  }, [mode, kanaType]);

  const handleAnswer = () => {
    if (!currentQuestion) return;

    const isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setScore(prev => prev + (isCorrect ? 1 : 0));
    setTotalQuestions(prev => prev + 1);
    setStreak(prev => isCorrect ? prev + 1 : 0);

    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  const playAudio = () => {
    if (currentQuestion?.audio) {
      // TODO: Implement audio playback
      console.log('Playing audio:', currentQuestion.audio);
    }
  };

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Kana Practice
        </Typography>
        
        <Grid container spacing={2} className="mb-6">
          <Grid item xs={12} sm={6}>
            <Paper className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Typography variant="subtitle1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Practice Mode
              </Typography>
              <RadioGroup
                value={mode}
                onChange={(e) => setMode(e.target.value as PracticeMode)}
                className="mt-2"
              >
                <FormControlLabel 
                  value="recognition" 
                  control={<Radio />} 
                  label="Recognition (Kana → Romaji)" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
                <FormControlLabel 
                  value="writing" 
                  control={<Radio />} 
                  label="Writing (Romaji → Kana)" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
                <FormControlLabel 
                  value="listening" 
                  control={<Radio />} 
                  label="Listening (Audio → Kana)" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
                <FormControlLabel 
                  value="matching" 
                  control={<Radio />} 
                  label="Matching (Romaji ↔ Kana)" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
              </RadioGroup>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Typography variant="subtitle1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Kana Type
              </Typography>
              <RadioGroup
                value={kanaType}
                onChange={(e) => setKanaType(e.target.value as KanaType)}
                className="mt-2"
              >
                <FormControlLabel 
                  value="basic" 
                  control={<Radio />} 
                  label="Basic Kana" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
                <FormControlLabel 
                  value="yōon" 
                  control={<Radio />} 
                  label="Yōon" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
                <FormControlLabel 
                  value="dakuon" 
                  control={<Radio />} 
                  label="Dakuon & Handakuon" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
                <FormControlLabel 
                  value="all" 
                  control={<Radio />} 
                  label="All Types" 
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                />
              </RadioGroup>
            </Paper>
          </Grid>
        </Grid>

        <Paper className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {isLoading ? (
            <Box className="flex justify-center items-center h-48">
              <CircularProgress />
            </Box>
          ) : currentQuestion ? (
            <Box>
              <Box className="flex justify-between items-center mb-6">
                <Typography variant="h5" className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {currentQuestion.question}
                </Typography>
                {currentQuestion.audio && (
                  <Button onClick={playAudio}>
                    <VolumeUp />
                  </Button>
                )}
              </Box>

              {mode === 'matching' ? (
                <Grid container spacing={2}>
                  {currentQuestion.options?.map((option, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setUserAnswer(option);
                          handleAnswer();
                        }}
                        className={`h-16 text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {option}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box className="space-y-4">
                  <TextField
                    fullWidth
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={`Enter ${currentQuestion.type === 'romaji' ? 'romaji' : 'kana'}`}
                    variant="outlined"
                    className={isDarkMode ? 'bg-gray-700' : 'bg-white'}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAnswer}
                    disabled={!userAnswer}
                    fullWidth
                  >
                    Check Answer
                  </Button>
                </Box>
              )}

              {feedback && (
                <Alert 
                  severity={feedback === 'correct' ? 'success' : 'error'}
                  className="mt-4"
                  icon={feedback === 'correct' ? <Check /> : <Close />}
                >
                  {feedback === 'correct' 
                    ? `Correct! ${streak > 1 ? `(${streak} in a row!)` : ''}`
                    : `Incorrect. The answer was: ${currentQuestion.correctAnswer}`
                  }
                </Alert>
              )}

              <Box className="mt-6 flex justify-between items-center">
                <Typography variant="body1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Score: {score}/{totalQuestions}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={generateQuestion}
                >
                  Skip Question
                </Button>
              </Box>
            </Box>
          ) : null}
        </Paper>
      </Box>
    </Box>
  );
};

export default KanaPractice; 