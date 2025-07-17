import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
};

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
}

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordErrors(validatePassword(newPassword));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    if (passwordErrors.length > 0) {
      return setError('Please fix password requirements');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-dark-elevated dark:bg-gray-800 shadow-xl rounded-card p-8 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-2 text-center">Create your account</h2>
          <p className="text-text-muted dark:text-text-dark-muted dark:text-gray-400 text-center mb-6">Sign up to start your Japanese learning journey!</p>
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
                  className="appearance-none rounded-nav relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium dark:border-gray-700 placeholder-gray-400 text-text-primary dark:text-text-dark-primary dark:text-gray-100 bg-white dark:bg-dark-elevated dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-nav relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium dark:border-gray-700 placeholder-gray-400 text-text-primary dark:text-text-dark-primary dark:text-gray-100 bg-white dark:bg-dark-elevated dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                {passwordErrors.length > 0 && (
                  <ul className="mt-2 text-xs text-red-600 dark:text-red-300 list-disc list-inside">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="password-confirm" className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary">Confirm Password</label>
                <input
                  id="password-confirm"
                  name="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-nav relative block w-full px-3 py-2 border border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium dark:border-gray-700 placeholder-gray-400 text-text-primary dark:text-text-dark-primary dark:text-gray-100 bg-white dark:bg-dark-elevated dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirm password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-nav text-text-primary dark:text-text-dark-primary bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-text-primary dark:text-text-dark-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">Already have an account?</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 