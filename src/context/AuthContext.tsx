import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  auth, 
  db, 
  functions,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  UserCredential,
  Auth,
  Firestore,
  Functions
} from '../utils/firebase';
import type { AuthError } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { AuthContextType, AuthErrorResponse } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('[useAuth] Context is undefined, returning default values');
    // Return default context values instead of throwing an error
    return {
      currentUser: null,
      loading: false,
      error: null,
      isEmailVerified: false,
      sessionWarning: false,
      initError: null,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
      resetPassword: async () => {},
      updateUserPassword: async () => {},
      sendVerificationEmail: async () => {},
      updateUserProfile: async () => {},
      clearError: () => {},
      resetSessionTimer: () => {},
      forceClearAuth: async () => {}
    };
  }
  return context;
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthErrorResponse | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only set up the listener if it hasn't been set up yet
    if (!unsubscribeRef.current) {
      console.log('AuthProvider: Starting authentication state listener...');
      try {
        const unsubscribe = onAuthStateChanged(auth, 
          (user) => {
            console.log('AuthProvider: Auth state changed:', {
              hasUser: !!user,
              email: user?.email,
              emailVerified: user?.emailVerified,
              uid: user?.uid,
              timestamp: new Date().toISOString()
            });
            
            // Additional debugging
            if (user) {
              console.log('AuthProvider: User is signed in:', {
                email: user.email,
                uid: user.uid,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                photoURL: user.photoURL
              });
            } else {
              console.log('AuthProvider: No user signed in');
            }
            
            setCurrentUser(user);
            setIsEmailVerified(user?.emailVerified ?? false);
            setLoading(false);
            setInitError(null);
          },
          (error) => {
            console.error('AuthProvider: Firebase auth initialization error:', {
              error,
              code: error instanceof Error ? (error as AuthError).code : 'unknown',
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            });
            setInitError(error instanceof Error ? error.message : 'Unknown error occurred');
            setLoading(false);
          }
        );

        unsubscribeRef.current = unsubscribe;
        console.log('AuthProvider: Auth state listener set up successfully');
      } catch (error) {
        console.error('AuthProvider: Critical error setting up auth state listener:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        setInitError(error instanceof Error ? error.message : 'Failed to initialize authentication');
        setLoading(false);
      }
    }

    // Cleanup only on unmount
    return () => {
      if (unsubscribeRef.current) {
        console.log('AuthProvider: Cleaning up auth state listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // Empty dependency array since we only want to set up once

  const handleError = (error: unknown): never => {
    if (error instanceof Error) {
      const errorResponse: AuthErrorResponse = {
        code: error instanceof AuthError ? error.code : 'unknown',
        message: error.message,
        name: error.name
      };
      setError(errorResponse);
      throw error;
    }
    const defaultError: AuthErrorResponse = {
      code: 'unknown',
      message: 'An unknown error occurred',
      name: 'Error'
    };
    setError(defaultError);
    throw new Error(defaultError.message);
  };

  const clearError = () => setError(null);

  const resetSessionTimer = () => {
    setSessionWarning(false);
    // Additional session management logic can be added here
  };

  const login = async (email: string, password: string) => {
    try {
      clearError();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      clearError();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      // Send email verification
      await sendEmailVerification(user);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const logout = async () => {
    try {
      clearError();
      console.log('AuthProvider: Attempting to sign out user...');
      await firebaseSignOut(auth);
      console.log('AuthProvider: User signed out successfully');
    } catch (error: unknown) {
      console.error('AuthProvider: Error during sign out:', error);
      handleError(error);
    }
  };

  // Force clear auth state (for debugging)
  const forceClearAuth = async () => {
    try {
      console.log('AuthProvider: Force clearing auth state...');
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setIsEmailVerified(false);
      console.log('AuthProvider: Auth state cleared successfully');
    } catch (error: unknown) {
      console.error('AuthProvider: Error force clearing auth state:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      clearError();
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const updateUserPassword = async (_actionCode: string, newPassword: string) => {
    try {
      clearError();
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      await updatePassword(currentUser, newPassword);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      clearError();
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      await sendEmailVerification(currentUser);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; email?: string }) => {
    try {
      clearError();
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Update profile in Firebase Auth
      if (updates.displayName) {
        await updateProfile(currentUser, { displayName: updates.displayName });
      }

      // Update email if provided
      if (updates.email && updates.email !== currentUser.email) {
        await updateEmail(currentUser, updates.email);
      }

      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Update local state
      setCurrentUser({ ...currentUser, ...updates });
    } catch (error: unknown) {
      handleError(error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    sendVerificationEmail,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    isEmailVerified,
    sessionWarning,
    resetSessionTimer,
    error,
    clearError,
    forceClearAuth
  };

  if (loading) {
    console.log('AuthProvider: Rendering loading screen');
    return <LoadingScreen />;
  }

  if (initError) {
    console.error('AuthProvider: Rendering error screen due to initialization error:', initError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Initialization Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{initError}</p>
          <button 
            onClick={() => {
              console.log('AuthProvider: Retry button clicked');
              window.location.reload();
            }} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Rendering children with auth context');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 