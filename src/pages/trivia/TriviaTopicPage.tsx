import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Translate as TranslateIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { TriviaItem } from '../../data/triviaContent';
import { playAudio } from '../../utils/audio';

type DisplayMode = 'japanese' | 'romaji' | 'english';

interface TriviaTopicPageProps {
  title: string;
  content: TriviaItem[];
}

const TriviaTopicPage: React.FC<TriviaTopicPageProps> = ({ title, content }) => {
  const [displayModes, setDisplayModes] = useState<DisplayMode[]>(['japanese', 'romaji', 'english']);
  const [audioError, setAudioError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDisplayMode = (mode: DisplayMode) => {
    setDisplayModes(prev => {
      if (prev.length === 1 && prev.includes(mode)) {
        return prev;
      }
      return prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode];
    });
  };

  const handleAudioPlay = async (text: string) => {
    try {
      await playAudio(text);
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError('Unable to play audio. Please try again later.');
    }
  };

  const renderLanguageText = (text: { japanese: string; romaji: string; english: string }) => (
    <Box>
      {displayModes.includes('japanese') && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            {text.japanese}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleAudioPlay(text.japanese)}
            sx={{ 
              color: 'primary.main',
              '&:hover': { color: 'primary.dark' }
            }}
          >
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {displayModes.includes('romaji') && (
        <Typography variant="subtitle1" sx={{ fontStyle: 'italic', mb: 1, color: 'text.secondary' }}>
          {text.romaji}
        </Typography>
      )}
      {displayModes.includes('english') && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {text.english}
        </Typography>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navigation and Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/trivia"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Trivia Home
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
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {title}
          </Typography>
        </Paper>
      </Box>

      {/* Language Display Controls */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Japanese">
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
              <TranslateIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Romaji">
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
              <MenuBookIcon />
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

      {/* Content */}
      <Box sx={{ mt: 3 }}>
        {content.map((item, index) => (
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

              {item.examples && item.examples.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Examples:
                  </Typography>
                  {item.examples.map((example, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      {renderLanguageText(example)}
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        open={!!audioError}
        autoHideDuration={6000}
        onClose={() => setAudioError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAudioError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {audioError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TriviaTopicPage; 