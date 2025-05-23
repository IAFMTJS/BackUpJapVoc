import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GuestBanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  if (currentUser) return null;

  return (
    <div className={`w-full bg-gradient-to-r from-sage-500 to-accent-wood text-ivory-100 py-3 px-4 flex items-center justify-center shadow-soft backdrop-blur-sm bg-opacity-95 z-40`}>
      <span className="text-sm sm:text-base font-medium max-w-4xl mx-auto text-center">
        <span className="mr-2">Sign up or log in to save your progress and access it from any device!</span>
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
      </span>
    </div>
  );
};

export default GuestBanner; 