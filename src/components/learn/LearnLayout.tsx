import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Trophy, User, Home, LogIn, CheckCircle } from 'lucide-react';
import { learnService } from '../../services/learnService';

interface LearnLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showProgress?: boolean;
}

export const LearnLayout: React.FC<LearnLayoutProps> = ({
  children,
  title = "Japanese Learning",
  showBackButton = true,
  showProgress = true
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showImportMessage, setShowImportMessage] = useState(false);

  useEffect(() => {
    // Check if there's guest progress and user just logged in
    if (currentUser) {
      const guestProgress = learnService.exportGuestProgress();
      if (guestProgress && Object.keys(guestProgress).length > 1) { // More than just level_1
        setShowImportMessage(true);
        // Hide message after 5 seconds
        setTimeout(() => setShowImportMessage(false), 5000);
      }
    }
  }, [currentUser]);

  const handleBack = () => {
    navigate('/learn');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white dark:bg-dark-elevated shadow-card dark:shadow-dark-card border-b border-border-light dark:border-border-dark dark:border-border-dark-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-nav hover:bg-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-text-muted dark:text-text-dark-muted" />
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary">{title}</h1>
                  {showProgress && (
                    <p className="text-sm text-text-muted dark:text-text-dark-muted">Learning Progress</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* User info or login prompt */}
              {currentUser ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-text-muted dark:text-text-dark-muted">
                    <User className="w-4 h-4" />
                    <span>{currentUser.email}</span>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleHome}
                      className="p-2 rounded-nav hover:bg-gray-100 transition-colors"
                      aria-label="Go to home"
                    >
                      <Home className="w-5 h-5 text-text-muted dark:text-text-dark-muted" />
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-text-dark-secondary bg-gray-100 rounded-nav hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-sm text-text-muted dark:text-text-dark-muted">
                    <User className="w-4 h-4" />
                    <span>Guest User</span>
                  </div>

                  {/* Navigation buttons for guest */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleHome}
                      className="p-2 rounded-nav hover:bg-gray-100 transition-colors"
                      aria-label="Go to home"
                    >
                      <Home className="w-5 h-5 text-text-muted dark:text-text-dark-muted" />
                    </button>
                    
                    <button
                      onClick={handleLogin}
                      className="px-4 py-2 text-sm font-medium text-text-primary dark:text-text-dark-primary bg-indigo-600 rounded-nav hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login reminder banner for guest users */}
      {!currentUser && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You're learning as a guest. <strong>Login to save your progress!</strong>
                </span>
              </div>
              <button
                onClick={handleLogin}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success message for imported progress */}
      {showImportMessage && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">
                  <strong>Welcome back!</strong> Your guest progress has been imported to your account.
                </span>
              </div>
              <button
                onClick={() => setShowImportMessage(false)}
                className="text-sm font-medium text-green-800 hover:text-green-900"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-elevated rounded-card shadow-lg overflow-hidden">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-elevated border-t border-border-light dark:border-border-dark dark:border-border-dark-dark-light mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-text-muted dark:text-text-dark-muted">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Japanese Learning Module</span>
            </div>
            <div>
              <span>© 2024 JapVoc Learning</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 