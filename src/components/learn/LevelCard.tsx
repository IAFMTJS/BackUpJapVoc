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
        return 'bg-blue-600 border-blue-600 text-white';
      case 'vocab':
        return 'bg-green-600 border-green-600 text-white';
      case 'kanji':
        return 'bg-purple-600 border-purple-600 text-white';
      case 'grammar':
        return 'bg-orange-600 border-orange-600 text-white';
      case 'mixed':
        return 'bg-indigo-600 border-indigo-600 text-white';
      default:
        return 'bg-gray-600 border-gray-600 text-white';
    }
  };

  const getBadgeForScore = (score: number) => {
    if (score >= 95) return { icon: '🥇', color: 'text-yellow-700', label: 'Perfect' };
    if (score >= 85) return { icon: '🥈', color: 'text-gray-700', label: 'Excellent' };
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
      className={`group relative bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        status === 'completed' 
          ? 'border-green-500 bg-green-50' 
          : unlocked 
          ? 'border-gray-200 hover:border-indigo-300' 
          : 'border-gray-300 opacity-60'
      }`}
    >
      {/* Level Number Badge */}
      <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
        status === 'completed' 
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
          : unlocked 
          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
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
          <Lock className="w-6 h-6 text-gray-500" />
        ) : (
          <Play className="w-6 h-6 text-indigo-600" />
        )}
      </div>

      {/* Category Icon */}
      <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-r ${getCategoryColor(level.category)} text-white`}>
        {getCategoryIcon(level.category)}
      </div>

      {/* Content */}
      <div className="p-6 pt-16">
        <div className="mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryBgColor(level.category)}`}>
            {level.category}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
          {level.title}
        </h3>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{level.description}</p>
        
        {/* Progress Bar for completed levels */}
        {status === 'completed' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 font-medium">Your Score</span>
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
            <span className="text-gray-600 flex items-center font-medium">
              <Clock className="w-3 h-3 mr-1" />
              Time:
            </span>
            <span className="font-bold text-gray-900">{estimatedTime} min</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Exercises:</span>
            <span className="font-bold text-gray-900">{level.exercises.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Min Score:</span>
            <span className="font-bold text-gray-900">{level.minScore}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Difficulty:</span>
            <div className="flex space-x-1">
              {[...Array(level.difficulty)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            status === 'completed'
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
              : unlocked
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
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
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      )}
    </div>
  );
}; 