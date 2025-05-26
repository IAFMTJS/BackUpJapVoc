import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GuestBanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  if (currentUser) return null;

  return (
    <div className={`w-full bg-gradient-to-r from-sage-500 to-accent-wood text-ivory-100 py-4 px-4 flex flex-col items-center justify-center shadow-soft backdrop-blur-sm bg-opacity-95 z-40`}>
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <p className="text-sm sm:text-base font-medium">
          Welcome to JapVoc! All features are available to try right now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="flex items-center">
            <span className="mr-1">✨</span>
            <span>Track your progress locally</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center">
            <span className="mr-1">🎮</span>
            <span>Play all learning games</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center">
            <span className="mr-1">📚</span>
            <span>Access all learning materials</span>
          </span>
        </div>
        <div className="mt-2 text-sm sm:text-base">
          <span className="mr-2">Want to save your progress across devices?</span>
          <Link 
            to="/signup" 
            className="underline font-medium hover:text-ivory-50 transition-colors"
          >
            Sign up
          </Link>
          <span className="mx-2">or</span>
          <Link 
            to="/login" 
            className="underline font-medium hover:text-ivory-50 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestBanner; 