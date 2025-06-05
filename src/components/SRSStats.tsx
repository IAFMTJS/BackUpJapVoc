import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useProgress } from '../context/ProgressContext';
import { formatDistanceToNow } from 'date-fns';

interface SRSStats {
  totalReviews: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageAccuracy: number;
  masteryLevels: {
    [key: string]: number;
  };
  recentActivity: Array<{
    word: string;
    timestamp: Date;
    isCorrect: boolean;
    masteryLevel: number;
  }>;
}

const SRSStats: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { progress } = useProgress();
  const db = useDatabase();
  const [stats, setStats] = useState<SRSStats>({
    totalReviews: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageAccuracy: 0,
    masteryLevels: {
      level0: 0,
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    },
    recentActivity: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!db) return;

      try {
        const tx = db.transaction(['srsItems', 'learningProgress'], 'readonly');
        const srsStore = tx.objectStore('srsItems');
        const progressStore = tx.objectStore('learningProgress');

        // Get all SRS items
        const srsItems = await srsStore.getAll();
        
        // Calculate statistics
        const totalReviews = srsItems.reduce((sum, item) => sum + (item.correctCount + item.incorrectCount), 0);
        const correctAnswers = srsItems.reduce((sum, item) => sum + item.correctCount, 0);
        const incorrectAnswers = srsItems.reduce((sum, item) => sum + item.incorrectCount, 0);
        const averageAccuracy = totalReviews > 0 ? (correctAnswers / totalReviews) * 100 : 0;

        // Calculate mastery levels
        const masteryLevels = srsItems.reduce((levels, item) => {
          const level = `level${item.level}`;
          levels[level] = (levels[level] || 0) + 1;
          return levels;
        }, {} as { [key: string]: number });

        // Get recent activity (last 10 reviews)
        const recentActivity = await Promise.all(
          srsItems
            .sort((a, b) => b.lastReview.getTime() - a.lastReview.getTime())
            .slice(0, 10)
            .map(async (item) => ({
              word: item.word.japanese,
              timestamp: item.lastReview,
              isCorrect: item.lastAnswer === 'correct',
              masteryLevel: item.level
            }))
        );

        setStats({
          totalReviews,
          correctAnswers,
          incorrectAnswers,
          averageAccuracy,
          masteryLevels,
          recentActivity
        });
      } catch (error) {
        console.error('Error fetching SRS stats:', error);
      }
    };

    fetchStats();
  }, [db]);

  return (
    <Box className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Typography variant="h4" component="h1" className={`mb-6 ${themeClasses.text.primary}`}>
          SRS Statistics
        </Typography>

        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} md={4}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={themeClasses.text.secondary}>
                  Total Reviews
                </Typography>
                <Typography variant="h3" className={themeClasses.text.primary}>
                  {stats.totalReviews}
                </Typography>
                <Typography variant="body2" className={themeClasses.text.secondary}>
                  {stats.correctAnswers} correct, {stats.incorrectAnswers} incorrect
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={themeClasses.text.secondary}>
                  Accuracy
                </Typography>
                <Typography variant="h3" className={themeClasses.text.primary}>
                  {stats.averageAccuracy.toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.averageAccuracy} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={themeClasses.text.secondary}>
                  Mastery Distribution
                </Typography>
                <Box className="mt-2">
                  {Object.entries(stats.masteryLevels).map(([level, count]) => (
                    <Box key={level} className="mb-2">
                      <Typography variant="body2" className={themeClasses.text.secondary}>
                        Level {level.replace('level', '')}: {count} items
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / stats.totalReviews) * 100} 
                        className="mt-1"
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={`mb-4 ${themeClasses.text.secondary}`}>
                  Recent Activity
                </Typography>
                {stats.recentActivity.length === 0 ? (
                  <Typography className={themeClasses.text.primary}>
                    No recent activity to display.
                  </Typography>
                ) : (
                  <List>
                    {stats.recentActivity.map((activity, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography className={themeClasses.text.primary}>
                                {activity.word} - Level {activity.masteryLevel}
                              </Typography>
                            }
                            secondary={
                              <Typography className={themeClasses.text.secondary}>
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })} - 
                                {activity.isCorrect ? ' Correct' : ' Incorrect'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < stats.recentActivity.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

export default SRSStats; 