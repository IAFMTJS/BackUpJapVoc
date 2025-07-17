import React, { useState } from 'react';
import { AnimePhrase } from '../types/anime';
import { playAudio } from '../utils/audio';

interface AnimePhraseDetailsProps {
  phrase: AnimePhrase;
  onClose: () => void;
}

interface DifficultyRating {
  level: 1 | 2 | 3 | 4 | 5;
  aspects: {
    wordComplexity: number;
    grammarPatterns: number;
    speakingSpeed: number;
    culturalReferences: number;
    subtitleAvailability: number;
  };
  userRating?: number;
}

const AnimePhraseDetails: React.FC<AnimePhraseDetailsProps> = ({ phrase, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'difficulty' | 'prerequisites'>('preview');
  const [showFullList, setShowFullList] = useState(false);

  // Mock difficulty rating - in a real app, this would come from a database
  const difficultyRating: DifficultyRating = {
    level: 3,
    aspects: {
      wordComplexity: 2,
      grammarPatterns: 3,
      speakingSpeed: 4,
      culturalReferences: 2,
      subtitleAvailability: 5
    }
  };

  // Mock word list - in a real app, this would be extracted from the phrase
  const wordList = phrase.japanese.split(' ').map(word => ({
    word,
    meaning: 'Sample meaning', // In a real app, this would come from a dictionary
    difficulty: 'beginner' as const
  }));

  const renderDifficultyStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xl ${
          i < rating ? 'text-yellow-400' : 'text-text-secondary dark:text-text-dark-secondary'
        }`}
      >
        ★
      </span>
    ));
  };

  const renderDifficultyAspect = (label: string, rating: number) => (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary">{label}</span>
      <div className="flex gap-1">
        {renderDifficultyStars(rating)}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-elevated dark:bg-gray-800 rounded-nav shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark dark:border-border-dark-dark-light dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary dark:text-text-primary dark:text-text-dark-primary mb-2">
                {phrase.japanese}
              </h2>
              <p className="text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary">{phrase.romaji}</p>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted dark:text-text-dark-muted hover:text-text-secondary dark:text-text-dark-secondary dark:text-gray-400 dark:hover:text-text-secondary dark:text-text-dark-secondary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-nav ${
                activeTab === 'preview'
                  ? 'bg-japanese-red text-text-primary dark:text-text-dark-primary'
                  : 'bg-gray-100 text-text-secondary dark:text-text-dark-secondary hover:bg-gray-200'
              }`}
            >
              Word List
            </button>
            <button
              onClick={() => setActiveTab('difficulty')}
              className={`px-4 py-2 rounded-nav ${
                activeTab === 'difficulty'
                  ? 'bg-japanese-red text-text-primary dark:text-text-dark-primary'
                  : 'bg-gray-100 text-text-secondary dark:text-text-dark-secondary hover:bg-gray-200'
              }`}
            >
              Difficulty
            </button>
            <button
              onClick={() => setActiveTab('prerequisites')}
              className={`px-4 py-2 rounded-nav ${
                activeTab === 'prerequisites'
                  ? 'bg-japanese-red text-text-primary dark:text-text-dark-primary'
                  : 'bg-gray-100 text-text-secondary dark:text-text-dark-secondary hover:bg-gray-200'
              }`}
            >
              Prerequisites
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'preview' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Word Breakdown</h3>
                <div className="space-y-2">
                  {(showFullList ? wordList : wordList.slice(0, 5)).map((word, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-light dark:bg-dark dark:bg-gray-700 rounded"
                    >
                      <div>
                        <span className="font-medium">{word.word}</span>
                        <span className="text-sm text-text-muted dark:text-text-dark-muted ml-2">{word.meaning}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {word.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
                {wordList.length > 5 && (
                  <button
                    onClick={() => setShowFullList(!showFullList)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    {showFullList ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'difficulty' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Overall Difficulty</h3>
                <div className="flex items-center gap-2">
                  {renderDifficultyStars(difficultyRating.level)}
                  <span className="text-sm text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary ml-2">
                    Level {difficultyRating.level}/5
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Difficulty Breakdown</h3>
                {renderDifficultyAspect('Word Complexity', difficultyRating.aspects.wordComplexity)}
                {renderDifficultyAspect('Grammar Patterns', difficultyRating.aspects.grammarPatterns)}
                {renderDifficultyAspect('Speaking Speed', difficultyRating.aspects.speakingSpeed)}
                {renderDifficultyAspect('Cultural References', difficultyRating.aspects.culturalReferences)}
                {renderDifficultyAspect('Subtitle Availability', difficultyRating.aspects.subtitleAvailability)}
              </div>
            </div>
          )}

          {activeTab === 'prerequisites' && (
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Required Knowledge</h3>
                  <ul className="list-disc list-inside space-y-2 text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">
                    <li>Basic sentence structure (SOV pattern)</li>
                    <li>Common particles (は、が、を、に)</li>
                    <li>Present tense conjugation</li>
                    <li>Basic vocabulary (100+ words)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommended Learning Path</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-nav">
                      <h4 className="font-medium">Step 1: Basic Grammar</h4>
                      <p className="text-sm text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary">
                        Complete the basic grammar section to understand sentence structure
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900 rounded-nav">
                      <h4 className="font-medium">Step 2: Essential Vocabulary</h4>
                      <p className="text-sm text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary">
                        Learn the core vocabulary needed for this phrase
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-nav">
                      <h4 className="font-medium">Step 3: Cultural Context</h4>
                      <p className="text-sm text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary">
                        Understand the cultural context and usage of this phrase
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimePhraseDetails; 