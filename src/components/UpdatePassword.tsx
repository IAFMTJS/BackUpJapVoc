import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPasswordStrength } from '../utils/security';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUserPassword } = useAuth();

  // Get the action code from the URL
  const actionCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!actionCode) {
      setError('Invalid password reset link');
    }
  }, [actionCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const { score, feedback } = checkPasswordStrength(password);
    if (score < 3) {
      return setError(feedback.join(' '));
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await updateUserPassword(actionCode!, password);
      setMessage('Password updated successfully');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/expired-action-code') {
        setError('Password reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('Invalid password reset link. Please request a new one.');
      } else {
        setError('Failed to update password. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!actionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">Invalid password reset link</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary dark:text-text-dark-primary">
            Update your password
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted dark:text-text-dark-muted">
            Please enter your new password
          </p>
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
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium placeholder-gray-500 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium placeholder-gray-500 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-text-primary dark:text-text-dark-primary bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 