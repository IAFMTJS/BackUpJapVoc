import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializationCoordinator, InitState } from '../utils/initializationCoordinator';
import { DatabaseProvider } from './DatabaseContext';
import { DictionaryProvider } from './DictionaryContext';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { AppProvider } from './AppContext';
import { SettingsProvider } from './SettingsContext';
import { AccessibilityProvider } from './AccessibilityContext';
import { WordProvider } from './WordContext';
import { WordLevelProvider } from './WordLevelContext';
import { ProgressProvider } from './ProgressContext';
import { AchievementProvider } from './AchievementContext';
import { LearningProvider } from './LearningContext';

interface InitializationContextType {
  state: InitState;
  retry: () => Promise<void>;
  abort: () => void;
}

const InitializationContext = createContext<InitializationContextType | null>(null);

export const useInitialization = () => {
  const context = useContext(InitializationContext);
  if (!context) {
    throw new Error('useInitialization must be used within an InitializationProvider');
  }
  return context;
};

// Define the initialization order with proper dependencies
const INITIALIZATION_ORDER = [
  'DatabaseProvider',    // Must be first as other providers depend on it
  'ThemeProvider',       // Must be early as it affects UI rendering
  'AppProvider',         // Core app state
  'AuthProvider',        // Authentication state
  'SettingsProvider',    // User settings
  'AccessibilityProvider', // Accessibility features
  'DictionaryProvider',  // Dictionary data
  'WordProvider',        // Word management
  'WordLevelProvider',   // Word levels
  'AchievementProvider', // Achievements
  'ProgressProvider',    // Progress tracking
  'LearningProvider'     // Learning state
] as const;

type ProviderName = typeof INITIALIZATION_ORDER[number];

interface ProviderState {
  [key: string]: boolean;
}

export const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<InitState>(initializationCoordinator.getState());
  const [providerStates, setProviderStates] = useState<ProviderState>({});
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initializationCoordinator.subscribe(setState);
    return () => unsubscribe();
  }, []);

  const initializeProvider = async (providerName: ProviderName): Promise<void> => {
    try {
      setProviderStates(prev => ({ ...prev, [providerName]: true }));
      
      // Add a longer delay between provider initializations to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate provider initialization with proper error handling
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          setProviderStates(prev => ({ ...prev, [providerName]: false }));
          resolve(undefined);
        }, 200); // Increased timeout for more reliable initialization

        const errorHandler = (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        };

        try {
          // Provider initialization logic
          if (providerName === 'ThemeProvider') {
            // Ensure theme is fully initialized before proceeding
            setTimeout(resolve, 50);
          } else {
            resolve(undefined);
          }
        } catch (error) {
          errorHandler(error instanceof Error ? error : new Error(`Failed to initialize ${providerName}`));
        }
      });
    } catch (error) {
      console.error(`Failed to initialize ${providerName}:`, error);
      setInitError(error instanceof Error ? error.message : `Failed to initialize ${providerName}`);
      throw error;
    }
  };

  const initializeProviders = async () => {
    try {
      for (const provider of INITIALIZATION_ORDER) {
        await initializeProvider(provider);
      }
    } catch (error) {
      console.error('Provider initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize providers');
      throw error;
    }
  };

  const retry = async () => {
    try {
      setInitError(null);
      await initializationCoordinator.initialize();
      await initializeProviders();
    } catch (error) {
      console.error('Retry failed:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to retry initialization');
      throw error;
    }
  };

  const abort = () => {
    initializationCoordinator.abort();
    setInitError('Initialization aborted by user');
  };

  // Start initialization when the provider mounts
  useEffect(() => {
    let isMounted = true;

    const startInitialization = async () => {
      try {
        if (!isMounted) return;
        
        await initializationCoordinator.initialize();
        await initializeProviders();
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
      }
    };

    startInitialization();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      abort();
    };
  }, []);

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Initialization Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{initError}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <InitializationContext.Provider value={{ state, retry, abort }}>
      {children}
    </InitializationContext.Provider>
  );
};

// Create a wrapper component for providers that need initialization
export const withInitialization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  providerName: ProviderName
) => {
  return (props: P) => {
    const { state } = useInitialization();
    const isProviderReady = !state.isInitializing && state.isInitialized;

    if (!isProviderReady) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">{state.progress.step}</p>
            {state.progress.details && (
              <p className="text-sm text-gray-500 mt-2">{state.progress.details}</p>
            )}
            {state.error && (
              <p className="text-sm text-red-500 mt-2">{state.error}</p>
            )}
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Wrap providers with initialization
const DatabaseProviderWithInit = withInitialization(DatabaseProvider, 'DatabaseProvider');
const DictionaryProviderWithInit = withInitialization(DictionaryProvider, 'DictionaryProvider');
const AuthProviderWithInit = withInitialization(AuthProvider, 'AuthProvider');
const ThemeProviderWithInit = withInitialization(ThemeProvider, 'ThemeProvider');
const SettingsProviderWithInit = withInitialization(SettingsProvider, 'SettingsProvider');
const AccessibilityProviderWithInit = withInitialization(AccessibilityProvider, 'AccessibilityProvider');
const WordProviderWithInit = withInitialization(WordProvider, 'WordProvider');
const WordLevelProviderWithInit = withInitialization(WordLevelProvider, 'WordLevelProvider');
const ProgressProviderWithInit = withInitialization(ProgressProvider, 'ProgressProvider');
const AchievementProviderWithInit = withInitialization(AchievementProvider, 'AchievementProvider');
const LearningProviderWithInit = withInitialization(LearningProvider, 'LearningProvider');
const AppProviderWithInit = withInitialization(AppProvider, 'AppProvider'); 