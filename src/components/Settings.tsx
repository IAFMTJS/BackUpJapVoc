import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import type { Settings } from '../context/AppContext';
import { getCacheStats, clearCache } from '../utils/AudioCache';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import safeLocalStorage from '../utils/safeLocalStorage';

type SettingsKey = keyof Settings;

const SettingsPanel: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings: appSettings, updateSettings: updateAppSettings } = useApp();
  const { settings: globalSettings, updateSettings: updateGlobalSettings } = useSettings();
  const { currentUser, updateUserProfile } = useAuth();

  // Form state for user-specific settings
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [dailyGoal, setDailyGoal] = useState(10);
  const [practiceMode, setPracticeMode] = useState<'word' | 'sentence'>('word');
  const [dailyReminders, setDailyReminders] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Audio cache state
  const [cacheStats, setCacheStats] = useState<{ fileCount: number; totalSize: number }>({ fileCount: 0, totalSize: 0 });
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    getCacheStats().then(setCacheStats);
  }, [clearing]);

  useEffect(() => {
    // Load saved settings
    const savedSettings = safeLocalStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setDailyGoal(parsed.dailyGoal || 10);
        setPracticeMode(parsed.practiceMode || 'mixed');
        setDailyReminders(parsed.dailyReminders || false);
        setProgressUpdates(parsed.progressUpdates || true);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Update form state when currentUser changes
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleClearCache = async () => {
    setClearing(true);
    await clearCache();
    setClearing(false);
    setCacheStats({ fileCount: 0, totalSize: 0 });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update user profile if there are changes
      if (currentUser && (displayName !== currentUser.displayName || email !== currentUser.email)) {
        await updateUserProfile({
          displayName: displayName !== currentUser.displayName ? displayName : undefined,
          email: email !== currentUser.email ? email : undefined
        });
        toast.success('Profile updated successfully');
      }

      // Save other settings to localStorage
      const userSettings = {
        dailyGoal,
        practiceMode,
        dailyReminders,
        progressUpdates
      };
      safeLocalStorage.setItem('userSettings', JSON.stringify(userSettings));

      // Update global settings
      updateGlobalSettings({
        useTimer: globalSettings.useTimer,
        timeLimit: globalSettings.timeLimit,
        showRomaji: globalSettings.showRomaji,
        showHints: globalSettings.showHints,
        soundEnabled: globalSettings.soundEnabled,
        darkMode: isDarkMode
      });

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        card: 'bg-charcoal-700 hover:bg-charcoal-600',
        border: 'border-charcoal-600',
        input: 'bg-charcoal-900 border-charcoal-700 text-ivory-100',
        button: 'bg-sage-600 hover:bg-sage-500 text-ivory-100',
        buttonSecondary: 'bg-charcoal-700 hover:bg-charcoal-600 text-ivory-100',
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      card: 'bg-ivory-50 hover:bg-sage-50',
      border: 'border-sage-200',
      input: 'bg-white border-sage-200 text-charcoal-800',
      button: 'bg-sage-600 hover:bg-sage-500 text-ivory-100',
      buttonSecondary: 'bg-charcoal-200 hover:bg-charcoal-300 text-charcoal-800',
    };
  };

  const themeClasses = getThemeClasses();

  const renderToggle = (settingKey: keyof Settings, label: string) => (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${themeClasses.text}`}>{label}</span>
      <button
        onClick={() => {
          const newValue = !globalSettings[settingKey as keyof typeof globalSettings];
          updateGlobalSettings({ [settingKey]: newValue });
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          globalSettings[settingKey as keyof typeof globalSettings] ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            globalSettings[settingKey as keyof typeof globalSettings] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`${themeClasses.container} rounded-2xl shadow-soft p-8`}>
        <h1 className={`text-3xl font-serif font-medium mb-8 ${themeClasses.text}`}>
          Settings
        </h1>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className={`p-6 rounded-xl ${themeClasses.card} shadow-card`}>
            <h2 className={`text-xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-sage-500 focus:border-transparent`}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-sage-500 focus:border-transparent`}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Practice Settings */}
          <div className={`p-6 rounded-xl ${themeClasses.card} shadow-card`}>
            <h2 className={`text-xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Practice Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                  Daily Goal (words)
                </label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-sage-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                  Practice Mode
                </label>
                <select
                  value={practiceMode}
                  onChange={(e) => setPracticeMode(e.target.value as 'word' | 'sentence')}
                  className={`w-full px-4 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 focus:ring-sage-500 focus:border-transparent`}
                >
                  <option value="word">Word Practice</option>
                  <option value="sentence">Sentence Practice</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className={`p-6 rounded-xl ${themeClasses.card} shadow-card`}>
            <h2 className={`text-xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${themeClasses.text}`}>
                  Daily Reminders
                </label>
                <button
                  onClick={() => setDailyReminders(!dailyReminders)}
                  className={`px-4 py-2 rounded-lg ${dailyReminders ? themeClasses.button : themeClasses.buttonSecondary}`}
                >
                  {dailyReminders ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${themeClasses.text}`}>
                  Progress Updates
                </label>
                <button
                  onClick={() => setProgressUpdates(!progressUpdates)}
                  className={`px-4 py-2 rounded-lg ${progressUpdates ? themeClasses.button : themeClasses.buttonSecondary}`}
                >
                  {progressUpdates ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : themeClasses.button
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 