import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import safeLocalStorage from '../utils/safeLocalStorage';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored login attempts and lockout time
    const storedAttempts = safeLocalStorage.getItem('loginAttempts');
    const storedLockoutTime = safeLocalStorage.getItem('lockoutEndTime');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }
    if (storedLockoutTime) {
      const lockoutTime = parseInt(storedLockoutTime, 10);
      if (lockoutTime > Date.now()) {
        setLockoutEndTime(lockoutTime);
      } else {
        // Clear expired lockout
        safeLocalStorage.removeItem('lockoutEndTime');
        safeLocalStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  const updateLoginAttempts = (attempts: number) => {
    setLoginAttempts(attempts);
    safeLocalStorage.setItem('loginAttempts', attempts.toString());
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      setLockoutEndTime(lockoutTime);
      safeLocalStorage.setItem('lockoutEndTime', lockoutTime.toString());
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      const remainingMinutes = Math.ceil((lockoutEndTime - Date.now()) / 60000);
      setError(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`);
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Reset login attempts on successful login
      safeLocalStorage.removeItem('loginAttempts');
      safeLocalStorage.removeItem('lockoutEndTime');
      setLoginAttempts(0);
      setLockoutEndTime(null);
      navigate('/');
    } catch (err: any) {
      const newAttempts = loginAttempts + 1;
      updateLoginAttempts(newAttempts);
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setError(`Too many failed attempts. Please try again in ${LOCKOUT_DURATION / 60000} minutes.`);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(`Invalid email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const remainingLockoutTime = lockoutEndTime ? Math.ceil((lockoutEndTime - Date.now()) / 60000) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-dark-elevated dark:bg-gray-800 shadow-xl rounded-card p-8 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-2 text-center">Sign in to your account</h2>
          <p className="text-text-muted dark:text-text-dark-muted dark:text-gray-400 text-center mb-6">Welcome back! Please enter your details to continue.</p>
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-2">
                <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!!lockoutEndTime}
                  className="appearance-none rounded-nav relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium dark:border-gray-700 placeholder-gray-400 text-text-primary dark:text-text-dark-primary dark:text-gray-100 bg-white dark:bg-dark-elevated dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={!!lockoutEndTime}
                  className="appearance-none rounded-nav relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium dark:border-gray-700 placeholder-gray-400 text-text-primary dark:text-text-dark-primary dark:text-gray-100 bg-white dark:bg-dark-elevated dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || !!lockoutEndTime}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-nav text-text-primary dark:text-text-dark-primary bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-text-primary dark:text-text-dark-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/reset-password" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">Forgot your password?</Link>
              </div>
              <div className="text-sm">
                <Link to="/signup" className="font-medium text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 transition-colors">Sign up</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 