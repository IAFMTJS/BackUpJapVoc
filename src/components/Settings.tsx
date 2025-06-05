import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  TextField,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormLabel,
  Slider,
  Tooltip
} from '@mui/material';
import {
  NotificationsIcon,
  LanguageIcon,
  PaletteIcon,
  SecurityIcon,
  DeleteIcon,
  SaveIcon,
  RestoreIcon,
  DownloadIcon,
  UploadIcon,
  HelpIcon,
  VolumeUpIcon,
  TimerIcon,
  SpeedIcon,
  VisibilityIcon,
  KeyboardIcon,
  DarkModeIcon,
  CloudDownloadIcon,
  CloudUploadIcon,
  AccessibilityIcon
} from '../index';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings: React.FC = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { progress, updateProgress } = useProgress();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: () => {} });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminder: true,
    goalReminders: true,
    achievementAlerts: true,
    progressUpdates: true,
    reminderTime: '09:00',
    reminderDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  });

  // Language Settings
  const [languageSettings, setLanguageSettings] = useState({
    interfaceLanguage: 'en',
    studyLanguage: 'ja',
    romanization: true,
    showEnglish: true,
    showKanji: true,
    showHiragana: true,
    showKatakana: true
  });

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState({
    mode: 'light',
    primaryColor: theme.palette.primary.main,
    fontSize: 16,
    animationSpeed: 1,
    highContrast: false,
    reducedMotion: false
  });

  // Study Settings
  const [studySettings, setStudySettings] = useState({
    reviewInterval: 24, // hours
    newWordsPerDay: 10,
    maxReviewsPerDay: 50,
    autoPlayAudio: true,
    showHints: true,
    typingMode: false,
    studySessionDuration: 25, // minutes
    breakDuration: 5 // minutes
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requirePassword: false,
    sessionTimeout: 30, // minutes
    dataExport: true,
    dataSync: true
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = (section: string) => {
    // TODO: Implement actual saving logic
    setSnackbar({
      open: true,
      message: `${section} settings saved successfully`,
      severity: 'success'
    });
  };

  const handleResetSettings = (section: string) => {
    setConfirmDialog({
      open: true,
      title: 'Reset Settings',
      message: `Are you sure you want to reset all ${section} settings to default?`,
      action: () => {
        // TODO: Implement reset logic
        setSnackbar({
          open: true,
          message: `${section} settings reset to default`,
          severity: 'success'
        });
      }
    });
  };

  const handleExportData = () => {
    // TODO: Implement data export
    setSnackbar({
      open: true,
      message: 'Data exported successfully',
      severity: 'success'
    });
  };

  const handleImportData = () => {
    // TODO: Implement data import
    setSnackbar({
      open: true,
      message: 'Data imported successfully',
      severity: 'success'
    });
  };

  return (
    <Box>
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<LanguageIcon />} label="Language" />
          <Tab icon={<PaletteIcon />} label="Appearance" />
          <Tab icon={<TimerIcon />} label="Study" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<HelpIcon />} label="Help" />
        </Tabs>

        {/* Notifications Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><NotificationsIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Daily Study Reminders"
                    secondary="Get reminded to study at your preferred time"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.dailyReminder}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        dailyReminder: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon><TimerIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Goal Reminders"
                    secondary="Get notified about your learning goals"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.goalReminders}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        goalReminders: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon><VolumeUpIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Achievement Alerts"
                    secondary="Get notified when you earn achievements"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notificationSettings.achievementAlerts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        achievementAlerts: e.target.checked
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Reminder Time</InputLabel>
                <Select
                  value={notificationSettings.reminderTime}
                  label="Reminder Time"
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    reminderTime: e.target.value
                  })}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <MenuItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Language Settings */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Interface Language</InputLabel>
                <Select
                  value={languageSettings.interfaceLanguage}
                  label="Interface Language"
                  onChange={(e) => setLanguageSettings({
                    ...languageSettings,
                    interfaceLanguage: e.target.value
                  })}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Study Language</InputLabel>
                <Select
                  value={languageSettings.studyLanguage}
                  label="Study Language"
                  onChange={(e) => setLanguageSettings({
                    ...languageSettings,
                    studyLanguage: e.target.value
                  })}
                >
                  <MenuItem value="ja">Japanese</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Display Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={languageSettings.romanization}
                        onChange={(e) => setLanguageSettings({
                          ...languageSettings,
                          romanization: e.target.checked
                        })}
                      />
                    }
                    label="Show Romanization"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={languageSettings.showEnglish}
                        onChange={(e) => setLanguageSettings({
                          ...languageSettings,
                          showEnglish: e.target.checked
                        })}
                      />
                    }
                    label="Show English Translations"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Appearance Settings */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Theme Mode</FormLabel>
                <RadioGroup
                  row
                  value={themeSettings.mode}
                  onChange={(e) => setThemeSettings({
                    ...themeSettings,
                    mode: e.target.value
                  })}
                >
                  <FormControlLabel value="light" control={<Radio />} label="Light" />
                  <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                  <FormControlLabel value="system" control={<Radio />} label="System" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Font Size</Typography>
              <Slider
                value={themeSettings.fontSize}
                min={12}
                max={24}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setThemeSettings({
                  ...themeSettings,
                  fontSize: value as number
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Animation Speed</Typography>
              <Slider
                value={themeSettings.animationSpeed}
                min={0.5}
                max={2}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setThemeSettings({
                  ...themeSettings,
                  animationSpeed: value as number
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeSettings.highContrast}
                    onChange={(e) => setThemeSettings({
                      ...themeSettings,
                      highContrast: e.target.checked
                    })}
                  />
                }
                label="High Contrast Mode"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Study Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>New Words Per Day</Typography>
              <Slider
                value={studySettings.newWordsPerDay}
                min={5}
                max={50}
                step={5}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setStudySettings({
                  ...studySettings,
                  newWordsPerDay: value as number
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Review Interval (hours)</Typography>
              <Slider
                value={studySettings.reviewInterval}
                min={12}
                max={72}
                step={12}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setStudySettings({
                  ...studySettings,
                  reviewInterval: value as number
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Study Session Duration</InputLabel>
                <Select
                  value={studySettings.studySessionDuration}
                  label="Study Session Duration"
                  onChange={(e) => setStudySettings({
                    ...studySettings,
                    studySessionDuration: e.target.value as number
                  })}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={25}>25 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Break Duration</InputLabel>
                <Select
                  value={studySettings.breakDuration}
                  label="Break Duration"
                  onChange={(e) => setStudySettings({
                    ...studySettings,
                    breakDuration: e.target.value as number
                  })}
                >
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={studySettings.typingMode}
                    onChange={(e) => setStudySettings({
                      ...studySettings,
                      typingMode: e.target.checked
                    })}
                  />
                }
                label="Enable Typing Mode (Type answers instead of multiple choice)"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.requirePassword}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      requirePassword: e.target.checked
                    })}
                  />
                }
                label="Require Password for App Access"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Session Timeout</InputLabel>
                <Select
                  value={securitySettings.sessionTimeout}
                  label="Session Timeout"
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: e.target.value as number
                  })}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                  >
                    Export Data
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={handleImportData}
                  >
                    Import Data
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Help Settings */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Help & Support
              </Typography>
              <List>
                <ListItem button onClick={() => window.open('/docs/getting-started', '_blank')}>
                  <ListItemIcon><HelpIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Getting Started Guide"
                    secondary="Learn the basics of using the app"
                  />
                </ListItem>
                <ListItem button onClick={() => window.open('/docs/faq', '_blank')}>
                  <ListItemIcon><HelpIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Frequently Asked Questions"
                    secondary="Find answers to common questions"
                  />
                </ListItem>
                <ListItem button onClick={() => window.open('/docs/contact', '_blank')}>
                  <ListItemIcon><HelpIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Contact Support"
                    secondary="Get help from our support team"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version: 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={() => handleResetSettings('all')}
        >
          Reset All Settings
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSaveSettings('all')}
        >
          Save All Changes
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirmDialog.action();
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 