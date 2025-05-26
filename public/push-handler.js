// Push notification event handler
self.addEventListener('push', async (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, data: notificationData, tag, requireInteraction } = data;

    // Get notification preferences from IndexedDB
    const preferences = await getNotificationPreferences();

    // Check if this type of notification is enabled in preferences
    if (!preferences[notificationData.type]) {
      console.log(`Notification type ${notificationData.type} is disabled in preferences`);
      return;
    }

    const options = {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/badge-96x96.png',
      data: notificationData,
      tag,
      requireInteraction: requireInteraction || false,
      vibrate: [100, 50, 100],
      actions: notificationData.actions || [],
      timestamp: Date.now(),
      renotify: true,
      silent: false
    };

    // Add custom styling based on notification type
    switch (notificationData.type) {
      case 'achievement':
        options.icon = '/icons/achievement-192x192.png';
        options.vibrate = [200, 100, 200];
        break;
      case 'dailyReminder':
        options.icon = '/icons/reminder-192x192.png';
        options.requireInteraction = true;
        break;
      case 'studyStreak':
        options.icon = '/icons/streak-192x192.png';
        options.vibrate = [100, 50, 100, 50, 100];
        break;
      case 'newContent':
        options.icon = '/icons/new-content-192x192.png';
        options.requireInteraction = true;
        break;
      case 'progressUpdate':
        options.icon = '/icons/progress-192x192.png';
        break;
    }

    await self.registration.showNotification(title, options);
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = '/';

  // Handle different notification types
  switch (notificationData.type) {
    case 'achievement':
      url = '/achievements';
      break;
    case 'dailyReminder':
      url = '/srs';
      break;
    case 'studyStreak':
      url = '/progress';
      break;
    case 'newContent':
      url = notificationData.contentUrl || '/vocabulary';
      break;
    case 'progressUpdate':
      url = '/progress';
      break;
  }

  // Handle custom actions
  if (event.action) {
    const action = notificationData.actions?.find(a => a.action === event.action);
    if (action?.url) {
      url = action.url;
    }
  }

  // Focus or open the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Get notification preferences from IndexedDB
async function getNotificationPreferences() {
  return new Promise((resolve) => {
    const request = indexedDB.open('JapVocDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get('notificationPreferences');

      getRequest.onsuccess = () => {
        const preferences = getRequest.result || {
          achievements: true,
          dailyReminders: true,
          studyStreaks: true,
          newContent: true,
          progressUpdates: true
        };
        resolve(preferences);
      };

      getRequest.onerror = () => {
        console.error('Error getting notification preferences');
        resolve({
          achievements: true,
          dailyReminders: true,
          studyStreaks: true,
          newContent: true,
          progressUpdates: true
        });
      };
    };

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      resolve({
        achievements: true,
        dailyReminders: true,
        studyStreaks: true,
        newContent: true,
        progressUpdates: true
      });
    };
  });
}

// Handle background sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Sync notifications with server
async function syncNotifications() {
  try {
    const registration = await self.registration;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) return;

    // Send subscription to server
    await fetch('/api/push/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        lastSync: await getLastSyncTime()
      })
    });

    // Update last sync time
    await updateLastSyncTime();
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Get last sync time from IndexedDB
async function getLastSyncTime() {
  return new Promise((resolve) => {
    const request = indexedDB.open('JapVocDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get('lastNotificationSync');

      getRequest.onsuccess = () => {
        resolve(getRequest.result || 0);
      };

      getRequest.onerror = () => {
        resolve(0);
      };
    };

    request.onerror = () => {
      resolve(0);
    };
  });
}

// Update last sync time in IndexedDB
async function updateLastSyncTime() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JapVocDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const putRequest = store.put(Date.now(), 'lastNotificationSync');

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
} 