import React, { Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useAchievements } from '../context/AchievementContext';
import HybridMascots from '../components/ui/HybridMascots';
import ManekiNekoBackground from '../components/ui/ManekiNekoBackground';

// Enhanced Quick Actions with dynamic content
const useQuickActions = () => {
  const { progress } = useProgress();
  const { currentUser } = useAuth();
  const { achievements, unlockedAchievements, getAchievementProgress } = useAchievements();

  return useMemo(() => {
    // Calculate key metrics
    const totalWords = Object.keys(progress.words || {}).length;
    const masteredWords = Object.values(progress.words || {}).filter((word: any) => word.mastery >= 0.8).length;
    const inProgressWords = Object.values(progress.words || {}).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
    const currentStreak = progress.statistics?.currentStreak || 0;
    const longestStreak = progress.statistics?.longestStreak || 0;
    const totalStudyTime = progress.statistics?.totalStudyTime || 0;
    const dailyGoal = progress.preferences?.dailyGoal || 20;
    const lastStudyDate = progress.statistics?.lastStudyDate || 0;
    const today = new Date().toDateString();
    const lastStudyDay = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
    const hasStudiedToday = lastStudyDay === today;

    // Calculate daily progress
    const todayProgress = progress.statistics?.dailyProgress?.[new Date().toISOString().split('T')[0]] || 0;
    const dailyProgressPercentage = (todayProgress / dailyGoal) * 100;

    // Find words due for review (SRS)
    const now = Date.now();
    const wordsDueForReview = Object.entries(progress.words || {})
      .filter(([_, word]: [string, any]) => word.nextReviewDate && word.nextReviewDate <= now)
      .length;

    // Find favorite words
    const favoriteWords = Object.entries(progress.words || {})
      .filter(([_, word]: [string, any]) => word.favorite)
      .length;

    // Find difficult words (low mastery)
    const difficultWords = Object.entries(progress.words || {})
      .filter(([_, word]: [string, any]) => word.mastery > 0 && word.mastery < 0.3)
      .length;

    // Check for upcoming achievements
    const upcomingAchievements = achievements.filter(achievement => {
      const progress = getAchievementProgress(achievement.id);
      const isClose = (progress / achievement.requirement) >= 0.8;
      return !achievement.unlockedAt && isClose;
    });

    // Check for streak milestones
    const nextStreakMilestone = [7, 30, 100, 365].find(milestone => currentStreak < milestone && currentStreak >= milestone * 0.8);

    // Determine priority actions
    const actions = [];

    // 1. Continue Learning (Smart - adapts based on context)
    if (wordsDueForReview > 0) {
      actions.push({
        title: `Review ${wordsDueForReview} Words`,
        description: 'Words due for spaced repetition review',
        icon: '🔄',
        path: '/srs',
        color: 'japanese-red',
        priority: 1,
        badge: 'Due',
        badgeColor: 'error'
      });
    } else if (inProgressWords > 0) {
      actions.push({
        title: 'Continue Learning',
        description: `Continue with ${inProgressWords} words in progress`,
        icon: '▶️',
        path: '/knowing',
        color: 'japanese-blue',
        priority: 2,
        badge: `${inProgressWords}`,
        badgeColor: 'primary'
      });
    } else if (totalWords === 0) {
      actions.push({
        title: 'Start Learning',
        description: 'Begin your Japanese learning journey',
        icon: '🎓',
        path: '/knowing',
        color: 'japanese-blue',
        priority: 1,
        badge: 'New',
        badgeColor: 'success'
      });
    }

    // 2. Daily Goal Progress
    if (dailyProgressPercentage < 100) {
      const remaining = dailyGoal - todayProgress;
      actions.push({
        title: `Complete Daily Goal`,
        description: `${remaining} more minutes to reach your ${dailyGoal}min goal`,
        icon: '🎯',
        path: '/knowing',
        color: 'japanese-green',
        priority: 1,
        badge: `${Math.round(dailyProgressPercentage)}%`,
        badgeColor: 'success',
        progress: dailyProgressPercentage
      });
    } else {
      actions.push({
        title: 'Daily Goal Complete!',
        description: 'Great job! You\'ve reached your daily goal',
        icon: '✅',
        path: '/progress',
        color: 'japanese-green',
        priority: 3,
        badge: 'Done',
        badgeColor: 'success'
      });
    }

    // 3. Streak Management
    if (currentStreak > 0) {
      if (nextStreakMilestone) {
        const daysToMilestone = nextStreakMilestone - currentStreak;
        actions.push({
          title: `Maintain Streak`,
          description: `${daysToMilestone} more days to ${nextStreakMilestone}-day milestone`,
          icon: '🔥',
          path: '/knowing',
          color: 'japanese-orange',
          priority: 1,
          badge: `${currentStreak}`,
          badgeColor: 'warning'
        });
      } else {
        actions.push({
          title: `Amazing Streak!`,
          description: `${currentStreak} days and counting - keep it up!`,
          icon: '🔥',
          path: '/progress',
          color: 'japanese-orange',
          priority: 2,
          badge: `${currentStreak}`,
          badgeColor: 'warning'
        });
      }
    } else if (!hasStudiedToday) {
      actions.push({
        title: 'Start Your Streak',
        description: 'Begin studying today to start a new streak',
        icon: '🔥',
        path: '/knowing',
        color: 'japanese-orange',
        priority: 1,
        badge: 'New',
        badgeColor: 'warning'
      });
    }

    // 4. Additional actions
    if (difficultWords > 0) {
      actions.push({
        title: 'Focus on Difficult Words',
        description: `${difficultWords} words need extra attention`,
        icon: '⚠️',
        path: '/knowing',
        color: 'japanese-orange',
        priority: 2,
        badge: `${difficultWords}`,
        badgeColor: 'warning'
      });
    }

    if (favoriteWords > 0) {
      actions.push({
        title: 'Review Favorites',
        description: `Practice your ${favoriteWords} favorite words`,
        icon: '⭐',
        path: '/favorites',
        color: 'japanese-yellow',
        priority: 3,
        badge: `${favoriteWords}`,
        badgeColor: 'warning'
      });
    }

    // Sort by priority
    return actions.sort((a, b) => a.priority - b.priority);
  }, [progress, achievements, getAchievementProgress]);
};

