import React from 'react';
import { 
  Lock, 
  CheckCircle, 
  Star, 
  Clock, 
  Play,
  RefreshCw
} from 'lucide-react';
import type { Level } from '../../types/learn';

interface LevelCardProps {
  level: Level;
  status: 'completed' | 'unlocked' | 'locked';
  score: number;
  unlocked: boolean;
  onClick: (level: Level) => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  status,
  score,
  unlocked,
  onClick
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kana':
        return 'ひ';
      case 'vocab':
        return '📘';
      case 'kanji':
        return '漢';
      case 'grammar':
        return '🧠';
      case 'mixed':
        return '🔄';
      default:
        return '📚';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'kana':
        return 'from-blue-500 to-blue-600';
      case 'vocab':
        return 'from-green-500 to-green-600';
      case 'kanji':
        return 'from-purple-500 to-purple-600';
      case 'grammar':
        return 'from-orange-500 to-orange-600';
      case 'mixed':
        return 'from-indigo-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'kana':
        return 'bg-japanese-red border-blue-600 text-text-primary dark:text-text-dark-primary';
      case 'vocab':
        return 'bg-green-600 border-green-600 text-text-primary dark:text-text-dark-primary';
      case 'kanji':
        return 'bg-purple-600 border-purple-600 text-text-primary dark:text-text-dark-primary';
      case 'grammar':
        return 'bg-orange-600 border-orange-600 text-text-primary dark:text-text-dark-primary';
      case 'mixed':
        return 'bg-indigo-600 border-indigo-600 text-text-primary dark:text-text-dark-primary';
      default:
        return 'bg-gray-600 border-gray-600 text-text-primary dark:text-text-dark-primary';
    }
  };

  const getBadgeForScore = (score: number) => {
    if (score >= 95) return { icon: '🥇', color: 'text-yellow-700', label: 'Perfect' };
    if (score >= 85) return { icon: '🥈', color: 'text-text-secondary dark:text-text-dark-secondary', label: 'Excellent' };
    if (score >= 75) return { icon: '🥉', color: 'text-amber-700', label: 'Good' };
    return null;
  };

  const getEstimatedTime = (level: Level) => {
    return Math.ceil(level.exercises.length * 1.5); // ~1.5 min per exercise
  };

  const badge = getBadgeForScore(score);
  const estimatedTime = getEstimatedTime(level);

  return (
    <div
      onClick={() => onClick(level)}
      className={`group relative bg-white dark:bg-dark-elevated rounded-card shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        status === 'completed' 
          ? 'border-green-500 bg-green-50' 
          : unlocked 
          ? 'border-border-light dark:border-border-dark dark:border-border-dark-dark-light hover:border-indigo-300' 
          : 'border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium opacity-60'
      }`}
    >
      {/* Level Number Badge */}
      <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
        status === 'completed' 
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-text-primary dark:text-text-dark-primary' 
          : unlocked 
          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-text-primary dark:text-text-dark-primary' 
          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-text-primary dark:text-text-dark-primary'
      }`}>
        {level.id}
      </div>

      {/* Status Icon */}
      <div className="absolute top-4 right-4">
        {status === 'completed' ? (
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-6 h-6 text-green-600" />
            {badge && (
              <span className="text-lg">{badge.icon}</span>
            )}
          </div>
        ) : !unlocked ? (
          <Lock className="w-6 h-6 text-text-muted dark:text-text-dark-muted" />
        ) : (
          <Play className="w-6 h-6 text-indigo-600" />
        )}
      </div>

      {/* Category Icon */}
      <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-r ${getCategoryColor(level.category)} text-text-primary dark:text-text-dark-primary`}>
        {getCategoryIcon(level.category)}
      </div>

      {/* Content */}
      <div className="p-6 pt-16">
        <div className="mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryBgColor(level.category)}`}>
            {level.category}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-2 group-hover:text-indigo-700 transition-colors">
          {level.title}
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4 line-clamp-2">{level.description}</p>
        
        {/* Progress Bar for completed levels */}
        {status === 'completed' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-muted dark:text-text-dark-muted font-medium">Your Score</span>
              <span className="text-xs font-bold text-green-700">{score}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Level Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted dark:text-text-dark-muted flex items-center font-medium">
              <Clock className="w-3 h-3 mr-1" />
              Time:
            </span>
            <span className="font-bold text-text-primary dark:text-text-dark-primary">{estimatedTime} min</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-text-muted dark:text-text-dark-muted font-medium">Exercises:</span>
            <span className="font-bold text-text-primary dark:text-text-dark-primary">{level.exercises.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-text-muted dark:text-text-dark-muted font-medium">Min Score:</span>
            <span className="font-bold text-text-primary dark:text-text-dark-primary">{level.minScore}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-text-muted dark:text-text-dark-muted font-medium">Difficulty:</span>
            <div className="flex space-x-1">
              {[...Array(level.difficulty)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button className={`w-full py-2 px-4 rounded-nav font-medium transition-all duration-200 ${
            status === 'completed'
              ? 'bg-green-600 text-text-primary dark:text-text-dark-primary hover:bg-green-700 shadow-card dark:shadow-dark-card'
              : unlocked
              ? 'bg-indigo-600 text-text-primary dark:text-text-dark-primary hover:bg-indigo-700 shadow-card dark:shadow-dark-card'
              : 'bg-gray-300 text-text-muted dark:text-text-dark-muted cursor-not-allowed'
          }`}>
            {status === 'completed' ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </span>
            ) : unlocked ? (
              <span className="flex items-center justify-center">
                <Play className="w-4 h-4 mr-2" />
                Start
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" />
                Locked
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hover Overlay */}
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      )}
    </div>
  );
}; 