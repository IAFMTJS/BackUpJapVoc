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
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const mountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = process.env.NODE_ENV === 'production' ? 5 : 3;
  const INIT_TIMEOUT = process.env.NODE_ENV === 'production' ? 45000 : 15000; // 45 seconds in production

  useEffect(() => {
    console.log('[InitializationProvider] Setting up coordinator subscription');
    const unsubscribe = initializationCoordinator.subscribe((newState) => {
      console.log('[InitializationProvider] State update:', {
        newState,
        currentState: state,
        isInitializing,
        retryCount: retryCountRef.current,
        environment: process.env.NODE_ENV
      });
      
      // If we're stuck at the same progress for too long, increment retry count
      if (newState.progress.progress === state.progress.progress && 
          newState.progress.step === state.progress.step &&
          retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.warn(`[InitializationProvider] Progress stalled, retry ${retryCountRef.current}/${MAX_RETRIES}`);
        
        if (retryCountRef.current >= MAX_RETRIES) {
          console.error('[InitializationProvider] Max retries reached, forcing initialization complete');
          // In production, try to continue with partial initialization
          if (process.env.NODE_ENV === 'production') {
            setState(prev => ({
              ...prev,
              isInitialized: true,
              isInitializing: false,
              criticalDataLoaded: prev.criticalDataLoaded,
              progress: { 
                ...prev.progress, 
                step: 'Initialization partially complete (forced)', 
                progress: 100,
                details: 'Some features may be limited'
              }
            }));
          } else {
            setState(prev => ({
              ...prev,
              isInitialized: true,
              isInitializing: false,
              criticalDataLoaded: true,
              progress: { ...prev.progress, step: 'Initialization complete (forced)', progress: 100 }
            }));
          }
          setIsInitializing(false);
          return;
        }
      }
      
      setState(newState);
      
      if (newState.isInitialized) {
        console.log('[InitializationProvider] Coordinator initialized, completing initialization');
        setIsInitializing(false);
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
      }
    });
    
    // Add a timeout to prevent infinite loading
    initTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && isInitializing) {
        console.error('[InitializationProvider] Initialization timeout reached');
        // In production, try to continue with partial initialization
        if (process.env.NODE_ENV === 'production') {
          setInitError('Initialization taking longer than expected. Some features may be limited.');
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isInitializing: false,
            criticalDataLoaded: prev.criticalDataLoaded,
            progress: { 
              ...prev.progress, 
              step: 'Initialization partially complete (timeout)', 
              progress: 100,
              details: 'Some features may be limited'
            }
          }));
        } else {
          setInitError('Initialization timed out. Please refresh the page.');
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isInitializing: false,
            criticalDataLoaded: true,
            progress: { ...prev.progress, step: 'Initialization complete (timeout)', progress: 100 }
          }));
        }
        setIsInitializing(false);
      }
    }, INIT_TIMEOUT);

    return () => {
      console.log('[InitializationProvider] Cleanup');
      mountedRef.current = false;
      unsubscribe();
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  // Start initialization when the provider mounts
  useEffect(() => {
    console.log('[InitializationProvider] Starting initialization');
    
    const init = async () => {
      try {
        // Reset retry count on new initialization attempt
        retryCountRef.current = 0;
        await initializationCoordinator.initialize();
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('[InitializationProvider] Initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
        setIsInitializing(false);
        // Force initialization complete to prevent UI from being stuck
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isInitializing: false,
          criticalDataLoaded: true,
          progress: { ...prev.progress, step: 'Initialization complete (error)', progress: 100 }
        }));
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      initializationCoordinator.abort();
    };
  }, []);

  const retry = async () => {
    if (!mountedRef.current) return;
    try {
      setInitError(null);
      setIsInitializing(true);
      await initializationCoordinator.initialize();
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('[InitializationProvider] Retry failed:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to retry initialization');
      setIsInitializing(false);
    }
  };

  const abort = () => {
    if (!mountedRef.current) return;
    initializationCoordinator.abort();
    setInitError('Initialization aborted by user');
    setIsInitializing(false);
  };

  // Show loading state during initialization
  if (isInitializing || !state.isInitialized) {
    console.log('[InitializationProvider] Rendering loading state:', {
      isInitializing,
      isInitialized: state.isInitialized,
      progress: state.progress,
      environment: process.env.NODE_ENV
    });
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            {initError ? 'Initialization Notice' : 'Initializing application...'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {state.progress.step}
            {state.progress.details && ` - ${state.progress.details}`}
          </p>
          {initError && (
            <div className="mt-4">
              <p className="text-sm text-yellow-500 mb-4">{initError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          )}
          {state.progress.progress > 0 && !initError && (
            <div className="w-64 mx-auto mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500">
              <p>Initialization Status:</p>
              <p>Progress: {state.progress.progress}%</p>
              <p>Step: {state.progress.step}</p>
              {state.progress.details && (
                <p>Details: {state.progress.details}</p>
              )}
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