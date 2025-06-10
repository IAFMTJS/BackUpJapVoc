import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useDatabase } from '../context/DatabaseContext';
import { DictionaryItem } from '../types/dictionary';
import { wordsByLevel } from '../data/japaneseWords';

interface DownloadProgress {
  level: number;
  progress: number;
  total: number;
  status: 'idle' | 'downloading' | 'complete' | 'error';
}

const AudioDownloader: React.FC = () => {
  const { db } = useDatabase();
  const [words, setWords] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<number, DownloadProgress>>({});
  const [isDownloading, setIsDownloading] = useState(false);

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

  const downloadAudioFiles = async (level: number) => {
    const levelWords = getWordsByLevel(level);
    const totalFiles = levelWords.length * 3; // Each word has 1 main audio + 2 examples
    let completedFiles = 0;

    setDownloadProgress(prev => ({
      ...prev,
      [level]: { level, progress: 0, total: totalFiles, status: 'downloading' }
    }));

    try {
      // Create a zip file for this level
      const zip = new JSZip();
      const audioFolder = zip.folder(`level-${level}`);

      // Download all audio files for this level
      for (const word of levelWords) {
        // Download main word audio
        try {
          const response = await fetch(`/audio/${word.id}.mp3`);
          if (response.ok) {
            const blob = await response.blob();
            audioFolder?.file(`${word.id}.mp3`, blob);
          }
          completedFiles++;
          setDownloadProgress(prev => ({
            ...prev,
            [level]: {
              ...prev[level],
              progress: completedFiles,
              status: 'downloading'
            }
          }));
        } catch (error) {
          console.error(`Error downloading ${word.id}.mp3:`, error);
        }

        // Download example audios
        for (let i = 1; i <= 2; i++) {
          try {
            const response = await fetch(`/audio/${word.id}_example_${i}.mp3`);
            if (response.ok) {
              const blob = await response.blob();
              audioFolder?.file(`${word.id}_example_${i}.mp3`, blob);
            }
            completedFiles++;
            setDownloadProgress(prev => ({
              ...prev,
              [level]: {
                ...prev[level],
                progress: completedFiles,
                status: 'downloading'
              }
            }));
          } catch (error) {
            console.error(`Error downloading ${word.id}_example_${i}.mp3:`, error);
          }
        }
      }

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `japanese-audio-level-${level}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadProgress(prev => ({
        ...prev,
        [level]: { level, progress: totalFiles, total: totalFiles, status: 'complete' }
      }));
    } catch (error) {
      console.error('Error creating zip file:', error);
      setDownloadProgress(prev => ({
        ...prev,
        [level]: { level, progress: completedFiles, total: totalFiles, status: 'error' }
      }));
    }
  };

  const downloadAllLevels = async () => {
    setIsDownloading(true);
    const levels = Object.keys(wordsByLevel).map(Number);
    
    for (const level of levels) {
      await downloadAudioFiles(level);
    }
    
    setIsDownloading(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2 className="text-xl font-bold mb-4">Download Audio Files</h2>
      <p className="text-gray-600 mb-4">
        Download audio files for offline use. Files are organized by level and include both word pronunciations and example sentences.
      </p>
      
      <div className="space-y-4">
        {Object.keys([...Array(5)]).map(level => {
          const levelNum = Number(level) + 1;
          const levelWords = getWordsByLevel(levelNum);
          const progress = downloadProgress[levelNum];
          
          return (
            <Box key={level} sx={{ mb: 2 }}>
              <Typography variant="h6">Level {levelNum}</Typography>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-600">{levelWords.length} words</p>
                </div>
                <button
                  onClick={() => downloadAudioFiles(levelNum)}
                  disabled={progress?.status === 'downloading'}
                  className={`px-4 py-2 rounded ${
                    progress?.status === 'downloading'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {progress?.status === 'downloading' ? 'Downloading...' : 'Download'}
                </button>
              </div>
              
              {progress && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      progress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.total ? (progress.progress / progress.total) * 100 : 0}%` }}
                  ></div>
                </div>
              )}
              
              {progress?.status === 'complete' && (
                <p className="text-sm text-green-600 mt-1">Download complete!</p>
              )}
              {progress?.status === 'error' && (
                <p className="text-sm text-red-600 mt-1">Error downloading files</p>
              )}
            </Box>
          );
        })}
        
        <button
          onClick={downloadAllLevels}
          disabled={isDownloading}
          className={`w-full px-4 py-2 rounded ${
            isDownloading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isDownloading ? 'Downloading All Levels...' : 'Download All Levels'}
        </button>
      </div>
    </Box>
  );
};

export default AudioDownloader; 