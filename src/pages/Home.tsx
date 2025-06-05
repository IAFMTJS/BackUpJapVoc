import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Container, Typography, Box, Paper, Grid, Button, Card, CardContent, CardActionArea, useMediaQuery, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  SchoolIcon,
  MenuBookIcon,
  QuizIcon,
  EmojiEventsIcon,
  HelpIcon,
  PersonIcon,
  MovieIcon,
  SportsEsportsIcon,
  HistoryIcon,
  RestaurantIcon,
  TempleBuddhistIcon,
  PsychologyIcon,
  MoodIcon,
  StarIcon,
  TimelineIcon
} from '../index';
import ProgressSummary from '../components/progress/ProgressSummary';

const MAIN_CATEGORIES = [
  {
    title: 'Knowing Center',
    description: 'Your central hub for learning Japanese vocabulary, culture, and more.',
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    path: '/knowing',
    color: 'primary',
    features: ['Dictionary', 'Mood & Emotions', 'Culture & Rules', 'Favorites']
  },
  {
    title: 'Learning Practice',
    description: 'Master Japanese writing, kanji, and kana through interactive lessons.',
    icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
    path: '/learning',
    color: 'secondary',
    features: ['Kana Practice', 'Kanji Practice', 'Writing Practice', 'Quiz Mode']
  },
  {
    title: 'SRS Learning',
    description: 'Optimize your learning with spaced repetition system.',
    icon: <HelpIcon sx={{ fontSize: 40 }} />,
    path: '/srs',
    color: 'success',
    features: ['Review', 'Statistics', 'SRS Settings']
  },
  {
    title: 'Learning Games',
    description: 'Practice Japanese through fun interactive games and quizzes.',
    icon: <SportsEsportsIcon sx={{ fontSize: 40 }} />,
    path: '/games',
    color: 'primary',
    features: ['Memory Game', 'Quiz Game', 'Typing Practice']
  },
  {
    title: 'Japanese Trivia',
    description: 'Discover fascinating facts about Japanese culture, history, and mythology.',
    icon: <HistoryIcon sx={{ fontSize: 40 }} />,
    path: '/trivia',
    color: 'secondary',
    features: ['Anime & Manga', 'Games', 'Shintoism', 'History', 'Cuisine', 'Mythology']
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey and track your achievements.',
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    path: '/progress',
    color: 'success',
    features: ['Overview', 'Achievements', 'Learning Goals', 'Statistics']
  }
];

const HomeContent: React.FC = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { progress } = useProgress();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 6 },
          mb: 6,
          borderRadius: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
            : 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
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
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Japanese Vocabulary Learning
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Master Japanese vocabulary through interactive learning and spaced repetition
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            href="/learn"
            sx={{ 
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)'
              }
            }}
          >
            Start Learning
          </Button>
          {!currentUser && (
            <Button 
              variant="outlined" 
              color="inherit"
              size="large"
              href="/login"
              sx={{ 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Paper>

      {/* Progress Summary */}
      {progress && (
        <Box sx={{ mb: 6 }}>
          <ProgressSummary variant="compact" />
        </Box>
      )}

      {/* Main Categories */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Learning Categories
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {MAIN_CATEGORIES.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.title}>
            <Card 
              component={motion.div}
              whileHover={{ y: -4 }}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={category.path}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {category.icon}
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      sx={{ ml: 2, fontWeight: 'bold' }}
                    >
                      {category.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {category.description}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {category.features.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        size="small"
                        color={category.color as any}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features Section */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Features
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {/* Feature cards */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Interactive Learning
            </Typography>
            <Typography color="text.secondary">
              Learn through engaging exercises, quizzes, and real-world examples
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Spaced Repetition
            </Typography>
            <Typography color="text.secondary">
              Optimize your learning with scientifically proven spaced repetition techniques
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Progress Tracking
            </Typography>
            <Typography color="text.secondary">
              Monitor your progress with detailed statistics and achievements
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

const Home: React.FC = () => {
  return (
    <Suspense fallback={
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <LoadingSpinner />
      </Box>
    }>
      <HomeContent />
    </Suspense>
  );
};

export default Home; 