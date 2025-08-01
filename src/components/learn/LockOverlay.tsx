import React from 'react';
import { Lock, Target, Star, ArrowRight } from 'lucide-react';
import type { Level } from '../../types/learn';

interface LockOverlayProps {
  level: Level;
  requiredLevels: Level[];
  onClose: () => void;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({
  level,
  requiredLevels,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-elevated rounded-card shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark dark:border-border-dark-dark-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-600 rounded-nav flex items-center justify-center">
                <Lock className="w-6 h-6 text-text-primary dark:text-text-dark-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary">Level Locked</h2>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">Complete requirements to unlock</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-nav transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5 text-text-muted dark:text-text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Level Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
              {level.title}
            </h3>
            <p className="text-text-muted dark:text-text-dark-muted mb-3">
              {level.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-text-muted dark:text-text-dark-muted">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{level.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{level.minScore}% to pass</span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h4 className="font-semibold text-text-primary dark:text-text-dark-primary mb-3">
              Requirements to unlock:
            </h4>
            <div className="space-y-3">
              {requiredLevels.map((requiredLevel) => (
                <div
                  key={requiredLevel.id}
                  className="flex items-center justify-between p-3 bg-light dark:bg-dark rounded-nav"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-nav flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {requiredLevel.id}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary dark:text-text-dark-primary">
                        {requiredLevel.title}
                      </div>
                      <div className="text-sm text-text-muted dark:text-text-dark-muted">
                        {requiredLevel.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Info */}
          <div className="bg-blue-50 rounded-nav p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Progress Required</span>
            </div>
            <p className="text-sm text-blue-700">
              Complete all required levels with a passing score to unlock this level. 
              Each level builds upon the previous ones, so take your time to master the fundamentals.
            </p>
          </div>

          {/* Action */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-gray-700 transition-colors font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                onClose();
                // Navigate to the first required level
                if (requiredLevels.length > 0) {
                  window.location.href = `/learn/${requiredLevels[0].id}`;
                }
              }}
              className="flex-1 px-4 py-2 bg-japanese-red text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-japanese-redLight transition-colors font-medium"
            >
              Start Required Level
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 