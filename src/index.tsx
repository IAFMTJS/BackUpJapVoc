import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Store the current client ID for cleanup
      const clientId = await getClientId();
      
      // Always unregister service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        // Notify the service worker before unregistering
        try {
          const activeWorker = registration.active;
          if (activeWorker) {
            activeWorker.postMessage({ type: 'CLIENT_UNLOADING', clientId });
            // Give the service worker time to handle the message
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn('Failed to notify service worker before unregistering:', error);
        }
        
        await registration.unregister();
        console.log('Unregistered service worker:', registration.scope);
      }

      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cleared all caches');

      if (process.env.NODE_ENV === 'production') {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          // Add message port error handling
          navigator.serviceWorker.addEventListener('messageerror', (event) => {
            console.warn('Service worker message error:', event);
            if (event.data?.type === 'PORT_CLOSED') {
              // Only reload if we're not already unloading
              if (!document.hidden) {
                window.location.reload();
              }
            }
          });

          // Handle service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (!event.data) return;
            
            switch (event.data.type) {
              case 'ERROR':
                console.error('Service worker error:', event.data.error);
                break;
              case 'CACHE_UPDATED':
                console.log('Cache updated:', event.data.payload);
                break;
            }
          });

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update prompt
                if (confirm('New version available! Would you like to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            });
          });

          // Handle page unload
          window.addEventListener('beforeunload', async () => {
            try {
              const activeWorker = registration.active;
              if (activeWorker) {
                activeWorker.postMessage({ type: 'CLIENT_UNLOADING', clientId });
                // Give the service worker time to handle the message
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (error) {
              console.warn('Failed to notify service worker before unload:', error);
            }
          });

          console.log('ServiceWorker registration successful with scope:', registration.scope);
        } catch (error) {
          console.error('ServiceWorker registration failed:', error);
        }
      }
    } catch (error) {
      console.error('Service worker cleanup failed:', error);
    }
  });
}

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