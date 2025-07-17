import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
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
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark via-dark-secondary to-dark-tertiary' 
        : 'bg-gradient-to-br from-light via-light-secondary to-light-tertiary'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className={`shadow-xl rounded-card p-8 flex flex-col items-center ${
          theme === 'dark' ? 'bg-dark-elevated border border-border-dark-light' : 'bg-white border border-border-light'
        }`}>
          <h2 className={`text-3xl font-extrabold mb-2 text-center ${
            theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'
          }`}>
            Sign in to your account
          </h2>
          <p className={`text-center mb-6 ${
            theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'
          }`}>
            Welcome back! Please enter your details to continue.
          </p>
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`rounded-nav p-4 mb-2 ${
                theme === 'dark' ? 'bg-japanese-red/10 border border-japanese-red/20' : 'bg-japanese-red/5 border border-japanese-red/20'
              }`}>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'
                }`}>{error}</div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'
                }`}>
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!!lockoutEndTime}
                  className={`appearance-none rounded-input relative block w-full px-3 py-2 border placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-japanese-red focus:border-japanese-red disabled:cursor-not-allowed transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-border-dark-light text-text-dark-primary bg-dark-elevated placeholder-gray-500 disabled:bg-dark-tertiary'
                      : 'border-border-light text-text-primary bg-white placeholder-gray-400 disabled:bg-light-tertiary'
                  }`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-secondary'
                }`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={!!lockoutEndTime}
                  className={`appearance-none rounded-input relative block w-full px-3 py-2 border placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-japanese-red focus:border-japanese-red disabled:cursor-not-allowed transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-border-dark-light text-text-dark-primary bg-dark-elevated placeholder-gray-500 disabled:bg-dark-tertiary'
                      : 'border-border-light text-text-primary bg-white placeholder-gray-400 disabled:bg-light-tertiary'
                  }`}
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-button text-white bg-japanese-red hover:bg-japanese-redLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-japanese-red disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-button hover:shadow-button-hover"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <Link to="/reset-password" className={`font-medium hover:opacity-80 transition-colors ${
                  theme === 'dark' ? 'text-japanese-red' : 'text-japanese-red'
                }`}>
                  Forgot your password?
                </Link>
              </div>
              <div className="text-sm">
                <Link to="/signup" className={`font-medium hover:opacity-80 transition-colors ${
                  theme === 'dark' ? 'text-japanese-blue' : 'text-japanese-blue'
                }`}>
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 