import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

type Tab = 'overview' | 'achievements' | 'statistics' | 'calendar';

interface ProgressProps {
  detailed?: boolean;
}

const Progress: React.FC<ProgressProps> = ({ detailed = false }) => {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { progress } = useApp();

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-gray-800',
        text: 'text-gray-100',
        card: 'bg-gray-700',
        border: 'border-gray-600',
        tab: {
          active: 'bg-blue-600 text-white',
          inactive: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        },
        stat: {
          label: 'text-gray-400',
          value: 'text-gray-100',
          highlight: 'text-blue-400'
        }
      };
    }

    switch (theme) {
      case 'blue':
        return {
          container: 'bg-blue-50',
          text: 'text-blue-900',
          card: 'bg-white',
          border: 'border-blue-200',
          tab: {
            active: 'bg-blue-600 text-white',
            inactive: 'bg-white text-blue-900 hover:bg-blue-50',
          },
          stat: {
            label: 'text-blue-600',
            value: 'text-blue-900',
            highlight: 'text-blue-600'
          }
        };
      case 'green':
        return {
          container: 'bg-green-50',
          text: 'text-green-900',
          card: 'bg-white',
          border: 'border-green-200',
          tab: {
            active: 'bg-green-600 text-white',
            inactive: 'bg-white text-green-900 hover:bg-green-50',
          },
          stat: {
            label: 'text-green-600',
            value: 'text-green-900',
            highlight: 'text-green-600'
          }
        };
      default:
        return {
          container: 'bg-white',
          text: 'text-gray-900',
          card: 'bg-gray-50',
          border: 'border-gray-200',
          tab: {
            active: 'bg-blue-600 text-white',
            inactive: 'bg-gray-50 text-gray-900 hover:bg-gray-100',
          },
          stat: {
            label: 'text-gray-600',
            value: 'text-gray-900',
            highlight: 'text-blue-600'
          }
        };
    }
  };

  const themeClasses = getThemeClasses();

  const sections = [
    { id: 'section3', name: 'Writing Practice', icon: '✍️' },
    { id: 'section4', name: 'Cultural Context', icon: '🎎' },
    { id: 'section5', name: 'Vocabulary Builder', icon: '📚' },
    { id: 'section6', name: 'Reading Practice', icon: '📖' },
    { id: 'section7', name: 'JLPT Preparation', icon: '🎯' },
    { id: 'games', name: 'Interactive Games', icon: '🎮' },
    { id: 'anime', name: 'Anime & Manga Phrases', icon: '🎌' }
  ];

  const calculateTotalProgress = () => {
    const total = sections.reduce((acc, section) => {
      const sectionProgress = progress[section.id];
      if (!sectionProgress) return acc;
      return acc + (sectionProgress.completed / Math.max(sectionProgress.total, 1));
    }, 0);
    return Math.round((total / sections.length) * 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQuizStats = (sectionProgress: any) => {
    if (!sectionProgress.quizStats) return null;

    const stats = sectionProgress.quizStats;
    return (
      <div className={`mt-4 p-4 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Quiz & Game Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className={`text-sm ${themeClasses.stat.label}`}>Total Attempts</p>
            <p className={`text-xl font-medium ${themeClasses.stat.value}`}>
              {stats.totalQuizzes}
            </p>
          </div>
          <div className="space-y-1">
            <p className={`text-sm ${themeClasses.stat.label}`}>Average Score</p>
            <p className={`text-xl font-medium ${themeClasses.stat.value}`}>
              {Math.round(stats.averageScore)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className={`text-sm ${themeClasses.stat.label}`}>Best Score</p>
            <p className={`text-xl font-medium ${themeClasses.stat.highlight}`}>
              {stats.bestScore}%
            </p>
          </div>
          <div className="space-y-1">
            <p className={`text-sm ${themeClasses.stat.label}`}>Last Attempt</p>
            <p className={`text-sm ${themeClasses.stat.value}`}>
              {formatDate(stats.lastQuizDate)}
            </p>
          </div>
        </div>

        {Object.entries(stats.categories).length > 0 && (
          <div className="mt-6">
            <h4 className={`text-md font-semibold mb-3 ${themeClasses.text}`}>Category Performance</h4>
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([category, stats]: [string, any]) => (
                <div key={category} className={`p-3 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${themeClasses.text}`}>{category}</span>
                    <span className={`text-sm ${themeClasses.stat.highlight}`}>
                      {stats.attempts} attempts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className={`text-xs ${themeClasses.stat.label}`}>Average Score</p>
                      <p className={`text-sm ${themeClasses.stat.value}`}>
                        {Math.round(stats.averageScore)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs ${themeClasses.stat.label}`}>Best Score</p>
                      <p className={`text-sm ${themeClasses.stat.highlight}`}>
                        {stats.bestScore}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${themeClasses.text}`}>Learning Progress</h2>
          <div className="relative inline-block">
            <div className={`text-3xl sm:text-4xl font-bold ${themeClasses.stat.highlight}`}>
              {calculateTotalProgress()}%
            </div>
            <div className={`text-sm ${themeClasses.stat.label}`}>Overall Progress</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {sections.map((section) => {
            const sectionProgress = progress[section.id] || { completed: 0, total: 0 };
            const percentage = sectionProgress.total > 0
              ? Math.round((sectionProgress.completed / sectionProgress.total) * 100)
              : 0;

            return (
              <div key={section.id} className={`p-3 sm:p-4 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl sm:text-2xl">{section.icon}</span>
                  <span className={`text-sm sm:text-base font-medium ${themeClasses.text}`}>{section.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs sm:text-sm ${themeClasses.stat.label}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDetailed = () => {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${themeClasses.text}`}>Learning Progress</h2>
          <div className="relative inline-block">
            <div className={`text-3xl sm:text-4xl font-bold ${themeClasses.stat.highlight}`}>
              {calculateTotalProgress()}%
            </div>
            <div className={`text-sm ${themeClasses.stat.label}`}>Overall Progress</div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sections.map((section) => {
            const sectionProgress = progress[section.id] || { completed: 0, total: 0 };
            const percentage = sectionProgress.total > 0
              ? Math.round((sectionProgress.completed / sectionProgress.total) * 100)
              : 0;

            return (
              <div key={section.id} className={`p-4 sm:p-6 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl sm:text-3xl">{section.icon}</span>
                    <h3 className={`text-lg sm:text-xl font-semibold ${themeClasses.text}`}>{section.name}</h3>
                  </div>
                  <span className={`text-sm ${themeClasses.stat.label}`}>
                    {sectionProgress.completed}/{sectionProgress.total} completed
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {renderQuizStats(sectionProgress)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!detailed) {
      return renderOverview();
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();

      case 'achievements':
        return (
          <div className={`p-6 text-center ${themeClasses.text}`}>
            <h2 className="text-2xl font-bold mb-4">Achievements Coming Soon</h2>
            <p className="text-lg opacity-75">
              Track your milestones and earn badges as you progress through your Japanese learning journey!
            </p>
          </div>
        );

      case 'statistics':
        return (
          <div className={`p-6 text-center ${themeClasses.text}`}>
            <h2 className="text-2xl font-bold mb-4">Detailed Statistics Coming Soon</h2>
            <p className="text-lg opacity-75">
              Get insights into your learning patterns, strengths, and areas for improvement.
            </p>
          </div>
        );

      case 'calendar':
        return (
          <div className={`p-6 text-center ${themeClasses.text}`}>
            <h2 className="text-2xl font-bold mb-4">Learning Calendar Coming Soon</h2>
            <p className="text-lg opacity-75">
              Track your daily study sessions and maintain a consistent learning schedule.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`${detailed ? 'max-w-4xl mx-auto px-4 py-8' : ''}`}>
      <div className={`${themeClasses.container} rounded-lg shadow-md p-6`}>
        {detailed && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(['overview', 'achievements', 'statistics', 'calendar'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  activeTab === tab ? themeClasses.tab.active : themeClasses.tab.inactive
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {renderTabContent()}
      </div>
    </div>
  );
};

export default Progress; 