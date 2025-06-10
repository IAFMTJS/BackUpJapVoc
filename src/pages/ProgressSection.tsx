import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';

const ProgressSection: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const { progress: progressData } = useProgress();
  const themeClasses = getThemeClasses();

  const formatPercent = (num: number) => `${Math.round(num * 100)}%`;

  // Transform progress data to the expected format
  const progressSections = [
    {
      name: 'Dictionary',
      data: progressData.sections.dictionary,
      key: 'dictionary'
    },
    {
      name: 'Mood',
      data: progressData.sections.mood,
      key: 'mood'
    },
    {
      name: 'Culture',
      data: progressData.sections.culture,
      key: 'culture'
    }
  ];

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
            ← Back to Home
          </Link>
          <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
            Progress Overview
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {progressSections.map(({ name, data, key }) => {
            const total = data.totalItems || 0;
            const mastered = data.masteredItems || 0;
            const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
            
            return (
              <div key={key} className={themeClasses.card}>
                <h2 className={`text-xl font-bold mb-4 ${themeClasses.text.primary}`}>
                  {name}
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={themeClasses.text.secondary}>Progress</span>
                    <span className={themeClasses.text.primary}>{percent}%</span>
                  </div>
                  <div className="w-full bg-dark-lighter rounded-full h-4">
                    <div
                      className="bg-accent-red h-4 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={themeClasses.text.muted}>
                      Mastered: {mastered}
                    </span>
                    <span className={themeClasses.text.muted}>
                      Total: {total}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressSection; 