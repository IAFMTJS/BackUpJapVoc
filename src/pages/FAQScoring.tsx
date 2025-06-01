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
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const FAQScoring: React.FC = () => {
  const theme = useTheme();

  const faqSections = [
    {
      title: 'Word Mastery System',
      icon: <SchoolIcon />,
      questions: [
        {
          q: 'How is word mastery calculated?',
          a: 'Word mastery is calculated based on three main factors:\n' +
             '1. Accuracy (70% weight): The ratio of correct answers to total attempts\n' +
             '2. Time Factor (30% weight): How quickly you answer, normalized to 30 seconds per question\n' +
             'A word is considered mastered when it reaches 80% mastery (0.8) or higher.'
        },
        {
          q: 'What are the different mastery levels?',
          a: 'Words are categorized into three mastery levels:\n' +
             '- Mastered (≥80%): Words you know well\n' +
             '- In Progress (1-79%): Words you\'re learning\n' +
             '- Not Started (0%): Words you haven\'t attempted yet'
        },
        {
          q: 'How is mastery tracked over time?',
          a: 'Mastery is tracked through:\n' +
             '- Individual word progress\n' +
             '- Category-wise mastery distribution\n' +
             '- Overall mastery rate\n' +
             '- Learning efficiency metrics'
        }
      ]
    },
    {
      title: 'Study Statistics',
      icon: <AssessmentIcon />,
      questions: [
        {
          q: 'What statistics are tracked?',
          a: 'The following statistics are tracked:\n' +
             '- Total study time\n' +
             '- Words learned and mastered\n' +
             '- Current and longest streaks\n' +
             '- Average accuracy\n' +
             '- Study efficiency score\n' +
             '- Time distribution (morning/afternoon/evening/night)\n' +
             '- Category distribution\n' +
             '- Difficulty distribution'
        },
        {
          q: 'How is study efficiency calculated?',
          a: 'Study efficiency is calculated using a weighted formula:\n' +
             '- Learning Speed (40%): Words learned per hour\n' +
             '- Retention Rate (40%): Percentage of mastered words\n' +
             '- Consistency Score (20%): Based on study session frequency\n' +
             'The final score is presented as a percentage (0-100).'
        },
        {
          q: 'What is the optimal study time?',
          a: 'The system analyzes your performance across different times of day to determine your optimal study time. This is based on:\n' +
             '- Accuracy rates during different time slots\n' +
             '- Learning speed in each period\n' +
             '- Consistency of study sessions'
        }
      ]
    },
    {
      title: 'Achievement System',
      icon: <TrophyIcon />,
      questions: [
        {
          q: 'What types of achievements are available?',
          a: 'Achievements are categorized into several types:\n' +
             '- Vocabulary Achievements (learning words)\n' +
             '- Kanji Achievements (learning kanji)\n' +
             '- Study Streak Achievements\n' +
             '- Special Achievements\n' +
             'Each achievement has different tiers (bronze, silver, gold) with increasing difficulty.'
        },
        {
          q: 'How do I earn achievements?',
          a: 'Achievements are earned by:\n' +
             '- Reaching word count milestones\n' +
             '- Maintaining study streaks\n' +
             '- Mastering specific categories\n' +
             '- Completing learning challenges\n' +
             'Each achievement has specific requirements and rewards.'
        },
        {
          q: 'What are the achievement rewards?',
          a: 'Achievements provide:\n' +
             '- Experience points (XP)\n' +
             '- Progress tracking\n' +
             '- Visual badges\n' +
             '- Unlockable content\n' +
             'Higher-tier achievements provide more significant rewards.'
        }
      ]
    },
    {
      title: 'Learning Path & Progress',
      icon: <TimelineIcon />,
      questions: [
        {
          q: 'How is the learning path structured?',
          a: 'The learning path consists of multiple stages:\n' +
             '1. Kana Mastery (prerequisite)\n' +
             '2. Beginner Levels (First Steps, Basic Greetings)\n' +
             '3. Elementary Levels (Foundation, Expansion, Mastery)\n' +
             '4. Intermediate Levels\n' +
             '5. Advanced Levels\n' +
             '6. Expert Levels\n' +
             '7. Mastery Levels\n' +
             'Each stage has specific requirements and success metrics.'
        },
        {
          q: 'What are the success metrics for each level?',
          a: 'Each level has specific success metrics including:\n' +
             '- Required word count\n' +
             '- Required kanji count\n' +
             '- Mastery threshold (typically 85%)\n' +
             '- Grammar requirements\n' +
             '- Assessment criteria'
        },
        {
          q: 'How is progress measured across levels?',
          a: 'Progress is measured through:\n' +
             '- Word mastery distribution\n' +
             '- Category performance\n' +
             '- Learning efficiency\n' +
             '- Achievement completion\n' +
             '- Skill tree advancement'
        }
      ]
    },
    {
      title: 'Performance Analytics',
      icon: <SpeedIcon />,
      questions: [
        {
          q: 'What performance metrics are tracked?',
          a: 'The system tracks detailed performance metrics:\n' +
             '- Word difficulty impact\n' +
             '- Learning curve analysis\n' +
             '- Session efficiency\n' +
             '- Category performance\n' +
             '- Time-based performance\n' +
             '- Retention rates'
        },
        {
          q: 'How is learning efficiency analyzed?',
          a: 'Learning efficiency is analyzed through:\n' +
             '- Words per hour rate\n' +
             '- Focus scores\n' +
             '- Session consistency\n' +
             '- Optimal study time detection\n' +
             '- Difficulty progression'
        },
        {
          q: 'What insights are provided?',
          a: 'The system provides insights on:\n' +
             '- Best performing categories\n' +
             '- Optimal study times\n' +
             '- Learning patterns\n' +
             '- Areas needing improvement\n' +
             '- Progress predictions'
        }
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Scoring & Progress FAQ
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Learn how your progress is measured and tracked in the application
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

export default FAQScoring; 