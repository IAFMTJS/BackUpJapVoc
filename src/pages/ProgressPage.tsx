import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Dictionary from '../components/Dictionary';
import LearningProgress from '../components/LearningProgress';
import { downloadOfflineData } from '../utils/offlineData';
import { useProgress } from '../context/ProgressContext';
import { ProgressItem } from '../types';
import { quizWords } from '../data/quizData';
import { kanjiList } from '../data/kanjiData';
import { beginnerPhrases } from './AnimeSection';
import { romajiWords, romajiSentences, romajiStories } from '../data/romajiWords';

type TabType = 'progress' | 'dictionary';

const sections = [
  { 
    id: 'vocabulary', 
    name: 'Vocabulary Quiz', 
    icon: '📝', 
    total: quizWords.filter(item => item.isHiragana).length + quizWords.filter(item => item.isKatakana).length,
    description: 'Test your knowledge of Japanese vocabulary'
  },
  { 
    id: 'dictionary', 
    name: 'Dictionary', 
    icon: '📖', 
    total: quizWords.filter(item => item.isHiragana || item.isKatakana).length + kanjiList.length,
    description: 'Learn and track vocabulary progress'
  },
  { 
    id: 'kanji', 
    name: 'Kanji', 
    icon: '🀄', 
    total: kanjiList.length,
    description: 'Master Japanese characters'
  },
  { 
    id: 'games', 
    name: 'Games', 
    icon: '🎮', 
    total: 50,
    description: 'Learn through interactive games',
    path: '/games'
  },
  { 
    id: 'vocabulary-builder', 
    name: 'Vocabulary Builder', 
    icon: '📚', 
    total: quizWords.length,
    description: 'Build your vocabulary systematically'
  },
  { 
    id: 'anime', 
    name: 'Anime Section', 
    icon: '🎬', 
    total: beginnerPhrases.length,
    description: 'Learn from anime and manga'
  },
  {
    id: 'romaji',
    name: 'Romaji Practice',
    icon: '🔤',
    total: romajiWords.length + romajiSentences.length + romajiStories.length,
    description: 'Master Romaji words, sentences, and stories'
  },
];

// Add type definitions for section stats
type DictionaryStats = {
  masteryLevels: {
    started: number;
    almostMastered: number;
    mastered: number;
  };
  recentActivity: number;
  totalItems: number;
  progressPercentage: number;
};

type OtherSectionStats = {
  completed: number;
  totalItems: number;
  progressPercentage: number;
  recentActivity: number;
};

type SectionStats = DictionaryStats | OtherSectionStats;

