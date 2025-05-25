import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/vocabulary', label: 'Vocabulary' },
    { path: '/dictionary', label: 'Dictionary' },
    { path: '/writing', label: 'Writing' },
    { path: '/kanji', label: 'Kanji' },
    { path: '/romaji', label: 'Romaji' },
    { path: '/srs', label: 'SRS' },
    { path: '/games', label: 'Games' },
    { path: '/anime', label: 'Anime' },
    { path: '/progress', label: 'Progress' },
    { path: '/achievements', label: 'Achievements' },
    { path: '/word-levels', label: 'Levels' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <nav className={themeClasses.nav.background}>
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold ${themeClasses.text.primary} tracking-wider`}>
              JAPVOC
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2 flex-nowrap justify-end">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${isActive(path) ? themeClasses.nav.link.active : themeClasses.nav.link.default} text-xs px-2 py-1 whitespace-nowrap`}
              >
                {label}
              </Link>
            ))}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className={`${themeClasses.button.secondary} inline-flex items-center justify-center p-2 rounded-md`}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive(path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;