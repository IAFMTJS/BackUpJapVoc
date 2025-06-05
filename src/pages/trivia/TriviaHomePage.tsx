import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Paper,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Movie as MovieIcon,
  SportsEsports as GamesIcon,
  TempleBuddhist as ShintoIcon,
  History as HistoryIcon,
  Restaurant as FoodIcon,
  Psychology as MythologyIcon,
} from '@mui/icons-material';
import { triviaTopics } from '../../data/triviaContent';

const TriviaHomePage: React.FC = () => {
  const theme = useTheme();

  const topicIcons = {
    'Anime & Manga': <MovieIcon sx={{ fontSize: 40 }} />,
    'Japanese Games': <GamesIcon sx={{ fontSize: 40 }} />,
    'Shintoism': <ShintoIcon sx={{ fontSize: 40 }} />,
    'Japanese History': <HistoryIcon sx={{ fontSize: 40 }} />,
    'Japanese Cuisine': <FoodIcon sx={{ fontSize: 40 }} />,
    'Japanese Mythology': <MythologyIcon sx={{ fontSize: 40 }} />,
  };

  // Custom navigation paths for special cases
  const getTopicPath = (title: string) => {
    const pathMap: { [key: string]: string } = {
      'Anime & Manga': '/trivia/anime',
      'Japanese Games': '/trivia/games',
      'Shintoism': '/trivia/shinto',
      'Japanese History': '/trivia/history',
      'Japanese Cuisine': '/trivia/cuisine',
      'Japanese Mythology': '/trivia/mythology'
    };
    return pathMap[title] || `/trivia/${title.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 4 },
          mb: 4,
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
          variant="h3" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            mb: 2
          }}
        >
          Japanese Trivia
        </Typography>
        <Typography 
          variant="h6"
          sx={{ 
            opacity: 0.9,
            maxWidth: '800px'
          }}
        >
          Explore various aspects of Japanese culture, history, and entertainment through our trivia sections.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {triviaTopics.map((topic) => (
          <Grid item xs={12} sm={6} md={4} key={topic.title}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={getTopicPath(topic.title)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {topicIcons[topic.title as keyof typeof topicIcons]}
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      sx={{ ml: 2, fontWeight: 'bold' }}
                    >
                      {topic.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {topic.content[0]?.description.english || 'Explore interesting facts about ' + topic.title.toLowerCase()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TriviaHomePage; 