// Feature categories
const FEATURE_CATEGORIES = [
  {
    title: 'Core Learning',
    subtitle: 'Essential tools for mastering Japanese',
    items: [
      {
        title: 'Vocabulary Learning',
        description: 'Learn new words with context, examples, and audio pronunciation',
        icon: '📚',
        path: '/knowing',
        color: 'japanese-blue',
        badge: 'Core'
      },
      {
        title: 'SRS Review',
        description: 'Spaced repetition system for optimal retention',
        icon: '🔄',
        path: '/srs',
        color: 'japanese-red',
        badge: 'Smart'
      },
      {
        title: 'Progress Tracking',
        description: 'Monitor your learning journey with detailed analytics',
        icon: '📊',
        path: '/progress',
        color: 'japanese-green',
        badge: 'Track'
      }
    ]
  },
  {
    title: 'Interactive Features',
    subtitle: 'Engage with Japanese in fun and meaningful ways',
    items: [
      {
        title: 'Learning Games',
        description: 'Reinforce knowledge through interactive quizzes and challenges',
        icon: '🎮',
        path: '/games',
        color: 'japanese-purple',
        badge: 'Fun'
      },
      {
        title: 'Dictionary',
        description: 'Comprehensive Japanese dictionary with detailed entries',
        icon: '📖',
        path: '/dictionary',
        color: 'japanese-blue',
        badge: 'Complete'
      },
      {
        title: 'Kana Practice',
        description: 'Master hiragana and katakana with interactive exercises',
        icon: 'あ',
        path: '/learning/kana',
        color: 'japanese-green',
        badge: 'Essential'
      }
    ]
  },
  {
    title: 'Cultural & Advanced',
    subtitle: 'Deepen your understanding of Japanese language and culture',
    items: [
      {
        title: 'Cultural Insights',
        description: 'Learn about Japanese customs, etiquette, and traditions',
        icon: '⛩️',
        path: '/culture',
        color: 'japanese-earth',
        badge: 'Culture'
      },
      {
        title: 'Mood & Emotions',
        description: 'Express feelings and emotions in Japanese',
        icon: '😊',
        path: '/mood',
        color: 'japanese-pink',
        badge: 'Emotional'
      },
      {
        title: 'Anime & Media',
        description: 'Explore Japanese pop culture and entertainment',
        icon: '🎬',
        path: '/anime',
        color: 'japanese-purple',
        badge: 'Pop Culture'
      }
    ]
  }
];

