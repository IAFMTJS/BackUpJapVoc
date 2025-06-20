import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isChunkError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk loading error
    const isChunkError = error.message.includes('Loading chunk') || 
                        error.message.includes('ChunkLoadError') ||
                        error.message.includes('99.505cc745.chunk.js');
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      isChunkError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
      isChunkError: error.message.includes('Loading chunk') || 
                   error.message.includes('ChunkLoadError') ||
                   error.message.includes('99.505cc745.chunk.js')
    });
  }

  handleRefresh = () => {
    // Clear any cached chunks and reload
    if (this.state.isChunkError) {
      // Clear webpack chunk cache
      if (window.webpackChunkBackupJapVoc) {
        window.webpackChunkBackupJapVoc = [];
      }
      
      // Clear any cached chunks from localStorage
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('webpack') || key.includes('chunk')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }
    }
    
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <Alert 
              severity={this.state.isChunkError ? "warning" : "error"}
              sx={{ mb: 3 }}
            >
              {this.state.isChunkError 
                ? "Chunk Loading Error" 
                : "Something went wrong"
              }
            </Alert>
            
            <Typography variant="h5" component="h1" gutterBottom>
              {this.state.isChunkError 
                ? "Failed to load application component" 
                : "Application Error"
              }
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.isChunkError 
                ? "The application failed to load a required component. This is usually a temporary issue that can be resolved by refreshing the page."
                : "An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
              }
            </Typography>

            {this.state.isChunkError && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Error details: {this.state.error?.message}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                sx={{ minWidth: 140 }}
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{ minWidth: 140 }}
              >
                Go Home
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Error Details (Development)
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    maxHeight: 200,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  <pre>{this.state.error?.stack}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </Paper>
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