import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { useApp } from '../context/AppContext';
import type { Settings } from '../context/AppContext';
import { quizWords, Category } from '../data/quizData';

interface WordPair {
  id: string;
  japanese: string;
  english: string;
  hiragana: string;
  isMatched?: boolean;
  isSelected?: boolean;
}

interface GameState {
  isPlaying: boolean;
  score: number;
  timeLeft: number;
  level: number;
  mistakes: number;
}

interface Card {
  id: string;
  content: string;
  type: string;
  isFlipped: boolean;
  isMatched: boolean;
  match?: string;
}

interface SentenceWord {
  id: number;
  word: string;
  type: string;
  isPlaced: boolean;
}

interface GameSettings {
  showRomajiGames: boolean;
  showKanjiGames: boolean;
}

// Separate game states
interface BaseGameState {
  isPlaying: boolean;
  score: number;
  mistakes: number;
}

interface MemoryCard {
  id: number;
  word: string;
  match: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameState extends BaseGameState {
  cards: MemoryCard[];
  feedback: string;
  isWin: boolean;
}

interface MatchingPair {
  id: number;
  japanese: string;
  english: string;
  hiragana: string;
  isMatched: boolean;
  isSelected: boolean;
}

interface MatchingGameState extends BaseGameState {
  pairs: MatchingPair[];
}

interface SentenceGameState extends BaseGameState {
  currentSentence: typeof sentenceExamples[0];
  choices: SentenceWord[];
  answer: SentenceWord[];
  feedback: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizGameState extends BaseGameState {
  currentQuestion: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  questions: QuizQuestion[];
}

interface AssociationGameState extends BaseGameState {
  currentWord: string;
  selectedAssociations: string[];
  correctAssociations: string[];
}

const sentenceExamples = [
  { english: 'I am a student.', japanese: 'わたし は がくせい です' },
  { english: 'I go to school every day.', japanese: '毎日 学校 に 行きます' },
  { english: 'I study Japanese.', japanese: '日本語 を 勉強 します' },
  { english: 'I drink coffee in the morning.', japanese: '朝 コーヒー を のみます' },
  { english: 'Tomorrow I will eat sushi.', japanese: '明日 すし を たべます' }
] as const;

const Section8: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
            ← Back to Home
          </Link>
          <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
            Practice Exercises
          </h1>
        </div>

        <div className={themeClasses.card}>
          <h2 className={`text-2xl font-semibold mb-6 ${themeClasses.text.primary}`}>
            Practice Exercises
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className={themeClasses.button.primary}>
              Start Quiz
            </button>
            <button className={themeClasses.button.secondary}>
              View Examples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section8;