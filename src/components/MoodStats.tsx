import React from 'react';
import { Box, Typography, Paper, LinearProgress, Tooltip, IconButton } from '@mui/material';
import { EmotionalCategory, MoodWord } from '../types/mood';
import { EMOTIONAL_CATEGORIES } from '../types/mood';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloudIcon from '@mui/icons-material/Cloud';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
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
    <Paper className={className} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
          Mood Statistics
        </Typography>
        <Tooltip title={showDetails ? "Show summary" : "Show detailed stats"}>
          <IconButton onClick={() => setShowDetails(!showDetails)} size="small">
            {showDetails ? <BarChartIcon /> : <CloudIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {showDetails ? (
        // Detailed statistics view
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {sortedCategories
            .filter(stat => stat && typeof stat.count === 'number' && stat.count > 0 && EMOTIONAL_CATEGORIES[stat.category])
            .map(stat => (
              <Paper
                key={stat.category}
                sx={{
                  p: 2,
                  borderLeft: `4px solid ${EMOTIONAL_CATEGORIES[stat.category].emoji}`,
                  backgroundColor: `${EMOTIONAL_CATEGORIES[stat.category].emoji}10`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    <span style={{ marginRight: 8 }}>{EMOTIONAL_CATEGORIES[stat.category].emoji}</span>
                    {EMOTIONAL_CATEGORIES[stat.category].name}
                  </Typography>
                  <Tooltip title="Words in this category">
                    <Typography variant="caption" color="text.secondary">
                      {stat.count} words
                    </Typography>
                  </Tooltip>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Mastery Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.mastered / stat.count) * 100}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${EMOTIONAL_CATEGORIES[stat.category].emoji}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: EMOTIONAL_CATEGORIES[stat.category].emoji
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((stat.mastered / stat.count) * 100)}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Average Intensity
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.averageIntensity / 5) * 100}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${EMOTIONAL_CATEGORIES[stat.category].emoji}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: EMOTIONAL_CATEGORIES[stat.category].emoji
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {stat.averageIntensity.toFixed(1)}/5
                    </Typography>
                  </Box>
                </Box>

                {Object.keys(stat.relatedEmotions).length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Related Emotions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {Object.entries(stat.relatedEmotions)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([emotion, count]) => (
                          <Tooltip
                            key={emotion}
                            title={`${count} words with this related emotion`}
                          >
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                backgroundColor: `${EMOTIONAL_CATEGORIES[emotion as EmotionalCategory].emoji}20`,
                                border: `1px solid ${EMOTIONAL_CATEGORIES[emotion as EmotionalCategory].emoji}`,
                                fontSize: '0.75rem'
                              }}
                            >
                              <span style={{ marginRight: 4 }}>
                                {EMOTIONAL_CATEGORIES[emotion as EmotionalCategory].emoji}
                              </span>
                              {EMOTIONAL_CATEGORIES[emotion as EmotionalCategory].name}
                            </Box>
                          </Tooltip>
                        ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            ))}
        </Box>
      ) : (
        // Summary view (mood cloud)
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          justifyContent: 'center',
          p: 2
        }}>
          {moodCloudData.map(({ category, count, intensity, mastered }) => (
            <Tooltip
              key={category}
              title={
                <Box>
                  <Typography variant="subtitle2">
                    {EMOTIONAL_CATEGORIES[category].name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Total: {count} words
                  </Typography>
                  <Typography variant="caption" display="block">
                    Mastered: {mastered} words
                  </Typography>
                  <Typography variant="caption" display="block">
                    Average Intensity: {intensity.toFixed(1)}/5
                  </Typography>
                </Box>
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: `${EMOTIONAL_CATEGORIES[category].emoji}10`,
                  border: `1px solid ${EMOTIONAL_CATEGORIES[category].emoji}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {EMOTIONAL_CATEGORIES[category].emoji}
                </Typography>
                <Typography variant="subtitle2" align="center">
                  {EMOTIONAL_CATEGORIES[category].name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {count} words
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default MoodStats; 