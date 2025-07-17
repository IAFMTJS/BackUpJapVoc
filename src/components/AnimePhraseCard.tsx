import React from 'react';
import { playAudio, playDynamicAudio } from '../utils/audio';

interface AnimePhraseCardProps {
  japanese: string;
  romaji: string;
  english: string;
  context: string;
  example: string;
  category: string;
  showRomaji: boolean;
  showEnglish: boolean;
  animeImage?: string;
  characterName?: string;
  animeTitle?: string;
  id?: string;
}

const AnimePhraseCard: React.FC<AnimePhraseCardProps> = ({
  japanese,
  romaji,
  english,
  context,
  example,
  category,
  showRomaji,
  showEnglish,
  animeImage,
  characterName,
  animeTitle,
  id
}) => {
  // Use the provided animeImage directly, it should already be a full path
  const imageUrl = animeImage || '/anime/default.JPG';

  const handlePlayAudio = () => {
    playAudio(japanese);
  };

  return (
    <div className="bg-white dark:bg-dark-elevated dark:bg-gray-800 rounded-nav shadow-lg overflow-hidden flex flex-col md:flex-row items-stretch">
      {/* Left: Text Content */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary dark:text-text-primary dark:text-text-dark-primary mb-2">
          {japanese}
        </h2>
        <button
          onClick={handlePlayAudio}
          className="ml-2 p-2 rounded-full hover:bg-opacity-10"
          title="Play Audio"
        >
          🔊
        </button>
        {showRomaji && (
          <p className="text-xl text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary mb-2">
            {romaji}
          </p>
        )}
        {showEnglish && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-text-primary dark:text-text-dark-primary mb-2">
              {english}
            </h3>
          </div>
        )}
        <div className="space-y-4 mb-2">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-nav">
            <p className="text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">
              <span className="font-semibold">Context:</span> {context}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-nav">
            <p className="text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">
              <span className="font-semibold">Example:</span> {example}
            </p>
          </div>
        </div>
        {/* Category Badge */}
        <div className="mt-2">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-600 text-text-primary dark:text-text-dark-primary dark:bg-purple-900 dark:text-purple-200">
            {category}
          </span>
        </div>
        {characterName && animeTitle && (
          <div className="mt-2 text-sm text-text-muted dark:text-text-dark-muted dark:text-text-secondary dark:text-text-dark-secondary">
            {characterName} - {animeTitle}
          </div>
        )}
      </div>
      {/* Right: Image */}
      <div className="md:w-64 w-full md:h-auto h-48 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
        <img
          src={imageUrl}
          alt={characterName || animeTitle || 'Anime'}
          className="object-cover w-full h-full rounded-none md:rounded-r-lg md:rounded-l-none rounded-b-lg md:rounded-b-none"
        />
      </div>
    </div>
  );
};

export default AnimePhraseCard; 