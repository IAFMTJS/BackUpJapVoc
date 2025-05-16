import React, { useState, useEffect } from 'react';
import { wordsByLevel } from '../data/japaneseWords';

interface AudioCache {
  id: string;
  blob: Blob;
  type: 'word' | 'example';
  exampleIndex?: number;
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
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open('JapaneseAudioDB', 1);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };

    request.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      setDb(database);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('audioFiles')) {
        database.createObjectStore('audioFiles', { keyPath: 'id' });
      }
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const cacheAudioFiles = async (level: number) => {
    if (!db) return;

    const words = wordsByLevel[level] || [];
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

  const playAudio = async (id: string, type: 'word' | 'example', exampleIndex?: number) => {
    if (!db) return;

    const transaction = db.transaction(['audioFiles'], 'readonly');
    const store = transaction.objectStore('audioFiles');
    const request = store.get(type === 'example' ? `${id}_example_${exampleIndex}` : id);

    request.onsuccess = (event) => {
      const audioData = (event.target as IDBRequest).result as AudioCache;
      if (audioData) {
        const url = URL.createObjectURL(audioData.blob);
        setCurrentAudio({ url, text: audioData.text });
      }
    };
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
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Audio Cache Manager</h2>
        <p className="text-gray-600 mb-4">
          Cache audio files for offline use. Once cached, audio will work without internet connection.
        </p>
        
        <div className="space-y-4">
          {Object.keys(wordsByLevel).map(level => {
            const progress = cacheProgress[Number(level)];
            const words = wordsByLevel[Number(level)];
            
            return (
              <div key={level} className="border rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold">Level {level}</h3>
                    <p className="text-sm text-gray-600">
                      {progress?.cached || 0} of {words.length * 3} files cached
                    </p>
                  </div>
                  <button
                    onClick={() => cacheAudioFiles(Number(level))}
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
                      style={{ width: `${(progress.cached / progress.total) * 100}%` }}
                    ></div>
                  </div>
                )}
                
                {progress?.status === 'complete' && (
                  <p className="text-sm text-green-600 mt-1">All files cached!</p>
                )}
                {progress?.status === 'error' && (
                  <p className="text-sm text-red-600 mt-1">Error caching files</p>
                )}
              </div>
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
  );
};

export default AudioManager; 