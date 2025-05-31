import React from 'react';
import ReactDOM from 'react-dom';
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

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemeWrapper>
          <ErrorBoundary>
            <AuthProvider>
              <AppProvider>
                <ProgressProvider>
                  <WordProvider>
                    <WordLevelProvider>
                      <AchievementProvider>
                        <LearningProvider>
                          <AccessibilityProvider>
                            <SettingsProvider>
                              <App />
                            </SettingsProvider>
                          </AccessibilityProvider>
                        </LearningProvider>
                      </AchievementProvider>
                    </WordLevelProvider>
                  </WordProvider>
                </ProgressProvider>
              </AppProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeWrapper>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  const registerServiceWorker = async () => {
    try {
      console.log('Starting service worker registration process...');
      
      // Get existing registration
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      
      // Only unregister in production if there's an existing registration
      if (process.env.NODE_ENV === 'production' && existingRegistration) {
        console.log('Unregistering existing service worker for update...');
        await existingRegistration.unregister();
      }

      console.log('Registering new service worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New version available. Please refresh to update.');
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
        console.log('Service worker controller changed');
        window.location.reload();
      });

      console.log('ServiceWorker registration successful with scope:', registration.scope);
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  };

  // Register service worker immediately
  registerServiceWorker();
}

// Modify the global error handler to be more specific
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Handle specific error types
  if (event.error?.message?.includes('theme')) {
    console.log('Theme-related error detected, attempting recovery...');
    // Instead of immediate reload, try to recover theme state
    const root = document.getElementById('root');
    if (root) {
      // Force a theme re-initialization
      root.setAttribute('data-theme', 'dark');
      // Then reload
      setTimeout(() => window.location.reload(), 1000);
    }
  } else if (event.error?.message?.includes('call')) {
    console.log('Function call error detected, attempting recovery...');
    // For call-related errors, try clearing runtime cache
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        const runtimeCache = cacheNames.find(name => name.includes('runtime'));
        if (runtimeCache) {
          caches.delete(runtimeCache).then(() => {
            console.log('Cleared runtime cache, reloading...');
            window.location.reload();
          });
        }
      });
    }
  }
});

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