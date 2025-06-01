import React, { useState, useEffect } from 'react';
import { useKanji } from '../context/KanjiContext';
import { Kanji } from '../context/KanjiContext';

const LearnKanji: React.FC = () => {
  const {
    kanji,
    kanjiProgress,
    isLoading,
    error,
    getKanjiByLevel,
    getKanjiByJLPT,
    getKanjiForReview,
    getMasteredKanji,
    getKanjiNeedingReview,
    calculateMasteryLevel,
    updateWritingScore,
    updateReadingScore
  } = useKanji();

  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedJLPT, setSelectedJLPT] = useState<string>('N5');
  const [viewMode, setViewMode] = useState<'learn' | 'review' | 'mastered'>('learn');
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showReading, setShowReading] = useState(false);

  // Get kanji based on current filters
  const filteredKanji = React.useMemo(() => {
    switch (viewMode) {
      case 'learn':
        return getKanjiByLevel(selectedLevel);
      case 'review':
        return getKanjiNeedingReview();
      case 'mastered':
        return getMasteredKanji();
      default:
        return [];
    }
  }, [viewMode, selectedLevel, getKanjiByLevel, getKanjiNeedingReview, getMasteredKanji]);

  // Calculate overall progress
  const progress = React.useMemo(() => {
    if (kanji.length === 0) return 0;
    const masteredCount = getMasteredKanji().length;
    return (masteredCount / kanji.length) * 100;
  }, [kanji.length, getMasteredKanji]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading kanji data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Learn Kanji</h1>
      
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(progress)}% Mastered</span>
          <span>{getMasteredKanji().length} / {kanji.length} Kanji</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View Mode
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'learn' | 'review' | 'mastered')}
          >
            <option value="learn">Learn New</option>
            <option value="review">Review</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        {viewMode === 'learn' && (
          <>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JLPT Level
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedJLPT}
                onChange={(e) => setSelectedJLPT(e.target.value)}
              >
                {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Kanji Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredKanji.map((k) => {
          const progress = kanjiProgress[k.id];
          const masteryLevel = calculateMasteryLevel(k.id);
          
          return (
            <div
              key={k.id}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedKanji?.id === k.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedKanji(k)}
            >
              <div className="text-4xl font-bold text-center mb-2">{k.character}</div>
              <div className="text-sm text-gray-600 text-center">
                {k.strokeCount} strokes
              </div>
              {progress && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${masteryLevel * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kanji Detail Modal */}
      {selectedKanji && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-4xl font-bold">{selectedKanji.character}</h2>
                <p className="text-gray-600">{selectedKanji.strokeCount} strokes</p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedKanji(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Readings</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">On'yomi: </span>
                    <span>{selectedKanji.readings.onyomi.join('、')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Kun'yomi: </span>
                    <span>{selectedKanji.readings.kunyomi.join('、')}</span>
                  </div>
                  {selectedKanji.readings.nanori.length > 0 && (
                    <div>
                      <span className="text-gray-600">Nanori: </span>
                      <span>{selectedKanji.readings.nanori.join('、')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Meanings</h3>
                <div className="space-y-1">
                  {selectedKanji.meanings.map((meaning, index) => (
                    <div key={index} className="text-gray-700">
                      {index + 1}. {meaning}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Radicals</h3>
              <div className="flex flex-wrap gap-2">
                {selectedKanji.radicals.map((radical, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded text-sm"
                  >
                    {radical}
                  </span>
                ))}
              </div>
            </div>

            {/* Practice Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => {
                  // TODO: Implement writing practice
                  console.log('Writing practice for', selectedKanji.character);
                }}
              >
                Practice Writing
              </button>
              <button
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                onClick={() => {
                  // TODO: Implement reading practice
                  console.log('Reading practice for', selectedKanji.character);
                }}
              >
                Practice Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnKanji; 