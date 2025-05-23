import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const Statistics: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { progress } = useProgress();

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        card: 'bg-charcoal-700 hover:bg-charcoal-600',
        border: 'border-charcoal-600',
        chart: {
          background: 'bg-charcoal-800',
          text: 'text-ivory-100',
          grid: 'border-charcoal-600',
        },
        stat: {
          label: 'text-ivory-300',
          value: 'text-ivory-100',
          highlight: 'text-sage-300'
        }
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      card: 'bg-ivory-50 hover:bg-sage-50',
      border: 'border-sage-200',
      chart: {
        background: 'bg-ivory-100',
        text: 'text-charcoal-800',
        grid: 'border-sage-200',
      },
      stat: {
        label: 'text-charcoal-600',
        value: 'text-charcoal-800',
        highlight: 'text-sage-600'
      }
    };
  };

  const themeClasses = getThemeClasses();

  const calculateAccuracy = (section: any): number => {
    if (section.totalQuestions === 0) return 0;
    return Math.round((section.correctAnswers / section.totalQuestions) * 100);
  };

  const getAccuracyData = (): ChartData => ({
    labels: ['Word Practice', 'Sentence Practice', 'Kanji Practice'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: [
          calculateAccuracy(progress.wordPractice),
          calculateAccuracy(progress.sentencePractice),
          calculateAccuracy(progress.kanji),
        ],
        backgroundColor: isDarkMode ? 'rgba(107, 135, 96, 0.2)' : 'rgba(107, 135, 96, 0.1)',
        borderColor: isDarkMode ? 'rgb(107, 135, 96)' : 'rgb(85, 109, 77)',
      },
    ],
  });

  const getQuestionsData = (): ChartData => ({
    labels: ['Word Practice', 'Sentence Practice', 'Kanji Practice'],
    datasets: [
      {
        label: 'Questions Answered',
        data: [
          progress.wordPractice.totalQuestions,
          progress.sentencePractice.totalQuestions,
          progress.kanji.totalQuestions,
        ],
        backgroundColor: isDarkMode ? 'rgba(139, 115, 85, 0.2)' : 'rgba(139, 115, 85, 0.1)',
        borderColor: isDarkMode ? 'rgb(139, 115, 85)' : 'rgb(196, 164, 132)',
      },
    ],
  });

  const getStreakData = (): ChartData => ({
    labels: ['Word Practice', 'Sentence Practice', 'Kanji Practice'],
    datasets: [
      {
        label: 'Best Streak',
        data: [
          progress.wordPractice.bestStreak,
          progress.sentencePractice.bestStreak,
          progress.kanji.bestStreak,
        ],
        backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
        borderColor: isDarkMode ? 'rgb(245, 158, 11)' : 'rgb(217, 119, 6)',
      },
    ],
  });

  const renderStatCard = (title: string, value: string | number, icon: string) => (
    <div className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.card}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const renderSectionStats = (title: string, section: any, icon: string) => (
    <div className={`p-6 rounded-xl border ${themeClasses.border} ${themeClasses.card} shadow-soft transition-all duration-300 hover:shadow-card`}>
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className={`text-lg font-serif font-medium ${themeClasses.text}`}>{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-sm ${themeClasses.stat.label}`}>Total Questions</p>
          <p className={`text-xl font-medium ${themeClasses.stat.value}`}>
            {section.totalQuestions}
          </p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.stat.label}`}>Accuracy</p>
          <p className={`text-xl font-medium ${themeClasses.stat.value}`}>
            {calculateAccuracy(section)}%
          </p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.stat.label}`}>Best Streak</p>
          <p className={`text-xl font-medium ${themeClasses.stat.highlight}`}>
            {section.bestStreak}
          </p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.stat.label}`}>Last Practice</p>
          <p className={`text-sm ${themeClasses.stat.value}`}>
            {section.lastAttempt ? new Date(section.lastAttempt).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`mb-8 ${themeClasses.container} rounded-lg shadow-md p-6`}>
        <h2 className="text-2xl font-bold mb-6">Detailed Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {renderStatCard(
            'Total Questions',
            progress.wordPractice.totalQuestions + 
            progress.sentencePractice.totalQuestions + 
            progress.kanji.totalQuestions +
            progress.hiragana.totalQuestions +
            progress.katakana.totalQuestions,
            '📊'
          )}
          {renderStatCard(
            'Average Accuracy',
            `${Math.round(
              (calculateAccuracy(progress.wordPractice) +
                calculateAccuracy(progress.sentencePractice) +
                calculateAccuracy(progress.kanji) +
                calculateAccuracy(progress.hiragana) +
                calculateAccuracy(progress.katakana)) /
                5
            )}%`,
            '🎯'
          )}
          {renderStatCard(
            'Best Overall Streak',
            Math.max(
              progress.wordPractice.bestStreak,
              progress.sentencePractice.bestStreak,
              progress.kanji.bestStreak,
              progress.hiragana.bestStreak,
              progress.katakana.bestStreak
            ),
            '🔥'
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Section Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSectionStats('Hiragana', progress.hiragana, 'あ')}
            {renderSectionStats('Katakana', progress.katakana, 'ア')}
            {renderSectionStats('Word Practice', progress.wordPractice, '📚')}
            {renderSectionStats('Sentence Practice', progress.sentencePractice, '📝')}
            {renderSectionStats('Kanji', progress.kanji, '🖋️')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 