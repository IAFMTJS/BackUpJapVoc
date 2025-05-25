import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import ToriiGate from '../components/ToriiGate';
import { useProgress } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';

const Home: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const navigate = useNavigate();
  const { progress, isLoading: isProgressLoading } = useProgress();
  const { userProgress, getLevelProgress } = useWordLevel();

  // Calculate total progress across all sections
  const calculateTotalProgress = () => {
    if (isProgressLoading) return 0;
    const sections = Object.keys(progress);
    if (sections.length === 0) return 0;
    
    const totalProgress = sections.reduce((acc, section) => {
      const sectionProgress = progress[section];
      if (sectionProgress && sectionProgress.total) {
        return acc + (sectionProgress.correct / sectionProgress.total);
      }
      return acc;
    }, 0);
    
    return Math.round((totalProgress / sections.length) * 100);
  };

  // Get recent activities (last 5 items)
  const getRecentActivities = () => {
    if (isProgressLoading) return [];
    
    const activities = Object.entries(progress)
      .filter(([_, item]) => item.lastAttempted)
      .sort((a, b) => b[1].lastAttempted - a[1].lastAttempted)
      .slice(0, 5)
      .map(([section, item]) => ({
        section,
        lastAttempted: new Date(item.lastAttempted),
        score: item.total ? Math.round((item.correct / item.total) * 100) : 0
      }));
    
    return activities;
  };

  // Calculate daily streak
  const calculateDailyStreak = () => {
    if (isProgressLoading) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = Object.values(progress)
      .map(item => new Date(item.lastAttempted))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    
    if (!lastActivity) return 0;
    
    const lastActivityDate = new Date(lastActivity);
    lastActivityDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If last activity was today or yesterday, streak is active
    return diffDays <= 1 ? 1 : 0;
  };

  // Get last session's weakest category for welcome back test
  const getLastSessionWeakestCategory = () => {
    if (isProgressLoading || recentActivities.length === 0) return null;
    
    // Get activities from the last session (within last 24 hours)
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const lastSessionActivities = recentActivities.filter(
      activity => activity.lastAttempted.getTime() > last24Hours
    );
    
    if (lastSessionActivities.length === 0) return null;
    
    // Find the activity with the lowest score
    const weakestActivity = lastSessionActivities.reduce((lowest, current) => 
      current.score < lowest.score ? current : lowest
    );
    
    return {
      section: weakestActivity.section,
      score: weakestActivity.score,
      lastAttempted: weakestActivity.lastAttempted
    };
  };

  const sections = [
    { 
      id: 'vocabulary', 
      name: 'Vocabulary Quiz', 
      icon: '📝', 
      path: '/vocabulary',
      description: 'Test your knowledge of Japanese vocabulary with interactive quizzes',
      difficulty: 'Beginner to Advanced',
      estimatedTime: '10-15 minutes per quiz'
    },
    { 
      id: 'dictionary', 
      name: 'Dictionary', 
      icon: '📚', 
      path: '/dictionary',
      description: 'Look up Japanese words and phrases with detailed explanations'
    },
    { 
      id: 'writing', 
      name: 'Writing Practice', 
      icon: '✍️', 
      path: '/writing',
      description: 'Practice writing hiragana, katakana, and kanji characters'
    },
    { 
      id: 'kanji', 
      name: 'Kanji Quiz', 
      icon: '漢', 
      path: '/kanji',
      description: 'Master kanji characters through interactive exercises'
    },
    {
      id: 'romaji',
      name: 'Romaji Practice',
      icon: '🔤',
      path: '/romaji',
      description: 'Learn and practice Japanese romaji with words, sentences, and stories'
    },
    {
      id: 'srs',
      name: 'SRS Learning',
      icon: '🔄',
      path: '/srs',
      description: 'Use spaced repetition to optimize your learning'
    },
    {
      id: 'games',
      name: 'Interactive Games',
      icon: '🎮',
      path: '/games',
      description: 'Learn through fun and engaging games'
    },
    {
      id: 'anime',
      name: 'Anime Section',
      icon: '🎬',
      path: '/anime',
      description: 'Learn Japanese from anime and manga'
    },
    {
      id: 'progress',
      name: 'Learning Progress',
      icon: '📊',
      path: '/progress',
      description: 'Track your learning journey with beautiful visualizations, achievements, and detailed progress analytics',
      features: [
        'Interactive progress charts and graphs',
        'Achievement badges and trophies',
        'Learning streak tracking',
        'Detailed performance analytics',
        'Activity heatmap and timeline'
      ]
    },
    {
      id: 'word-levels',
      name: 'Word Levels',
      icon: '📈',
      path: '/word-levels',
      description: 'Progress through vocabulary levels systematically'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      path: '/settings',
      description: 'Customize your learning experience'
    }
  ];

  const totalProgress = calculateTotalProgress();
  const recentActivities = getRecentActivities();
  const dailyStreak = calculateDailyStreak();

  // Neon SVG icons for each button
  const NeonIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'vocabulary':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="neon-pink" x="-10" y="-10" width="52" height="52">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M4 6h24v20H4z" stroke="#ff00c8" strokeWidth="2.5" filter="url(#neon-pink)" fill="none" />
            <path d="M8 10h16v2H8z" fill="#ff00c8" filter="url(#neon-pink)" />
            <path d="M8 15h10v2H8z" fill="#ff00c8" filter="url(#neon-pink)" />
            <path d="M8 20h6v2H8z" fill="#ff00c8" filter="url(#neon-pink)" />
            <circle cx="22" cy="16" r="2" fill="#ff00c8" filter="url(#neon-pink)" />
          </svg>
        );
      case 'dictionary':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="neon-blue" x="-10" y="-10" width="52" height="52">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M6 6h20v20H6z" stroke="#00f7ff" strokeWidth="2.5" filter="url(#neon-blue)" fill="none" />
            <text x="16" y="22" textAnchor="middle" fontSize="14" fill="#00f7ff" fontFamily="Orbitron, sans-serif" filter="url(#neon-blue)">辞</text>
            <path d="M8 8h16v2H8z" fill="#00f7ff" filter="url(#neon-blue)" opacity="0.5" />
          </svg>
        );
      case 'writing':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="neon-purple" x="-10" y="-10" width="52" height="52">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M8 6l16 4-4 16-16-4z" stroke="#9c00ff" strokeWidth="2.5" filter="url(#neon-purple)" fill="none" />
            <path d="M12 10l8 8" stroke="#9c00ff" strokeWidth="2" filter="url(#neon-purple)" />
            <circle cx="24" cy="10" r="2" fill="#9c00ff" filter="url(#neon-purple)" />
          </svg>
        );
      case 'kanji':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="neon-orange" x="-10" y="-10" width="52" height="52">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="#ff9900" strokeWidth="2.5" filter="url(#neon-orange)" fill="none" />
            <text x="16" y="22" textAnchor="middle" fontSize="14" fill="#ff9900" fontFamily="Orbitron, sans-serif" filter="url(#neon-orange)">漢</text>
            <path d="M8 8h16v2H8z" fill="#ff9900" filter="url(#neon-orange)" opacity="0.5" />
          </svg>
        );
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="neon-cyan" x="-10" y="-10" width="52" height="52">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="16" cy="16" r="12" stroke="#00f7ff" strokeWidth="2.5" filter="url(#neon-cyan)" fill="none" />
            <path d="M16 8v16M8 16h16" stroke="#00f7ff" strokeWidth="2" filter="url(#neon-cyan)" />
          </svg>
        );
    }
  };

  // Neon menu button component
  const NeonMenuButton = ({ section, onClick }: { section: any; onClick: () => void }) => {
    const { getThemeClasses } = useTheme();
    const themeClasses = getThemeClasses();

    const getColor = (id: string) => {
      switch (id) {
        case 'vocabulary':
          return '#ff00c8'; // neon pink
        case 'dictionary':
          return '#00f7ff'; // neon cyan
        case 'writing':
          return '#9c00ff'; // electric purple
        case 'kanji':
          return '#ff9900'; // neon orange
        default:
          return '#00f7ff'; // neon cyan
      }
    };

    const color = getColor(section.id);

    return (
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center h-32 rounded-2xl border-2 shadow-lg font-techno text-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-cyan group animate-neon-pulse ${themeClasses.button.primary}`}
        style={{
          borderColor: color,
          boxShadow: `0 0 16px ${color}, 0 0 48px ${color}44`,
          background: 'rgba(13,13,26,0.85)',
          color: color,
          textShadow: `0 0 8px ${color}`
        }}
      >
        <span className="mb-2 transform group-hover:scale-110 transition-transform duration-200">
          <NeonIcon type={section.id} />
        </span>
        <span className="uppercase tracking-wider">{section.name}</span>
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${themeClasses.container} relative overflow-hidden`}>
      {/* Neon grid background - only show in neon theme */}
      {theme === 'neon' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,247,255,0.1)_0%,rgba(13,13,26,0)_70%)]">
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,247,255,0.05)_25%,rgba(0,247,255,0.05)_26%,transparent_27%,transparent_74%,rgba(0,247,255,0.05)_75%,rgba(0,247,255,0.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,247,255,0.05)_25%,rgba(0,247,255,0.05)_26%,transparent_27%,transparent_74%,rgba(0,247,255,0.05)_75%,rgba(0,247,255,0.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px] animate-[grid-move_20s_linear_infinite]" />
        </div>
      )}

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-12">
          <h1 
            className={`text-4xl md:text-6xl font-bold mb-4 ${themeClasses.title}`}
          >
            Japanese Vocabulary
          </h1>
          <p 
            className={`text-xl md:text-2xl ${themeClasses.subtitle}`}
          >
            Master Japanese with interactive learning tools
          </p>
        </header>

        {/* Decorative cityscape background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
          <JapaneseCityscape 
            width={1200}
            height={600}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              filter: theme === 'dark' ? 'brightness(0.7)' : 'brightness(1)'
            }}
          />
        </div>

        {/* Hero Section */}
        <div className="relative py-12 px-4 sm:px-6 lg:px-8">
          <div className="relative z-10">
            {/* Main content grid with Torii Gate */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side - Welcome and Progress */}
                <div className="lg:col-span-8">
                  <div className="hero-content">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary tracking-tight">
                      WELCOME TO JAPVOC
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary mb-8">
                      Build your Japanese skills with interactive quizzes and practice
                    </p>
                    
                    {/* Progress Summary for Returning Users */}
                    {!isProgressLoading && totalProgress > 0 && (
                      <div className="mb-8 p-6 bg-opacity-10 bg-primary rounded-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-center">Your Progress</h2>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col items-center">
                            <p className="text-sm text-text-secondary mb-2">Total Progress</p>
                            <div className="relative w-20 h-20 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="36"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="none"
                                  className="text-primary opacity-20"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="36"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="none"
                                  className="text-primary"
                                  strokeDasharray={`${totalProgress * 2.26} 226`}
                                />
                              </svg>
                              <span className="absolute text-2xl font-bold">{totalProgress}%</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-sm text-text-secondary mb-2">Daily Streak</p>
                            <div className="relative w-20 h-20 flex items-center justify-center">
                              <div className="text-4xl font-bold">
                                {dailyStreak} 🔥
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-sm text-text-secondary mb-2">Current Level</p>
                            <div className="relative w-20 h-20 flex items-center justify-center">
                              <div className="text-4xl font-bold">
                                {userProgress.currentLevel}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Activities */}
                    {recentActivities.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Recent Activities</h3>
                        <div className="space-y-2">
                          {recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-opacity-5 bg-primary rounded">
                              <span className="text-sm font-medium">{activity.section}</span>
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-2 bg-primary bg-opacity-20 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${activity.score}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{activity.score}%</span>
                                <span className="text-xs text-text-secondary w-24 text-right">
                                  {activity.lastAttempted.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => navigate('/how-to-use')}
                      className={themeClasses.button.primary}
                    >
                      How to Use This Site
                    </button>
                  </div>
                </div>

                {/* Right side - Torii Gate with Text */}
                <div className="lg:col-span-4 flex items-center justify-center">
                  <div className="relative">
                    <ToriiGate 
                      className="w-80 h-80" 
                      size="large" 
                      opacity={1}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center transform -rotate-12">
                        <h1 className="text-5xl font-bold mb-2 tracking-wider" style={{ color: '#FF4B4B', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                          日本語
                        </h1>
                        <p className="text-2xl font-medium" style={{ color: '#FF4B4B', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                          JapVoc
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome Back Test section */}
                {!isProgressLoading && totalProgress > 0 && (
                  <div className="lg:col-span-12">
                    <div className="bg-opacity-10 bg-primary rounded-lg p-6">
                      {(() => {
                        const weakestCategory = getLastSessionWeakestCategory();
                        if (weakestCategory) {
                          return (
                            <div className="space-y-6">
                              <div className="text-center">
                                <p className="text-lg mb-2">Continue where you left off</p>
                                <p className="text-sm text-text-secondary mb-4">
                                  Your last session showed some challenges in {weakestCategory.section}
                                </p>
                                <div className="mb-6">
                                  <div className="w-full h-3 bg-primary bg-opacity-20 rounded-full overflow-hidden mb-2">
                                    <div 
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${weakestCategory.score}%` }}
                                    />
                                  </div>
                                  <p className="text-sm text-text-secondary">
                                    Last score: {weakestCategory.score}%
                                  </p>
                                </div>
                                <button
                                  onClick={() => navigate(`/${weakestCategory.section}`)}
                                  className={`${themeClasses.button.primary} w-full`}
                                >
                                  Practice {weakestCategory.section}
                                </button>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-text-secondary mb-4">Or try a different section</p>
                                <div className="grid grid-cols-2 gap-3">
                                  {sections
                                    .filter(section => section.id !== weakestCategory.section)
                                    .slice(0, 4)
                                    .map(section => (
                                      <button
                                        key={section.id}
                                        onClick={() => navigate(section.path)}
                                        className={`${themeClasses.button.secondary} text-sm py-2`}
                                      >
                                        {section.name}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="text-center">
                            <p className="text-lg mb-4">Start your learning journey</p>
                            <p className="text-sm text-text-secondary mb-6">
                              Choose a section to begin practicing
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {sections.slice(0, 4).map(section => (
                                <button
                                  key={section.id}
                                  onClick={() => navigate(section.path)}
                                  className={`${themeClasses.button.secondary} text-sm py-2`}
                                >
                                  {section.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        {theme === 'neon' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 max-w-2xl mx-auto">
            {sections.slice(0, 4).map(section => (
              <NeonMenuButton key={section.id} section={section} onClick={() => navigate(section.path)} />
            ))}
          </div>
        ) : (
          <section className="py-12 relative z-10">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => {
                  const sectionProgress = progress[`${section.id}-total`];
                  const progressPercentage = sectionProgress && sectionProgress.total
                    ? Math.round((sectionProgress.correct / sectionProgress.total) * 100)
                    : 0;
                  const lastAccessed = sectionProgress?.lastAttempted
                    ? new Date(sectionProgress.lastAttempted)
                    : null;

                  return (
                    <Link
                      key={section.id}
                      to={section.path}
                      className={`${themeClasses.card} hover:scale-105 transition-transform duration-300`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-xl font-bold ${themeClasses.text.primary}`}>
                          {section.name}
                        </h3>
                        <span className={`text-2xl ${themeClasses.text.secondary}`}>
                          {section.icon}
                        </span>
                      </div>
                      <p className={`mb-4 ${themeClasses.text.secondary}`}>
                        {section.description}
                      </p>
                      {sectionProgress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={themeClasses.text.muted}>Progress</span>
                            <span className={themeClasses.text.secondary}>{progressPercentage}%</span>
                          </div>
                          <div className={`h-2 rounded-full ${themeClasses.progress.background}`}>
                            <div
                              className={`h-full rounded-full ${themeClasses.progress.bar}`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          {lastAccessed && (
                            <p className={`text-xs ${themeClasses.text.muted}`}>
                              Last accessed: {lastAccessed.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-dark-border py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className={themeClasses.text.muted}>
                  © 2024 JAPVOC. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <Link to="/about" className={themeClasses.text.secondary}>
                  About
                </Link>
                <Link to="/privacy" className={themeClasses.text.secondary}>
                  Privacy
                </Link>
                <Link to="/contact" className={themeClasses.text.secondary}>
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home; 