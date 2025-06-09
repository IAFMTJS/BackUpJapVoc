import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Container, Typography, Box, Paper, Grid, Button, Card, CardContent, CardActionArea, useMediaQuery, Chip, Avatar } from '@mui/material';
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
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ThemeWrapper } from '../App';

const QUICK_ACTIONS = [
  {
    title: 'Continue Learning',
    description: 'Pick up where you left off',
    icon: <PlayArrowIcon sx={{ fontSize: 28 }} />,
    path: '/knowing',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  {
    title: 'Daily Quiz',
    description: 'Test your knowledge',
    icon: <PsychologyIcon sx={{ fontSize: 28 }} />,
    path: '/learning/quiz',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    title: 'Practice Kanji',
    description: 'Master Japanese characters',
    icon: <LanguageIcon sx={{ fontSize: 28 }} />,
    path: '/learning/kanji-dictionary',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    title: 'Culture Corner',
    description: 'Explore Japanese traditions',
    icon: <CultureIcon sx={{ fontSize: 28 }} />,
    path: '/knowing/culture',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  }
];

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
          {QUICK_ACTIONS.map((action, index) => (
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
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardActionArea 
                    component={Link} 
                    to={action.path}
                    sx={{ height: '100%', p: 3 }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {action.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

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