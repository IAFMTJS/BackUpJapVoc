import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useDatabase } from '../context/DatabaseContext';
import AudioService from '../services/AudioService';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';
import { getCacheStats, clearCache } from '../utils/AudioCache';
import safeLocalStorage from '../utils/safeLocalStorage';
import { playAudio, debugVoices } from '../utils/audio';

interface AudioSettings {
  useTTS: boolean;
  preferredVoice: string;
  rate: number;
  pitch: number;
  autoPlay: boolean;
  volume: number;
}

const SettingsPage: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { settings: appSettings, updateSettings: updateAppSettings } = useApp();
  const { 
    settings: globalSettings, 
    updateSettings: updateGlobalSettings, 
    isLoading: isSettingsLoading,
    error: settingsError 
  } = useSettings();
  const { 
    progress: progressData, 
    resetProgress, 
    exportProgress,
    importProgress,
    isLoading: isProgressLoading,
    error: progressError 
  } = useProgress();
  const { 
    settings: accessibilitySettings, 
    updateSettings: updateAccessibilitySettings, 
    isLoading: isAccessibilityLoading 
  } = useAccessibility();
  const { database } = useDatabase();

  // State for dialogs and notifications
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDatabaseResetDialog, setShowDatabaseResetDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Audio settings state
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    useTTS: true,
    preferredVoice: '',
    rate: 1,
    pitch: 1,
    autoPlay: false,
    volume: 1,
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [cacheStats, setCacheStats] = useState({ size: 0, entryCount: 0 });
  const [isClearingCache, setIsClearingCache] = useState(false);
  const audioService = AudioService.getInstance();

  // Load initial data
  useEffect(() => {
    // Load available voices
    const voices = audioService.getAvailableVoices();
    setAvailableVoices(voices);
    
    // Load saved audio settings
    try {
      const savedAudioSettings = safeLocalStorage.getItem('audioSettings');
      if (savedAudioSettings) {
        const parsed = JSON.parse(savedAudioSettings);
        setAudioSettings(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
    
    // Set default voice if not set
    if (!audioSettings.preferredVoice && voices.length > 0) {
      const japaneseVoice = voices.find(v => v.lang.includes('ja')) || voices[0];
      setAudioSettings(prev => ({
        ...prev,
        preferredVoice: japaneseVoice.name
      }));
    }

    // Load cache stats
    getCacheStats().then(stats => {
      setCacheStats({
        size: stats.totalSize,
        entryCount: stats.fileCount
      });
    });
  }, []);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Add keyboard shortcut for saving (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleSaveSettings();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, isSaving]);

  // Handlers
  const handlePreferenceChange = (key: string, value: any) => {
    updateGlobalSettings({ [key]: value });
    setHasUnsavedChanges(true);
  };

  const handleAudioSettingsChange = (key: keyof AudioSettings, value: any) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Save audio settings
      safeLocalStorage.setItem('audioSettings', JSON.stringify(audioSettings));
      
      // Save global settings
      await updateGlobalSettings(globalSettings);
      
      setHasUnsavedChanges(false);
      setNotification({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({
        open: true,
        message: 'Failed to save settings. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProgress = async () => {
    try {
      await resetProgress();
      setShowResetDialog(false);
      setNotification({
        open: true,
        message: 'Progress reset successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error resetting progress:', error);
      setNotification({
        open: true,
        message: 'Failed to reset progress. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleExportProgress = async () => {
    try {
      const data = await exportProgress();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `japvoc-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setNotification({
        open: true,
        message: 'Progress exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting progress:', error);
      setNotification({
        open: true,
        message: 'Failed to export progress. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleImportProgress = async () => {
    try {
      const data = JSON.parse(importData);
      await importProgress(data);
      setShowImportDialog(false);
      setImportData('');
      setNotification({
        open: true,
        message: 'Progress imported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error importing progress:', error);
      setNotification({
        open: true,
        message: 'Failed to import progress. Please check the file format.',
        severity: 'error'
      });
    }
  };

  const handleClearCache = async () => {
    try {
      setIsClearingCache(true);
      await audioService.clearCache();
      
      // Update cache stats
      const stats = await getCacheStats();
      setCacheStats({
        size: stats.totalSize,
        entryCount: stats.fileCount
      });
      
      setNotification({
        open: true,
        message: 'Cache cleared successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      setNotification({
        open: true,
        message: 'Failed to clear cache. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleDatabaseReset = async () => {
    try {
      setIsResettingDatabase(true);
      
      // Clear all IndexedDB databases
      const databases = [
        'DictionaryDB',
        'JapVocDB',
        'japvoc-romaji-cache',
        'JapaneseAudioDB',
        'AudioCacheDB',
        'JapVocAudioDB'
      ];

      for (const dbName of databases) {
        try {
          await window.indexedDB.deleteDatabase(dbName);
          console.log(`Deleted database: ${dbName}`);
        } catch (error) {
          console.warn(`Error deleting ${dbName}:`, error);
        }
      }

      // Clear localStorage items
      const keysToRemove = [
        'dbVersion',
        'lastSync',
        'audioCacheVersion',
        'databaseInitialized'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });

      setShowDatabaseResetDialog(false);
      setNotification({
        open: true,
        message: 'Database reset successfully! Please refresh the page.',
        severity: 'success'
      });

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error resetting database:', error);
      setNotification({
        open: true,
        message: 'Failed to reset database. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsResettingDatabase(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const LoadingSpinner = ({ text }: { text: string }) => (
    <div className={`flex flex-col items-center justify-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-japanese-red mb-4"></div>
      <p>{text}</p>
    </div>
  );

  if (isSettingsLoading || isProgressLoading || isAccessibilityLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Loading settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Settings
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Customize your learning experience
              </p>
            </div>
            <div className="flex gap-4">
              {hasUnsavedChanges && (
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className={`px-6 py-3 bg-japanese-green text-white rounded-nav font-semibold hover:bg-japanese-green-dark transition-colors duration-300 flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Changes
                    </>
                  )}
                </button>
              )}
              <Link
                to="/"
                className={`px-6 py-3 border-2 border-japanese-red text-japanese-red rounded-nav font-semibold hover:bg-japanese-red hover:text-white transition-colors duration-300`}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Error Alerts */}
        {settingsError && (
          <div className={`p-4 rounded-2xl mb-6 ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2`}>
              ❌ Settings Error
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {settingsError}
            </p>
          </div>
        )}

        {progressError && (
          <div className={`p-4 rounded-2xl mb-6 ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2`}>
              ❌ Progress Error
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {progressError}
            </p>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              🌙 General Settings
            </h2>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Dark Mode
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Switch between light and dark themes
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('darkMode', !globalSettings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    globalSettings.darkMode ? 'bg-japanese-red' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      globalSettings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Language */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Language
                </label>
                <select
                  value={globalSettings.language || 'en'}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                      : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                  }`}
                >
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Notifications
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Receive learning reminders
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('notifications', !globalSettings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    globalSettings.notifications ? 'bg-japanese-green' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      globalSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              🔊 Audio Settings
            </h2>
            
            <div className="space-y-6">
              {/* TTS Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Text-to-Speech
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Enable voice pronunciation
                  </div>
                </div>
                <button
                  onClick={() => handleAudioSettingsChange('useTTS', !audioSettings.useTTS)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    audioSettings.useTTS ? 'bg-japanese-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      audioSettings.useTTS ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Selection */}
              {audioSettings.useTTS && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Preferred Voice
                  </label>
                  <select
                    value={audioSettings.preferredVoice}
                    onChange={(e) => handleAudioSettingsChange('preferredVoice', e.target.value)}
                    className={`w-full px-4 py-2 rounded-nav border transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'bg-dark border-border-dark-light text-text-dark-primary focus:border-japanese-red' 
                        : 'bg-light border-border-light text-text-primary focus:border-japanese-red'
                    }`}
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Volume */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Volume: {Math.round(audioSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioSettings.volume}
                  onChange={(e) => handleAudioSettingsChange('volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Rate */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Speech Rate: {audioSettings.rate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={audioSettings.rate}
                  onChange={(e) => handleAudioSettingsChange('rate', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Progress Management */}
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              📊 Progress Management
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleExportProgress}
                className={`w-full px-4 py-3 bg-japanese-green text-white rounded-nav font-semibold hover:bg-japanese-green-dark transition-colors duration-300 flex items-center justify-center gap-2`}
              >
                📤 Export Progress
              </button>
              
              <button
                onClick={() => setShowImportDialog(true)}
                className={`w-full px-4 py-3 bg-japanese-blue text-white rounded-nav font-semibold hover:bg-japanese-blue-dark transition-colors duration-300 flex items-center justify-center gap-2`}
              >
                📥 Import Progress
              </button>
              
              <button
                onClick={() => setShowResetDialog(true)}
                className={`w-full px-4 py-3 bg-japanese-red text-white rounded-nav font-semibold hover:bg-japanese-red-dark transition-colors duration-300 flex items-center justify-center gap-2`}
              >
                🗑️ Reset Progress
              </button>
            </div>
          </div>

          {/* Cache Management */}
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              🗂️ Cache Management
            </h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-nav ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Cache Statistics
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  <div>Files: {cacheStats.entryCount}</div>
                  <div>Size: {(cacheStats.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className={`w-full px-4 py-3 bg-japanese-orange text-white rounded-nav font-semibold hover:bg-japanese-orange-dark transition-colors duration-300 flex items-center justify-center gap-2 ${isClearingCache ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isClearingCache ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    🧹 Clear Cache
                  </>
                )}
              </button>

              <button
                onClick={() => setShowDatabaseResetDialog(true)}
                className={`w-full px-4 py-3 bg-japanese-purple text-white rounded-nav font-semibold hover:bg-japanese-purple/80 transition-colors duration-300 flex items-center justify-center gap-2`}
              >
                🔄 Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {showResetDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-2xl max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Reset Progress
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Are you sure you want to reset all your progress? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetDialog(false)}
                  className={`flex-1 px-4 py-2 border-2 border-japanese-red text-japanese-red rounded-nav font-semibold hover:bg-japanese-red hover:text-white transition-colors duration-300`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className={`flex-1 px-4 py-2 bg-japanese-red text-white rounded-nav font-semibold hover:bg-japanese-red-dark transition-colors duration-300`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {showImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-2xl max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Import Progress
              </h3>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your exported progress data here..."
                className={`w-full h-32 px-4 py-2 rounded-nav border transition-colors duration-200 mb-4 resize-none ${
                  theme === 'dark' 
                    ? 'bg-dark border-border-dark-light text-text-dark-primary placeholder-text-dark-secondary focus:border-japanese-red' 
                    : 'bg-light border-border-light text-text-primary placeholder-text-secondary focus:border-japanese-red'
                }`}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className={`flex-1 px-4 py-2 border-2 border-japanese-red text-japanese-red rounded-nav font-semibold hover:bg-japanese-red hover:text-white transition-colors duration-300`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportProgress}
                  className={`flex-1 px-4 py-2 bg-japanese-blue text-white rounded-nav font-semibold hover:bg-japanese-blue-dark transition-colors duration-300`}
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {showDatabaseResetDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-2xl max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Reset Database
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                This will clear all databases and reset the application to its initial state. This action cannot be undone and will require you to restart the application.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDatabaseResetDialog(false)}
                  disabled={isResettingDatabase}
                  className={`flex-1 px-4 py-2 border-2 border-japanese-purple text-japanese-purple rounded-nav font-semibold hover:bg-japanese-purple hover:text-white transition-colors duration-300 ${isResettingDatabase ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDatabaseReset}
                  disabled={isResettingDatabase}
                  className={`flex-1 px-4 py-2 bg-japanese-purple text-white rounded-nav font-semibold hover:bg-japanese-purple/80 transition-colors duration-300 flex items-center justify-center gap-2 ${isResettingDatabase ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isResettingDatabase ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Resetting...
                    </>
                  ) : (
                    'Reset Database'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.open && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-2xl max-w-sm z-50 ${
            notification.severity === 'success' 
              ? theme === 'dark' ? 'bg-japanese-green/20 border border-japanese-green/40' : 'bg-japanese-green/10 border border-japanese-green/30'
              : theme === 'dark' ? 'bg-japanese-red/20 border border-japanese-red/40' : 'bg-japanese-red/10 border border-japanese-red/30'
          }`}>
            <div className={`font-semibold mb-1 ${
              notification.severity === 'success' ? 'text-japanese-green' : 'text-japanese-red'
            }`}>
              {notification.severity === 'success' ? '✅ Success' : '❌ Error'}
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {notification.message}
            </p>
            <button
              onClick={handleCloseNotification}
              className={`absolute top-2 right-2 text-lg ${theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 