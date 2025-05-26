import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, IconButton, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import styled from '@emotion/styled';

const StatusContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: `${theme.spacing(2)}px`,
  right: `${theme.spacing(2)}px`,
  zIndex: theme.zIndex.snackbar,
  display: 'flex',
  alignItems: 'center',
  gap: `${theme.spacing(1)}px`,
  padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.error.main}`,
  '&.offline': {
    border: `1px solid ${theme.palette.error.main}`,
    '& .MuiTypography-root': {
      color: theme.palette.error.main
    }
  },
  '&.online': {
    border: `1px solid ${theme.palette.success.main}`,
    '& .MuiTypography-root': {
      color: theme.palette.success.main
    }
  }
}));

const OfflineStatus: React.FC = () => {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationMessage('You are back online!');
      setNotificationSeverity('success');
      setShowSnackbar(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationMessage('You are offline. Some features may be limited.');
      setNotificationSeverity('error');
      setShowSnackbar(true);
    };

    // Check connection status periodically
    const checkConnection = async () => {
      try {
        const response = await fetch('/version.json', { method: 'HEAD' });
        if (response.ok && !navigator.onLine) {
          window.dispatchEvent(new Event('online'));
        }
      } catch (error) {
        if (navigator.onLine) {
          window.dispatchEvent(new Event('offline'));
        }
      }
    };

    const intervalId = setInterval(checkConnection, 5000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  const handleCloseNotification = () => {
    setShowSnackbar(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: theme.spacing(2),
          right: theme.spacing(2),
          zIndex: theme.zIndex.snackbar,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
          p: `${theme.spacing(1)} ${theme.spacing(2)}`,
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: theme.shadows[4],
          transition: 'all 0.3s ease',
          border: `1px solid ${
            isOnline 
              ? theme.palette.success.main 
              : theme.palette.error.main
          }`,
          '& .MuiTypography-root': {
            color: isOnline 
              ? theme.palette.success.main 
              : theme.palette.error.main
          }
        }}
        className={isOnline ? 'online' : 'offline'}
      >
        {isOnline ? <OnlineIcon /> : <OfflineIcon />}
        <Typography variant="body2">
          {isOnline ? 'Online' : 'Offline'}
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setShowStatus(false)}
          sx={{ 
            ml: theme.spacing(1),
            color: 'inherit'
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notificationSeverity}
          variant="filled"
          sx={{
            width: '100%',
            '& .MuiAlert-icon': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseNotification}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineStatus; 