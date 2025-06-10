import React, { Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Container, Typography, Box, Paper, Grid, Button, Card, CardContent, CardActionArea, useMediaQuery, Chip, Avatar, LinearProgress, Badge, Tooltip } from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Translate as TranslateIcon,
  EmojiEmotions as MoodIcon,
  Public as CultureIcon,
  SportsEsports as GamesIcon,
  Movie as MovieIcon,
  History as HistoryIcon,
  Restaurant as FoodIcon,
  TempleBuddhist as ShintoIcon,
  PlayArrow as PlayArrowIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  FlashOn as FlashOnIcon,
  Psychology as PsychologyIcon,
  Language as LanguageIcon,
  AutoAwesome as AutoAwesomeIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Lightbulb as LightbulbIcon,
  MyLocation as TargetIcon,
  Celebration as CelebrationIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ThemeWrapper } from '../App';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useAchievements } from '../context/AchievementContext';

// Enhanced Quick Actions with dynamic content
const useQuickActions = () => {
  const { progress } = useProgress();
  const { currentUser } = useAuth();
  const { achievements, unlockedAchievements, getAchievementProgress } = useAchievements();

  return useMemo(() => {
    // Calculate key metrics
    const totalWords = Object.keys(progress.words || {}).length;
    const masteredWords = Object.values(progress.words || {}).filter((word: any) => word.mastery >= 0.8).length;
    const inProgressWords = Object.values(progress.words || {}).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
    const currentStreak = progress.statistics?.currentStreak || 0;
    const longestStreak = progress.statistics?.longestStreak || 0;
    const totalStudyTime = progress.statistics?.totalStudyTime || 0;
    const dailyGoal = progress.preferences?.dailyGoal || 20;
    const lastStudyDate = progress.statistics?.lastStudyDate || 0;
    const today = new Date().toDateString();
    const lastStudyDay = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
    const hasStudiedToday = lastStudyDay === today;

    // Calculate daily progress
    const todayProgress = progress.statistics?.dailyProgress?.[new Date().toISOString().split('T')[0]] || 0;
    const dailyProgressPercentage = (todayProgress / dailyGoal) * 100;

    // Find words due for review (SRS)
    const now = Date.now();
    const wordsDueForReview = Object.entries(progress.words || {})
      .filter(([_, word]: [string, any]) => word.nextReviewDate && word.nextReviewDate <= now)
      .length;

    // Find favorite words
    const favoriteWords = Object.entries(progress.words || {})
      .filter(([_, word]: [string, any]) => word.favorite)
      .length;

    // Find difficult words (low mastery)
    const difficultWords = Object.entries(progress.words || {})
      .filter(([_, word]: [string, any]) => word.mastery > 0 && word.mastery < 0.3)
      .length;

    // Check for upcoming achievements
    const upcomingAchievements = achievements.filter(achievement => {
      const progress = getAchievementProgress(achievement.id);
      const isClose = (progress / achievement.requirement) >= 0.8;
      return !achievement.unlockedAt && isClose;
    });

    // Check for streak milestones
    const nextStreakMilestone = [7, 30, 100, 365].find(milestone => currentStreak < milestone && currentStreak >= milestone * 0.8);

    // Determine priority actions
    const actions = [];

    // 1. Continue Learning (Smart - adapts based on context)
    if (wordsDueForReview > 0) {
      actions.push({
        title: `Review ${wordsDueForReview} Words`,
        description: 'Words due for spaced repetition review',
        icon: <RefreshIcon sx={{ fontSize: 28 }} />,
        path: '/srs',
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        priority: 1,
        badge: 'Due',
        badgeColor: 'error'
      });
    } else if (inProgressWords > 0) {
      actions.push({
        title: 'Continue Learning',
        description: `Continue with ${inProgressWords} words in progress`,
        icon: <PlayArrowIcon sx={{ fontSize: 28 }} />,
        path: '/knowing',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        priority: 2,
        badge: `${inProgressWords}`,
        badgeColor: 'primary'
      });
    } else if (totalWords === 0) {
      actions.push({
        title: 'Start Learning',
        description: 'Begin your Japanese learning journey',
        icon: <SchoolIcon sx={{ fontSize: 28 }} />,
        path: '/knowing',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        priority: 1,
        badge: 'New',
        badgeColor: 'success'
      });
    }

    // 2. Daily Goal Progress
    if (dailyProgressPercentage < 100) {
      const remaining = dailyGoal - todayProgress;
      actions.push({
        title: `Complete Daily Goal`,
        description: `${remaining} more minutes to reach your ${dailyGoal}min goal`,
        icon: <TargetIcon sx={{ fontSize: 28 }} />,
        path: '/knowing',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        priority: 1,
        badge: `${Math.round(dailyProgressPercentage)}%`,
        badgeColor: 'success',
        progress: dailyProgressPercentage
      });
    } else {
      actions.push({
        title: 'Daily Goal Complete!',
        description: 'Great job! You\'ve reached your daily goal',
        icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
        path: '/progress',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        priority: 3,
        badge: 'Done',
        badgeColor: 'success'
      });
    }

    // 3. Streak Management
    if (currentStreak > 0) {
      if (nextStreakMilestone) {
        const daysToMilestone = nextStreakMilestone - currentStreak;
        actions.push({
          title: `Maintain Streak`,
          description: `${daysToMilestone} more days to ${nextStreakMilestone}-day milestone`,
          icon: <FireIcon sx={{ fontSize: 28 }} />,
          path: '/knowing',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          priority: 1,
          badge: `${currentStreak}`,
          badgeColor: 'warning'
        });
      } else {
        actions.push({
          title: `Amazing Streak!`,
          description: `${currentStreak} days and counting - keep it up!`,
          icon: <FireIcon sx={{ fontSize: 28 }} />,
          path: '/progress',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          priority: 2,
          badge: `${currentStreak}`,
          badgeColor: 'warning'
        });
      }
    } else if (!hasStudiedToday) {
      actions.push({
        title: 'Start Your Streak',
        description: 'Begin studying today to start a new streak',
        icon: <FireIcon sx={{ fontSize: 28 }} />,
        path: '/knowing',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        priority: 1,
        badge: 'Start',
        badgeColor: 'warning'
      });
    }

    // 4. Achievement Progress
    if (upcomingAchievements.length > 0) {
      const closestAchievement = upcomingAchievements[0];
      const progress = getAchievementProgress(closestAchievement.id);
      const progressPercentage = (progress / closestAchievement.requirement) * 100;
      
      actions.push({
        title: `Unlock Achievement`,
        description: `${closestAchievement.title} - ${Math.round(progressPercentage)}% complete`,
        icon: <TrophyIcon sx={{ fontSize: 28 }} />,
        path: '/progress',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        priority: 2,
        badge: 'Close',
        badgeColor: 'secondary',
        progress: progressPercentage
      });
    }

    // 5. Difficult Words Practice
    if (difficultWords > 0) {
      actions.push({
        title: 'Practice Difficult Words',
        description: `${difficultWords} words need extra attention`,
        icon: <WarningIcon sx={{ fontSize: 28 }} />,
        path: '/learning/quiz',
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        priority: 2,
        badge: `${difficultWords}`,
        badgeColor: 'error'
      });
    }

    // 6. Favorite Words Review
    if (favoriteWords > 0) {
      actions.push({
        title: 'Review Favorites',
        description: `Practice your ${favoriteWords} favorite words`,
        icon: <FavoriteIcon sx={{ fontSize: 28 }} />,
        path: '/knowing/favorites',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        priority: 3,
        badge: `${favoriteWords}`,
        badgeColor: 'secondary'
      });
    }

    // 7. Daily Quiz
    actions.push({
      title: 'Daily Quiz',
      description: 'Test your knowledge and track progress',
      icon: <PsychologyIcon sx={{ fontSize: 28 }} />,
      path: '/learning/quiz',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      priority: 3,
      badge: 'Daily',
      badgeColor: 'info'
    });

    // 8. Culture & Learning
    actions.push({
      title: 'Culture Corner',
      description: 'Explore Japanese traditions and customs',
      icon: <CultureIcon sx={{ fontSize: 28 }} />,
      path: '/knowing/culture',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      priority: 4,
      badge: 'New',
      badgeColor: 'secondary'
    });

    // Sort by priority and return top 4
    return actions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 4);
  }, [progress, achievements, unlockedAchievements, getAchievementProgress, currentUser]);
};

