import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Container, Typography, Box, Paper, Grid, Button, Card, CardContent, CardActionArea, useMediaQuery } from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Translate as TranslateIcon,
  EmojiEmotions as MoodIcon,
  Culture as CultureIcon,
  SportsEsports as GamesIcon,
  Movie as MovieIcon,
  History as HistoryIcon,
  Restaurant as FoodIcon,
  TempleBuddhist as ShintoIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ThemeWrapper } from '../App';

const FEATURE_CATEGORIES = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Knowing Center',
        description: 'Your central hub for learning Japanese vocabulary, culture, and more.',
        icon: <SchoolIcon sx={{ fontSize: 32 }} />,
        path: '/knowing',
        color: 'primary'
      },
      {
        title: 'Learning Center',
        description: 'Master Japanese writing, kanji, and romaji through interactive lessons.',
        icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
        path: '/learning',
        color: 'secondary'
      },
      {
        title: 'SRS Learning',
        description: 'Optimize your learning with spaced repetition system.',
        icon: <TranslateIcon sx={{ fontSize: 32 }} />,
        path: '/srs',
        color: 'success'
      }
    ]
  },
  {
    title: 'Core Learning',
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
    title: 'Interactive Learning',
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
    items: [
      {
        title: 'Progress Tracking',
        description: 'Monitor your learning journey and track your achievements.',
        icon: <HistoryIcon sx={{ fontSize: 32 }} />,
        path: '/progress',
        color: 'primary'
      },
      {
        title: 'Favorites',
        description: 'Access your saved words, phrases, and learning materials.',
        icon: <MoodIcon sx={{ fontSize: 32 }} />,
        path: '/knowing/favorites',
        color: 'secondary'
      },
      {
        title: 'Settings',
        description: 'Customize your learning experience and preferences.',
        icon: <CultureIcon sx={{ fontSize: 32 }} />,
        path: '/settings',
        color: 'success'
      }
    ]
  }
];

const HomeContent: React.FC = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          <SchoolIcon sx={{ fontSize: 32, mr: 2 }} />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Japanese Vocabulary Learning
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            maxWidth: '800px',
            mb: 4
          }}
        >
          Your journey to mastering Japanese starts here. Explore vocabulary, culture, 
          and language through interactive learning tools and engaging content.
        </Typography>
        <Button
          component={Link}
          to="/knowing"
          variant="contained"
          size="large"
          endIcon={<PlayArrowIcon />}
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
      </Paper>

      {/* Feature Categories */}
      {FEATURE_CATEGORIES.map((category) => (
        <Box key={category.title} sx={{ mb: 6 }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 3,
              color: 'primary.main'
            }}
          >
            {category.title}
          </Typography>
          <Grid container spacing={3}>
            {category.items.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <CardActionArea 
                    component={Link} 
                    to={item.path}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            p: 1,
                            borderRadius: 1,
                            bgcolor: `${item.color}.main`,
                            color: `${item.color}.contrastText`,
                            mr: 2
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color={item.color as 'primary' | 'secondary' | 'success'}
                          endIcon={<PlayArrowIcon />}
                        >
                          Explore
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
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