import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AppWrapper from './App';
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
import { DatabaseProvider } from './context/DatabaseContext';
import { InitializationProvider } from './context/InitializationContext';

// Optimize Material-UI icon imports
import BaseRefreshIcon from '@mui/icons-material/Refresh';
import BaseHomeIcon from '@mui/icons-material/Home';
import BaseSchoolIcon from '@mui/icons-material/School';
import BaseMenuBookIcon from '@mui/icons-material/MenuBook';
import BaseQuizIcon from '@mui/icons-material/Quiz';
import BaseEmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BaseHelpIcon from '@mui/icons-material/Help';
import BasePersonIcon from '@mui/icons-material/Person';
import BaseMovieIcon from '@mui/icons-material/Movie';
import BaseSportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BaseHistoryIcon from '@mui/icons-material/History';
import BaseRestaurantIcon from '@mui/icons-material/Restaurant';
import BaseTempleBuddhistIcon from '@mui/icons-material/TempleBuddhist';
import BasePsychologyIcon from '@mui/icons-material/Psychology';
import BaseMoodIcon from '@mui/icons-material/Mood';
import BaseStarIcon from '@mui/icons-material/Star';
import BaseTimelineIcon from '@mui/icons-material/Timeline';
import BaseSettingsIcon from '@mui/icons-material/Settings';
import BaseEditIcon from '@mui/icons-material/Edit';
import BaseBarChartIcon from '@mui/icons-material/BarChart';
import BaseTranslateIcon from '@mui/icons-material/Translate';
import BaseEmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import BasePublicIcon from '@mui/icons-material/Public';
import BasePlayArrowIcon from '@mui/icons-material/PlayArrow';
import BaseTrophyIcon from '@mui/icons-material/EmojiEvents';
import BaseNotificationsIcon from '@mui/icons-material/Notifications';
import BaseLanguageIcon from '@mui/icons-material/Language';
import BasePaletteIcon from '@mui/icons-material/Palette';
import BaseSecurityIcon from '@mui/icons-material/Security';
import BaseDeleteIcon from '@mui/icons-material/Delete';
import BaseSaveIcon from '@mui/icons-material/Save';
import BaseRestoreIcon from '@mui/icons-material/Restore';
import BaseDownloadIcon from '@mui/icons-material/Download';
import BaseUploadIcon from '@mui/icons-material/Upload';
import BaseVolumeUpIcon from '@mui/icons-material/VolumeUp';
import BaseTimerIcon from '@mui/icons-material/Timer';
import BaseSpeedIcon from '@mui/icons-material/Speed';
import BaseVisibilityIcon from '@mui/icons-material/Visibility';
import BaseKeyboardIcon from '@mui/icons-material/Keyboard';
import BaseMenuIcon from '@mui/icons-material/Menu';
import BaseBookIcon from '@mui/icons-material/Book';
import BaseWifiOffIcon from '@mui/icons-material/WifiOff';
import BaseWifiIcon from '@mui/icons-material/Wifi';
import BaseCloseIcon from '@mui/icons-material/Close';
import BaseLightbulbIcon from '@mui/icons-material/Lightbulb';
import BaseTrendingUpIcon from '@mui/icons-material/TrendingUp';
import BaseWarningIcon from '@mui/icons-material/Warning';
import BaseScheduleIcon from '@mui/icons-material/Schedule';
import BaseAutoGraphIcon from '@mui/icons-material/AutoGraph';
import BaseDarkModeIcon from '@mui/icons-material/DarkMode';
import BaseCloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BaseCloudUploadIcon from '@mui/icons-material/CloudUpload';
import BaseAccessibilityIcon from '@mui/icons-material/Accessibility';
import BaseExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BaseExpandLessIcon from '@mui/icons-material/ExpandLess';
import BaseCultureIcon from '@mui/icons-material/Public';
import BaseShintoIcon from '@mui/icons-material/TempleBuddhist';
import BaseMythologyIcon from '@mui/icons-material/Psychology';
import BaseChartIcon from '@mui/icons-material/BarChart';

// Create a wrapper component to enforce Outlined variant
const createOutlinedIcon = (Icon: React.ComponentType<any>) => {
  return (props: any) => <Icon {...props} variant="outlined" />;
};

