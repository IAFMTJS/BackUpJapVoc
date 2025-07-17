import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App, { ThemeWrapper } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { WordProvider } from './context/WordContext';
import { WordLevelProvider } from './context/WordLevelContext';
import { LearningProvider } from './context/LearningContext';
import { AchievementProvider } from './context/AchievementContext';
import ErrorBoundary from './components/ErrorBoundary';

// Setup global error handling for React errors
const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's a chunk loading error
    if (event.reason && typeof event.reason === 'string' && 
        (event.reason.includes('Loading chunk') || event.reason.includes('ChunkLoadError'))) {
      console.log('Detected chunk loading rejection, attempting recovery...');
      event.preventDefault();
      
      // Try to recover by reloading the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Check if it's a chunk loading error
    if (event.error && event.error.message && 
        (event.error.message.includes('Loading chunk') || event.error.message.includes('ChunkLoadError'))) {
      console.log('Detected chunk loading error, attempting recovery...');
      
      // Try to recover by reloading the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Handle React errors that might not be caught by ErrorBoundary
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Call the original console.error
    originalConsoleError.apply(console, args);
    
    // Check if it's a React error
    const errorString = args.join(' ');
    if (errorString.includes('React') || errorString.includes('chunk') || errorString.includes('Loading')) {
      console.log('React error detected, checking for recovery options...');
    }

    // Specifically check for React error #130 (invalid element type)
    if (errorString.includes('invalid element type') || 
        errorString.includes('Element type is invalid') ||
        errorString.includes('130')) {
      console.error('🚨 React Error #130 detected (invalid element type):', {
        error: errorString,
        stack: new Error().stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      
      // Try to identify the problematic component
      const componentMatch = errorString.match(/Element type is invalid: expected a string \(for built-in components\) or a class\/function \(for composite components\) but got: (.*?)\./);
      if (componentMatch) {
        console.error('Problematic component:', componentMatch[1]);
      }
      
      // Attempt recovery
      setTimeout(() => {
        console.log('Attempting to recover from React error #130...');
        window.location.reload();
      }, 2000);
    }
  };
};

// Initialize global error handling
setupGlobalErrorHandling();

// Create root with error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Use React 18 createRoot API
const root = ReactDOM.createRoot(rootElement);

// Render the app with all necessary providers
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ProgressProvider>
              <SettingsProvider>
                <AccessibilityProvider>
                  <WordProvider>
                    <WordLevelProvider>
                      <LearningProvider>
                        <AchievementProvider>
                          <App />
                        </AchievementProvider>
                      </LearningProvider>
                    </WordLevelProvider>
                  </WordProvider>
                </AccessibilityProvider>
              </SettingsProvider>
            </ProgressProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  const registerServiceWorker = async () => {
    try {
      console.log('[SW] Starting service worker registration process...');
      
      // Add message handler to prevent undefined message type spam
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (!event.data || typeof event.data.type === 'undefined') {
          // Silently ignore messages without type to prevent console spam
          return;
        }
        console.log('[SW] Message received:', event.data.type);
      });
      
      // Get existing registration
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      
      // Only unregister in production if there's an existing registration AND it's not active
      if (process.env.NODE_ENV === 'production' && existingRegistration && !existingRegistration.active) {
        console.log('[SW] Unregistering inactive service worker for update...');
        await existingRegistration.unregister();
      } else if (existingRegistration?.active) {
        console.log('[SW] Using existing active service worker');
        return existingRegistration;
      }

      console.log('[SW] Registering new service worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('[SW] Service worker ready');

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          console.log(`[SW] New worker state: ${newWorker.state}`);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New version available. Please refresh to update.');
            // Show a notification to the user
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Update Available', {
                body: 'A new version is available. Please refresh to update.',
                icon: '/icons/icon-192x192.png'
              });
            }
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Service worker controller changed');
        // Only reload if we're not in a loading state
        if (!document.querySelector('.loading-spinner')) {
          window.location.reload();
        }
      });

      console.log('[SW] ServiceWorker registration successful with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('[SW] ServiceWorker registration failed:', error);
      // Don't throw the error, just log it and continue
      return null;
    }
  };

  // Register service worker with retry
  const registerWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const registration = await registerServiceWorker();
        if (registration) return;
      } catch (error) {
        console.warn(`[SW] Registration attempt ${i + 1} failed:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    console.warn('[SW] Service worker registration failed after all retries');
  };

  // Register service worker with a slight delay to ensure app is loaded
  setTimeout(() => {
    registerWithRetry();
  }, 1000);
}

// Add a function to clear all caches and reload
const clearCachesAndReload = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
  window.location.reload();
};

// Helper function to get a unique client ID
async function getClientId(): Promise<string> {
  let clientId = sessionStorage.getItem('clientId');
  if (!clientId) {
    clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('clientId', clientId);
  }
  return clientId;
}

// Handle PWA installation prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show a custom install button if you have one
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
});

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('Application was installed');
  // You can track installations here
}); 