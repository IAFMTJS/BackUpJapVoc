import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Paper,
  Container,
  useTheme as useMuiTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  MenuBook as DictionaryIcon,
  Mood as MoodIcon,
  Public as CultureIcon,
  School as LearningIcon,
  Translate as TranslateIcon,
  EmojiEvents as AchievementIcon
} from '@mui/icons-material';

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  highlight?: boolean;
}> = ({ title, description, icon, path, color, highlight }) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        ...(highlight && {
          background: 'linear-gradient(45deg, rgba(25,118,210,0.1) 30%, rgba(66,165,245,0.1) 90%)',
          border: '1px solid rgba(25,118,210,0.2)'
        })
      }}
    >
      <CardActionArea 
        component={Link} 
        to={path}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              color: color
            }}
          >
            {icon}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                ml: 1,
                fontWeight: 'bold'
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {description}
          </Typography>
          {highlight && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="info"
                size="small"
                endIcon={<LearningIcon />}
              >
                Explore Now
              </Button>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const KnowingCenter: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const location = useLocation();

  // Only show the landing page if we're at the root /knowing path
  const isRootPath = location.pathname === '/knowing';

  // If we're not at the root path, render the child route
  if (!isRootPath) {
    return <Outlet />;
  }

  const features = [
    {
      title: 'Dictionary',
      description: 'Comprehensive Japanese dictionary with detailed word entries, examples, and audio pronunciation.',
      icon: <DictionaryIcon sx={{ fontSize: 32 }} />,
      path: '/knowing/dictionary',
      color: muiTheme.palette.primary.main
    },
    {
      title: 'Mood & Emotions',
      description: 'Learn to express emotions and feelings in Japanese with context and cultural insights.',
      icon: <MoodIcon sx={{ fontSize: 32 }} />,
      path: '/knowing/mood',
      color: muiTheme.palette.secondary.main
    },
    {
      title: 'Culture & Rules',
      description: 'Explore Japanese culture, customs, etiquette, and language rules to deepen your understanding.',
      icon: <CultureIcon sx={{ fontSize: 32 }} />,
      path: '/knowing/culture',
      color: muiTheme.palette.success.main
    },
    {
      title: 'Trivia',
      description: 'Discover fascinating facts about Japanese anime, games, Shintoism, history, and cuisine in an interactive format.',
      icon: <LearningIcon sx={{ fontSize: 32 }} />,
      path: '/trivia',
      color: muiTheme.palette.info.main,
      highlight: true
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 6 },
          mb: 6,
          borderRadius: 4,
          background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
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
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Knowing Center
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            opacity: 0.9,
            maxWidth: '800px',
            mx: 'auto',
            mb: 3
          }}
        >
          Your comprehensive resource for Japanese language and culture. Explore the dictionary, 
          learn to express emotions, understand cultural nuances, and discover fascinating trivia.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            component={Link}
            to="/trivia"
            variant="contained"
            color="info"
            size="large"
            startIcon={<LearningIcon />}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            Explore Trivia
          </Button>
        </Box>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} md={feature.highlight ? 12 : 4} key={feature.title}>
            <FeatureCard {...feature} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box 
        sx={{ 
          mt: 6,
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 1,
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
            background: 'radial-gradient(circle at bottom left, rgba(25,118,210,0.05) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Knowledge Hub Stats
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                textAlign: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="h4">10,000+</Typography>
              <Typography variant="body2">Dictionary Entries</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                textAlign: 'center',
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="h4">500+</Typography>
              <Typography variant="body2">Emotional Expressions</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                textAlign: 'center',
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="h4">100+</Typography>
              <Typography variant="body2">Cultural Topics</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                textAlign: 'center',
                bgcolor: 'info.light',
                color: 'info.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="h4">50+</Typography>
              <Typography variant="body2">Trivia Categories</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default KnowingCenter; 