import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Box, Typography, Paper, Tabs, Tab, Grid } from '@mui/material';
import BasicKana from '../components/kana/BasicKana';
import YōonKana from '../components/kana/YōonKana';
import DakuonKana from '../components/kana/DakuonKana';
import KanaPractice from '../components/kana/KanaPractice';
import KanaGrammar from '../components/kana/KanaGrammar';
import KanaWriting from '../components/kana/KanaWriting';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kana-tabpanel-${index}`}
      aria-labelledby={`kana-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const KanaSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Home
        </Link>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Japanese Kana Learning
        </h1>
      </div>

      <Paper className={`mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Box className="p-6">
          <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            About Japanese Kana
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>
                <strong>Hiragana (ひらがな):</strong> The primary script used for native Japanese words, 
                grammatical particles, and to indicate the pronunciation of kanji. It's essential for 
                beginners to master hiragana as it forms the foundation of Japanese writing.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>
                <strong>Katakana (カタカナ):</strong> Used primarily for foreign words, onomatopoeia, 
                and emphasis. It's crucial for writing loanwords and technical terms. The characters 
                are more angular compared to hiragana.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            <Tab label="Basic Kana" />
            <Tab label="Yōon (拗音)" />
            <Tab label="Dakuon & Handakuon" />
            <Tab label="Writing Practice" />
            <Tab label="Practice & Quiz" />
            <Tab label="Grammar & Usage" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <BasicKana />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <YōonKana />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <DakuonKana />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <KanaWriting />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <KanaPractice />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <KanaGrammar />
        </TabPanel>
      </Paper>
    </div>
  );
};

export default KanaSection; 