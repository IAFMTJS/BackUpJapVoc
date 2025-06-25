import { EmotionalCategory } from '../types/dictionary';

export const EMOTIONAL_CATEGORIES: Record<EmotionalCategory, { emoji: string; color: string }> = {
  flirting: { emoji: '😘', color: '#ff69b4' },
  anger: { emoji: '😠', color: '#ff4444' },
  love: { emoji: '❤️', color: '#ff1493' },
  happiness: { emoji: '😊', color: '#ffd700' },
  sadness: { emoji: '😢', color: '#4169e1' },
  surprise: { emoji: '😲', color: '#ffa500' },
  fear: { emoji: '😨', color: '#800080' },
  disgust: { emoji: '🤢', color: '#556b2f' },
  neutral: { emoji: '😐', color: '#808080' },
  respect: { emoji: '🙏', color: '#8b4513' },
  embarrassment: { emoji: '😳', color: '#ff69b4' },
  shame: { emoji: '😔', color: '#696969' },
  gratitude: { emoji: '🙏', color: '#32cd32' },
  pride: { emoji: '😌', color: '#ffd700' },
  excitement: { emoji: '🤩', color: '#ff4500' },
  relief: { emoji: '😌', color: '#98fb98' },
  loneliness: { emoji: '😔', color: '#4682b4' },
  determination: { emoji: '💪', color: '#dc143c' },
  nostalgia: { emoji: '🥺', color: '#daa520' }
};

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
  respect: '#8b4513',  // Saddle brown
  embarrassment: '#ff69b4', // Hot pink
  shame: '#696969',    // Dim gray
  gratitude: '#32cd32', // Lime green
  pride: '#ffd700',    // Gold
  excitement: '#ff4500', // Orange red
  relief: '#98fb98',   // Pale green
  loneliness: '#4682b4', // Steel blue
  determination: '#dc143c', // Crimson
  nostalgia: '#daa520' // Goldenrod
}; 