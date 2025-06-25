import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';

interface ErrorFallbackProps {
  error?: Error;
  componentName?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  componentName = 'component',
  onRetry,
  onGoHome 
}) => {
  // Safety check to ensure we're rendering a valid component
  if (typeof ErrorFallback !== 'function') {
    console.error('ErrorFallback is not a valid component');
    return <div>Error loading component</div>;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleReportError = () => {
    const errorReport = {
      component: componentName,
      message: error?.message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Component Error Report:', errorReport);
    
    // You can send this to your error reporting service
    alert('Error report logged to console. Please check the browser console for details.');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        padding: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 500,
          width: '100%',
          padding: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom color="error">
          🚨 Component Loading Error
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            Failed to load <strong>{componentName}</strong>. This might be due to:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Network connectivity issues</li>
            <li>Browser cache problems</li>
            <li>Temporary loading errors</li>
          </ul>
        </Alert>

        {error && (
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom>
              Error Details:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                backgroundColor: 'grey.100', 
                padding: 1, 
                borderRadius: 1,
                wordBreak: 'break-word',
                fontSize: '0.875rem'
              }}
            >
              {error.message}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={handleRetry}
          >
            Retry Loading
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<BugReport />}
            onClick={handleReportError}
          >
            Report Error
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If the problem persists, try refreshing the page or clearing your browser cache.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ErrorFallback; 