// Create and export wrapped icons directly
export const RefreshIcon = createOutlinedIcon(BaseRefreshIcon);
export const HomeIcon = createOutlinedIcon(BaseHomeIcon);
export const SchoolIcon = createOutlinedIcon(BaseSchoolIcon);
export const MenuBookIcon = createOutlinedIcon(BaseMenuBookIcon);
export const QuizIcon = createOutlinedIcon(BaseQuizIcon);
export const EmojiEventsIcon = createOutlinedIcon(BaseEmojiEventsIcon);
export const HelpIcon = createOutlinedIcon(BaseHelpIcon);
export const PersonIcon = createOutlinedIcon(BasePersonIcon);
export const MovieIcon = createOutlinedIcon(BaseMovieIcon);
export const SportsEsportsIcon = createOutlinedIcon(BaseSportsEsportsIcon);
export const HistoryIcon = createOutlinedIcon(BaseHistoryIcon);
export const RestaurantIcon = createOutlinedIcon(BaseRestaurantIcon);
export const TempleBuddhistIcon = createOutlinedIcon(BaseTempleBuddhistIcon);
export const PsychologyIcon = createOutlinedIcon(BasePsychologyIcon);
export const MoodIcon = createOutlinedIcon(BaseMoodIcon);
export const StarIcon = createOutlinedIcon(BaseStarIcon);
export const TimelineIcon = createOutlinedIcon(BaseTimelineIcon);
export const SettingsIcon = createOutlinedIcon(BaseSettingsIcon);
export const EditIcon = createOutlinedIcon(BaseEditIcon);
export const BarChartIcon = createOutlinedIcon(BaseBarChartIcon);
export const TranslateIcon = createOutlinedIcon(BaseTranslateIcon);
export const EmojiEmotionsIcon = createOutlinedIcon(BaseEmojiEmotionsIcon);
export const PublicIcon = createOutlinedIcon(BasePublicIcon);
export const PlayArrowIcon = createOutlinedIcon(BasePlayArrowIcon);
export const TrophyIcon = createOutlinedIcon(BaseTrophyIcon);
export const NotificationsIcon = createOutlinedIcon(BaseNotificationsIcon);
export const LanguageIcon = createOutlinedIcon(BaseLanguageIcon);
export const PaletteIcon = createOutlinedIcon(BasePaletteIcon);
export const SecurityIcon = createOutlinedIcon(BaseSecurityIcon);
export const DeleteIcon = createOutlinedIcon(BaseDeleteIcon);
export const SaveIcon = createOutlinedIcon(BaseSaveIcon);
export const RestoreIcon = createOutlinedIcon(BaseRestoreIcon);
export const DownloadIcon = createOutlinedIcon(BaseDownloadIcon);
export const UploadIcon = createOutlinedIcon(BaseUploadIcon);
export const VolumeUpIcon = createOutlinedIcon(BaseVolumeUpIcon);
export const TimerIcon = createOutlinedIcon(BaseTimerIcon);
export const SpeedIcon = createOutlinedIcon(BaseSpeedIcon);
export const VisibilityIcon = createOutlinedIcon(BaseVisibilityIcon);
export const KeyboardIcon = createOutlinedIcon(BaseKeyboardIcon);
export const MenuIcon = createOutlinedIcon(BaseMenuIcon);
export const BookIcon = createOutlinedIcon(BaseBookIcon);
export const WifiOffIcon = createOutlinedIcon(BaseWifiOffIcon);
export const WifiIcon = createOutlinedIcon(BaseWifiIcon);
export const CloseIcon = createOutlinedIcon(BaseCloseIcon);
export const LightbulbIcon = createOutlinedIcon(BaseLightbulbIcon);
export const TrendingUpIcon = createOutlinedIcon(BaseTrendingUpIcon);
export const WarningIcon = createOutlinedIcon(BaseWarningIcon);
export const ScheduleIcon = createOutlinedIcon(BaseScheduleIcon);
export const AutoGraphIcon = createOutlinedIcon(BaseAutoGraphIcon);
export const DarkModeIcon = createOutlinedIcon(BaseDarkModeIcon);
export const CloudDownloadIcon = createOutlinedIcon(BaseCloudDownloadIcon);
export const CloudUploadIcon = createOutlinedIcon(BaseCloudUploadIcon);
export const AccessibilityIcon = createOutlinedIcon(BaseAccessibilityIcon);
export const ExpandMoreIcon = createOutlinedIcon(BaseExpandMoreIcon);
export const ExpandLessIcon = createOutlinedIcon(BaseExpandLessIcon);
export const CultureIcon = createOutlinedIcon(BaseCultureIcon);
export const ShintoIcon = createOutlinedIcon(BaseShintoIcon);
export const MythologyIcon = createOutlinedIcon(BaseMythologyIcon);
export const ChartIcon = createOutlinedIcon(BaseChartIcon);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  const registerServiceWorker = async () => {
    try {
      console.log('[SW] Starting service worker registration process...');
      
      // Get existing registration
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      
      // Check if we're in a state where we should abort registration
      if (document.readyState === 'unloaded' || document.readyState === 'unloading') {
        console.log('[SW] Document unloading, aborting registration');
        return null;
      }

      // Only unregister in production if there's an existing registration AND it's not active
      if (process.env.NODE_ENV === 'production' && existingRegistration && !existingRegistration.active) {
        try {
          console.log('[SW] Unregistering inactive service worker for update...');
          await existingRegistration.unregister();
        } catch (unregisterError) {
          console.warn('[SW] Failed to unregister existing worker:', unregisterError);
        }
      } else if (existingRegistration?.active) {
        console.log('[SW] Using existing active service worker');
        return existingRegistration;
      }

      // Register new service worker
      console.log('[SW] Registering new service worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // Wait for the service worker to be ready with a timeout
      try {
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
          )
        ]);
        console.log('[SW] Service worker ready');
      } catch (readyError) {
        console.warn('[SW] Service worker ready check failed:', readyError);
      }

      return registration;
    } catch (error) {
      console.error('[SW] ServiceWorker registration failed:', error);
      return null;
    }
  };

  // Register service worker immediately, but don't block app initialization
  registerServiceWorker().catch(console.error);
}

// Replace ReactDOM.render with createRoot
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <InitializationProvider>
        <AppWrapper />
      </InitializationProvider>
    </BrowserRouter>
  </React.StrictMode>
);

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