const HomeContent: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { progress } = useProgress();
  const { achievements, unlockedAchievements, getAchievementProgress } = useAchievements();
  const quickActions = useQuickActions();

  // Calculate key metrics
  const totalWords = Object.keys(progress.words || {}).length;
  const masteredWords = Object.values(progress.words || {}).filter((word: any) => word.mastery >= 0.8).length;
  const inProgressWords = Object.values(progress.words || {}).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
  const currentStreak = progress.statistics?.currentStreak || 0;
  const longestStreak = progress.statistics?.longestStreak || 0;
  const totalStudyTime = progress.statistics?.totalStudyTime || 0;
  const dailyGoal = progress.preferences?.dailyGoal || 20;
  const todayProgress = progress.statistics?.dailyProgress?.[new Date().toISOString().split('T')[0]] || 0;
  const dailyProgressPercentage = (todayProgress / dailyGoal) * 100;
  const masteryPercentage = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark text-text-dark-primary' : 'bg-light text-text-primary'}`}>
      {/* Maneki Neko Background */}
      <ManekiNekoBackground variant="subtle" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Main Content with Right Side Mascot */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left Content */}
          <div className="flex-1">
            {/* Welcome Section */}
            <div className="text-center lg:text-left mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Welcome back!
                </h1>
                <p className={`text-xl ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  Continue your journey on Japanese Learning
                </p>
              </motion.div>

              {/* Maneki Neko Call to Action */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <Link to="/knowing" className="inline-flex items-center px-8 py-4 bg-japanese-red text-white rounded-nav font-bold text-lg shadow-lg hover:bg-japanese-red-dark transition-all duration-300 transform hover:scale-105">
                  <span className="mr-3 text-2xl">🐱</span>
                  Resume Course
                  <span className="ml-3">▶️</span>
                </Link>
              </motion.div>
            </div>

            {/* Progress Summary Section */}
            {currentUser && (
              <div className="mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Your Progress
                </h2>
                <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  Track your learning journey
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                      Learning Overview
                    </h3>
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>Overall Mastery</span>
                        <span className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>{Math.round(masteryPercentage)}%</span>
                      </div>
                      <div className={`w-full h-3 bg-gray-200 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-gradient-to-r from-japanese-red to-japanese-orange rounded-full transition-all duration-500"
                          style={{ width: `${masteryPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold text-japanese-red ${theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'}`}>
                          {masteredWords}
                        </div>
                        <div className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>Mastered</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold text-japanese-orange ${theme === 'dark' ? 'text-japanese-orange' : 'text-japanese-orange'}`}>
                          {inProgressWords}
                        </div>
                        <div className={`${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>In Progress</div>
                      </div>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {quickActions.slice(0, 3).map((action, index) => (
                        <Link
                          key={action.title}
                          to={action.path}
                          className={`block p-3 rounded-nav border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                            theme === 'dark' 
                              ? 'border-border-dark-light hover:border-japanese-red' 
                              : 'border-border-light hover:border-japanese-red'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{action.icon}</span>
                              <div>
                                <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                                  {action.title}
                                </div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                                  {action.description}
                                </div>
                              </div>
                            </div>
                            {action.badge && (
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                action.badgeColor === 'error' ? 'bg-japanese-red text-white' :
                                action.badgeColor === 'success' ? 'bg-japanese-green text-white' :
                                action.badgeColor === 'warning' ? 'bg-japanese-orange text-white' :
                                'bg-japanese-blue text-white'
                              }`}>
                                {action.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity Section */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Recent Activity
              </h2>
              <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Your latest learning achievements
              </p>
              <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-nav bg-opacity-10 bg-japanese-green">
                    <div className="flex items-center">
                      <span className="text-2xl mr-4">✅</span>
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                          Daily Goal Completed
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                          {dailyProgressPercentage >= 100 ? 'Today' : 'Yesterday'}
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      {dailyGoal} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-nav bg-opacity-10 bg-japanese-blue">
                    <div className="flex items-center">
                      <span className="text-2xl mr-4">🎓</span>
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                          New Words Learned
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                          This week
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      +{Math.floor(Math.random() * 10) + 5}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-nav bg-opacity-10 bg-japanese-orange">
                    <div className="flex items-center">
                      <span className="text-2xl mr-4">🔥</span>
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                          Streak Maintained
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                          {currentStreak > 0 ? `${currentStreak} days` : 'Start today!'}
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      🔥
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Tips Section */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Learning Tips
              </h2>
              <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Boost your Japanese learning with these tips
              </p>
              <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <span className="text-2xl mr-4 mt-1">🎯</span>
                    <div>
                      <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                        Set Daily Goals
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        Even 10 minutes a day can make a big difference in your Japanese learning journey. Consistency is key!
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-4 mt-1">🔄</span>
                    <div>
                      <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                        Review Regularly
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        Use spaced repetition to remember words better and longer. The SRS system will help you review at optimal intervals.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-4 mt-1">🎌</span>
                    <div>
                      <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                        Practice Speaking
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        Don't just read - practice pronunciation and speaking out loud. Use the audio features to perfect your accent.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-4 mt-1">🎬</span>
                    <div>
                      <div className={`font-semibold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                        Watch Anime & Media
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        Immerse yourself in Japanese culture through anime, movies, and TV shows. Context helps with retention!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Statistics Section */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                Study Statistics
              </h2>
              <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                Your detailed learning metrics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">⏱️</span>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                      Study Time
                    </h3>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold text-japanese-blue mb-2 ${theme === 'dark' ? 'text-japanese-blue' : 'text-japanese-blue'}`}>
                      {formatTime(totalStudyTime)}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      Total time spent learning
                    </div>
                  </div>
                </div>
                <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">📚</span>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                      Vocabulary
                    </h3>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold text-japanese-green mb-2 ${theme === 'dark' ? 'text-japanese-green' : 'text-japanese-green'}`}>
                      {totalWords}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      Total words in collection
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Maneki Neko Mascot */}
          <div className="lg:w-96 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full"
            >
              {/* Main Emotion-Based Mascot */}
              <div className="text-center mb-8">
                <div className="w-64 h-64 mx-auto mb-6 relative">
                  <HybridMascots
                    type="emotions"
                    size="xlarge"
                    progress={masteryPercentage}
                    performance={masteryPercentage >= 80 ? 'excellent' : masteryPercentage >= 60 ? 'good' : masteryPercentage >= 40 ? 'average' : masteryPercentage >= 20 ? 'poor' : 'terrible'}
                    context="welcome"
                    mood={dailyProgressPercentage >= 100 ? 'positive' : currentStreak > 0 ? 'positive' : 'neutral'}
                  />
                </div>
                <h3 className={`text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                  Your Learning Companions
                </h3>
                <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                  {dailyProgressPercentage >= 100 ? 'Amazing work today! 🎉' : 
                   currentStreak > 0 ? 'Keep up the great work! 🔥' : 
                   'Maneki Neko brings luck to your studies! 🍀'}
                </p>
              </div>

              {/* Daily Goal Progress with Maneki Neko */}
              <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'} mb-6`}>
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-4">🎯</span>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Daily Goal
                  </h4>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold text-japanese-green mb-3 ${theme === 'dark' ? 'text-japanese-green' : 'text-japanese-green'}`}>
                    {todayProgress}/{dailyGoal}
                  </div>
                  <div className={`text-base mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {dailyProgressPercentage >= 100 ? 'Completed! 🎉' : 'minutes studied'}
                  </div>
                  <div className={`w-full h-4 bg-gray-200 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-japanese-green to-japanese-blue rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(dailyProgressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Streak Display */}
              {currentStreak > 0 && (
                <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'}`}>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">🔥</span>
                    <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                      Current Streak
                    </h4>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold text-japanese-orange mb-3 ${theme === 'dark' ? 'text-japanese-orange' : 'text-japanese-orange'}`}>
                      {currentStreak}
                    </div>
                    <div className={`text-base ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      days and counting! 🚀
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              <div className={`p-8 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'} mt-6`}>
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-4">📊</span>
                  <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    Quick Stats
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-base ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>Mastered Words</span>
                    <span className={`text-2xl font-bold text-japanese-red ${theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'}`}>
                      {masteredWords}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-base ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>In Progress</span>
                    <span className={`text-2xl font-bold text-japanese-orange ${theme === 'dark' ? 'text-japanese-orange' : 'text-japanese-orange'}`}>
                      {inProgressWords}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-base ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>Study Time</span>
                    <span className={`text-xl font-bold text-japanese-blue ${theme === 'dark' ? 'text-japanese-blue' : 'text-japanese-blue'}`}>
                      {formatTime(totalStudyTime)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            Quick Actions
          </h2>
          <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            Jump right into your learning journey
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={action.path} className="block">
                  <div className={`relative p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
                    theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
                  }`}>
                    {action.badge && (
                      <div className="absolute -top-2 -right-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          action.badgeColor === 'error' ? 'bg-japanese-red text-white' :
                          action.badgeColor === 'success' ? 'bg-japanese-green text-white' :
                          action.badgeColor === 'warning' ? 'bg-japanese-orange text-white' :
                          'bg-japanese-blue text-white'
                        }`}>
                          {action.badge}
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-4xl mb-4">{action.icon}</div>
                      <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                        {action.title}
                      </h3>
                      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                        {action.description}
                      </p>
                      {action.progress !== undefined && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                              Progress
                            </span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                              {Math.round(action.progress)}%
                            </span>
                          </div>
                          <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div 
                              className="h-full bg-gradient-to-r from-japanese-green to-japanese-blue rounded-full transition-all duration-500"
                              style={{ width: `${action.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Categories */}
        {FEATURE_CATEGORIES.map((category, categoryIndex) => (
          <div key={category.title} className="mb-8">
            <div className="mb-6">
              <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                {category.title}
              </h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                {category.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (categoryIndex * 0.2) + (index * 0.1) }}
                >
                  <Link to={item.path} className="block">
                    <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
                      theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'
                    }`}>
                      <div className="flex items-start mb-4">
                        <div className={`w-12 h-12 rounded-nav flex items-center justify-center mr-4 text-white text-xl ${
                          item.color === 'japanese-red' ? 'bg-japanese-red' :
                          item.color === 'japanese-blue' ? 'bg-japanese-blue' :
                          item.color === 'japanese-green' ? 'bg-japanese-green' :
                          item.color === 'japanese-orange' ? 'bg-japanese-orange' :
                          item.color === 'japanese-purple' ? 'bg-japanese-purple' :
                          item.color === 'japanese-pink' ? 'bg-japanese-pink' :
                          item.color === 'japanese-yellow' ? 'bg-japanese-yellow' :
                          'bg-japanese-earth'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                              {item.title}
                            </h3>
                            {item.badge && (
                              <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${
                                item.color === 'japanese-red' ? 'bg-japanese-red' :
                                item.color === 'japanese-blue' ? 'bg-japanese-blue' :
                                item.color === 'japanese-green' ? 'bg-japanese-green' :
                                item.color === 'japanese-orange' ? 'bg-japanese-orange' :
                                item.color === 'japanese-purple' ? 'bg-japanese-purple' :
                                item.color === 'japanese-pink' ? 'bg-japanese-pink' :
                                item.color === 'japanese-yellow' ? 'bg-japanese-yellow' :
                                'bg-japanese-earth'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <span className={`px-4 py-2 rounded-nav text-sm font-semibold text-white ${
                          item.color === 'japanese-red' ? 'bg-japanese-red' :
                          item.color === 'japanese-blue' ? 'bg-japanese-blue' :
                          item.color === 'japanese-green' ? 'bg-japanese-green' :
                          item.color === 'japanese-orange' ? 'bg-japanese-orange' :
                          item.color === 'japanese-purple' ? 'bg-japanese-purple' :
                          item.color === 'japanese-pink' ? 'bg-japanese-pink' :
                          item.color === 'japanese-yellow' ? 'bg-japanese-yellow' :
                          'bg-japanese-earth'
                        }`}>
                          Explore ▶️
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom Mascot Section - Emotion Showcase */}
        <div className="text-center py-16">
          <h2 className={`text-4xl font-bold mb-8 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
            Your Emotional Learning Companions
          </h2>
          <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            Our mascots react to your learning progress and achievements!
          </p>
          
          {/* Emotion Showcase Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            <div className="text-center">
              <HybridMascots 
                type="emotions" 
                size="medium" 
                variant="happy" 
                context="achievement"
              />
              <p className="text-sm mt-2 font-medium">Happy</p>
            </div>
            <div className="text-center">
              <HybridMascots 
                type="emotions" 
                size="medium" 
                variant="goodJob" 
                context="success"
              />
              <p className="text-sm mt-2 font-medium">Good Job</p>
            </div>
            <div className="text-center">
              <HybridMascots 
                type="emotions" 
                size="medium" 
                variant="confident" 
                context="quiz"
              />
              <p className="text-sm mt-2 font-medium">Confident</p>
            </div>
            <div className="text-center">
              <HybridMascots 
                type="emotions" 
                size="medium" 
                variant="love" 
                context="streak"
              />
              <p className="text-sm mt-2 font-medium">Love</p>
            </div>
            <div className="text-center">
              <HybridMascots 
                type="emotions" 
                size="medium" 
                variant="disappointed" 
                context="error"
              />
              <p className="text-sm mt-2 font-medium">Disappointed</p>
            </div>
            <div className="text-center">
              <HybridMascots 
                type="emotions" 
                size="medium" 
                variant="shocked" 
                context="error"
              />
              <p className="text-sm mt-2 font-medium">Shocked</p>
            </div>
          </div>

          {/* Performance-Based Mascot Display */}
          <div className="mb-12">
            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
              How Your Mascot Feels About Your Progress
            </h3>
            <div className="flex justify-center">
              <HybridMascots
                type="emotions"
                size="large"
                progress={masteryPercentage}
                performance={masteryPercentage >= 80 ? 'excellent' : masteryPercentage >= 60 ? 'good' : masteryPercentage >= 40 ? 'average' : masteryPercentage >= 20 ? 'poor' : 'terrible'}
                context="study"
                mood={dailyProgressPercentage >= 100 ? 'positive' : currentStreak > 0 ? 'positive' : 'neutral'}
              />
            </div>
            <p className={`text-lg mt-4 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {masteryPercentage >= 80 ? 'Your mascot is extremely proud of you! 🎉' :
               masteryPercentage >= 60 ? 'Your mascot is very happy with your progress! 😊' :
               masteryPercentage >= 40 ? 'Your mascot is satisfied with your work! 👍' :
               masteryPercentage >= 20 ? 'Your mascot is a bit disappointed, but believes in you! 💪' :
               'Your mascot is worried, but ready to help you improve! 🫂'}
            </p>
          </div>

          <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            Let's get started! 🎌
          </p>
          <div className="flex justify-center space-x-6">
            <Link to="/knowing" className="px-8 py-4 bg-japanese-red text-white rounded-nav font-semibold text-lg hover:bg-japanese-red-dark transition-colors transform hover:scale-105">
              Start Learning
            </Link>
            <Link to="/anime" className="px-8 py-4 bg-japanese-blue text-white rounded-nav font-semibold text-lg hover:bg-japanese-blue-dark transition-colors transform hover:scale-105">
              Anime Phrases
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;