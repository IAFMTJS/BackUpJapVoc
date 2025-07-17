import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { isValidEmail } from '../utils/security';
import safeLocalStorage from '../utils/safeLocalStorage';

const MAX_RESET_ATTEMPTS = 3;
const RESET_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetAttempts, setResetAttempts] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const { resetPassword } = useAuth();

  useEffect(() => {
    // Check for stored reset attempts and cooldown time
    const storedAttempts = safeLocalStorage.getItem('resetAttempts');
    const storedCooldownTime = safeLocalStorage.getItem('resetCooldownTime');
    
    if (storedAttempts) {
      setResetAttempts(parseInt(storedAttempts, 10));
    }
    if (storedCooldownTime) {
      const cooldownTime = parseInt(storedCooldownTime, 10);
      if (cooldownTime > Date.now()) {
        setCooldownEndTime(cooldownTime);
      } else {
        // Clear expired cooldown
        safeLocalStorage.removeItem('resetCooldownTime');
        safeLocalStorage.removeItem('resetAttempts');
      }
    }
  }, []);

  const updateResetAttempts = (attempts: number) => {
    setResetAttempts(attempts);
    safeLocalStorage.setItem('resetAttempts', attempts.toString());
    
    if (attempts >= MAX_RESET_ATTEMPTS) {
      const cooldownTime = Date.now() + RESET_COOLDOWN;
      setCooldownEndTime(cooldownTime);
      safeLocalStorage.setItem('resetCooldownTime', cooldownTime.toString());
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (cooldownEndTime && Date.now() < cooldownEndTime) {
      const remainingMinutes = Math.ceil((cooldownEndTime - Date.now()) / 60000);
      setError(`Too many reset attempts. Please try again in ${remainingMinutes} minutes.`);
      return;
    }

    if (!isValidEmail(email)) {
      return setError('Please enter a valid email address');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
      
      // Update reset attempts
      const newAttempts = resetAttempts + 1;
      updateResetAttempts(newAttempts);
      
      if (newAttempts >= MAX_RESET_ATTEMPTS) {
        setError(`You've reached the maximum number of reset attempts. Please try again in ${RESET_COOLDOWN / 60000} minutes.`);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many reset attempts. Please try again later.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const remainingCooldownTime = cooldownEndTime ? Math.ceil((cooldownEndTime - Date.now()) / 60000) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary dark:text-text-dark-primary">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted dark:text-text-dark-muted">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          {resetAttempts > 0 && (
            <p className="mt-2 text-center text-sm text-yellow-600">
              {MAX_RESET_ATTEMPTS - resetAttempts} reset attempts remaining
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}
          {cooldownEndTime && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="text-sm text-yellow-700">
                Too many reset attempts. Please try again in {remainingCooldownTime} minutes.
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={!!cooldownEndTime}
              className="appearance-none rounded relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium placeholder-gray-500 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!cooldownEndTime}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-text-primary dark:text-text-dark-primary bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 