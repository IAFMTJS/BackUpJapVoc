import { EmotionalCategory } from '../types/dictionary';

export const EMOTIONAL_EMOJIS: Record<EmotionalCategory, string> = {
  flirting: '😘',
  anger: '😠',
  love: '❤️',
  happiness: '😊',
  sadness: '😢',
  surprise: '😲',
  fear: '😨',
  disgust: '🤢',
  neutral: '😐',
  respect: '🙏',
  embarrassment: '😳',
  shame: '😔',
  gratitude: '🙏',
  pride: '😌',
  excitement: '🤩',
  relief: '😌',
  loneliness: '😔',
  determination: '💪',
  nostalgia: '🥺'
};

export const EMOTIONAL_COLORS: Record<EmotionalCategory, string> = {
  flirting: '#ff69b4', // Hot pink
  anger: '#ff4444',    // Red
  love: '#ff1493',     // Deep pink
  happiness: '#ffd700', // Gold
  sadness: '#4169e1',  // Royal blue
  surprise: '#ffa500', // Orange
  fear: '#800080',     // Purple
  disgust: '#556b2f',  // Dark olive green
  neutral: '#808080',  // Gray
  respect: '#4b0082',  // Indigo
  embarrassment: '#ff69b4', // Hot pink
  shame: '#8b4513',    // Saddle brown
  gratitude: '#228b22', // Forest green
  pride: '#daa520',    // Goldenrod
  excitement: '#ff4500', // Orange red
  relief: '#98fb98',   // Pale green
  loneliness: '#4682b4', // Steel blue
  determination: '#b22222', // Firebrick
  nostalgia: '#dda0dd'  // Plum
}; 