const FEATURE_CATEGORIES = [
  {
    title: 'Learning Paths',
    subtitle: 'Structured learning experiences',
    items: [
      {
        title: 'Knowing Center',
        description: 'Your central hub for learning Japanese vocabulary, culture, and more.',
        icon: <SchoolIcon sx={{ fontSize: 32 }} />,
        path: '/knowing',
        color: 'primary',
        badge: 'Popular'
      },
      {
        title: 'Learning Center',
        description: 'Master Japanese writing, kanji, and romaji through interactive lessons.',
        icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
        path: '/learning',
        color: 'secondary',
        badge: 'New'
      },
      {
        title: 'SRS Learning',
        description: 'Optimize your learning with spaced repetition system.',
        icon: <TranslateIcon sx={{ fontSize: 32 }} />,
        path: '/srs',
        color: 'success',
        badge: 'Smart'
      }
    ]
  },
  {
    title: 'Core Features',
    subtitle: 'Essential learning tools',
    items: [
      {
        title: 'Dictionary',
        description: 'Comprehensive Japanese dictionary with audio pronunciation and examples.',
        icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
        path: '/knowing/dictionary',
        color: 'primary'
      },
      {
        title: 'Mood & Emotions',
        description: 'Learn words through emotional context and cultural insights.',
        icon: <MoodIcon sx={{ fontSize: 32 }} />,
        path: '/knowing/mood',
        color: 'secondary'
      },
      {
        title: 'Culture & Rules',
        description: 'Explore Japanese culture, customs, and language rules.',
        icon: <CultureIcon sx={{ fontSize: 32 }} />,
        path: '/knowing/culture',
        color: 'success'
      }
    ]
  },
  {
    title: 'Interactive Content',
    subtitle: 'Engaging learning experiences',
    items: [
      {
        title: 'Learning Games',
        description: 'Practice Japanese through fun interactive games and quizzes.',
        icon: <GamesIcon sx={{ fontSize: 32 }} />,
        path: '/games',
        color: 'primary'
      },
      {
        title: 'Anime & Manga',
        description: 'Learn Japanese through popular anime and manga content.',
        icon: <MovieIcon sx={{ fontSize: 32 }} />,
        path: '/anime',
        color: 'secondary'
      },
      {
        title: 'Japanese Trivia',
        description: 'Discover fascinating facts about Japanese culture, history, and mythology.',
        icon: <HistoryIcon sx={{ fontSize: 32 }} />,
        path: '/trivia',
        color: 'success'
      }
    ]
  },
  {
    title: 'Progress & Settings',
    subtitle: 'Track and customize your journey',
    items: [
      {
        title: 'Progress Tracking',
        description: 'Monitor your learning journey and track your achievements.',
        icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
        path: '/progress',
        color: 'primary'
      },
      {
        title: 'Favorites',
        description: 'Access your saved words, phrases, and learning materials.',
        icon: <StarIcon sx={{ fontSize: 32 }} />,
        path: '/knowing/favorites',
        color: 'secondary'
      },
      {
        title: 'Settings',
        description: 'Customize your learning experience and preferences.',
        icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />,
        path: '/settings',
        color: 'success'
      }
    ]
  }
];

