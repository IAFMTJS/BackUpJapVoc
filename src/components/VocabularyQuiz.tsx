import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { allWords } from '../data/japaneseWords';
import { useProgress } from '../context/ProgressContext';
import { useSound } from '../context/SoundContext';
import { useWordLevel } from '../context/WordLevelContext';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert } from '@mui/material';
import { playAudio, playDynamicAudio } from '../utils/audio';

type Difficulty = 'easy' | 'medium' | 'hard' | 'extraHard';
type QuizType = 'multiple-choice' | 'writing';
type AnswerType = 'romaji' | 'english';
type QuizMode = 'setup' | 'quiz' | 'result';

interface QuizSettings {
  category: string;
  difficulty: Difficulty;
  questionCount: number;
  quizType: QuizType;
  answerType: AnswerType;
  level: number;
}

interface QuizState {
  mode: QuizMode;
  currentQuestion: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  currentWord: any | null;
  questions: any[];
  score: number;
  totalQuestions: number;
  completed: boolean;
}

const VocabularyQuiz: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings: appSettings } = useApp();
  const { updateProgress, progress } = useProgress();
  const { currentLevel, unlockedLevels } = useWordLevel();
  const { playSound } = useSound();

  const [settings, setSettings] = useState<QuizSettings>({
    category: 'all',
    difficulty: 'easy',
    questionCount: 10,
    quizType: 'multiple-choice',
    answerType: 'romaji',
    level: currentLevel
  });

  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'setup',
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    showCorrect: false,
    currentWord: null,
    questions: [],
    score: 0,
    totalQuestions: 0,
    completed: false
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Get available categories
  const getAvailableCategories = useCallback(() => {
    const categorySet = new Set<string>();
    allWords.forEach(word => {
      if (word.category && word.category !== 'hiragana' && word.category !== 'katakana') {
        categorySet.add(word.category);
      }
    });
    return Array.from(categorySet).map(cat => ({ 
      id: cat, 
      name: cat.charAt(0).toUpperCase() + cat.slice(1) 
    }));
  }, []);

  const [categories] = useState(getAvailableCategories());

  // Filter words based on settings
  const getFilteredWords = useCallback(() => {
    return allWords.filter(word => {
      // Exclude hiragana and katakana words
      if (word.category === 'hiragana' || word.category === 'katakana') {
        return false;
      }
      
      // Filter by level
      if (word.level > settings.level) {
        return false;
      }

      // Filter by category
      if (settings.category !== 'all' && word.category !== settings.category) {
        return false;
      }

      return true;
    });
  }, [settings.category, settings.level]);

  const handleStartQuiz = useCallback(() => {
    const filteredWords = getFilteredWords();
    console.log('Filtered words count:', filteredWords.length);

    if (filteredWords.length === 0) {
      alert('No words available for the selected settings. Please try different settings.');
      return;
    }

    // Shuffle and select questions
    const shuffled = [...filteredWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.questionCount);

    setQuizState({
      mode: 'quiz',
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      currentWord: shuffled[0],
      questions: shuffled,
      score: 0,
      totalQuestions: shuffled.length,
      completed: false
    });

    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
  }, [getFilteredWords, settings.questionCount]);

  const generateOptions = useCallback((correctWord: any, allWords: any[]) => {
    const otherWords = allWords.filter(word => 
      word.category === correctWord.category && 
      word.english !== correctWord.english
    );
    const shuffled = [...otherWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(word => word.english);
    return [...shuffled, correctWord.english].sort(() => Math.random() - 0.5);
  }, []);

  const checkAnswer = useCallback((answer: string, selectedIndex: number) => {
    const currentWord = quizState.questions[quizState.currentQuestion];
    let isCorrect = false;

    if (settings.difficulty === 'easy') {
      isCorrect = answer.trim().toLowerCase() === currentWord.english.toLowerCase();
    } else if (settings.difficulty === 'medium') {
      isCorrect = answer.trim().toLowerCase() === (currentWord.romaji || '').toLowerCase();
    } else if (settings.difficulty === 'hard') {
      isCorrect = 
        answer.trim().toLowerCase() === (currentWord.romaji || '').toLowerCase() ||
        answer.trim().toLowerCase() === currentWord.english.toLowerCase();
    }

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: selectedIndex,
      showFeedback: true,
      isCorrect,
      showCorrect: true
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCurrentStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      playSound('correct');
    } else {
      setCurrentStreak(0);
      playSound('incorrect');
    }

    // Update progress
    updateProgress('vocabulary', currentWord.japanese, isCorrect);
  }, [quizState.currentQuestion, quizState.questions, settings.difficulty, bestStreak, playSound, updateProgress]);

  const handleNextQuestion = useCallback(() => {
    if (!quizState.showFeedback) return;

    if (quizState.currentQuestion + 1 >= quizState.questions.length) {
      setQuizState(prev => ({
        ...prev,
        mode: 'result',
        completed: true
      }));
      return;
    }

    const nextQuestionIndex = quizState.currentQuestion + 1;
    setQuizState(prev => ({
      ...prev,
      currentQuestion: nextQuestionIndex,
      currentWord: prev.questions[nextQuestionIndex],
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      selectedAnswer: null
    }));

    setUserAnswer('');
  }, [quizState.showFeedback, quizState.currentQuestion, quizState.questions.length]);

  const handleRestart = useCallback(() => {
    setQuizState({
      mode: 'setup',
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      currentWord: null,
      questions: [],
      score: 0,
      totalQuestions: 0,
      completed: false
    });
    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setUserAnswer('');
  }, []);

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  const renderQuizSetup = () => (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Vocabulary Quiz
      </Typography>
      <Typography variant="body1" gutterBottom>
        Test your knowledge of Japanese vocabulary. Choose a category and difficulty to start the quiz.
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={settings.category}
            label="Category"
            onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Level</InputLabel>
          <Select
            value={settings.level}
            label="Level"
            onChange={(e) => setSettings(prev => ({ ...prev, level: Number(e.target.value) }))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
              <MenuItem 
                key={level} 
                value={level}
                disabled={!unlockedLevels.includes(level)}
              >
                Level {level} {!unlockedLevels.includes(level) && '(Locked)'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={settings.difficulty}
            label="Difficulty"
            onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
          >
            <MenuItem value="easy">Easy (Multiple Choice)</MenuItem>
            <MenuItem value="medium">Medium (Type Romaji)</MenuItem>
            <MenuItem value="hard">Hard (Type Romaji or English)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Number of Questions</InputLabel>
          <Select
            value={settings.questionCount}
            label="Number of Questions"
            onChange={(e) => setSettings(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
          >
            <MenuItem value={10}>10 Questions</MenuItem>
            <MenuItem value={20}>20 Questions</MenuItem>
            <MenuItem value={50}>50 Questions</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleStartQuiz}
          sx={{ mt: 2 }}
        >
          Start Quiz
        </Button>
      </Box>
    </Box>
  );

  const renderQuizContent = () => {
    if (!quizState.currentWord) return null;

    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question {quizState.currentQuestion + 1} of {quizState.questions.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Score: {score}/{quizState.currentQuestion + 1}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Current Streak: {currentStreak} (Best: {bestStreak})
          </Typography>
        </Box>

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
            {quizState.currentWord.japanese}
            <button
              onClick={() => handlePlayAudio(quizState.currentWord.japanese)}
              className="ml-2 p-2 rounded-full hover:bg-opacity-10"
              title="Play Audio"
            >
              🔊
            </button>
          </Typography>
          {settings.difficulty === 'medium' && (
            <Typography variant="body1" color="text.secondary">
              Type the romaji
            </Typography>
          )}
          {settings.difficulty === 'hard' && (
            <Typography variant="body1" color="text.secondary">
              Type the romaji or English
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {quizState.currentWord.japanese}
          </Typography>
          {settings.difficulty === 'easy' && (
            <Typography variant="body1" color="text.secondary">
              {quizState.currentWord.romaji}
            </Typography>
          )}
        </Box>

        {settings.difficulty === 'easy' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {generateOptions(quizState.currentWord, quizState.questions).map((option, index) => (
              <Button
                key={index}
                variant="outlined"
                fullWidth
                onClick={() => !quizState.showFeedback && checkAnswer(option, index)}
                sx={{
                  justifyContent: 'flex-start',
                  ...(quizState.selectedAnswer === index && {
                    bgcolor: quizState.isCorrect ? 'success.light' : 'error.light',
                    color: quizState.isCorrect ? 'success.dark' : 'error.dark',
                  })
                }}
                disabled={quizState.showFeedback}
              >
                {option}
              </Button>
            ))}
          </Box>
        ) : (
          <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            checkAnswer(userAnswer, -1);
          }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={settings.difficulty === 'medium' ? 'Type the romaji' : 'Type the romaji or English'}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
                disabled={quizState.showFeedback}
              />
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={quizState.showFeedback || !userAnswer.trim()}
            >
              Check Answer
            </Button>
          </Box>
        )}

        {quizState.showFeedback && (
          <Box sx={{ mt: 4 }}>
            <Alert 
              severity={quizState.isCorrect ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {quizState.isCorrect ? 'Correct!' : 'Incorrect!'}
            </Alert>
            <Typography variant="body1" gutterBottom>
              Correct Answer: {quizState.currentWord.english}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Romaji: {quizState.currentWord.romaji}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleNextQuestion}
              sx={{ mt: 2 }}
            >
              {quizState.currentQuestion + 1 < quizState.questions.length ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const renderResult = () => (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Quiz Complete!
      </Typography>
      <Typography variant="h5" gutterBottom>
        Final Score: {score}/{quizState.questions.length}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Best Streak: {bestStreak}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleRestart}
        sx={{ mt: 4 }}
      >
        Start New Quiz
      </Button>
    </Box>
  );

  return (
    <Box>
      {quizState.mode === 'setup' && renderQuizSetup()}
      {quizState.mode === 'quiz' && renderQuizContent()}
      {quizState.mode === 'result' && renderResult()}
    </Box>
  );
};

export default VocabularyQuiz; 