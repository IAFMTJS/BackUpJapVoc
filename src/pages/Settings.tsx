import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Translate as TranslateIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  VolumeUp as VolumeUpIcon,
  Accessibility as AccessibilityIcon,
  School as SchoolIcon,
  SportsEsports as GamesIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useDatabase } from '../context/DatabaseContext';
import AudioService from '../services/AudioService';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';
import { getCacheStats, clearCache } from '../utils/AudioCache';

interface AudioSettings {
  useTTS: boolean;
  preferredVoice: string;
  rate: number;
  pitch: number;
  autoPlay: boolean;
  volume: number;
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getThemeClasses, theme: appTheme } = useAppTheme();
  const { settings: appSettings, updateSettings: updateAppSettings } = useApp();
  const { 
    settings: globalSettings, 
    updateSettings: updateGlobalSettings, 
    isLoading: isSettingsLoading,
    error: settingsError 
  } = useSettings();
  const { 
    progress: progressData, 
    resetProgress, 
    exportProgress,
    importProgress,
    isLoading: isProgressLoading,
    error: progressError 
  } = useProgress();
  const { 
    settings: accessibilitySettings, 
    updateSettings: updateAccessibilitySettings, 
    isLoading: isAccessibilityLoading 
  } = useAccessibility();
  const { database } = useDatabase();

  // State for dialogs and notifications
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Audio settings state
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    useTTS: true,
    preferredVoice: '',
    rate: 1,
    pitch: 1,
    autoPlay: false,
    volume: 1,
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [cacheStats, setCacheStats] = useState({ size: 0, entryCount: 0 });
  const [isClearingCache, setIsClearingCache] = useState(false);
  const audioService = AudioService.getInstance();

  // Load initial data
  useEffect(() => {
    // Load available voices
    const voices = audioService.getAvailableVoices();
    setAvailableVoices(voices);
    
    // Set default voice if not set
    if (!audioSettings.preferredVoice && voices.length > 0) {
      const japaneseVoice = voices.find(v => v.lang.includes('ja')) || voices[0];
      setAudioSettings(prev => ({
        ...prev,
        preferredVoice: japaneseVoice.name
      }));
    }

    // Load cache stats
    getCacheStats().then(stats => {
      setCacheStats({
        size: stats.totalSize,
        entryCount: stats.fileCount
      });
    });
  }, []);

  // Handlers
  const handlePreferenceChange = (key: string, value: any) => {
    updateGlobalSettings({ [key]: value });
  };

  const handleResetProgress = async () => {
    try {
      await resetProgress();
      setShowResetDialog(false);
      setNotification({
        open: true,
        message: 'Progress has been reset successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to reset progress',
        severity: 'error',
      });
    }
  };

  const handleExportProgress = async () => {
    try {
      await exportProgress();
      setNotification({
        open: true,
        message: 'Progress exported successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to export progress',
        severity: 'error',
      });
    }
  };

  const handleImportProgress = async () => {
    try {
      await importProgress(importData);
      setShowImportDialog(false);
      setImportData('');
      setNotification({
        open: true,
        message: 'Progress imported successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to import progress',
        severity: 'error',
      });
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearCache();
      const stats = await getCacheStats();
      setCacheStats({
        size: stats.totalSize,
        entryCount: stats.fileCount
      });
      setNotification({
        open: true,
        message: 'Audio cache cleared successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to clear audio cache',
        severity: 'error',
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Show error state if there's a critical error
  if (settingsError || progressError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Link to="/" style={{ textDecoration: 'none', marginRight: 2 }}>
            <Button startIcon={<SettingsIcon />}>Back to Home</Button>
          </Link>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Box>
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Settings
          </Typography>
          <Typography color="error" paragraph>
            {settingsError || progressError}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // Loading component
  const LoadingSpinner = ({ text }: { text: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <CircularProgress size={20} sx={{ mr: 2 }} />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <JapaneseCityscape
          width={800}
          height={400}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: appTheme === 'dark' 
              ? 'brightness(0.5) saturate(0.8)' 
              : 'brightness(1.1) saturate(1.2)'
          }}
        />
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{ textDecoration: 'none', marginRight: 2 }}>
          <Button startIcon={<SettingsIcon />}>Back to Home</Button>
        </Link>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        {/* App Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              App Settings
            </Typography>
            {isSettingsLoading ? (
              <LoadingSpinner text="Loading app settings..." />
            ) : (
              <List>
                <ListItem>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Enable dark theme for the application"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={globalSettings.darkMode}
                      onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Show Romaji"
                    secondary="Display romaji for Japanese text"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={globalSettings.showRomaji}
                      onChange={(e) => handlePreferenceChange('showRomaji', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Show Hints"
                    secondary="Display hints during exercises"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={globalSettings.showHints}
                      onChange={(e) => handlePreferenceChange('showHints', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Default Difficulty"
                    secondary="Set default difficulty for exercises"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={globalSettings.difficulty || 'medium'}
                        onChange={(e: SelectChangeEvent) =>
                          handlePreferenceChange('difficulty', e.target.value)
                        }
                      >
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Audio Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Audio Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Text-to-Speech"
                  secondary="Enable voice synthesis for Japanese text"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={audioSettings.useTTS}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, useTTS: e.target.checked }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Preferred Voice"
                  secondary="Select voice for Japanese pronunciation"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={audioSettings.preferredVoice}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, preferredVoice: e.target.value }))}
                      disabled={!audioSettings.useTTS}
                    >
                      {availableVoices.map((voice) => (
                        <MenuItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Auto Play"
                  secondary="Automatically play audio for new words"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={audioSettings.autoPlay}
                    onChange={(e) => setAudioSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                    disabled={!audioSettings.useTTS}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Audio Cache"
                  secondary={`${cacheStats.entryCount} files (${(cacheStats.size / 1024 / 1024).toFixed(2)} MB)`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearCache}
                    disabled={isClearingCache || cacheStats.entryCount === 0}
                  >
                    {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Accessibility Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accessibility
            </Typography>
            {isAccessibilityLoading ? (
              <LoadingSpinner text="Loading accessibility settings..." />
            ) : (
              <List>
                <ListItem>
                  <ListItemText
                    primary="High Contrast"
                    secondary="Enable high contrast mode for better visibility"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={accessibilitySettings.highContrast}
                      onChange={(e) => updateAccessibilitySettings({ highContrast: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Reduced Motion"
                    secondary="Minimize animations and transitions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={accessibilitySettings.reducedMotion}
                      onChange={(e) => updateAccessibilitySettings({ reducedMotion: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Screen Reader"
                    secondary="Optimize for screen readers"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={accessibilitySettings.screenReader}
                      onChange={(e) => updateAccessibilitySettings({ screenReader: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Keyboard Navigation"
                    secondary="Enhanced keyboard controls"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={accessibilitySettings.keyboardNavigation}
                      onChange={(e) => updateAccessibilitySettings({ keyboardNavigation: e.target.checked })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Progress Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress Management
            </Typography>
            {isProgressLoading ? (
              <LoadingSpinner text="Loading progress data..." />
            ) : (
              <List>
                <ListItem>
                  <ListItemText
                    primary="Export Progress"
                    secondary="Download your learning progress as a JSON file"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={handleExportProgress}
                    >
                      Export
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Import Progress"
                    secondary="Import learning progress from a JSON file"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      startIcon={<ImportIcon />}
                      onClick={() => setShowImportDialog(true)}
                    >
                      Import
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Reset Progress"
                    secondary="Clear all learning progress and start fresh"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setShowResetDialog(true)}
                    >
                      Reset
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Reset Progress Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
      >
        <DialogTitle>Reset Progress</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset all your learning progress? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetProgress} color="error" autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Progress Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Progress</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Paste your exported progress data below:
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Paste JSON data here..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleImportProgress}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 