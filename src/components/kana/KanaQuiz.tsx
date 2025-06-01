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
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RestartAlt as RestartIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';
import { useProgress } from '../../context/ProgressContext';

interface KanaQuizProps {
  type: 'hiragana' | 'katakana';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizQuestion {
  kana: string;
  romaji: string;
  correctAnswer: string;
  options: string[];
  type: 'romaji-to-kana' | 'kana-to-romaji';
}

// Define kana data structure
const kanaData = {
  hiragana: {
    gojuon: [
      { kana: ['あ', 'い', 'う', 'え', 'お'], romaji: ['a', 'i', 'u', 'e', 'o'] },
      { kana: ['か', 'き', 'く', 'け', 'こ'], romaji: ['ka', 'ki', 'ku', 'ke', 'ko'] },
      { kana: ['さ', 'し', 'す', 'せ', 'そ'], romaji: ['sa', 'shi', 'su', 'se', 'so'] },
      { kana: ['た', 'ち', 'つ', 'て', 'と'], romaji: ['ta', 'chi', 'tsu', 'te', 'to'] },
      { kana: ['な', 'に', 'ぬ', 'ね', 'の'], romaji: ['na', 'ni', 'nu', 'ne', 'no'] },
      { kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'], romaji: ['ha', 'hi', 'fu', 'he', 'ho'] },
      { kana: ['ま', 'み', 'む', 'め', 'も'], romaji: ['ma', 'mi', 'mu', 'me', 'mo'] },
      { kana: ['や', '', 'ゆ', '', 'よ'], romaji: ['ya', '', 'yu', '', 'yo'] },
      { kana: ['ら', 'り', 'る', 'れ', 'ろ'], romaji: ['ra', 'ri', 'ru', 're', 'ro'] },
      { kana: ['わ', '', '', '', 'を'], romaji: ['wa', '', '', '', 'wo'] },
      { kana: ['ん', '', '', '', ''], romaji: ['n', '', '', '', ''] }
    ],
    dakuon: [
      { kana: ['が', 'ぎ', 'ぐ', 'げ', 'ご'], romaji: ['ga', 'gi', 'gu', 'ge', 'go'] },
      { kana: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'], romaji: ['za', 'ji', 'zu', 'ze', 'zo'] },
      { kana: ['だ', 'ぢ', 'づ', 'で', 'ど'], romaji: ['da', 'ji', 'zu', 'de', 'do'] },
      { kana: ['ば', 'び', 'ぶ', 'べ', 'ぼ'], romaji: ['ba', 'bi', 'bu', 'be', 'bo'] }
    ],
    handakuon: [
      { kana: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'], romaji: ['pa', 'pi', 'pu', 'pe', 'po'] }
    ],
    yoon: [
      { kana: ['きゃ', 'きゅ', 'きょ'], romaji: ['kya', 'kyu', 'kyo'] },
      { kana: ['しゃ', 'しゅ', 'しょ'], romaji: ['sha', 'shu', 'sho'] },
      { kana: ['ちゃ', 'ちゅ', 'ちょ'], romaji: ['cha', 'chu', 'cho'] },
      { kana: ['にゃ', 'にゅ', 'にょ'], romaji: ['nya', 'nyu', 'nyo'] },
      { kana: ['ひゃ', 'ひゅ', 'ひょ'], romaji: ['hya', 'hyu', 'hyo'] },
      { kana: ['みゃ', 'みゅ', 'みょ'], romaji: ['mya', 'myu', 'myo'] },
      { kana: ['りゃ', 'りゅ', 'りょ'], romaji: ['rya', 'ryu', 'ryo'] },
      { kana: ['ぎゃ', 'ぎゅ', 'ぎょ'], romaji: ['gya', 'gyu', 'gyo'] },
      { kana: ['じゃ', 'じゅ', 'じょ'], romaji: ['ja', 'ju', 'jo'] },
      { kana: ['びゃ', 'びゅ', 'びょ'], romaji: ['bya', 'byu', 'byo'] },
      { kana: ['ぴゃ', 'ぴゅ', 'ぴょ'], romaji: ['pya', 'pyu', 'pyo'] }
    ]
  },
  katakana: {
    gojuon: [
      { kana: ['ア', 'イ', 'ウ', 'エ', 'オ'], romaji: ['a', 'i', 'u', 'e', 'o'] },
      { kana: ['カ', 'キ', 'ク', 'ケ', 'コ'], romaji: ['ka', 'ki', 'ku', 'ke', 'ko'] },
      { kana: ['サ', 'シ', 'ス', 'セ', 'ソ'], romaji: ['sa', 'shi', 'su', 'se', 'so'] },
      { kana: ['タ', 'チ', 'ツ', 'テ', 'ト'], romaji: ['ta', 'chi', 'tsu', 'te', 'to'] },
      { kana: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'], romaji: ['na', 'ni', 'nu', 'ne', 'no'] },
      { kana: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'], romaji: ['ha', 'hi', 'fu', 'he', 'ho'] },
      { kana: ['マ', 'ミ', 'ム', 'メ', 'モ'], romaji: ['ma', 'mi', 'mu', 'me', 'mo'] },
      { kana: ['ヤ', '', 'ユ', '', 'ヨ'], romaji: ['ya', '', 'yu', '', 'yo'] },
      { kana: ['ラ', 'リ', 'ル', 'レ', 'ロ'], romaji: ['ra', 'ri', 'ru', 're', 'ro'] },
      { kana: ['ワ', '', '', '', 'ヲ'], romaji: ['wa', '', '', '', 'wo'] },
      { kana: ['ン', '', '', '', ''], romaji: ['n', '', '', '', ''] }
    ],
    dakuon: [
      { kana: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'], romaji: ['ga', 'gi', 'gu', 'ge', 'go'] },
      { kana: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'], romaji: ['za', 'ji', 'zu', 'ze', 'zo'] },
      { kana: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'], romaji: ['da', 'ji', 'zu', 'de', 'do'] },
      { kana: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'], romaji: ['ba', 'bi', 'bu', 'be', 'bo'] }
    ],
    handakuon: [
      { kana: ['パ', 'ピ', 'プ', 'ペ', 'ポ'], romaji: ['pa', 'pi', 'pu', 'pe', 'po'] }
    ],
    yoon: [
      { kana: ['キャ', 'キュ', 'キョ'], romaji: ['kya', 'kyu', 'kyo'] },
      { kana: ['シャ', 'シュ', 'ショ'], romaji: ['sha', 'shu', 'sho'] },
      { kana: ['チャ', 'チュ', 'チョ'], romaji: ['cha', 'chu', 'cho'] },
      { kana: ['ニャ', 'ニュ', 'ニョ'], romaji: ['nya', 'nyu', 'nyo'] },
      { kana: ['ヒャ', 'ヒュ', 'ヒョ'], romaji: ['hya', 'hyu', 'hyo'] },
      { kana: ['ミャ', 'ミュ', 'ミョ'], romaji: ['mya', 'myu', 'myo'] },
      { kana: ['リャ', 'リュ', 'リョ'], romaji: ['rya', 'ryu', 'ryo'] },
      { kana: ['ギャ', 'ギュ', 'ギョ'], romaji: ['gya', 'gyu', 'gyo'] },
      { kana: ['ジャ', 'ジュ', 'ジョ'], romaji: ['ja', 'ju', 'jo'] },
      { kana: ['ビャ', 'ビュ', 'ビョ'], romaji: ['bya', 'byu', 'byo'] },
      { kana: ['ピャ', 'ピュ', 'ピョ'], romaji: ['pya', 'pyu', 'pyo'] }
    ]
  }
};

const KanaQuiz: React.FC<KanaQuizProps> = ({ type, difficulty = 'beginner' }) => {
  const theme = useTheme();
  const { playAudio } = useAudio();
  const { updateWordProgress, updateSectionProgress, addStudySession, progress } = useProgress();
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

  // Generate questions based on difficulty and type
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const newQuestions = generateQuestions(type, difficulty);
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setShowInstructions(false);
    }
  }, [type, difficulty, quizStarted]);

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
      updateSectionProgress(type, {
        totalItems: questions.length,
        masteredItems: score,
        inProgressItems: questions.length - score,
        notStartedItems: 0,
        lastStudied: Date.now(),
        streak: 1, // This will be updated by the streak system
        averageMastery: score / questions.length
      });

      // Update individual kana progress
      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const currentProgress = progress.words[question.kana] || {
          masteryLevel: 0,
          consecutiveCorrect: 0,
          lastAnswerCorrect: false,
          correctAnswers: 0,
          incorrectAnswers: 0
        };

        updateWordProgress(question.kana, {
          lastReviewed: Date.now(),
          reviewCount: (currentProgress.reviewCount || 0) + 1,
          nextReviewDate: Date.now() + (isCorrect ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
          category: type,
          section: type,
          difficulty: difficulty,
          lastAnswerCorrect: isCorrect,
          correctAnswers: isCorrect ? (currentProgress.correctAnswers || 0) + 1 : (currentProgress.correctAnswers || 0),
          incorrectAnswers: !isCorrect ? (currentProgress.incorrectAnswers || 0) + 1 : (currentProgress.incorrectAnswers || 0)
        });
      });
    }
  }, [quizCompleted, score, questions, type, difficulty, answers, addStudySession, updateSectionProgress, updateWordProgress, progress]);

  const generateQuestions = (type: 'hiragana' | 'katakana', difficulty: string): QuizQuestion[] => {
    const allKana: { kana: string; romaji: string }[] = [];

    // Collect all kana and romaji pairs
    Object.values(kanaData[type]).forEach(category => {
      category.forEach(row => {
        row.kana.forEach((kana, index) => {
          if (kana) {
            allKana.push({ kana, romaji: row.romaji[index] });
          }
        });
      });
    });

    // Filter based on difficulty
    let filteredKana = allKana;
    if (difficulty === 'beginner') {
      filteredKana = allKana.filter(k => kanaData[type].gojuon.some(row => row.kana.includes(k.kana)));
    } else if (difficulty === 'intermediate') {
      filteredKana = allKana.filter(k => 
        kanaData[type].gojuon.some(row => row.kana.includes(k.kana)) ||
        kanaData[type].dakuon.some(row => row.kana.includes(k.kana))
      );
    }

    // Generate questions
    const questions: QuizQuestion[] = [];
    const numQuestions = 10;

    for (let i = 0; i < numQuestions; i++) {
      // Alternate between romaji-to-kana and kana-to-romaji
      const questionType = i % 2 === 0 ? 'romaji-to-kana' : 'kana-to-romaji';
      const correctKana = filteredKana[Math.floor(Math.random() * filteredKana.length)];
      
      // Generate options based on question type
      const options = questionType === 'romaji-to-kana' 
        ? [correctKana.kana]  // Options will be kana characters
        : [correctKana.romaji]; // Options will be romaji

      while (options.length < 4) {
        const randomKana = filteredKana[Math.floor(Math.random() * filteredKana.length)];
        const option = questionType === 'romaji-to-kana' ? randomKana.kana : randomKana.romaji;
        if (!options.includes(option)) {
          options.push(option);
        }
      }

      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      questions.push({
        kana: correctKana.kana,
        romaji: correctKana.romaji,
        correctAnswer: questionType === 'romaji-to-kana' ? correctKana.kana : correctKana.romaji,
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

  if (showInstructions) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            {type === 'hiragana' ? 'Hiragana' : 'Katakana'} Quiz Instructions
          </Typography>
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1" gutterBottom>
              • You will be presented with 10 questions
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Questions alternate between two types:
            </Typography>
            <Typography variant="body1" sx={{ pl: 2 }} gutterBottom>
              - Romaji to Kana: Select the correct kana for the given romaji
            </Typography>
            <Typography variant="body1" sx={{ pl: 2 }} gutterBottom>
              - Kana to Romaji: Select the correct romaji for the given kana
            </Typography>
            <Typography variant="body1" gutterBottom>
              • You can listen to the pronunciation by clicking the speaker icon
            </Typography>
            <Typography variant="body1" gutterBottom>
              • Your progress will be tracked and saved
            </Typography>
            <Typography variant="body1">
              • Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Typography>
          </Alert>
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
            {type === 'hiragana' ? 'Hiragana' : 'Katakana'} Quiz
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Test your knowledge of {type === 'hiragana' ? 'hiragana' : 'katakana'} characters.
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
            fontFamily: currentQuestion.type === 'romaji-to-kana' ? 'inherit' : 'Noto Sans JP, sans-serif'
          }}>
            {currentQuestion.type === 'romaji-to-kana' ? currentQuestion.romaji : currentQuestion.kana}
          </Typography>
          <Tooltip title="Listen to pronunciation">
            <IconButton 
              onClick={() => playAudio(currentQuestion.romaji)}
              size="large"
              color="primary"
              sx={{ mb: 2 }}
            >
              <VolumeIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" color="text.secondary">
            {currentQuestion.type === 'romaji-to-kana' 
              ? 'Select the correct kana for this romaji'
              : 'Select the correct romaji for this kana'}
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
                          fontFamily: currentQuestion.type === 'kana-to-romaji' ? 'inherit' : 'Noto Sans JP, sans-serif'
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

        {showFeedback && (
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

export default KanaQuiz; 