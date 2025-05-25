import { openDB } from 'idb';

// PWA utility functions
export class PWAUtils {
  private static instance: PWAUtils;
  private registration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {}

  static getInstance(): PWAUtils {
    if (!PWAUtils.instance) {
      PWAUtils.instance = new PWAUtils();
    }
    return PWAUtils.instance;
  }

  // Initialize PWA features
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service workers not supported');
      return;
    }

    try {
      // Register service worker first
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      this.registration = registration;
      console.log('[PWA] Service worker registered successfully');

      // Initialize other features in the background
      this.initializeFeatures().catch(error => {
        console.warn('[PWA] Background feature initialization failed:', error);
      });

    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      throw error;
    }
  }

  // Initialize features in the background
  private async initializeFeatures(): Promise<void> {
    if (!this.registration) return;

    try {
      // Try to initialize push notifications
      await this.initializePushNotifications().catch(error => {
        console.warn('[PWA] Push notifications initialization failed:', error);
      });

      // Try to initialize background sync
      await this.initializeBackgroundSync().catch(error => {
        console.warn('[PWA] Background sync initialization failed:', error);
      });

    } catch (error) {
      console.warn('[PWA] Feature initialization failed:', error);
    }
  }

  // Push Notification methods
  private async initializePushNotifications(): Promise<void> {
    if (!this.registration) return;

    try {
      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.log('[PWA] Push notifications not supported');
        return;
      }

      // Check permission without requesting it
      const permission = Notification.permission;
      if (permission !== 'granted') {
        console.log('[PWA] Notification permission not granted');
        return;
      }

      // Get push subscription
      this.pushSubscription = await this.registration.pushManager.getSubscription();
      
      // Subscribe if not already subscribed
      if (!this.pushSubscription) {
        try {
          const applicationServerKey = await this.getApplicationServerKey();
          this.pushSubscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });

          // Send subscription to server in the background
          this.sendSubscriptionToServer(this.pushSubscription).catch(error => {
            console.warn('[PWA] Failed to send subscription to server:', error);
          });
        } catch (error) {
          console.warn('[PWA] Push subscription failed:', error);
        }
      }
    } catch (error) {
      console.warn('[PWA] Push notifications initialization failed:', error);
    }
  }

  private async getApplicationServerKey(): Promise<ArrayBuffer> {
    // Fetch your VAPID public key from the server
    const response = await fetch('/api/push/vapid-key');
    const { publicKey } = await response.json();
    return this.urlBase64ToUint8Array(publicKey);
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Background Sync methods
  private async initializeBackgroundSync(): Promise<void> {
    if (!this.registration) return;

    try {
      // Register periodic sync
      if ('periodicSync' in this.registration) {
        await this.registration.periodicSync.register('update-vocabulary', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
      }
    } catch (error) {
      console.error('Failed to initialize background sync:', error);
    }
  }

  // Queue data for background sync
  async queueForSync(type: 'vocabulary' | 'progress' | 'settings', data: any): Promise<void> {
    if (!this.registration) return;

    try {
      const db = await this.getDB();
      const store = db.transaction(`pending${type.charAt(0).toUpperCase() + type.slice(1)}`, 'readwrite').objectStore(`pending${type.charAt(0).toUpperCase() + type.slice(1)}`);
      
      await store.add({
        data,
        timestamp: Date.now()
      });

      // Request sync
      await this.registration.sync.register(`sync-${type}`);
    } catch (error) {
      console.error(`Failed to queue ${type} for sync:`, error);
    }
  }

  // Schedule a study reminder
  async scheduleStudyReminder(delay: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.showNotification('Study Reminder', {
        body: 'Time to practice your Japanese vocabulary!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-96x96.png',
        tag: 'study-reminder',
        showTrigger: new TimestampTrigger(Date.now() + delay)
      });
    } catch (error) {
      console.error('Failed to schedule study reminder:', error);
    }
  }

  // Utility methods
  private async getDB() {
    return openDB('japvoc-sync', 1, {
      upgrade(db) {
        // Create object stores for different types of data
        if (!db.objectStoreNames.contains('pendingVocabulary')) {
          db.createObjectStore('pendingVocabulary', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('pendingProgress')) {
          db.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('pendingSettings')) {
          db.createObjectStore('pendingSettings', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pwaUtils = PWAUtils.getInstance(); 