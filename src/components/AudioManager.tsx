import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useDatabase } from '../context/DatabaseContext';
import { DictionaryItem } from '../types/dictionary';

interface AudioCache {
  text: string;
  audio: HTMLAudioElement;
}

interface CacheProgress {
  level: number;
  cached: number;
  total: number;
  status: 'idle' | 'caching' | 'complete' | 'error';
}

const AudioManager: React.FC = () => {
  const [cacheProgress, setCacheProgress] = useState<Record<number, CacheProgress>>({});
  const [isCaching, setIsCaching] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<{ url: string; text: string } | null>(null);
  const { db } = useDatabase();
  const [audioCache, setAudioCache] = useState<Record<string, AudioCache>>({});
  const [words, setWords] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWords = async () => {
      if (!db) return;
      try {
        const allWords = await db.getAll('words');
        setWords(allWords);
      } catch (err) {
        setError('Failed to load words from database');
        console.error('Error loading words:', err);
      } finally {
        setLoading(false);
      }
    };
    loadWords();
  }, [db]);

  const getWordsByLevel = useCallback((level: number) => {
    return words.filter(word => word.level === level);
  }, [words]);

  const cacheAudioFiles = async (level: number) => {
    if (!db) return;

    const words = getWordsByLevel(level);
    const totalFiles = words.length * 3; // Each word has 1 main audio + 2 examples
    let cachedFiles = 0;

    setCacheProgress(prev => ({
      ...prev,
      [level]: { level, cached: 0, total: totalFiles, status: 'caching' }
    }));

    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');

    try {
      for (const word of words) {
        // Cache main word audio
        try {
          const response = await fetch(`/audio/${word.id}.mp3`);
          if (response.ok) {
            const blob = await response.blob();
            await store.put({
              id: word.id,
              blob,
              type: 'word',
              text: word.japanese
            });
            cachedFiles++;
            updateProgress(level, cachedFiles, totalFiles);
          }
        } catch (error) {
          console.error(`Error caching ${word.id}.mp3:`, error);
        }

        // Cache example audios
        for (let i = 1; i <= 2; i++) {
          try {
            const response = await fetch(`/audio/${word.id}_example_${i}.mp3`);
            if (response.ok) {
              const blob = await response.blob();
              await store.put({
                id: `${word.id}_example_${i}`,
                blob,
                type: 'example',
                exampleIndex: i,
                text: word.examples[i - 1]?.japanese || ''
              });
              cachedFiles++;
              updateProgress(level, cachedFiles, totalFiles);
            }
          } catch (error) {
            console.error(`Error caching ${word.id}_example_${i}.mp3:`, error);
          }
        }
      }

      setCacheProgress(prev => ({
        ...prev,
        [level]: { level, cached: totalFiles, total: totalFiles, status: 'complete' }
      }));
    } catch (error) {
      console.error('Error caching audio files:', error);
      setCacheProgress(prev => ({
        ...prev,
        [level]: { level, cached: cachedFiles, total: totalFiles, status: 'error' }
      }));
    }
  };

  const updateProgress = (level: number, cached: number, total: number) => {
    setCacheProgress(prev => ({
      ...prev,
      [level]: { level, cached, total, status: 'caching' }
    }));
  };

  const playAudio = async (text: string) => {
    try {
      if (!db) {
        console.error('Database not initialized');
        return;
      }

      // Check cache first
      if (audioCache[text]) {
        audioCache[text].audio.play();
        return;
      }

      // Get audio URL from database
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const index = store.index('by-japanese');
      const word = await index.get(text);

      if (!word) {
        console.error('Word not found in database:', text);
        return;
      }

      // Create and cache audio element
      const audio = new Audio(`/audio/${word.id}.mp3`);
      const cache: AudioCache = { text, audio };
      setAudioCache(prev => ({ ...prev, [text]: cache }));

      // Play audio
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } catch (error) {
      console.error('Error in playAudio:', error);
    }
  };

  const cacheAllLevels = async () => {
    setIsCaching(true);
    const levels = Object.keys(wordsByLevel).map(Number);
    
    for (const level of levels) {
      await cacheAudioFiles(level);
    }
    
    setIsCaching(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <div className="space-y-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Audio Cache Manager</h2>
          <p className="text-gray-600 mb-4">
            Cache audio files for offline use. Once cached, audio will work without internet connection.
          </p>
          
          <div className="space-y-4">
            {Object.keys([...Array(5)]).map(level => {
              const levelNum = Number(level) + 1;
              const levelWords = getWordsByLevel(levelNum);
              const progress = cacheProgress[levelNum];
              
              return (
                <Box key={level} sx={{ mb: 2 }}>
                  <Typography variant="h6">Level {levelNum}</Typography>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        {progress?.cached || 0} of {levelWords.length * 3} files cached
                      </p>
                    </div>
                    <button
                      onClick={() => cacheAudioFiles(levelNum)}
                      disabled={progress?.status === 'caching'}
                      className={`px-4 py-2 rounded ${
                        progress?.status === 'caching'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {progress?.status === 'caching' ? 'Caching...' : 'Cache Audio'}
                    </button>
                  </div>
                  
                  {progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          progress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress.total ? (progress.cached / progress.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {progress?.status === 'complete' && (
                    <p className="text-sm text-green-600 mt-1">All files cached!</p>
                  )}
                  {progress?.status === 'error' && (
                    <p className="text-sm text-red-600 mt-1">Error caching files</p>
                  )}
                </Box>
              );
            })}
            
            <button
              onClick={cacheAllLevels}
              disabled={isCaching}
              className={`w-full px-4 py-2 rounded ${
                isCaching
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isCaching ? 'Caching All Levels...' : 'Cache All Levels'}
            </button>
          </div>
        </div>

        {/* Audio Player */}
        {currentAudio && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{currentAudio.text}</p>
              </div>
              <audio
                src={currentAudio.url}
                controls
                className="flex-1 mx-4"
                onEnded={() => setCurrentAudio(null)}
              />
              <button
                onClick={() => setCurrentAudio(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default AudioManager; 