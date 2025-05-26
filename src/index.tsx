import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { ThemeWrapper } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { WordLevelProvider } from './context/WordLevelContext';
import { SoundProvider } from './context/SoundContext';
import { AchievementProvider } from './context/AchievementContext';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ThemeWrapper>
          <ErrorBoundary>
            <AuthProvider>
              <AppProvider>
                <ProgressProvider>
                  <WordLevelProvider>
                    <AchievementProvider>
                      <SettingsProvider>
                        <SoundProvider>
                          <AccessibilityProvider>
                            <App />
                          </AccessibilityProvider>
                        </SoundProvider>
                      </SettingsProvider>
                    </AchievementProvider>
                  </WordLevelProvider>
                </ProgressProvider>
              </AppProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  // Delay service worker registration until after initial render and theme initialization
  const registerServiceWorker = async () => {
    try {
      // Wait for theme initialization
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Starting service worker registration process...');
      const clientId = await getClientId();
      
      // Always unregister existing service worker in production
      if (process.env.NODE_ENV === 'production') {
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          console.log('Unregistering existing service worker for update...');
          await existingRegistration.unregister();
        }

        try {
          // Clear caches before registering new service worker
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('Cleared all caches before service worker registration');
          }

          console.log('Registering new service worker...');
          const newRegistration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          // Handle service worker updates more gracefully
          newRegistration.addEventListener('updatefound', () => {
            const newWorker = newRegistration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Instead of immediate reload, show a notification to the user
                console.log('New version available. Please refresh to update.');
                // You could show a notification to the user here
              }
            });
          });

          console.log('ServiceWorker registration successful with scope:', newRegistration.scope);
        } catch (error) {
          console.error('ServiceWorker registration failed:', error);
          // Don't clear caches on registration failure to prevent data loss
        }
      }
    } catch (error) {
      console.error('Service worker initialization failed:', error);
    }
  };

  // Register service worker after window load
  window.addEventListener('load', registerServiceWorker);
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