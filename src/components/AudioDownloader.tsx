import React, { useState } from 'react';
import { wordsByLevel } from '../data/japaneseWords';

interface DownloadProgress {
  level: number;
  progress: number;
  total: number;
  status: 'idle' | 'downloading' | 'complete' | 'error';
}

export const AudioDownloader: React.FC = () => {
  const [downloadProgress, setDownloadProgress] = useState<Record<number, DownloadProgress>>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAudioFiles = async (level: number) => {
    const words = wordsByLevel[level] || [];
    const totalFiles = words.length * 3; // Each word has 1 main audio + 2 examples
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
      for (const word of words) {
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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Download Audio Files</h2>
      <p className="text-gray-600 mb-4">
        Download audio files for offline use. Files are organized by level and include both word pronunciations and example sentences.
      </p>
      
      <div className="space-y-4">
        {Object.keys(wordsByLevel).map(level => {
          const progress = downloadProgress[Number(level)];
          const words = wordsByLevel[Number(level)];
          
          return (
            <div key={level} className="border rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">Level {level}</h3>
                  <p className="text-sm text-gray-600">{words.length} words</p>
                </div>
                <button
                  onClick={() => downloadAudioFiles(Number(level))}
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
                    style={{ width: `${(progress.progress / progress.total) * 100}%` }}
                  ></div>
                </div>
              )}
              
              {progress?.status === 'complete' && (
                <p className="text-sm text-green-600 mt-1">Download complete!</p>
              )}
              {progress?.status === 'error' && (
                <p className="text-sm text-red-600 mt-1">Error downloading files</p>
              )}
            </div>
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
    </div>
  );
}; 