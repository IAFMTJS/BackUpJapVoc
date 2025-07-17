import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementContext';
import ProgressPage from './ProgressPage';
import Settings from '../components/Settings';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import HybridMascots from '../components/ui/HybridMascots';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="py-6">
          {children}
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { currentUser } = useAuth();
  const { progress: userProgress, statistics } = useProgress();
  const { achievements, unlockedAchievements } = useAchievements();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate user stats
  const userStats = {
    totalWords: Object.keys(userProgress).length,
    masteredWords: Object.values(userProgress).filter(p => p.correct >= 3).length,
    currentStreak: calculateStreak(userProgress),
    totalAchievements: achievements.length,
    unlockedAchievements: unlockedAchievements.length,
    averageAccuracy: calculateAverageAccuracy(userProgress)
  };

  // Generate chart data for the last 7 days
  const chartData = generateChartData(userProgress);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-6 rounded-2xl text-center ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              Please sign in to view your profile
            </h2>
            <a
              href="/login"
              className={`inline-block px-6 py-3 bg-japanese-red text-white rounded-nav font-semibold hover:bg-japanese-red-dark transition-colors duration-300`}
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Profile Header with Mascot */}
        <div className={`relative overflow-hidden rounded-2xl mb-8 p-8 ${theme === 'dark' ? 'bg-gradient-to-br from-japanese-red/20 to-japanese-purple/20 border border-border-dark-light' : 'bg-gradient-to-br from-japanese-red/10 to-japanese-purple/10 border border-border-light'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className={`w-32 h-32 ${theme === 'dark' ? 'bg-japanese-red/20' : 'bg-japanese-red/20'} rounded-full flex items-center justify-center mr-6 border-4 border-white shadow-lg`}>
                <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {currentUser?.displayName?.[0].toUpperCase() || currentUser?.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {currentUser?.displayName || 'User'}
                </h1>
                <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  {currentUser?.email}
                </p>
                <div className="flex gap-4">
                  <button className={`px-6 py-3 bg-white text-japanese-red rounded-nav font-semibold hover:bg-gray-50 transition-colors duration-300 flex items-center gap-2`}>
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={() => setTabValue(1)}
                    className={`px-6 py-3 border-2 border-white text-white rounded-nav font-semibold hover:bg-white hover:text-japanese-red transition-colors duration-300 flex items-center gap-2`}
                  >
                    📊 View Stats
                  </button>
                </div>
              </div>
              <div className="ml-8">
                <HybridMascots
                  type="emotions"
                  size="large"
                  progress={(userStats.masteredWords / userStats.totalWords) * 100}
                  performance={userStats.averageAccuracy >= 80 ? 'excellent' : userStats.averageAccuracy >= 60 ? 'good' : userStats.averageAccuracy >= 40 ? 'average' : userStats.averageAccuracy >= 20 ? 'poor' : 'terrible'}
                  context="profile"
                  mood={userStats.currentStreak > 0 ? 'positive' : 'neutral'}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📚</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Words Learned
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {userStats.totalWords}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  {userStats.masteredWords} mastered
                </div>
                <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-japanese-red to-japanese-orange rounded-full"
                    style={{ width: `${userStats.totalWords > 0 ? (userStats.masteredWords / userStats.totalWords) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🔥</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Current Streak
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {userStats.currentStreak}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  days
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🏆</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Achievements
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {userStats.unlockedAchievements}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  of {userStats.totalAchievements}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🎯</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Accuracy
                  </span>
                </div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  {Math.round(userStats.averageAccuracy)}%
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  average
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-nav p-1">
            {[
              { label: 'Overview', icon: '👤' },
              { label: 'Progress', icon: '📈' },
              { label: 'Settings', icon: '⚙️' }
            ].map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => handleTabChange(index)}
                className={`flex-1 px-4 py-2 rounded-nav text-sm font-medium transition-colors duration-200 ${
                  tabValue === index
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
        <TabPanel value={tabValue} index={0}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Chart */}
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Learning Activity (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="words" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Recent Achievements
              </h3>
              <div className="space-y-4">
                {unlockedAchievements.slice(0, 5).map((achievement, index) => (
                  <div key={achievement.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-japanese-green rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🏆</span>
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                        {achievement.title}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
                {unlockedAchievements.length === 0 && (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    <div className="text-4xl mb-2">🎯</div>
                    <p>No achievements unlocked yet. Keep learning to earn achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProgressPage />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Settings />
        </TabPanel>
      </div>
    </div>
  );
};

// Helper functions
const calculateStreak = (progress: Record<string, any>): number => {
  // Implementation for calculating streak
  return 0; // Placeholder
};

const calculateAverageAccuracy = (progress: Record<string, any>): number => {
  // Implementation for calculating average accuracy
  return 0; // Placeholder
};

const generateChartData = (progress: Record<string, any>) => {
  // Implementation for generating chart data
  return []; // Placeholder
};

export default ProfilePage; 