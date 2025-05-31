import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Button,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  CardActionArea
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Translate as TranslateIcon,
  MenuBook as MenuBookIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Movie as MovieIcon,
  SportsEsports as GamesIcon,
  TempleBuddhist as ShintoIcon,
  History as HistoryIcon,
  Restaurant as FoodIcon,
  PlayArrow as PlayArrowIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { triviaTopics } from '../data/triviaContent';
import { playAudio } from '../utils/audio';

type DisplayMode = 'japanese' | 'romaji' | 'english';

const TriviaSection: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [displayModes, setDisplayModes] = useState<DisplayMode[]>(['japanese', 'romaji', 'english']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle tab state from navigation
  useEffect(() => {
    const tabIndex = location.state?.activeTab;
    if (typeof tabIndex === 'number' && tabIndex >= 0 && tabIndex < triviaTopics.length) {
      setActiveTab(tabIndex);
    }
  }, [location.state]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleDisplayMode = (mode: DisplayMode) => {
    setDisplayModes(prev => {
      // Don't allow removing the last active language
      if (prev.length === 1 && prev.includes(mode)) {
        return prev;
      }
      return prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode];
    });
  };

  const renderLanguageText = (text: { [key in DisplayMode]: string }) => {
    return displayModes.map((mode, index) => (
      <React.Fragment key={mode}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            component="span" 
            variant="body1"
            sx={{ 
              display: 'block',
              mb: index < displayModes.length - 1 ? 1 : 0,
              color: mode === 'japanese' ? 'text.primary' : 
                     mode === 'romaji' ? 'text.secondary' : 
                     'text.secondary',
              fontStyle: mode === 'romaji' ? 'italic' : 'normal'
            }}
          >
            {text[mode]}
          </Typography>
          {mode === 'japanese' && (
            <IconButton
              size="small"
              onClick={() => playAudio(text[mode])}
              sx={{ 
                color: 'primary.main',
                '&:hover': { color: 'primary.dark' }
              }}
            >
              <VolumeUpIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </React.Fragment>
    ));
  };

  const renderContent = () => {
    const topic = triviaTopics[activeTab];
    return (
      <Box sx={{ mt: 3 }}>
        {topic.content.map((item, index) => (
          <Card 
            key={index} 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    mr: 2,
                    mt: 0.5
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  {renderLanguageText(item.title)}
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                {renderLanguageText(item.description)}
              </Box>

              <Paper 
                elevation={0}
                sx={{ 
                  p: 2,
                  mb: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1
                }}
              >
                {renderLanguageText(item.details)}
              </Paper>

              {item.examples && (
                <Box sx={{ mt: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      color: 'primary.main'
                    }}
                  >
                    Examples:
                  </Typography>
                  <Grid container spacing={2}>
                    {item.examples.map((example, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2,
                            bgcolor: 'action.hover',
                            borderRadius: 1
                          }}
                        >
                          {renderLanguageText(example)}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const renderInteractiveSections = () => (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold',
          mb: 2,
          color: 'primary.main'
        }}
      >
        Interactive Learning
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
              to="/anime"
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'secondary.light',
                      color: 'secondary.contrastText',
                      mr: 2
                    }}
                  >
                    <MovieIcon />
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Anime & Manga Learning
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Learn Japanese through popular anime and manga. Practice phrases, understand context, 
                  and improve your listening skills with authentic content.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    endIcon={<PlayArrowIcon />}
                  >
                    Start Learning
                  </Button>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
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
              to="/games"
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      mr: 2
                    }}
                  >
                    <GamesIcon />
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Learning Games
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Practice Japanese through interactive games. Test your knowledge with quizzes, 
                  audio matching, and more fun learning activities.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="success"
                    endIcon={<PlayArrowIcon />}
                  >
                    Play Now
                  </Button>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navigation and Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/knowing"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Knowing Center
        </Button>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
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
              Japanese Trivia & Learning
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              maxWidth: '800px'
            }}
          >
            Explore fascinating aspects of Japanese culture through anime, games, 
            Shintoism, history, and cuisine. Learn through interactive content and 
            discover interesting facts about Japan.
          </Typography>
        </Paper>
      </Box>

      {/* Interactive Learning Sections */}
      {renderInteractiveSections()}

      {/* Language Display Controls */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Display Languages:
          </Typography>
          <Tooltip title="Japanese (日本語)">
            <IconButton
              onClick={() => toggleDisplayMode('japanese')}
              color={displayModes.includes('japanese') ? 'primary' : 'default'}
              sx={{ 
                bgcolor: displayModes.includes('japanese') ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: displayModes.includes('japanese') ? 'primary.light' : 'action.hover'
                }
              }}
            >
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Romaji (ローマ字)">
            <IconButton
              onClick={() => toggleDisplayMode('romaji')}
              color={displayModes.includes('romaji') ? 'primary' : 'default'}
              sx={{ 
                bgcolor: displayModes.includes('romaji') ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: displayModes.includes('romaji') ? 'primary.light' : 'action.hover'
                }
              }}
            >
              <TranslateIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="English">
            <IconButton
              onClick={() => toggleDisplayMode('english')}
              color={displayModes.includes('english') ? 'primary' : 'default'}
              sx={{ 
                bgcolor: displayModes.includes('english') ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: displayModes.includes('english') ? 'primary.light' : 'action.hover'
                }
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider orientation={isMobile ? 'horizontal' : 'vertical'} flexItem />
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Toggle languages to display. At least one language must be active. Japanese text is shown in normal style, 
          romaji in italics, and English in regular text.
        </Typography>
      </Paper>

      {/* Topic Tabs */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: 'primary.main'
            },
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1rem',
              fontWeight: 'medium',
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold',
                backgroundColor: 'action.selected'
              },
              '&:hover': {
                backgroundColor: 'action.hover'
              },
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          {triviaTopics.map((topic, index) => (
            <Tab
              key={index}
              icon={topic.icon}
              label={topic.title}
              iconPosition="start"
              onClick={(e) => {
                e.preventDefault(); // Prevent default navigation
                handleTabChange(e, index);
              }}
              sx={{
                '& .MuiTab-iconWrapper': {
                  mr: 1,
                  color: activeTab === index ? 'primary.main' : 'inherit'
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      {renderContent()}
    </Container>
  );
};

export default TriviaSection; 