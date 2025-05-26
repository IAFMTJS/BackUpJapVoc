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
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setNotificationMessage('You are back online!');
      setNotificationSeverity('success');
      setShowNotification(true);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setNotificationMessage('You are offline. Some features may be limited.');
      setNotificationSeverity('error');
      setShowNotification(true);
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
    setShowNotification(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      <StatusContainer className={isOffline ? 'offline' : 'online'}>
        {isOffline ? (
          <>
            <OfflineIcon color="error" />
            <Typography variant="body2">
              Offline Mode
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleRetry}
              sx={{ 
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)'
                }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <OnlineIcon color="success" />
            <Typography variant="body2">
              Online
            </Typography>
          </>
        )}
      </StatusContainer>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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