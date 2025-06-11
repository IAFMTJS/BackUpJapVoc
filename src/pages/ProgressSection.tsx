import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import StatisticsDashboard from '../components/progress/StatisticsDashboard';
import UnifiedProgressOverview from '../components/progress/UnifiedProgressOverview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProgressSection: React.FC = () => {
  const { progress } = useProgress();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!progress) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Loading progress data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ p: 3, pb: 0 }}>
        Progress Dashboard
      </Typography>
      
      <Paper sx={{ mx: 3, mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="progress tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Statistics" />
          <Tab label="Section Progress" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <UnifiedProgressOverview />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <StatisticsDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>
          Section-by-Section Progress
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Detailed progress for each learning section including hiragana, katakana, kanji, dictionary, mood, culture, trivia, and anime content.
        </Typography>
        {/* You can add more detailed section progress components here */}
      </TabPanel>
    </Box>
  );
};

export default ProgressSection; 