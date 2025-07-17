import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface JapaneseWelcomeProps {
  userName?: string;
  currentLevel?: number;
  dailyGoal?: number;
  dailyProgress?: number;
  onResumeCourse?: () => void;
  onLogOut?: () => void;
}

const JapaneseWelcome: React.FC<JapaneseWelcomeProps> = ({
  userName = 'Learner',
  currentLevel = 3,
  dailyGoal = 20,
  dailyProgress = 15,
  onResumeCourse,
  onLogOut,
}) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const dailyProgressPercentage = (dailyProgress / dailyGoal) * 100;
  const isDailyGoalComplete = dailyProgress >= dailyGoal;

  return (
    <div className={`${themeClasses.container} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Welcome Message */}
            <div className="space-y-2">
              <h1 className={`${themeClasses.title} text-4xl lg:text-5xl`}>
                Welcome back, {userName}!
              </h1>
              <p className={`${themeClasses.subtitle} text-lg`}>
                Continue your journey on Japanese Learning
              </p>
            </div>

            {/* Primary Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onResumeCourse}
              className={`${themeClasses.button.primary} w-full lg:w-auto`}
            >
              Resume Course
            </motion.button>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Level Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`${themeClasses.card} text-center`}
              >
                <div className="space-y-2">
                  <p className={`${themeClasses.text.secondary} text-sm font-medium`}>
                    Current Level
                  </p>
                  <div className={`${themeClasses.text.primary} text-3xl font-bold`}>
                    {currentLevel}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-light dark:bg-dark-tertiary rounded-full h-2">
                    <div 
                      className="bg-accent-orange dark:bg-accent-orange-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentLevel % 1) * 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Daily Goal Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`${themeClasses.card} text-center`}
              >
                <div className="space-y-2">
                  <p className={`${themeClasses.text.secondary} text-sm font-medium`}>
                    Daily Goal
                  </p>
                  <div className={`${themeClasses.text.primary} text-3xl font-bold`}>
                    {dailyProgress}/{dailyGoal}
                  </div>
                  <p className={`${themeClasses.text.muted} text-sm`}>
                    {isDailyGoalComplete ? 'Completed' : `${dailyGoal - dailyProgress} remaining`}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - Mascottes and Japanese Elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-japanese-earth-light/20 to-japanese-earth-medium/10 rounded-3xl" />
            
            {/* Torii Gate Background */}
            <div className="relative z-10 flex items-center justify-center h-96">
              {/* Torii Gate SVG */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Torii Gate Structure */}
                <rect x="150" y="200" width="100" height="20" fill="#8B4513" />
                <rect x="120" y="180" width="160" height="20" fill="#C44536" />
                <rect x="130" y="220" width="20" height="80" fill="#8B4513" />
                <rect x="250" y="220" width="20" height="80" fill="#8B4513" />
                <rect x="140" y="160" width="120" height="20" fill="#C44536" />
              </svg>

              {/* Mascottes */}
              <div className="relative z-20 flex items-end space-x-8">
                {/* Maneki Neko (Motivational Cat) */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-white dark:bg-dark-elevated rounded-full border-4 border-japanese-red flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-2xl">🐱</span>
                  </div>
                  <p className={`${themeClasses.text.secondary} text-xs font-medium`}>
                    Maneki Neko
                  </p>
                </motion.div>

                {/* Penguin in Kimono (Disciplined Learner) */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-white dark:bg-dark-elevated rounded-full border-4 border-japanese-earth-dark flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-2xl">🐧</span>
                  </div>
                  <p className={`${themeClasses.text.secondary} text-xs font-medium`}>
                    Sensei Penguin
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 right-4 w-8 h-8 bg-accent-yellow dark:bg-accent-yellow-dark/30 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 left-8 w-6 h-6 bg-accent-orange dark:bg-accent-orange-dark/40 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-16 left-16 w-4 h-4 bg-japanese-red/30 rounded-full"
            />
          </motion.div>
        </div>

        {/* Navigation Bar */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`${themeClasses.nav.background} mt-8 rounded-nav p-4 flex items-center justify-between`}
        >
          <div className="flex items-center space-x-6">
            <a href="/" className={`${themeClasses.nav.link.default} font-medium`}>
              Home
            </a>
            <a href="/learn" className={`${themeClasses.nav.link.default} font-medium`}>
              Learn
            </a>
            <a href="/progress" className={`${themeClasses.nav.link.default} font-medium`}>
              Progress
            </a>
            <a href="/more" className={`${themeClasses.nav.link.default} font-medium`}>
              More
            </a>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogOut}
            className={`${themeClasses.button.secondary} text-sm`}
          >
            Log Out
          </motion.button>
        </motion.nav>
      </div>
    </div>
  );
};

export default JapaneseWelcome; 