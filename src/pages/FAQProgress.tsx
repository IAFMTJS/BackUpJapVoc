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
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  MenuBook as MenuBookIcon,
  LocalFireDepartment as FireIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const FAQProgress: React.FC = () => {
  const theme = useTheme();

  const faqSections = [
    {
      title: 'Learning Path Structure',
      icon: <SchoolIcon />,
      questions: [
        {
          q: 'What is the complete learning path structure?',
          a: 'The learning path is structured in progressive stages:\n\n' +
             '1. Kana Foundation (Prerequisite)\n' +
             '   - Hiragana mastery\n' +
             '   - Katakana mastery\n' +
             '   - Basic pronunciation\n\n' +
             '2. Beginner Levels\n' +
             '   - First Steps (Essential vocabulary)\n' +
             '   - Basic Greetings\n' +
             '   - Numbers and Time\n' +
             '   - Daily Expressions\n\n' +
             '3. Elementary Levels\n' +
             '   - Foundation (Basic grammar)\n' +
             '   - Expansion (More vocabulary)\n' +
             '   - Mastery (Basic conversations)\n\n' +
             '4. Intermediate Levels\n' +
             '   - Grammar Patterns\n' +
             '   - Complex Vocabulary\n' +
             '   - Cultural Context\n\n' +
             '5. Advanced Levels\n' +
             '   - Business Japanese\n' +
             '   - Academic Japanese\n' +
             '   - Literary Japanese\n\n' +
             'Each level requires specific mastery thresholds and achievements to unlock the next stage.'
        },
        {
          q: 'How do I advance through the learning path?',
          a: 'Advancement through the learning path requires:\n\n' +
             '1. Mastery Requirements:\n' +
             '   - Complete current level\'s word list (≥80% mastery)\n' +
             '   - Pass level assessment quizzes\n' +
             '   - Achieve required grammar points\n\n' +
             '2. Achievement Milestones:\n' +
             '   - Earn specific achievements for the level\n' +
             '   - Complete learning challenges\n' +
             '   - Maintain study streaks\n\n' +
             '3. Skill Requirements:\n' +
             '   - Reading comprehension\n' +
             '   - Writing proficiency\n' +
             '   - Speaking practice\n' +
             '   - Listening comprehension'
        }
      ]
    },
    {
      title: 'Progress Tracking Systems',
      icon: <TimelineIcon />,
      questions: [
        {
          q: 'What aspects of progress are tracked?',
          a: 'The system tracks comprehensive progress metrics:\n\n' +
             '1. Word Progress:\n' +
             '   - Individual word mastery (0-100%)\n' +
             '   - Attempts and success rate\n' +
             '   - Last attempted date\n' +
             '   - Time spent per word\n\n' +
             '2. Category Progress:\n' +
             '   - Category-wise mastery\n' +
             '   - Words learned per category\n' +
             '   - Category difficulty ratings\n' +
             '   - Category completion status\n\n' +
             '3. Learning Statistics:\n' +
             '   - Daily study time\n' +
             '   - Weekly progress\n' +
             '   - Monthly achievements\n' +
             '   - Long-term trends\n\n' +
             '4. Skill Development:\n' +
             '   - Reading speed\n' +
             '   - Writing accuracy\n' +
             '   - Listening comprehension\n' +
             '   - Speaking confidence'
        },
        {
          q: 'How is progress measured and calculated?',
          a: 'Progress is measured through multiple metrics:\n\n' +
             '1. Word Mastery Calculation:\n' +
             '   - Accuracy (70% weight)\n' +
             '   - Time Factor (30% weight)\n' +
             '   - Consistency bonus\n' +
             '   - Difficulty adjustment\n\n' +
             '2. Learning Efficiency Score:\n' +
             '   - Words per hour rate\n' +
             '   - Retention rate\n' +
             '   - Review effectiveness\n' +
             '   - Focus score\n\n' +
             '3. Overall Progress:\n' +
             '   - Level completion percentage\n' +
             '   - Achievement completion\n' +
             '   - Skill tree advancement\n' +
             '   - Learning path progression'
        }
      ]
    },
    {
      title: 'Achievement & Rewards',
      icon: <TrophyIcon />,
      questions: [
        {
          q: 'What achievements can I earn?',
          a: 'The achievement system includes:\n\n' +
             '1. Learning Achievements:\n' +
             '   - Word count milestones\n' +
             '   - Category mastery\n' +
             '   - Perfect quiz scores\n' +
             '   - Speed learning\n\n' +
             '2. Streak Achievements:\n' +
             '   - Daily login streaks\n' +
             '   - Study session streaks\n' +
             '   - Perfect week streaks\n' +
             '   - Monthly consistency\n\n' +
             '3. Special Achievements:\n' +
             '   - Early bird (morning study)\n' +
             '   - Night owl (evening study)\n' +
             '   - Weekend warrior\n' +
             '   - Quick learner\n\n' +
             '4. Level Achievements:\n' +
             '   - Level completion\n' +
             '   - Skill mastery\n' +
             '   - Path progression\n' +
             '   - Challenge completion'
        },
        {
          q: 'What rewards are available?',
          a: 'Rewards include:\n\n' +
             '1. Progress Rewards:\n' +
             '   - Experience points (XP)\n' +
             '   - Level advancement\n' +
             '   - Skill unlocks\n' +
             '   - Content access\n\n' +
             '2. Achievement Rewards:\n' +
             '   - Badges and medals\n' +
             '   - Profile customization\n' +
             '   - Special features\n' +
             '   - Exclusive content\n\n' +
             '3. Streak Rewards:\n' +
             '   - Bonus XP\n' +
             '   - Study multipliers\n' +
             '   - Special challenges\n' +
             '   - Unique achievements'
        }
      ]
    },
    {
      title: 'Learning Analytics',
      icon: <AssessmentIcon />,
      questions: [
        {
          q: 'What analytics and insights are available?',
          a: 'The system provides detailed analytics:\n\n' +
             '1. Performance Analytics:\n' +
             '   - Learning speed trends\n' +
             '   - Accuracy patterns\n' +
             '   - Time distribution\n' +
             '   - Category performance\n\n' +
             '2. Progress Insights:\n' +
             '   - Learning curve analysis\n' +
             '   - Weak area identification\n' +
             '   - Optimal study times\n' +
             '   - Progress predictions\n\n' +
             '3. Study Analytics:\n' +
             '   - Session effectiveness\n' +
             '   - Review efficiency\n' +
             '   - Focus metrics\n' +
             '   - Learning patterns\n\n' +
             '4. Achievement Analytics:\n' +
             '   - Achievement progress\n' +
             '   - Streak statistics\n' +
             '   - Reward tracking\n' +
             '   - Milestone analysis'
        },
        {
          q: 'How can I use analytics to improve?',
          a: 'Use analytics to optimize learning:\n\n' +
             '1. Performance Optimization:\n' +
             '   - Identify weak areas\n' +
             '   - Focus on difficult categories\n' +
             '   - Adjust study times\n' +
             '   - Modify learning approach\n\n' +
             '2. Progress Planning:\n' +
             '   - Set realistic goals\n' +
             '   - Track milestone progress\n' +
             '   - Plan review sessions\n' +
             '   - Optimize study schedule\n\n' +
             '3. Achievement Strategy:\n' +
             '   - Target specific achievements\n' +
             '   - Maintain streaks\n' +
             '   - Complete challenges\n' +
             '   - Maximize rewards'
        }
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Progress & Learning Path FAQ
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Comprehensive guide to progress tracking, learning paths, and advancement in the application
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

export default FAQProgress; 