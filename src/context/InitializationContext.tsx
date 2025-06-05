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

// Define the initialization order
const INITIALIZATION_ORDER = [
  'DatabaseProvider',
  'DictionaryProvider',
  'AuthProvider',
  'ThemeProvider',
  'AppProvider',
  'SettingsProvider',
  'AccessibilityProvider',
  'WordProvider',
  'WordLevelProvider',
  'AchievementProvider',
  'ProgressProvider',
  'LearningProvider'
] as const;

type ProviderName = typeof INITIALIZATION_ORDER[number];

interface ProviderState {
  [key: string]: boolean;
}

export const InitializationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<InitState>(initializationCoordinator.getState());
  const [providerStates, setProviderStates] = useState<ProviderState>({});

  useEffect(() => {
    const unsubscribe = initializationCoordinator.subscribe(setState);
    return () => unsubscribe();
  }, []);

  const initializeProvider = async (providerName: ProviderName): Promise<void> => {
    return new Promise((resolve) => {
      setProviderStates(prev => ({ ...prev, [providerName]: true }));
      // Simulate provider initialization time
      setTimeout(() => {
        setProviderStates(prev => ({ ...prev, [providerName]: false }));
        resolve();
      }, 100);
    });
  };

  const initializeProviders = async () => {
    try {
      for (const provider of INITIALIZATION_ORDER) {
        await initializeProvider(provider);
      }
    } catch (error) {
      console.error('Provider initialization failed:', error);
      throw error;
    }
  };

  const retry = async () => {
    try {
      await initializationCoordinator.initialize();
      await initializeProviders();
    } catch (error) {
      console.error('Retry failed:', error);
      throw error;
    }
  };

  const abort = () => {
    initializationCoordinator.abort();
  };

  // Start initialization when the provider mounts
  useEffect(() => {
    const startInitialization = async () => {
      try {
        await initializationCoordinator.initialize();
        await initializeProviders();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    startInitialization();

    // Cleanup on unmount
    return () => {
      abort();
    };
  }, []);

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