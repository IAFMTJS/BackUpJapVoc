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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeWrapper>
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
      </ThemeWrapper>
    </ThemeProvider>
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  // Force unregister any existing service workers first
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Unregistered existing service worker:', registration.scope);
    }
  });

  // Delay service worker registration until after initial render
  setTimeout(() => {
    window.addEventListener('load', async () => {
      try {
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
            console.log('Registering new service worker...');
            const newRegistration = await navigator.serviceWorker.register('/service-worker.js', {
              scope: '/',
              updateViaCache: 'none'
            });

            // Force update check
            if (newRegistration.active) {
              console.log('Checking for updates...');
              await newRegistration.update();
            }

            // Add message port error handling with retry
            navigator.serviceWorker.addEventListener('messageerror', (event) => {
              console.warn('Service worker message error:', event);
              if (event.data?.type === 'PORT_CLOSED') {
                console.log('Port closed, attempting reload...');
                // Add a small delay before reloading
                setTimeout(() => {
                  if (!document.hidden) {
                    console.log('Reloading page...');
                    window.location.reload();
                  }
                }, 1000);
              }
            });

            // Handle service worker messages
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (!event.data) return;
              console.log('Service worker message:', event.data);
              
              switch (event.data.type) {
                case 'ERROR':
                  console.error('Service worker error:', event.data.error);
                  break;
                case 'CACHE_UPDATED':
                  console.log('Cache updated:', event.data.payload);
                  // Force reload after cache update
                  window.location.reload();
                  break;
                case 'UPDATE_AVAILABLE':
                  console.log('Update available, reloading...');
                  window.location.reload();
                  break;
              }
            });

            // Handle updates
            newRegistration.addEventListener('updatefound', () => {
              console.log('Update found, installing new service worker...');
              const newWorker = newRegistration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                console.log('Service worker state changed:', newWorker.state);
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed, reloading...');
                  window.location.reload();
                }
              });
            });

            // Handle controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('Service worker controller changed, reloading...');
              window.location.reload();
            });

            console.log('ServiceWorker registration successful with scope:', newRegistration.scope);
          } catch (error) {
            console.error('ServiceWorker registration failed:', error);
            // Clear any cached data that might be causing issues
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                  caches.delete(cacheName);
                  console.log('Cleared cache:', cacheName);
                });
              });
            }
          }
        }
      } catch (error) {
        console.error('Service worker cleanup failed:', error);
      }
    });
  }, 2000); // Delay service worker registration by 2 seconds
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

// Add a global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // If we get a theme-related error, try clearing caches and reloading
  if (event.error?.message?.includes('theme')) {
    clearCachesAndReload();
  }
});

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