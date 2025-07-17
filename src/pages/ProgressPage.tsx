import React, { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow, format } from 'date-fns';
import StatisticsDashboard from '../components/progress/StatisticsDashboard';
import { DailyProgressChart } from '../components/progress/DailyProgressChart';
import { StudyEfficiency } from '../components/progress/StudyEfficiency';
import ProgressTimeline from '../components/progress/ProgressTimeline';
import SectionProgress from '../components/progress/SectionProgress';
import AchievementsList from '../components/progress/AchievementsList';
import { StudyHistory } from '../components/progress/StudyHistory';
import { MasteryDistribution } from '../components/progress/MasteryDistribution';
import LearningPath from '../components/progress/LearningPath';
import { Achievements } from '../components/progress/Achievements';
import HybridMascots from '../components/ui/HybridMascots';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="py-6">
          {children}
        </div>
      )}
    </div>
  );
}

const ProgressPage: React.FC = () => {
  const { progress, isLoading, error, isSyncing, lastSyncTime } = useProgress();
  const { currentUser } = useAuth();
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading && !loadingTimeout) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-japanese-red"></div>
        <h2 className={`text-xl mt-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          Loading your progress...
        </h2>
        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          This may take a moment
        </p>
      </div>
    );
  }

  if (loadingTimeout) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-4 rounded-2xl mb-4 ${theme === 'dark' ? 'bg-japanese-orange/10 border border-japanese-orange/20' : 'bg-japanese-orange/5 border border-japanese-orange/20'}`}>
            <div className={`font-semibold text-japanese-orange mb-2`}>
              ⚠️ Loading Timeout
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              Loading is taking longer than expected. Please check your connection and try refreshing the page.
            </p>
          </div>
          <button 
            className={`px-6 py-3 bg-japanese-red text-white rounded-nav font-semibold hover:bg-japanese-red-dark transition-colors duration-300`}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-4 rounded-2xl mb-4 ${theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'}`}>
            <div className={`font-semibold text-japanese-red mb-2`}>
              ❌ Error
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {error}
            </p>
          </div>
          <button 
            className={`px-6 py-3 bg-japanese-red text-white rounded-nav font-semibold hover:bg-japanese-red-dark transition-colors duration-300`}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure progress data exists
  if (!progress || !progress.statistics) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-japanese-blue/10 border border-japanese-blue/20' : 'bg-japanese-blue/5 border border-japanese-blue/20'}`}>
            <div className={`font-semibold text-japanese-blue mb-2`}>
              ℹ️ No Progress Data
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              No progress data available. Start learning to see your progress here!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    statistics,
    sections,
    preferences
  } = progress;

  const totalWords = Object.keys(progress.words).length;
  const masteredWords = Object.values(progress.words).filter(w => w.mastery >= 0.8).length;
  const inProgressWords = Object.values(progress.words).filter(w => w.mastery > 0 && w.mastery < 0.8).length;
  const notStartedWords = totalWords - masteredWords - inProgressWords;

  const totalStudyTime = statistics.totalStudyTime || 0;
  const averageStudyTimePerDay = totalStudyTime / ((statistics.studySessions?.length || 1));
  const studyEfficiency = statistics.studyEfficiency || 0;
  const averageAccuracy = statistics.averageAccuracy || 0;

  const recentSessions = (statistics.studySessions || [])
    .slice(-5)
    .reverse()
    .map(session => ({
      ...session,
      date: new Date(session.timestamp),
      duration: session.duration / 60, // Convert to minutes
      masteryGained: session.averageMastery
    }));

  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Status Alerts */}
        <div className="mb-6">
          {!currentUser && (
            <div className={`p-4 rounded-2xl mb-4 ${theme === 'dark' ? 'bg-japanese-blue/10 border border-japanese-blue/20' : 'bg-japanese-blue/5 border border-japanese-blue/20'}`}>
              <div className={`font-semibold text-japanese-blue mb-2`}>
                ℹ️ Guest Mode
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                You are currently using the app without an account. Sign in to sync your progress across devices.
              </p>
            </div>
          )}

          {isSyncing && (
            <div className={`p-4 rounded-2xl mb-4 ${theme === 'dark' ? 'bg-japanese-blue/10 border border-japanese-blue/20' : 'bg-japanese-blue/5 border border-japanese-blue/20'}`}>
              <div className={`font-semibold text-japanese-blue mb-2`}>
                🔄 Syncing
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Syncing progress...
              </p>
            </div>
          )}

          {lastSyncTime && (
            <div className={`p-4 rounded-2xl mb-4 ${theme === 'dark' ? 'bg-japanese-green/10 border border-japanese-green/20' : 'bg-japanese-green/5 border border-japanese-green/20'}`}>
              <div className={`font-semibold text-japanese-green mb-2`}>
                ✅ Synced
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Last synced {formatDistanceToNow(new Date(lastSyncTime))} ago
              </p>
            </div>
          )}
        </div>

        {/* Header with Mascot */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1">
              <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Your Progress
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Track your Japanese learning journey
              </p>
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-8">
              <HybridMascots
                type="emotions"
                size="large"
                progress={(masteredWords / totalWords) * 100}
                performance={(masteredWords / totalWords) >= 0.8 ? 'excellent' : (masteredWords / totalWords) >= 0.6 ? 'good' : (masteredWords / totalWords) >= 0.4 ? 'average' : (masteredWords / totalWords) >= 0.2 ? 'poor' : 'terrible'}
                context="achievement"
                mood={statistics.currentStreak > 0 ? 'positive' : 'neutral'}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Cards with Mascots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-japanese-red rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📚</span>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    {totalWords}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Total Words
                  </div>
                </div>
              </div>
              <HybridMascots
                type="emotions"
                size="small"
                variant="confident"
                context="study"
              />
            </div>
            <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-japanese-red to-japanese-orange rounded-full"
                style={{ width: `${totalWords > 0 ? (masteredWords / totalWords) * 100 : 0}%` }}
              ></div>
            </div>
            <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {masteredWords} mastered
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-japanese-orange rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🔥</span>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    {statistics.currentStreak || 0}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Day Streak
                  </div>
                </div>
              </div>
              <HybridMascots
                type="emotions"
                size="small"
                variant={statistics.currentStreak > 0 ? "love" : "neutral"}
                context="streak"
              />
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              Longest: {statistics.longestStreak || 0} days
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-japanese-green rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">⏱️</span>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    {Math.round(totalStudyTime / 60)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Study Hours
                  </div>
                </div>
              </div>
              <HybridMascots
                type="emotions"
                size="small"
                variant="goodJob"
                context="study"
              />
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {Math.round(averageStudyTimePerDay)} min/day avg
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-japanese-blue rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    {Math.round(averageAccuracy)}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Accuracy
                  </div>
                </div>
              </div>
              <HybridMascots
                type="emotions"
                size="small"
                variant={averageAccuracy >= 80 ? "extremelyHappy" : averageAccuracy >= 60 ? "goodJob" : "disappointed"}
                context="quiz"
              />
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              Efficiency: {Math.round(studyEfficiency)}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1">
            {[
              { label: 'Overview', icon: '📊' },
              { label: 'Statistics', icon: '📈' },
              { label: 'Achievements', icon: '🏆' },
              { label: 'Timeline', icon: '📅' },
              { label: 'Sections', icon: '📚' },
              { label: 'History', icon: '🕒' }
            ].map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => handleTabChange(index)}
                className={`flex-1 px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  selectedTab === index
                    ? 'bg-japanese-red text-white'
                    : `${theme === 'dark' ? 'text-text-dark-secondary hover:text-text-dark-primary' : 'text-text-secondary hover:text-text-primary'}`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <TabPanel value={selectedTab} index={0}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Daily Progress
              </h3>
              <DailyProgressChart timeRange={selectedTimeRange} />
            </div>
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Study Efficiency
              </h3>
              <StudyEfficiency />
            </div>
          </div>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <StatisticsDashboard />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <AchievementsList />
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <ProgressTimeline />
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <SectionProgress />
        </TabPanel>

        <TabPanel value={selectedTab} index={5}>
          <StudyHistory />
        </TabPanel>
      </div>
    </div>
  );
};

export default ProgressPage; 