import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // In development, we want to test the service worker
      // In production, we want to ensure proper caching
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        // In development, unregister any existing service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Unregistered service worker in development mode:', registration.scope);
        }
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('ServiceWorker registration successful with scope:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          console.log('No new service worker found');
          return;
        }
        
        console.log('Service worker update found!');

        newWorker.addEventListener('statechange', () => {
          console.log('Service worker state:', newWorker.state);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // In development, we want to activate immediately
            if (isDev) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            } else {
              console.log('New service worker installed, waiting for activation...');
            }
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated!');
        // Only reload in production to avoid development refresh loops
        if (!isDev) {
          window.location.reload();
        }
      });

    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}

/*
// Register service worker only in production mode
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', async () => {
    try {
      // Clear all caches first
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cleared all caches');

      // Unregister any existing service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Unregistered old service worker:', registration.scope);
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('ServiceWorker registration successful with scope:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          console.log('No new service worker found');
          return;
        }
        
        console.log('Service worker update found!');

        newWorker.addEventListener('statechange', () => {
          console.log('Service worker state:', newWorker.state);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker installed, waiting for activation...');
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated!');
        // Reload the page to ensure all resources are loaded correctly
        window.location.reload();
      });

    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
} else if ('serviceWorker' in navigator) {
  // In development mode, unregister any existing service workers
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Unregistered service worker in development mode:', registration.scope);
      }
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  // Unregister service worker in development mode
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
} 
*/ 