import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  Edit as EditIcon,
  Translate as TranslateIcon,
  Quiz as QuizIcon,
  MenuBook as MenuBookIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const LearningLayout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const learningPages = [
    {
      path: '/learning/writing-practice',
      label: 'Writing Practice',
      icon: <EditIcon sx={{ fontSize: 32 }} />,
      description: 'Practice writing Japanese characters with interactive stroke order and feedback.',
      color: theme.palette.primary.main
    },
    {
      path: '/learning/writing',
      label: 'Writing',
      icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
      description: 'Learn to write Japanese characters with step-by-step guidance and examples.',
      color: theme.palette.secondary.main
    },
    {
      path: '/learning/kanji',
      label: 'Kanji',
      icon: <TranslateIcon sx={{ fontSize: 32 }} />,
      description: 'Master kanji characters with meanings, readings, and example compounds.',
      color: theme.palette.success.main
    },
    {
      path: '/learning/romaji',
      label: 'Romaji',
      icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
      description: 'Learn Japanese pronunciation through romaji and audio practice.',
      color: theme.palette.info.main
    },
    {
      path: '/learning/quiz',
      label: 'Quiz',
      icon: <QuizIcon sx={{ fontSize: 32 }} />,
      description: 'Test your knowledge with interactive quizzes and track your progress.',
      color: theme.palette.warning.main
    }
  ];

  // Only show the landing page if we're at the root /learning path
  const isRootPath = location.pathname === '/learning';

  // If we're not at the root path, render the child route
  if (!isRootPath) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/learning"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Learning Center
          </Button>
        </Box>
        <Outlet />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 6 },
          mb: 6,
          borderRadius: 4,
          background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
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
            Learning Center
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            maxWidth: '800px'
          }}
        >
          Master Japanese writing, reading, and pronunciation through interactive exercises, 
          quizzes, and practice sessions. Track your progress and improve your skills.
        </Typography>
      </Paper>

      {/* Learning Cards Grid */}
      <Grid container spacing={3}>
        {learningPages.map((page) => (
          <Grid item xs={12} md={6} key={page.path}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={page.path}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        p: 1,
                        borderRadius: 1,
                        bgcolor: `${page.color}20`,
                        color: page.color,
                        mr: 2
                      }}
                    >
                      {page.icon}
                    </Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      {page.label}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {page.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      sx={{ 
                        bgcolor: page.color,
                        '&:hover': {
                          bgcolor: page.color,
                          opacity: 0.9
                        }
                      }}
                    >
                      Start Learning
                    </Button>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
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
            background: 'radial-gradient(circle at bottom left, rgba(33,150,243,0.05) 0%, transparent 70%)',
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
          Learning Progress
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
              <Typography variant="h4">100+</Typography>
              <Typography variant="body2">Characters Learned</Typography>
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
              <Typography variant="h4">50+</Typography>
              <Typography variant="body2">Practice Sessions</Typography>
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
              <Typography variant="h4">25+</Typography>
              <Typography variant="body2">Quizzes Completed</Typography>
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
              <Typography variant="h4">85%</Typography>
              <Typography variant="body2">Average Score</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LearningLayout; 