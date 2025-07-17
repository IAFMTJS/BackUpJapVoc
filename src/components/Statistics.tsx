import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    isPositive: boolean;
    value: number;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={themeClasses.card}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
          {title}
        </h3>
        <span className={`text-2xl ${themeClasses.text.primary}`}>{icon}</span>
      </div>
      <div className={`text-3xl font-bold mb-2 ${themeClasses.text.primary}`}>
        {value}
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${
          trend.isPositive ? 'text-accent-red' : 'text-text-muted dark:text-text-dark-muted'
        }`}>
          <span className="mr-1">
            {trend.isPositive ? '↑' : '↓'}
          </span>
          {trend.value}% from last week
        </div>
      )}
    </div>
  );
};

const Statistics: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress } = useProgress();

  // Calculate statistics
  const totalWords = progress.totalWords || 0;
  const masteredWords = progress.masteredWords || 0;
  const averageScore = progress.averageScore || 0;
  const studyStreak = progress.studyStreak || 0;

  // Calculate trends (mock data for now)
  const trends = {
    words: { value: 15, isPositive: true },
    mastery: { value: 8, isPositive: true },
    score: { value: 5, isPositive: true },
    streak: { value: 2, isPositive: true },
  };

  return (
    <div className="space-y-6">
      <div className={themeClasses.card}>
        <h3 className={`text-xl font-bold mb-6 ${themeClasses.text.primary}`}>
          Learning Progress
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={themeClasses.text.primary}>Vocabulary Mastery</span>
              <span className={themeClasses.text.primary}>
                {Math.round((masteredWords / totalWords) * 100)}%
              </span>
            </div>
            <div className="w-full h-4 bg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-red transition-all duration-500"
                style={{ width: `${(masteredWords / totalWords) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={themeClasses.text.primary}>Average Score</span>
              <span className={themeClasses.text.primary}>{averageScore}%</span>
            </div>
            <div className="w-full h-4 bg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-red transition-all duration-500"
                style={{ width: `${averageScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={themeClasses.text.primary}>Study Streak</span>
              <span className={themeClasses.text.primary}>{studyStreak} days</span>
            </div>
            <div className="w-full h-4 bg-dark-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-red transition-all duration-500"
                style={{ width: `${Math.min((studyStreak / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={themeClasses.card}>
        <h3 className={`text-xl font-bold mb-6 ${themeClasses.text.primary}`}>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {progress.recentActivity?.map((activity, index) => (
            <div
              key={index}
              className={`p-4 rounded-nav ${themeClasses.card} border ${themeClasses.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${themeClasses.text.primary}`}>
                    {activity.type}
                  </p>
                  <p className={`text-sm ${themeClasses.text.primary} opacity-75`}>
                    {activity.date}
                  </p>
                </div>
                <span className={`text-lg ${themeClasses.text.primary}`}>
                  {activity.icon}
                </span>
              </div>
            </div>
          ))}

          {(!progress.recentActivity || progress.recentActivity.length === 0) && (
            <div className={`text-center p-8 ${themeClasses.text.primary}`}>
              No recent activity to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics; 