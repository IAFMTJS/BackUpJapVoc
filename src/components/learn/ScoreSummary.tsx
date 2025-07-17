import React from 'react';
import { Trophy, Star, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import type { LevelResult } from '../../types/learn';

interface ScoreSummaryProps {
  levelResult: LevelResult;
  onContinue: () => void;
  onRetry: () => void;
}

export const ScoreSummary: React.FC<ScoreSummaryProps> = ({
  levelResult,
  onContinue,
  onRetry
}) => {
  const percentage = Math.round((levelResult.score / levelResult.maxPoints) * 100);
  const isPassed = levelResult.passed;
  const timeSpentMinutes = Math.round(levelResult.timeSpent / 1000 / 60);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "🎉 Uitstekend! Je bent een natuurlijk talent!";
    if (percentage >= 80) return "🌟 Geweldig! Je maakt fantastische vooruitgang!";
    if (percentage >= 70) return "👍 Goed werk! Blijf oefenen om te verbeteren!";
    if (percentage >= 60) return "📚 Niet slecht! Een beetje meer oefening helpt.";
    return "💪 Blijf oefenen! Je wordt steeds beter!";
  };

  const getStars = () => {
    if (percentage >= 90) return 3;
    if (percentage >= 75) return 2;
    if (percentage >= 60) return 1;
    return 0;
  };

  const stars = getStars();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          {isPassed ? (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          {isPassed ? '🎉 Level Voltooid!' : '😔 Level Niet Gehaald'}
        </h2>
        
        <p className="text-lg text-text-muted dark:text-text-dark-muted">
          {isPassed ? 'Gefeliciteerd! Je hebt dit level gehaald!' : 'Blijf oefenen en probeer het opnieuw!'}
        </p>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-card p-6 mb-8">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            {percentage}%
          </div>
          <div className="text-lg text-text-muted dark:text-text-dark-muted">
            {levelResult.score} / {levelResult.maxPoints} points
          </div>
        </div>

        {/* Stars */}
        <div className="flex justify-center mb-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 ${
                star <= stars ? 'text-yellow-400 fill-current' : 'text-text-secondary dark:text-text-dark-secondary'
              }`}
            />
          ))}
        </div>

        <p className="text-center text-text-secondary dark:text-text-dark-secondary font-medium">
          {getPerformanceMessage()}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-elevated rounded-nav p-4 border border-border-light dark:border-border-dark dark:border-border-dark-dark-light">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
                        <div className="text-sm text-text-muted dark:text-text-dark-muted">Nauwkeurigheid</div>
          <div className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
            {Math.round((levelResult.exerciseResults.filter(r => r.correct).length / levelResult.exerciseResults.length) * 100)}% 🎯
          </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-elevated rounded-nav p-4 border border-border-light dark:border-border-dark dark:border-border-dark-dark-light">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-green-600" />
            <div>
                        <div className="text-sm text-text-muted dark:text-text-dark-muted">Tijd Besteed</div>
          <div className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
            {timeSpentMinutes}m ⏱️
          </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-elevated rounded-nav p-4 border border-border-light dark:border-border-dark dark:border-border-dark-dark-light">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <div>
                        <div className="text-sm text-text-muted dark:text-text-dark-muted">Vragen</div>
          <div className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
            {levelResult.exerciseResults.length} ❓
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white dark:bg-dark-elevated rounded-nav border border-border-light dark:border-border-dark dark:border-border-dark-dark-light mb-8">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark dark:border-border-dark-dark-light">
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">📊 Vraag Resultaten</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {levelResult.exerciseResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-nav ${
                  result.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Vraag {index + 1}
                  </span>
                </div>
                <div className="text-sm text-text-muted dark:text-text-dark-muted">
                                      {result.correct ? (
                      <span className="text-green-700">✅ Correct</span>
                    ) : (
                      <span className="text-red-700">
                        ❌ {result.userAnswer} → {result.correctAnswer}
                      </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!isPassed && (
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-japanese-red text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-japanese-redLight transition-colors font-medium"
          >
            Try Again
          </button>
        )}
        
        <button
          onClick={onContinue}
          className={`flex-1 px-6 py-3 rounded-nav font-medium transition-colors ${
            isPassed
              ? 'bg-green-600 text-text-primary dark:text-text-dark-primary hover:bg-green-700'
              : 'bg-gray-600 text-text-primary dark:text-text-dark-primary hover:bg-gray-700'
          }`}
        >
          {isPassed ? 'Continue to Next Level' : 'Back to Level Selection'}
        </button>
      </div>

      {/* Encouragement */}
      {!isPassed && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-nav">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              Don't give up! Every attempt makes you stronger. Review the material and try again.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 