const ProgressPage: React.FC = () => {
  const { isDarkMode, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const [dictionaryMode, setDictionaryMode] = useState<'hiragana' | 'katakana' | 'kanji'>('hiragana');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Progress context for sync/backup/restore
  const {
    syncProgress,
    isSyncing,
    isOnline,
    createDataBackup,
    restoreDataBackup,
    error: progressError,
    lastSyncTime,
    progress
  } = useProgress();

  const [backupData, setBackupData] = useState<string>('');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-gray-800',
        card: 'bg-gray-700',
        text: 'text-gray-100',
        subtext: 'text-gray-400',
        progressBg: 'bg-gray-600',
        progressBar: 'bg-blue-500',
        sectionCard: 'bg-gray-700 hover:bg-gray-600',
        sectionProgressBg: 'bg-gray-600',
        sectionProgressBar: 'bg-green-500',
        border: 'border-gray-600'
      };
    }
    return {
      container: 'bg-white',
      card: 'bg-blue-50',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      progressBg: 'bg-blue-100',
      progressBar: 'bg-blue-600',
      sectionCard: 'bg-white hover:bg-gray-50',
      sectionProgressBg: 'bg-gray-200',
      sectionProgressBar: 'bg-green-500',
      border: 'border-gray-200'
    };
  };

  const themeClasses = getThemeClasses();

  // Calculate per-section and overall progress
  let total = 0, completed = 0, sectionPercents: number[] = [];
  sections.forEach(section => {
    let sectionItems: ProgressItem[] = [];
    if (section.id === 'dictionary') {
      sectionItems = Object.values(progress).filter(item =>
        item.section === 'hiragana' || item.section === 'katakana' || item.section === 'kanji'
      );
    } else if (section.id === 'vocabulary') {
      sectionItems = Object.values(progress).filter(item =>
        item.section === 'vocabulary'
      );
    } else {
      sectionItems = Object.values(progress).filter(item => item.section === section.id);
    }

    // Calculate section completion based on section type
    let sectionCompleted = 0;
    if (section.id === 'dictionary') {
      sectionCompleted = sectionItems.filter(item => item.correct >= 3).length;
    } else if (section.id === 'vocabulary') {
      sectionCompleted = sectionItems.filter(item => item.correct >= 5).length;
    } else {
      sectionCompleted = sectionItems.filter(item => item.correct > 0).length;
    }

    total += section.total;
    completed += sectionCompleted;
    sectionPercents.push(section.total ? (sectionCompleted / section.total) * 100 : 0);
  });
  const overallPercent = total ? Math.round((completed / total) * 100) : 0;
  const nonZeroSections = sectionPercents.filter(p => !isNaN(p) && p > 0);
  const averageScore = nonZeroSections.length
    ? Math.round(nonZeroSections.reduce((a, b) => a + b, 0) / nonZeroSections.length)
    : 0;

  const handleDownloadOfflineData = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    try {
      await downloadOfflineData();
      setDownloadSuccess(true);
    } catch (err) {
      setDownloadError('Er is een fout opgetreden bij het downloaden van de offline data.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Manual sync handler
  const handleManualSync = async () => {
    setBackupStatus(null);
    setRestoreStatus(null);
    try {
      await syncProgress();
      setBackupStatus('Progress synced!');
    } catch (err) {
      setBackupStatus('Sync failed.');
    }
  };

  // Manual backup handler
  const handleBackup = async () => {
    setBackupStatus(null);
    setRestoreStatus(null);
    try {
      const backup = await createDataBackup();
      setBackupData(JSON.stringify(backup, null, 2));
      setBackupStatus('Backup created! You can copy or download the data below.');
    } catch (err) {
      setBackupStatus('Backup failed.');
    }
  };

  // Manual restore handler
  const handleRestore = async () => {
    setBackupStatus(null);
    setRestoreStatus(null);
    setRestoreError(null);
    try {
      const parsed = JSON.parse(backupData);
      await restoreDataBackup(parsed);
      setRestoreStatus('Restore successful!');
    } catch (err) {
      setRestoreError('Restore failed. Please check your backup data.');
    }
  };

  // Update calculateSectionStats function
  const calculateSectionStats = (sectionId: string, progress: Record<string, ProgressItem>): SectionStats => {
    let sectionItems: ProgressItem[] = [];
    if (sectionId === 'dictionary') {
      sectionItems = Object.values(progress).filter(item =>
        item.section === 'hiragana' || item.section === 'katakana' || item.section === 'kanji'
      );
    } else if (sectionId === 'vocabulary') {
      sectionItems = Object.values(progress).filter(item =>
        item.section === 'vocabulary'
      );
    } else {
      sectionItems = Object.values(progress).filter(item => item.section === sectionId);
    }
    const section = sections.find(s => s.id === sectionId);
    const totalPossibleItems = section?.total || 0;
    
    // Calculate mastery levels
    let masteryLevels = {
      started: 0,
      almostMastered: 0,
      mastered: 0
    };
    
    if (sectionId === 'vocabulary') {
      masteryLevels = {
        started: sectionItems.filter(item => item.correct >= 1 && item.correct < 3).length,
        almostMastered: sectionItems.filter(item => item.correct >= 3 && item.correct < 5).length,
        mastered: sectionItems.filter(item => item.correct >= 5).length
      };
    } else if (sectionId === 'dictionary') {
      masteryLevels = {
        started: sectionItems.filter(item => item.correct === 1).length,
        almostMastered: sectionItems.filter(item => item.correct === 2).length,
        mastered: sectionItems.filter(item => item.correct >= 3).length
      };
    }

    // Calculate progress based on section type
    let progressPercentage = 0;
    if (sectionId === 'dictionary') {
      progressPercentage = totalPossibleItems > 0
        ? (masteryLevels.mastered / totalPossibleItems) * 100
        : 0;
    } else if (sectionId === 'vocabulary') {
      progressPercentage = totalPossibleItems > 0
        ? (masteryLevels.mastered / totalPossibleItems) * 100
        : 0;
    } else {
      const sectionCompleted = sectionItems.filter(item => item.correct > 0).length;
      progressPercentage = totalPossibleItems > 0
        ? (sectionCompleted / totalPossibleItems) * 100
        : 0;
    }

    // Calculate recent activity (last 7 days)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivity = sectionItems.filter(item => item.lastAttempted > oneWeekAgo).length;

    // Return different stats based on section type
    if (sectionId === 'dictionary') {
      return {
        masteryLevels,
        recentActivity,
        totalItems: totalPossibleItems,
        progressPercentage
      };
    } else if (sectionId === 'vocabulary') {
      return {
        masteryLevels,
        recentActivity,
        totalItems: totalPossibleItems,
        progressPercentage
      };
    } else {
      return {
        completed: sectionItems.filter(item => item.correct > 0).length,
        totalItems: totalPossibleItems,
        progressPercentage,
        recentActivity
      };
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Progress Card */}
        <div className={`mb-8 p-6 rounded-xl shadow-lg ${themeClasses.card} border ${themeClasses.border}`}>
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>Learning Progress</h1>
            <p className={`text-lg ${themeClasses.subtext}`}>Track your journey to Japanese mastery</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-lg font-semibold ${themeClasses.text}`}>Overall Progress</span>
              <span className={`text-lg font-bold ${themeClasses.text}`}>{overallPercent}%</span>
            </div>
            <div className={`w-full ${themeClasses.progressBg} rounded-full h-4`}>
              <div
                className={`${themeClasses.progressBar} h-4 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className={`p-4 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                <div className={`text-sm ${themeClasses.subtext}`}>Items Learned</div>
                <div className={`text-2xl font-bold ${themeClasses.text}`}>{completed} / {total}</div>
              </div>
              <div className={`p-4 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                <div className={`text-sm ${themeClasses.subtext}`}>Average Score</div>
                <div className={`text-2xl font-bold ${themeClasses.text}`}>{averageScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const sectionStats = section.id === 'dictionary' || section.id === 'vocabulary'
              ? calculateSectionStats(section.id, progress)
              : calculateSectionStats(section.id, progress);
            const sectionPercent = Math.round(sectionStats.progressPercentage);
            
            const isDictionarySection = section.id === 'dictionary';
            const isVocabularySection = section.id === 'vocabulary';
            const dictionaryStats = isDictionarySection ? sectionStats as DictionaryStats : null;
            const vocabularyStats = isVocabularySection ? sectionStats as DictionaryStats : null;
            
            return (
              <div 
                key={section.id} 
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 ${themeClasses.sectionCard} border ${themeClasses.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{section.icon}</span>
                    <div>
                      <h2 className={`text-xl font-semibold ${themeClasses.text}`}>{section.name}</h2>
                      <p className={`text-sm ${themeClasses.subtext}`}>{section.description}</p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${themeClasses.text}`}>{sectionPercent}%</span>
                </div>
                
                <div className={`w-full ${themeClasses.sectionProgressBg} rounded-full h-2.5 mb-4`}>
                  <div
                    className={`${themeClasses.sectionProgressBar} h-2.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${sectionPercent}%` }}
                  />
                </div>
                
                {isDictionarySection && dictionaryStats ? (
                  // Dictionary-specific stats
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                        <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Mastery Progress</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>Mastered</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {dictionaryStats.masteryLevels.mastered} / {dictionaryStats.totalItems}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>In Progress</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {dictionaryStats.masteryLevels.started + dictionaryStats.masteryLevels.almostMastered}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                        <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Mastery Levels</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>Started</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {dictionaryStats.masteryLevels.started}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>Almost</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {dictionaryStats.masteryLevels.almostMastered}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>Mastered</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {dictionaryStats.masteryLevels.mastered}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                      <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Recent Activity</div>
                      <div className={`text-lg font-bold ${themeClasses.text}`}>
                        {dictionaryStats.recentActivity} items in last 7 days
                      </div>
                    </div>
                  </>
                ) : isVocabularySection && vocabularyStats ? (
                  // Vocabulary Quiz-specific stats
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                        <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Progress</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>In Progress</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {vocabularyStats.masteryLevels.started}
                            </div>
                          </div>
                          <div>
                            <div className={`text-xs ${themeClasses.subtext}`}>Mastered</div>
                            <div className={`text-lg font-bold ${themeClasses.text}`}>
                              {vocabularyStats.masteryLevels.mastered} / {vocabularyStats.totalItems}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                        <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Recent Activity</div>
                        <div className={`text-lg font-bold ${themeClasses.text}`}>
                          {vocabularyStats.recentActivity} items in last 7 days
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Standard stats for other sections
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                      <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Progress</div>
                      <div className={`text-lg font-bold ${themeClasses.text}`}>
                        {(sectionStats as OtherSectionStats).completed} / {(sectionStats as OtherSectionStats).totalItems} items
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${themeClasses.container} border ${themeClasses.border}`}>
                      <div className={`text-sm font-medium ${themeClasses.text} mb-1`}>Recent Activity</div>
                      <div className={`text-lg font-bold ${themeClasses.text}`}>
                        {sectionStats.recentActivity} items in last 7 days
                      </div>
                    </div>
                  </div>
                )}
                {section.id === 'games' && (
                  <a href="/games" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Go to Games</a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 