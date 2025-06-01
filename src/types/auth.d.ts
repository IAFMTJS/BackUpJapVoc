import type { User } from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

// Custom error types for better error handling
export type AuthErrorResponse = Pick<FirebaseError, 'code' | 'message' | 'name'>;

// Session management types
export interface SessionState {
  isActive: boolean;
  lastActivity: number;
  warningShown: boolean;
}

// User profile types
export interface UserProfile {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  lastLoginAt: number;
}

// Auth state types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthErrorResponse | null;
  session: SessionState;
}

// Auth context types
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (actionCode: string, newPassword: string) => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; email?: string }) => Promise<void>;
  isEmailVerified: boolean;
  sessionWarning: boolean;
  resetSessionTimer: () => void;
  error: AuthErrorResponse | null;
  clearError: () => void;
}

// Form input types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordValidationResult extends ValidationResult {
  score: number;
  feedback: string[];
}

// Rate limiting types
export interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

// Constants
export const AUTH_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  MAX_RESET_ATTEMPTS: 3,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RESET_COOLDOWN: 60 * 60 * 1000, // 1 hour
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
} as const; 