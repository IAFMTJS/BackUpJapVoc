import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Slider, Button, Grid } from '@mui/material';

const SRSSettings: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { settings, updateSettings } = useApp();

  const [localSettings, setLocalSettings] = useState({
    adaptiveDifficulty: settings.adaptiveDifficulty ?? true,
    spacedRepetition: settings.spacedRepetition ?? true,
    dailyGoal: settings.dailyGoal ?? 20,
    reviewInterval: settings.reviewInterval ?? 24,
    showPronunciation: settings.showPronunciation ?? true,
    showWriting: settings.showWriting ?? true,
    showExamples: settings.showExamples ?? true,
    showMnemonics: settings.showMnemonics ?? true,
    difficultyAdjustment: settings.difficultyAdjustment ?? 1,
    streakBonus: settings.streakBonus ?? 1.1,
    masteryThreshold: settings.masteryThreshold ?? 80
  });

  const handleSettingChange = (setting: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
  };

  return (
    <Box className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Typography variant="h4" component="h1" className={`mb-6 ${themeClasses.text.primary}`}>
          SRS Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Learning Preferences */}
          <Grid item xs={12} md={6}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={`mb-4 ${themeClasses.text.secondary}`}>
                  Learning Preferences
                </Typography>
                
                <Box className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.adaptiveDifficulty}
                        onChange={(e) => handleSettingChange('adaptiveDifficulty', e.target.checked)}
                      />
                    }
                    label="Adaptive Difficulty"
                    className={themeClasses.text.primary}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.spacedRepetition}
                        onChange={(e) => handleSettingChange('spacedRepetition', e.target.checked)}
                      />
                    }
                    label="Spaced Repetition"
                    className={themeClasses.text.primary}
                  />

                  <Box>
                    <Typography className={themeClasses.text.secondary}>
                      Daily Goal (items)
                    </Typography>
                    <Slider
                      value={localSettings.dailyGoal}
                      onChange={(_, value) => handleSettingChange('dailyGoal', value)}
                      min={5}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Box>
                    <Typography className={themeClasses.text.secondary}>
                      Review Interval (hours)
                    </Typography>
                    <Slider
                      value={localSettings.reviewInterval}
                      onChange={(_, value) => handleSettingChange('reviewInterval', value)}
                      min={1}
                      max={72}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Display Options */}
          <Grid item xs={12} md={6}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={`mb-4 ${themeClasses.text.secondary}`}>
                  Display Options
                </Typography>
                
                <Box className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.showPronunciation}
                        onChange={(e) => handleSettingChange('showPronunciation', e.target.checked)}
                      />
                    }
                    label="Show Pronunciation"
                    className={themeClasses.text.primary}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.showWriting}
                        onChange={(e) => handleSettingChange('showWriting', e.target.checked)}
                      />
                    }
                    label="Show Writing"
                    className={themeClasses.text.primary}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.showExamples}
                        onChange={(e) => handleSettingChange('showExamples', e.target.checked)}
                      />
                    }
                    label="Show Examples"
                    className={themeClasses.text.primary}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.showMnemonics}
                        onChange={(e) => handleSettingChange('showMnemonics', e.target.checked)}
                      />
                    }
                    label="Show Mnemonics"
                    className={themeClasses.text.primary}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Advanced Settings */}
          <Grid item xs={12}>
            <Card className={themeClasses.card}>
              <CardContent>
                <Typography variant="h6" className={`mb-4 ${themeClasses.text.secondary}`}>
                  Advanced Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography className={themeClasses.text.secondary}>
                        Difficulty Adjustment
                      </Typography>
                      <Slider
                        value={localSettings.difficultyAdjustment}
                        onChange={(_, value) => handleSettingChange('difficultyAdjustment', value)}
                        min={0.5}
                        max={2}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography className={themeClasses.text.secondary}>
                        Streak Bonus
                      </Typography>
                      <Slider
                        value={localSettings.streakBonus}
                        onChange={(_, value) => handleSettingChange('streakBonus', value)}
                        min={1}
                        max={2}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography className={themeClasses.text.secondary}>
                        Mastery Threshold (%)
                      </Typography>
                      <Slider
                        value={localSettings.masteryThreshold}
                        onChange={(_, value) => handleSettingChange('masteryThreshold', value)}
                        min={50}
                        max={100}
                        step={5}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box className="flex justify-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                className={themeClasses.button.primary}
              >
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

export default SRSSettings; 