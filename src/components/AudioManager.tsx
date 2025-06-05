import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, LinearProgress } from '@mui/material';
import { useDatabase } from '../context/DatabaseContext';
import { DictionaryItem } from '../types/dictionary';
import { optimizedAudioService } from '../services/OptimizedAudioService';

interface CacheProgress {
  level: number;
  cached: number;
  total: number;
  status: 'idle' | 'caching' | 'complete' | 'error' | 'loading';
}

const AudioManager: React.FC = () => {
  const { db, wordsByLevel } = useDatabase();
  const [cacheProgress, setCacheProgress] = useState<{ [key: number]: CacheProgress }>({});
  const [isCaching, setIsCaching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWordsByLevel();
  }, [db]);

  const loadWordsByLevel = async () => {
    if (!db) return;

    try {
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const words = await store.getAll();

      const byLevel = words.reduce((acc, word) => {
        const level = word.level || 1;
        if (!acc[level]) acc[level] = [];
        acc[level].push(word);
        return acc;
      }, {} as Record<number, DictionaryItem[]>);

      setWordsByLevel(byLevel);
    } catch (error) {
      console.error('Error loading words by level:', error);
      setError('Failed to load words');
    }
  };

  const cacheAudioFiles = async (level: number) => {
    if (!db || !wordsByLevel[level]) return;

    try {
      const words = wordsByLevel[level];
      const totalFiles = words.length;

      // Get all audio URLs for this level
      const audioUrls = words.map(word => `/audio/${word.id}.mp3`);

      // Set initial progress
      setCacheProgress(prev => ({
        ...prev,
        [level]: { level, cached: 0, total: totalFiles, status: 'loading' }
      }));

      // Subscribe to progress updates
      const unsubscribe = optimizedAudioService.onProgressUpdate((progress) => {
        setCacheProgress(prev => ({
          ...prev,
          [level]: { 
            level, 
            cached: progress.cached, 
            total: progress.total, 
            status: progress.status 
          }
        }));
      });

      // Start preloading
      optimizedAudioService.preloadAudio(audioUrls);

      // Cleanup subscription after 5 minutes (timeout)
      setTimeout(() => {
        unsubscribe();
        setCacheProgress(prev => ({
          ...prev,
          [level]: { 
            level, 
            cached: prev[level]?.cached || 0, 
            total: totalFiles, 
            status: 'error' 
          }
        }));
      }, 300000);

    } catch (error) {
      console.error('Error caching audio files:', error);
      setCacheProgress(prev => ({
        ...prev,
        [level]: { 
          level, 
          cached: 0, 
          total: wordsByLevel[level]?.length || 0, 
          status: 'error' 
        }
      }));
    }
  };

  const playAudio = async (text: string) => {
    try {
      if (!db) {
        console.error('Database not initialized');
        return;
      }

      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const index = store.index('by-japanese');
      const word = await index.get(text);

      if (!word) {
        console.error('Word not found in database:', text);
        return;
      }

      await optimizedAudioService.playAudio(`/audio/${word.id}.mp3`, {
        priority: 'high',
        quality: 'high'
      });
    } catch (error) {
      console.error('Error in playAudio:', error);
      setError('Failed to play audio');
    }
  };

  const cacheAllLevels = async () => {
    setIsCaching(true);
    setError(null);
    
    try {
      const levels = Object.keys(wordsByLevel).map(Number);
      await Promise.all(levels.map(level => cacheAudioFiles(level)));
    } catch (error) {
      console.error('Error caching all levels:', error);
      setError('Failed to cache all levels');
    } finally {
      setIsCaching(false);
    }
  };

  const getLevelProgress = (level: number) => {
    const progress = cacheProgress[level];
    if (!progress) return 0;
    return (progress.cached / progress.total) * 100;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Audio Cache Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={cacheAllLevels}
          disabled={isCaching}
          sx={{ mr: 1 }}
        >
          {isCaching ? 'Caching...' : 'Cache All Levels'}
        </Button>
      </Box>

      {Object.keys(wordsByLevel).map(level => {
        const progress = cacheProgress[Number(level)];
        return (
          <Box key={level} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Level {level} ({progress?.cached || 0}/{progress?.total || 0} files)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={getLevelProgress(Number(level))}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={() => cacheAudioFiles(Number(level))}
                disabled={isCaching || progress?.status === 'caching'}
              >
                {progress?.status === 'caching' ? 'Caching...' : 'Cache Level'}
              </Button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default AudioManager; 