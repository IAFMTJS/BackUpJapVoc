import React from 'react';
import { EmotionalCategory, MoodWord } from '../types/mood';
import { EMOTIONAL_CATEGORIES } from '../types/mood';
import { useTheme } from '../context/ThemeContext';

interface MoodStatsProps {
  words: MoodWord[];
  className?: string;
}

interface MoodStat {
  category: EmotionalCategory;
  count: number;
  mastered: number;
  learning: number;
  averageIntensity: number;
  relatedEmotions: Record<EmotionalCategory, number>;
}

const MoodStats: React.FC<MoodStatsProps> = ({ words, className }) => {
  const { theme } = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);

  // Calculate mood statistics
  const moodStats = React.useMemo(() => {
    // Initialize stats for all categories with default values
    const stats: Record<EmotionalCategory, MoodStat> = Object.keys(EMOTIONAL_CATEGORIES).reduce((acc, category) => {
      acc[category as EmotionalCategory] = {
        category: category as EmotionalCategory,
        count: 0,
        mastered: 0,
        learning: 0,
        averageIntensity: 0,
        relatedEmotions: {} as Record<EmotionalCategory, number>
      };
      return acc;
    }, {} as Record<EmotionalCategory, MoodStat>);

    // Calculate stats
    words.forEach(word => {
      if (word.emotionalContext?.category && EMOTIONAL_CATEGORIES[word.emotionalContext.category]) {
        const { category, intensity = 0, relatedEmotions = [] } = word.emotionalContext;
        const stat = stats[category];
        
        if (stat) {  // Add safety check
          stat.count++;
          if (word.mastered) {
            stat.mastered++;
          } else {
            stat.learning++;
          }
          stat.averageIntensity = (stat.averageIntensity * (stat.count - 1) + intensity) / stat.count;

          // Track related emotions
          relatedEmotions?.forEach(related => {
            if (EMOTIONAL_CATEGORIES[related as EmotionalCategory]) {
              stat.relatedEmotions[related as EmotionalCategory] = (stat.relatedEmotions[related as EmotionalCategory] || 0) + 1;
            }
          });
        }
      }
    });

    return stats;
  }, [words]);

  // Sort categories by count, filtering out any undefined stats
  const sortedCategories = React.useMemo(() => {
    return Object.values(moodStats)
      .filter(stat => stat && typeof stat.count === 'number')
      .sort((a, b) => b.count - a.count);
  }, [moodStats]);

  // Calculate mood cloud data with safety checks
  const moodCloudData = React.useMemo(() => {
    return sortedCategories
      .filter(stat => stat && typeof stat.count === 'number' && stat.count > 0)
      .map(stat => {
        if (!stat || !EMOTIONAL_CATEGORIES[stat.category]) {
          return null;
        }
        return {
          category: stat.category,
          count: stat.count || 0,
          intensity: stat.averageIntensity || 0,
          mastered: stat.mastered || 0,
          color: EMOTIONAL_CATEGORIES[stat.category]?.emoji || '❓'
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [sortedCategories]);

  return (
    <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-dark-secondary border border-border-dark-light' : 'bg-light-secondary border border-border-light'} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
          Mood Statistics
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={showDetails ? "Show summary" : "Show detailed stats"}
        >
          {showDetails ? '📊' : '☁️'}
        </button>
      </div>

      {showDetails ? (
        // Detailed statistics view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories
            .filter(stat => stat && typeof stat.count === 'number' && stat.count > 0 && EMOTIONAL_CATEGORIES[stat.category])
            .map(stat => (
              <div
                key={stat.category}
                className={`p-4 rounded-2xl border-l-4 ${
                  theme === 'dark' ? 'bg-dark-tertiary border-border-dark-medium' : 'bg-light-tertiary border-border-medium'
                }`}
                style={{ borderLeftColor: EMOTIONAL_CATEGORIES[stat.category].emoji }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                    <span className="mr-2">{EMOTIONAL_CATEGORIES[stat.category].emoji}</span>
                    {EMOTIONAL_CATEGORIES[stat.category].name}
                  </h4>
                  <span className={`text-sm ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    {stat.count} words
                  </span>
                </div>

                <div className="mb-3">
                  <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Mastery Progress
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-japanese-green to-japanese-blue rounded-full"
                        style={{ width: `${(stat.mastered / stat.count) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      {Math.round((stat.mastered / stat.count) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                    Average Intensity
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-japanese-orange to-japanese-red rounded-full"
                        style={{ width: `${(stat.averageIntensity / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      {stat.averageIntensity.toFixed(1)}/5
                    </span>
                  </div>
                </div>

                {Object.keys(stat.relatedEmotions).length > 0 && (
                  <div>
                    <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                      Related Emotions
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(stat.relatedEmotions)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([emotion, count]) => (
                          <div
                            key={emotion}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-300'
                            }`}
                            title={`${count} words with this related emotion`}
                          >
                            <span className="mr-1">
                              {EMOTIONAL_CATEGORIES[emotion as EmotionalCategory].emoji}
                            </span>
                            {EMOTIONAL_CATEGORIES[emotion as EmotionalCategory].name}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        // Summary view (mood cloud)
        <div className="flex flex-wrap gap-4 justify-center p-4">
          {moodCloudData.map(({ category, count, intensity, mastered }) => (
            <div
              key={category}
              className={`flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-transform duration-200 hover:scale-105 ${
                theme === 'dark' ? 'bg-dark-tertiary border border-border-dark-medium' : 'bg-light-tertiary border border-border-medium'
              }`}
              title={`${EMOTIONAL_CATEGORIES[category].name}\nTotal: ${count} words\nMastered: ${mastered} words\nAverage Intensity: ${intensity.toFixed(1)}/5`}
            >
              <div className="text-3xl mb-2">
                {EMOTIONAL_CATEGORIES[category].emoji}
              </div>
              <div className={`text-sm font-semibold text-center ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-primary'}`}>
                {EMOTIONAL_CATEGORIES[category].name}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
                {count} words
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodStats; 