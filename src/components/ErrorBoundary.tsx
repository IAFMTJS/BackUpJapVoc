import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh, BugReport, Home } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRecovering: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      isRecovering: false 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to console for debugging
    console.group('🚨 React Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Check if it's a chunk loading error
    if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      console.log('Detected chunk loading error, attempting recovery...');
      this.handleChunkError();
    }

    // Check if it's React error #130 (invalid element type)
    if (error.message.includes('invalid element type') || 
        error.message.includes('Element type is invalid') ||
        error.message.includes('React') ||
        errorInfo.componentStack.includes('lazy')) {
      console.log('Detected React error #130 (invalid element type), attempting recovery...');
      this.handleReactError();
    }
  }

  private handleChunkError = () => {
    // Try to recover from chunk loading errors
    this.setState({ isRecovering: true });
    
    setTimeout(() => {
      try {
        // Clear any cached chunks that might be corrupted
        if (typeof window !== 'undefined' && window.webpackChunkBackupJapVoc) {
          // Clear the chunk cache
          window.webpackChunkBackupJapVoc = [];
        }
        
        // Force a page reload to recover
        window.location.reload();
      } catch (reloadError) {
        console.error('Failed to reload page:', reloadError);
        this.setState({ isRecovering: false });
      }
    }, 1000);
  };

  private handleReactError = () => {
    // Try to recover from React errors (usually lazy loading issues)
    this.setState({ isRecovering: true });
    
    setTimeout(() => {
      try {
        // Clear any cached chunks and modules
        if (typeof window !== 'undefined') {
          if (window.webpackChunkBackupJapVoc) {
            window.webpackChunkBackupJapVoc = [];
          }
          
          // Clear module cache if possible
          if (window.__webpack_require__ && window.__webpack_require__.c) {
            Object.keys(window.__webpack_require__.c).forEach(key => {
              delete window.__webpack_require__.c[key];
            });
          }
        }
        
        // Force a page reload to recover
        window.location.reload();
      } catch (reloadError) {
        console.error('Failed to reload page:', reloadError);
        this.setState({ isRecovering: false });
      }
    }, 1000);
  };

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false 
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Error Report:', errorReport);
    
    // You can send this to your error reporting service
    // For now, just log it and show a message
    alert('Error report logged to console. Please check the browser console for details.');
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: 'background.default'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: '100%',
              padding: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom color="error">
              🚨 Something went wrong
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                The application encountered an unexpected error. This might be due to:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Network connectivity issues</li>
                <li>Browser cache problems</li>
                <li>Temporary loading errors</li>
              </ul>
            </Alert>

            {this.state.error && (
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
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                disabled={this.state.isRecovering}
              >
                {this.state.isRecovering ? 'Recovering...' : 'Try Again'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={this.handleReportError}
              >
                Report Error
              </Button>
            </Box>

            {this.state.isRecovering && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Attempting to recover... Please wait.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 