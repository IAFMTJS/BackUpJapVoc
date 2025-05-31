import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  Translate as TranslateIcon,
  VolumeUp as VolumeUpIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import CulturalItemCard from '../components/CulturalItemCard';
import TabPanel from '../components/TabPanel';
import { culturalTopics, languageRules, CulturalTopic } from '../data/culturalContent';

type DisplayMode = {
  romaji: boolean;
  english: boolean;
};

type TabType = 'cultural' | 'language';

const CultureAndRules: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>({
    romaji: true,
    english: true
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleDisplayMode = (mode: keyof DisplayMode) => {
    setDisplayMode(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  };

  const renderContent = (topics: CulturalTopic[]) => (
    <Grid container spacing={3}>
      {topics.map((topic, index) => (
        <Grid item xs={12} key={index}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              {topic.icon}
              <Typography variant="h5" component="h2" ml={1}>
                {topic.title}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {topic.content.map((item, itemIndex) => (
                <Grid item xs={12} key={itemIndex}>
                  <CulturalItemCard
                    {...item}
                    showRomaji={displayMode.romaji}
                    showEnglish={displayMode.english}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          p: 4,
          borderRadius: 2,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Japanese Culture & Language Rules
        </Typography>
        <Typography variant="h6">
          Explore the rich cultural traditions and linguistic nuances of Japan
        </Typography>
      </Box>

      {/* Language Display Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ButtonGroup variant="contained" size={isMobile ? 'small' : 'medium'}>
          <Button
            onClick={() => toggleDisplayMode('romaji')}
            color={displayMode.romaji ? 'secondary' : 'primary'}
            startIcon={<TranslateIcon />}
          >
            Romaji
          </Button>
          <Button
            onClick={() => toggleDisplayMode('english')}
            color={displayMode.english ? 'secondary' : 'primary'}
            startIcon={<MenuBookIcon />}
          >
            English
          </Button>
        </ButtonGroup>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          <Tab
            label="Cultural Topics"
            value={0}
            icon={<MenuBookIcon />}
            iconPosition="start"
          />
          <Tab
            label="Language Rules"
            value={1}
            icon={<SchoolIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Content */}
      <TabPanel value={activeTab} index={0}>
        {renderContent(culturalTopics)}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderContent(languageRules)}
      </TabPanel>
    </Container>
  );
};

export default CultureAndRules; 