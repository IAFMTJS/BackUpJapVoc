import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  NotificationsActive as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import styled from '@emotion/styled';

const NotificationButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.9)' 
      : 'rgba(255, 255, 255, 1)',
  }
}));

interface NotificationPreferences {
  achievements: boolean;
  dailyReminders: boolean;
  studyStreaks: boolean;
  newContent: boolean;
  progressUpdates: boolean;
}

const defaultPreferences: NotificationPreferences = {
  achievements: true,
  dailyReminders: true,
  studyStreaks: true,
  newContent: true,
  progressUpdates: true
};

const PushNotifications: React.FC = () => {
  const theme = useTheme();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setSnackbarMessage('Notifications enabled successfully!');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        
        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
          });
          
          // Send subscription to server
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          });
        }
      } else {
        setSnackbarMessage('Notification permission denied');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setSnackbarMessage('Error enabling notifications');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  }, []);

  const handlePreferenceChange = (preference: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const renderNotificationButton = () => {
    if (!('Notification' in window)) return null;

    return (
      <Tooltip title={permission === 'granted' ? 'Notification Settings' : 'Enable Notifications'}>
        <NotificationButton
          onClick={permission === 'granted' ? handleOpenSettings : requestPermission}
          color={permission === 'granted' ? 'primary' : 'default'}
        >
          {permission === 'granted' ? <NotificationsIcon /> : <NotificationsOffIcon />}
        </NotificationButton>
      </Tooltip>
    );
  };

  return (
    <>
      {renderNotificationButton()}

      <Dialog 
        open={showSettings} 
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Notification Settings</Typography>
            <IconButton onClick={handleCloseSettings} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.achievements}
                  onChange={() => handlePreferenceChange('achievements')}
                  color="primary"
                />
              }
              label="Achievement Notifications"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
              Get notified when you unlock new achievements
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.dailyReminders}
                  onChange={() => handlePreferenceChange('dailyReminders')}
                  color="primary"
                />
              }
              label="Daily Study Reminders"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
              Receive daily reminders to maintain your study streak
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.studyStreaks}
                  onChange={() => handlePreferenceChange('studyStreaks')}
                  color="primary"
                />
              }
              label="Streak Updates"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
              Get notified about your study streak milestones
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.newContent}
                  onChange={() => handlePreferenceChange('newContent')}
                  color="primary"
                />
              }
              label="New Content Alerts"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
              Be notified when new vocabulary or lessons are added
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.progressUpdates}
                  onChange={() => handlePreferenceChange('progressUpdates')}
                  color="primary"
                />
              }
              label="Progress Updates"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
              Receive updates about your learning progress
            </Typography>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PushNotifications; 