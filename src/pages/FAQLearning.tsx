import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Psychology as PsychologyIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

const FAQLearning: React.FC = () => {
  const theme = useTheme();

  const faqSections = [
    {
      title: 'Getting Started',
      icon: <SchoolIcon />,
      questions: [
        {
          q: 'What is the best way to start learning Japanese?',
          a: 'The recommended learning path is:\n' +
             '1. Start with Kana (Hiragana and Katakana)\n' +
             '2. Learn basic Romaji pronunciation\n' +
             '3. Begin with essential vocabulary\n' +
             '4. Progress to basic Kanji\n' +
             '5. Practice with quizzes and SRS\n' +
             'The app is designed to guide you through this progression.'
        },
        {
          q: 'How much time should I spend studying each day?',
          a: 'For optimal learning:\n' +
             '- Beginners: 15-30 minutes daily\n' +
             '- Intermediate: 30-60 minutes daily\n' +
             '- Advanced: 1-2 hours daily\n' +
             'Consistency is more important than duration. Regular short sessions are better than infrequent long ones.'
        },
        {
          q: 'What learning resources are available?',
          a: 'The app provides multiple learning resources:\n' +
             '- Interactive lessons\n' +
             '- Spaced repetition system (SRS)\n' +
             '- Practice quizzes\n' +
             '- Audio pronunciation\n' +
             '- Progress tracking\n' +
             '- Achievement system'
        }
      ]
    },
    {
      title: 'Learning Methods',
      icon: <PsychologyIcon />,
      questions: [
        {
          q: 'What is the SRS system and how does it work?',
          a: 'The Spaced Repetition System (SRS) is a learning technique that:\n' +
             '- Shows words at optimal intervals for memory retention\n' +
             '- Adapts to your learning pace\n' +
             '- Focuses on words you find difficult\n' +
             '- Gradually increases intervals for mastered words\n' +
             'This method is scientifically proven to improve long-term retention.'
        },
        {
          q: 'How can I improve my retention rate?',
          a: 'To improve retention:\n' +
             '1. Use active recall (practice without hints)\n' +
             '2. Review words in different contexts\n' +
             '3. Practice writing and speaking\n' +
             '4. Use the SRS system consistently\n' +
             '5. Take regular quizzes\n' +
             '6. Review difficult words more frequently'
        },
        {
          q: 'What are the best practices for learning Kanji?',
          a: 'Effective Kanji learning strategies:\n' +
             '- Learn radicals first (basic components)\n' +
             '- Study in context with vocabulary\n' +
             '- Practice writing stroke order\n' +
             '- Use mnemonics for memorization\n' +
             '- Review regularly using SRS\n' +
             '- Focus on common Kanji first'
        }
      ]
    },
    {
      title: 'Study Tips & Techniques',
      icon: <LightbulbIcon />,
      questions: [
        {
          q: 'How can I stay motivated?',
          a: 'Stay motivated by:\n' +
             '- Setting clear, achievable goals\n' +
             '- Tracking your progress\n' +
             '- Using the achievement system\n' +
             '- Maintaining a study streak\n' +
             '- Joining study groups\n' +
             '- Celebrating milestones'
        },
        {
          q: 'What are effective study techniques?',
          a: 'Effective study techniques include:\n' +
             '- Active recall practice\n' +
             '- Spaced repetition\n' +
             '- Contextual learning\n' +
             '- Regular review sessions\n' +
             '- Mix of reading, writing, and listening\n' +
             '- Using mnemonics and memory aids'
        },
        {
          q: 'How can I overcome learning plateaus?',
          a: 'To overcome plateaus:\n' +
             '- Review your learning methods\n' +
             '- Focus on weak areas\n' +
             '- Try different learning approaches\n' +
             '- Set new, challenging goals\n' +
             '- Take breaks when needed\n' +
             '- Seek help from the community'
        }
      ]
    },
    {
      title: 'Learning Resources',
      icon: <MenuBookIcon />,
      questions: [
        {
          q: 'What additional resources are recommended?',
          a: 'Recommended supplementary resources:\n' +
             '- Japanese language apps\n' +
             '- Online dictionaries\n' +
             '- Language exchange platforms\n' +
             '- Japanese media (anime, manga, news)\n' +
             '- Grammar guides\n' +
             '- Practice workbooks'
        },
        {
          q: 'How can I practice speaking and listening?',
          a: 'Practice speaking and listening through:\n' +
             '- Using the app\'s audio features\n' +
             '- Language exchange programs\n' +
             '- Watching Japanese media\n' +
             '- Listening to Japanese podcasts\n' +
             '- Recording yourself speaking\n' +
             '- Using pronunciation guides'
        },
        {
          q: 'What tools are available for writing practice?',
          a: 'Writing practice tools include:\n' +
             '- Stroke order guides\n' +
             '- Writing practice sheets\n' +
             '- Kanji writing exercises\n' +
             '- Composition practice\n' +
             '- Grammar exercises\n' +
             '- Dictation exercises'
        }
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Learning Guide FAQ
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Learn how to effectively use the app and improve your Japanese learning journey
      </Typography>

      {faqSections.map((section, index) => (
        <Paper key={index} sx={{ mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: theme.palette.primary.main, color: 'white' }}>
            {section.icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {section.title}
            </Typography>
          </Box>
          <Divider />
          {section.questions.map((item, qIndex) => (
            <Accordion key={qIndex}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  component="div"
                  sx={{ whiteSpace: 'pre-line' }}
                  color="text.secondary"
                >
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      ))}
    </Container>
  );
};

export default FAQLearning; 