import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (progress: any) => boolean;
  category: 'word' | 'sentence' | 'kanji' | 'hiragana' | 'katakana' | 'general';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_word',
    title: 'First Steps',
    description: 'Complete your first word practice',
    icon: '🎯',
    condition: (progress) => progress.wordPractice.totalQuestions > 0,
    category: 'word'
  },
  {
    id: 'word_master',
    title: 'Word Master',
    description: 'Complete 100 word practices with 80% accuracy',
    icon: '📚',
    condition: (progress) => 
      progress.wordPractice.totalQuestions >= 100 && 
      (progress.wordPractice.correctAnswers / progress.wordPractice.totalQuestions) >= 0.8,
    category: 'word'
  },
  {
    id: 'sentence_starter',
    title: 'Sentence Builder',
    description: 'Complete your first sentence practice',
    icon: '📝',
    condition: (progress) => progress.sentencePractice.totalQuestions > 0,
    category: 'sentence'
  },
  {
    id: 'sentence_master',
    title: 'Grammar Guru',
    description: 'Complete 50 sentence practices with 75% accuracy',
    icon: '🎓',
    condition: (progress) => 
      progress.sentencePractice.totalQuestions >= 50 && 
      (progress.sentencePractice.correctAnswers / progress.sentencePractice.totalQuestions) >= 0.75,
    category: 'sentence'
  },
  {
    id: 'kanji_beginner',
    title: 'Kanji Explorer',
    description: 'Complete your first kanji practice',
    icon: '🖋️',
    condition: (progress) => progress.kanji.totalQuestions > 0,
    category: 'kanji'
  },
  {
    id: 'kanji_master',
    title: 'Kanji Master',
    description: 'Complete 200 kanji practices with 85% accuracy',
    icon: '🏆',
    condition: (progress) => 
      progress.kanji.totalQuestions >= 200 && 
      (progress.kanji.correctAnswers / progress.kanji.totalQuestions) >= 0.85,
    category: 'kanji'
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Maintain a 3-day practice streak',
    icon: '🔥',
    condition: (progress) => {
      const lastAttempt = new Date(progress.kanji.lastAttempt);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return lastAttempt >= threeDaysAgo;
    },
    category: 'general'
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '⚔️',
    condition: (progress) => {
      const lastAttempt = new Date(progress.kanji.lastAttempt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastAttempt >= sevenDaysAgo;
    },
    category: 'general'
  },
  {
    id: 'hiragana_beginner',
    title: 'Hiragana Explorer',
    description: 'Complete your first hiragana practice',
    icon: 'あ',
    condition: (progress) => progress.hiragana.totalQuestions > 0,
    category: 'hiragana'
  },
  {
    id: 'hiragana_master',
    title: 'Hiragana Master',
    description: 'Complete 100 hiragana practices with 90% accuracy',
    icon: 'あ',
    condition: (progress) => 
      progress.hiragana.totalQuestions >= 100 && 
      (progress.hiragana.correctAnswers / progress.hiragana.totalQuestions) >= 0.9,
    category: 'hiragana'
  },
  {
    id: 'katakana_beginner',
    title: 'Katakana Explorer',
    description: 'Complete your first katakana practice',
    icon: 'ア',
    condition: (progress) => progress.katakana.totalQuestions > 0,
    category: 'katakana'
  },
  {
    id: 'katakana_master',
    title: 'Katakana Master',
    description: 'Complete 100 katakana practices with 90% accuracy',
    icon: 'ア',
    condition: (progress) => 
      progress.katakana.totalQuestions >= 100 && 
      (progress.katakana.correctAnswers / progress.katakana.totalQuestions) >= 0.9,
    category: 'katakana'
  },
  {
    id: 'kana_master',
    title: 'Kana Master',
    description: 'Master both hiragana and katakana with 90% accuracy',
    icon: '🎯',
    condition: (progress) => 
      progress.hiragana.totalQuestions >= 100 && 
      progress.katakana.totalQuestions >= 100 &&
      (progress.hiragana.correctAnswers / progress.hiragana.totalQuestions) >= 0.9 &&
      (progress.katakana.correctAnswers / progress.katakana.totalQuestions) >= 0.9,
    category: 'general'
  },
  {
    id: 'kana_streak_7',
    title: 'Kana Warrior',
    description: 'Practice hiragana or katakana for 7 consecutive days',
    icon: '🔥',
    condition: (progress) => {
      const lastHiragana = new Date(progress.hiragana.lastAttempt);
      const lastKatakana = new Date(progress.katakana.lastAttempt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastHiragana >= sevenDaysAgo || lastKatakana >= sevenDaysAgo;
    },
    category: 'general'
  }
];

const Achievements: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { progress } = useProgress();

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        card: 'bg-charcoal-700 hover:bg-charcoal-600',
        border: 'border-charcoal-600',
        unlocked: 'bg-sage-700/20 border-sage-600/30',
        locked: 'bg-charcoal-900/20 border-charcoal-800/30',
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      card: 'bg-ivory-50 hover:bg-sage-50',
      border: 'border-sage-200',
      unlocked: 'bg-sage-100 border-sage-200',
      locked: 'bg-charcoal-100/20 border-charcoal-200',
    };
  };

  const themeClasses = getThemeClasses();

  const unlockedAchievements = ACHIEVEMENTS.filter(achievement => achievement.condition(progress));
  const lockedAchievements = ACHIEVEMENTS.filter(achievement => !achievement.condition(progress));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`${themeClasses.container} rounded-2xl shadow-soft p-8`}>
        <h1 className={`text-3xl font-serif font-medium mb-8 ${themeClasses.text}`}>
          Achievements
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {unlockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-6 rounded-xl ${themeClasses.unlocked} shadow-card transition-all duration-300 hover:shadow-soft`}
            >
              <div className="flex items-start space-x-4">
                <div className={`text-3xl ${isDarkMode ? 'text-sage-300' : 'text-sage-600'}`}>
                  {achievement.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-serif font-medium mb-2 ${themeClasses.text}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-ivory-300' : 'text-charcoal-600'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {lockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-6 rounded-xl ${themeClasses.locked} shadow-card transition-all duration-300 hover:shadow-soft`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl opacity-50">
                  {achievement.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-serif font-medium mb-2 ${themeClasses.text} opacity-50`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-ivory-300' : 'text-charcoal-600'} opacity-50`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements; 