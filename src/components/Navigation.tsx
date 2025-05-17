import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const mainLinks = [
    { path: '/vocabulary', name: 'Vocabulary Quiz', shortName: 'Vocab Quiz' },
    { path: '/srs', name: 'Spaced Repetition', shortName: 'SRS' },
    { path: '/kana', name: 'Kana Learning', shortName: 'Kana' },
    { path: '/section2', name: 'Dictionary', shortName: 'Dict' },
    { path: '/writing-practice', name: 'Writing Practice', shortName: 'Write' },
    { path: '/section4', name: 'Kanji Quiz', shortName: 'Kanji' },
    { path: '/section5', name: 'Vocabulary Builder', shortName: 'Vocab' },
    { path: '/section6', name: 'Reading Practice', shortName: 'Read' },
    { path: '/section7', name: 'JLPT Preparation', shortName: 'JLPT' },
    { path: '/games', name: 'Interactive Games', shortName: 'Games' },
    { path: '/word-levels', name: 'Word Levels', shortName: 'Levels' },
  ];
  const extraLinks = [
    { path: '/anime', name: 'Anime & Manga Phrases', shortName: 'Anime' },
    { path: '/progress', name: 'Progress', shortName: 'Progress' },
    { path: '/settings', name: 'Settings', shortName: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navClasses = isDarkMode 
    ? 'bg-gray-800 text-gray-100 shadow-lg'
    : 'bg-white text-gray-800 shadow-md';

  const linkClasses = (isActive: boolean) => {
    const baseClasses = 'px-3 py-1.5 text-sm rounded-lg transition-colors duration-200';
    if (isDarkMode) {
      return `${baseClasses} ${
        isActive 
          ? 'bg-blue-900 text-blue-100' 
          : 'text-gray-300 hover:bg-gray-700'
      }`;
    }
    return `${baseClasses} ${
      isActive 
        ? 'bg-blue-100 text-blue-800' 
        : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  return (
    <nav className={`sticky top-0 z-50 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                JapVoc
              </span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-2">
                {mainLinks.map((section) => (
                  <Link
                    key={section.path}
                    to={section.path}
                    className={linkClasses(location.pathname === section.path)}
                    title={section.name}
                  >
                    {section.shortName}
                  </Link>
                ))}
                {extraLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={linkClasses(location.pathname === link.path)}
                    title={link.name}
                  >
                    {link.shortName}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <ThemeToggle />
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Open user menu</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
                      <Link
                        to="/settings"
                        className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      Sign up
                    </Link>
                  </div>
                  {/* Toggle bar under Sign up */}
                  <div className="w-full flex justify-center mt-2 text-sm">
                    <ThemeToggle />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainLinks.map((section) => (
              <Link
                key={section.path}
                to={section.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${linkClasses(location.pathname === section.path)}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {section.name}
              </Link>
            ))}
            {extraLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${linkClasses(location.pathname === link.path)}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {currentUser ? (
              <div className="space-y-1">
                <Link
                  to="/settings"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
                {/* Toggle bar under Sign up (mobile) */}
                <div className="w-full flex justify-center mt-2 text-sm">
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;