const HomeContent: React.FC = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { progress } = useProgress();
  const { currentUser } = useAuth();
  const { achievements, unlockedAchievements, getAchievementProgress } = useAchievements();

  // Calculate progress stats
  const totalWords = Object.keys(progress.words || {}).length;
  const masteredWords = Object.values(progress.words || {}).filter((word: any) => word.mastery >= 0.8).length;
  const inProgressWords = Object.values(progress.words || {}).filter((word: any) => word.mastery > 0 && word.mastery < 0.8).length;
  const currentStreak = progress.statistics?.currentStreak || 0;
  const totalStudyTime = progress.statistics?.totalStudyTime || 0;
  const masteryPercentage = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

  // Additional calculations for insights
  const now = Date.now();
  const wordsDueForReview = Object.entries(progress.words || {})
    .filter(([_, word]: [string, any]) => word.nextReviewDate && word.nextReviewDate <= now)
    .length;

  const difficultWords = Object.entries(progress.words || {})
    .filter(([_, word]: [string, any]) => word.mastery > 0 && word.mastery < 0.3)
    .length;

  const favoriteWords = Object.entries(progress.words || {})
    .filter(([_, word]: [string, any]) => word.favorite)
    .length;

  const upcomingAchievements = achievements.filter(achievement => {
    const progress = getAchievementProgress(achievement.id);
    const isClose = (progress / achievement.requirement) >= 0.8;
    return !achievement.unlockedAt && isClose;
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const quickActions = useQuickActions();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 4, md: 8 },
          mb: 6,
          borderRadius: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
            <SchoolIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            JAPVOC
          </Typography>
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            opacity: 0.95,
            maxWidth: '800px',
            mb: 4,
            fontWeight: 300,
            lineHeight: 1.4
          }}
        >
          Master Japanese vocabulary through interactive learning, cultural insights, and personalized experiences.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/knowing"
            variant="contained"
            size="large"
            endIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Start Learning
          </Button>
          <Button
            component={Link}
            to="/learning"
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Explore Features
          </Button>
        </Box>
      </Paper>

      {/* Progress Summary Section */}
      {currentUser && (
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              color: 'primary.main'
            }}
          >
            Your Progress
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Track your learning journey
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Learning Overview
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Mastery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(masteryPercentage)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={masteryPercentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {masteredWords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mastered
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {inProgressWords}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {currentStreak}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Day Streak
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                        {formatTime(totalStudyTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Study Time
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {quickActions.slice(0, 3).map((action, index) => (
                    <Button
                      key={action.title}
                      component={Link}
                      to={action.path}
                      variant="outlined"
                      startIcon={action.icon}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {action.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {action.description}
                          </Typography>
                        </Box>
                        {action.badge && (
                          <Chip
                            label={action.badge}
                            size="small"
                            color={action.badgeColor as any}
                            sx={{
                              ml: 1,
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            color: 'primary.main'
          }}
        >
          Quick Actions
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Jump right into your learning journey
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={action.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    background: action.gradient,
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                >
                  {/* Badge */}
                  {action.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        zIndex: 1
                      }}
                    >
                      <Chip
                        label={action.badge}
                        size="small"
                        color={action.badgeColor as any}
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </Box>
                  )}
                  
                  <CardActionArea 
                    component={Link} 
                    to={action.path}
                    sx={{ height: '100%', p: 3 }}
                  >
                    <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ mb: 2 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                        {action.description}
                      </Typography>
                      
                      {/* Progress Bar */}
                      {action.progress !== undefined && (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Progress
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {Math.round(action.progress)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={action.progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                borderRadius: 2
                              }
                            }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Personalized Insights */}
      {currentUser && (
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 1,
              color: 'primary.main'
            }}
          >
            Personalized Insights
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Smart recommendations based on your learning patterns
          </Typography>
          <Grid container spacing={3}>
            {/* Learning Insights */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LightbulbIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Learning Insights
                  </Typography>
                </Box>
                <Box sx={{ space: 2 }}>
                  {currentStreak > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        🎉 Amazing Streak!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You've been studying for {currentStreak} days in a row. Keep up the momentum!
                      </Typography>
                    </Box>
                  )}
                  {masteredWords > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        📚 Knowledge Milestone
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You've mastered {masteredWords} words! That's {Math.round(masteryPercentage)}% of your vocabulary.
                      </Typography>
                    </Box>
                  )}
                  {inProgressWords > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        🔄 In Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You have {inProgressWords} words in progress. Focus on these to boost your mastery rate.
                      </Typography>
                    </Box>
                  )}
                  {currentStreak === 0 && masteredWords === 0 && inProgressWords === 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        🚀 Ready to Start?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Begin your Japanese learning journey today! Start with basic vocabulary and build your foundation.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Smart Recommendations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutoAwesomeIcon sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Smart Recommendations
                  </Typography>
                </Box>
                <Box sx={{ space: 2 }}>
                  {wordsDueForReview > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'error.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        ⏰ Review Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {wordsDueForReview} words are due for review. Spaced repetition will help you remember them better.
                      </Typography>
                    </Box>
                  )}
                  {difficultWords > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        🎯 Focus Area
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {difficultWords} words need extra attention. Try practicing them in different contexts.
                      </Typography>
                    </Box>
                  )}
                  {upcomingAchievements.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'secondary.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        🏆 Achievement Close
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You're close to unlocking {upcomingAchievements.length} achievement{upcomingAchievements.length > 1 ? 's' : ''}. Keep pushing!
                      </Typography>
                    </Box>
                  )}
                  {totalStudyTime > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ⏱️ Study Dedication
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You've spent {formatTime(totalStudyTime)} studying. Consistency is key to language mastery!
                      </Typography>
                    </Box>
                  )}
                  {wordsDueForReview === 0 && difficultWords === 0 && upcomingAchievements.length === 0 && totalStudyTime === 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        💡 Pro Tips
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Set a daily goal, practice regularly, and use spaced repetition for optimal learning results.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Feature Categories */}
      {FEATURE_CATEGORIES.map((category, categoryIndex) => (
        <Box key={category.title} sx={{ mb: 6 }}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                color: 'primary.main'
              }}
            >
              {category.title}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
            >
              {category.subtitle}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {category.items.map((item, index) => (
              <Grid item xs={12} md={4} key={item.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (categoryIndex * 0.2) + (index * 0.1) }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardActionArea 
                      component={Link} 
                      to={item.path}
                      sx={{ height: '100%' }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Box 
                            sx={{ 
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: `${item.color}.main`,
                              color: `${item.color}.contrastText`,
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                {item.title}
                              </Typography>
                              {item.badge && (
                                <Chip 
                                  label={item.badge} 
                                  size="small" 
                                  color={item.color as any}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color={item.color as 'primary' | 'secondary' | 'success'}
                            endIcon={<PlayArrowIcon />}
                            size="small"
                          >
                            Explore
                          </Button>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

const Home: React.FC = () => {
  return (
    <ThemeWrapper>
      <Suspense fallback={
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      }>
        <HomeContent />
      </Suspense>
    </ThemeWrapper>
  );
};

export default Home; 