import React, { useState } from 'react';
import { AudioManager } from '../services/AudioManager';

interface AudioSettingsProps {
  currentLevel: number;
  onSettingsChange?: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ currentLevel, onSettingsChange }) => {
  const [quality, setQuality] = useState<'high' | 'low'>('high');
  const [maxCacheSize, setMaxCacheSize] = useState(50);
  const [isDownloading, setIsDownloading] = useState(false);

  const audioManager = AudioManager.getInstance();

  const handleQualityChange = (newQuality: 'high' | 'low') => {
    setQuality(newQuality);
    audioManager.setQualitySettings({ quality: newQuality });
    onSettingsChange?.();
  };

  const handleMaxCacheSizeChange = (size: number) => {
    setMaxCacheSize(size);
    audioManager.setQualitySettings({ maxCacheSize: size * 1024 * 1024 }); // Convert to bytes
    onSettingsChange?.();
  };

  const handleDownloadLevel = async (level: number) => {
    setIsDownloading(true);
    try {
      await audioManager.preloadLevelAudio(level);
    } catch (error) {
      console.error('Failed to download level audio:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Audio Settings</h2>
      
      <div className="space-y-4">
        {/* Quality Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Audio Quality</label>
          <div className="mt-1 flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${
                quality === 'high' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => handleQualityChange('high')}
            >
              High
            </button>
            <button
              className={`px-4 py-2 rounded ${
                quality === 'low' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => handleQualityChange('low')}
            >
              Low
            </button>
          </div>
        </div>

        {/* Cache Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maximum Cache Size (MB)
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={maxCacheSize}
            onChange={(e) => handleMaxCacheSizeChange(Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>

        {/* Download Current Level */}
        <div>
          <button
            onClick={() => handleDownloadLevel(currentLevel)}
            disabled={isDownloading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            {isDownloading ? 'Downloading...' : 'Download Current Level Audio'}
          </button>
        </div>
      </div>
    </div>
  );
}; 