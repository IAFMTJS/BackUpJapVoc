import React, { useEffect, useState } from 'react';
import { pwaUtils } from '../utils/pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(Notification.permission);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Initialize push notifications
        await pwaUtils.initializePushNotifications();
        // Schedule initial study reminder
        await pwaUtils.scheduleStudyReminder();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (isInstalled) return null;

  return (
    <div className="pwa-prompt">
      {showInstallButton && (
        <div className="pwa-install-prompt">
          <h3>Install Japanese Vocabulary App</h3>
          <p>Install this app on your device for quick and easy access when you're on the go.</p>
          <button 
            className="install-button"
            onClick={handleInstallClick}
          >
            Install App
          </button>
        </div>
      )}

      {notificationPermission !== 'granted' && (
        <div className="notification-prompt">
          <h3>Enable Study Reminders</h3>
          <p>Get notified about your daily study goals and progress.</p>
          <button 
            className="notification-button"
            onClick={handleNotificationPermission}
          >
            Enable Notifications
          </button>
        </div>
      )}

      <style>{`
        .pwa-prompt {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 300px;
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .pwa-install-prompt,
        .notification-prompt {
          margin-bottom: 16px;
        }

        .pwa-install-prompt h3,
        .notification-prompt h3 {
          margin: 0 0 8px 0;
          color: var(--text-color);
          font-size: 16px;
        }

        .pwa-install-prompt p,
        .notification-prompt p {
          margin: 0 0 12px 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .install-button,
        .notification-button {
          width: 100%;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: var(--primary-color);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .install-button:hover,
        .notification-button:hover {
          background: var(--primary-color-dark);
        }

        @media (prefers-color-scheme: dark) {
          .pwa-prompt {
            background: var(--background-color-dark);
            border-color: var(--border-color-dark);
          }
        }
      `}</style>
    </div>
  );
}; 