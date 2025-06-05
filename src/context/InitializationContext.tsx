import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  [key: string]: string | null;
}

export const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<InitState>(initializationCoordinator.getState());
  const [providerStates, setProviderStates] = useState<ProviderState>({});
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    const unsubscribe = initializationCoordinator.subscribe(setState);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const initializeProvider = async (providerName: ProviderName): Promise<void> => {
    if (!mountedRef.current) return;

    try {
      setProviderStates(prev => ({ ...prev, [providerName]: 'initializing' }));
      
      // Add a longer delay between provider initializations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Special handling for critical providers
      if (providerName === 'DatabaseProvider') {
        // Ensure database is fully initialized
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (providerName === 'ThemeProvider') {
        // Ensure theme is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulate provider initialization with proper error handling
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!mountedRef.current) return;
          setProviderStates(prev => ({ ...prev, [providerName]: 'ready' }));
          resolve(undefined);
        }, 300); // Increased timeout for more reliable initialization

        const errorHandler = (error: Error) => {
          clearTimeout(timeout);
          if (!mountedRef.current) return;
          setProviderStates(prev => ({ ...prev, [providerName]: 'error' }));
          reject(error);
        };

        try {
          // Provider initialization logic
          resolve(undefined);
        } catch (error) {
          errorHandler(error instanceof Error ? error : new Error(`Failed to initialize ${providerName}`));
        }
      });
    } catch (error) {
      if (!mountedRef.current) return;
      console.error(`Failed to initialize ${providerName}:`, error);
      throw error;
    }
  };

  const initializeProviders = async () => {
    if (!mountedRef.current) return;

    try {
      setIsInitializing(true);
      setInitError(null);

      // Initialize providers sequentially
      for (const provider of INITIALIZATION_ORDER) {
        if (!mountedRef.current) return;
        await initializeProvider(provider);
      }

      if (mountedRef.current) {
        setIsInitializing(false);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Provider initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize providers');
      setIsInitializing(false);
      throw error;
    }
  };

  const retry = async () => {
    if (!mountedRef.current) return;
    try {
      setInitError(null);
      await initializationCoordinator.initialize();
      await initializeProviders();
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Retry failed:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to retry initialization');
      throw error;
    }
  };

  const abort = () => {
    if (!mountedRef.current) return;
    initializationCoordinator.abort();
    setInitError('Initialization aborted by user');
    setIsInitializing(false);
  };

  // Start initialization when the provider mounts
  useEffect(() => {
    initializeProviders().catch(error => {
      if (!mountedRef.current) return;
      console.error('Initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
    });

    return () => {
      mountedRef.current = false;
      abort();
    };
  }, []);

  // Show loading state during initialization
  if (isInitializing || !state.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Initializing application...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {state.progress.step}
            {state.progress.details && ` - ${state.progress.details}`}
          </p>
          {state.progress.progress > 0 && (
            <div className="w-64 mx-auto mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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