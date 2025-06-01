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
  Settings as SettingsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  TipsAndUpdates as TipsIcon,
  Keyboard as KeyboardIcon,
  Accessibility as AccessibilityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const FAQFeatures: React.FC = () => {
  const theme = useTheme();

  const faqSections = [
    {
      title: 'App Features',
      icon: <SettingsIcon />,
      questions: [
        {
          q: 'What are the main features of the app?',
          a: 'The app includes several key features:\n' +
             '- Interactive learning modules\n' +
             '- Spaced repetition system (SRS)\n' +
             '- Progress tracking and analytics\n' +
             '- Achievement system\n' +
             '- Audio pronunciation\n' +
             '- Offline mode\n' +
             '- Customizable settings\n' +
             '- Multiple learning paths'
        },
        {
          q: 'How do I customize my learning experience?',
          a: 'You can customize your experience through:\n' +
             '- Learning path selection\n' +
             '- Study session duration\n' +
             '- Review frequency settings\n' +
             '- Notification preferences\n' +
             '- Theme customization\n' +
             '- Accessibility options\n' +
             '- Audio settings'
        },
        {
          q: 'What accessibility features are available?',
          a: 'The app includes various accessibility features:\n' +
             '- Screen reader support\n' +
             '- High contrast mode\n' +
             '- Font size adjustment\n' +
             '- Keyboard navigation\n' +
             '- Color blind mode\n' +
             '- Reduced motion\n' +
             '- Audio descriptions'
        }
      ]
    },
    {
      title: 'Tips & Tricks',
      icon: <TipsIcon />,
      questions: [
        {
          q: 'What are some useful keyboard shortcuts?',
          a: 'Available keyboard shortcuts:\n' +
             '- Space: Next question/word\n' +
             '- Enter: Submit answer\n' +
             '- Esc: Exit current view\n' +
             '- Ctrl/Cmd + S: Save progress\n' +
             '- Ctrl/Cmd + P: Toggle pronunciation\n' +
             '- Ctrl/Cmd + M: Toggle menu\n' +
             '- Ctrl/Cmd + T: Toggle theme'
        },
        {
          q: 'How can I optimize my study sessions?',
          a: 'Optimize your study sessions by:\n' +
             '- Setting specific goals\n' +
             '- Using the SRS system effectively\n' +
             '- Taking regular breaks\n' +
             '- Reviewing difficult words\n' +
             '- Using all available features\n' +
             '- Tracking your progress\n' +
             '- Maintaining consistency'
        },
        {
          q: 'What are some hidden features?',
          a: 'Some lesser-known features include:\n' +
             '- Quick word lookup\n' +
             '- Custom word lists\n' +
             '- Study session statistics\n' +
             '- Export/import progress\n' +
             '- Advanced search filters\n' +
             '- Learning streak rewards\n' +
             '- Community features'
        }
      ]
    },
    {
      title: 'Technical Support',
      icon: <HelpIcon />,
      questions: [
        {
          q: 'How do I troubleshoot common issues?',
          a: 'Common troubleshooting steps:\n' +
             '1. Clear browser cache\n' +
             '2. Check internet connection\n' +
             '3. Update browser\n' +
             '4. Disable extensions\n' +
             '5. Check audio settings\n' +
             '6. Verify account status\n' +
             '7. Contact support if needed'
        },
        {
          q: 'How can I manage my data?',
          a: 'Data management options:\n' +
             '- Export learning progress\n' +
             '- Backup settings\n' +
             '- Clear cache\n' +
             '- Reset progress\n' +
             '- Manage account data\n' +
             '- Download statistics\n' +
             '- Sync across devices'
        },
        {
          q: 'What are the system requirements?',
          a: 'System requirements:\n' +
             '- Modern web browser\n' +
             '- Internet connection\n' +
             '- JavaScript enabled\n' +
             '- Audio support\n' +
             '- Local storage access\n' +
             '- Minimum screen resolution\n' +
             '- Recommended: 4GB RAM'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: <SecurityIcon />,
      questions: [
        {
          q: 'How is my data protected?',
          a: 'Data protection measures:\n' +
             '- Encrypted data storage\n' +
             '- Secure authentication\n' +
             '- Regular backups\n' +
             '- Privacy controls\n' +
             '- Data minimization\n' +
             '- Access controls\n' +
             '- Regular security updates'
        },
        {
          q: 'What privacy settings are available?',
          a: 'Available privacy settings:\n' +
             '- Data collection preferences\n' +
             '- Activity visibility\n' +
             '- Profile privacy\n' +
             '- Progress sharing\n' +
             '- Analytics opt-out\n' +
             '- Cookie preferences\n' +
             '- Account deletion'
        },
        {
          q: 'How can I manage my account security?',
          a: 'Account security management:\n' +
             '- Strong password requirements\n' +
             '- Two-factor authentication\n' +
             '- Login notifications\n' +
             '- Session management\n' +
             '- Device tracking\n' +
             '- Security alerts\n' +
             '- Account recovery options'
        }
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Features & Tips FAQ
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Learn about app features, tips, and technical support
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

export default FAQFeatures; 