import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ThemeToggle from './ThemeToggle';
import AnimeMascots from './ui/AnimeMascots';
import HybridMascots from './ui/HybridMascots';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const mainNavItems = [
    { text: 'Home', path: '/', icon: '🏠' },
    { text: 'Learn', path: '/learn', icon: '📚' },
    { text: 'Dictionary', path: '/knowing/dictionary', icon: '📖' },
    { text: 'SRS', path: '/srs', icon: '🔄' },
    { text: 'Games', path: '/games', icon: '🎮' },
    { text: 'Progress', path: '/progress', icon: '📊' },
  ];

  const dropdownMenus = {
    learning: {
      label: 'Learning',
      icon: '🎓',
      items: [
        { text: 'Learning Center', path: '/learning', icon: '📚' },
        { text: 'Kana Practice', path: '/learning/kana', icon: 'あ' },
        { text: 'Kanji Dictionary', path: '/learning/kanji-dictionary', icon: '漢' },
        { text: 'Romaji', path: '/learning/romaji', icon: 'ロ' },
        { text: 'Quiz', path: '/learning/quiz', icon: '❓' },
        { text: 'Learning Path', path: '/learning-path', icon: '🛤️' },
      ]
    },
    culture: {
      label: 'Culture',
      icon: '⛩️',
      items: [
        { text: 'Culture & Rules', path: '/culture', icon: '🏯' },
        { text: 'Mood & Emotions', path: '/mood', icon: '😊' },
        { text: 'Trivia', path: '/trivia', icon: '🎯' },
        { text: 'Anime & Media', path: '/anime', icon: '🎌' },
      ]
    },
    user: {
      label: 'User',
      icon: '👤',
      items: [
        { text: 'Profile', path: '/profile', icon: '👤' },
        { text: 'Settings', path: '/settings', icon: '⚙️' },
        { text: 'Favorites', path: '/favorites', icon: '⭐' },
        { text: 'FAQ', path: '/faq/features', icon: '❓' },
      ]
    }
  };

  return (
    <nav className="nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Mascot */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 relative overflow-hidden rounded-full border-2 border-japanese-red shadow-lg">
                <HybridMascots
                  type="emotions"
                  size="small"
                  variant={location.pathname === '/' ? "waving" : location.pathname.includes('/learn') ? "confident" : location.pathname.includes('/games') ? "excited" : location.pathname.includes('/progress') ? "supportive" : "neutral"}
                  context="navigation"
                />
              </div>
            </div>
            <span className="text-xl font-bold text-text-primary dark:text-text-dark-primary">
              JapVoc
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-nav text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-japanese-red text-white shadow-button'
                    : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.text}
              </Link>
            ))}

            {/* Dropdown Menus */}
            {Object.entries(dropdownMenus).map(([key, menu]) => (
              <div key={key} className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === key ? null : key)}
                  className={`px-4 py-2 rounded-nav text-sm font-medium transition-all duration-300 flex items-center ${
                    dropdownOpen === key
                      ? 'bg-japanese-red text-white shadow-button'
                      : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary'
                  }`}
                >
                  <span className="mr-2">{menu.icon}</span>
                  {menu.label}
                  <span className="ml-2">▼</span>
                </button>

                {dropdownOpen === key && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-light-secondary dark:bg-dark-secondary rounded-card shadow-card dark:shadow-dark-card border border-border-light dark:border-border-dark-light">
                    <div className="py-1">
                      {menu.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-text-primary dark:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary transition-all duration-300"
                          onClick={() => setDropdownOpen(null)}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.text}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary hover:bg-light-tertiary dark:hover:bg-dark-tertiary transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-nav bg-light-secondary dark:bg-dark-secondary hover:bg-light-tertiary dark:hover:bg-dark-tertiary transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-japanese-red rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary hidden sm:block">
                    {currentUser.displayName || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-light-secondary dark:bg-dark-secondary rounded-card shadow-card dark:shadow-dark-card border border-border-light dark:border-border-dark-light">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-text-primary dark:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        👤 Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-text-primary dark:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-text-primary dark:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-japanese-red text-white rounded-button hover:bg-japanese-redLight shadow-button hover:shadow-button-hover transition-all duration-300"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-nav bg-light-secondary dark:bg-dark-secondary hover:bg-light-tertiary dark:hover:bg-dark-tertiary transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-light dark:border-border-dark-light">
            <div className="flex flex-col space-y-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-nav text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-japanese-red text-white shadow-button'
                      : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </Link>
              ))}
              
              {/* Mobile Dropdown Sections */}
              {Object.entries(dropdownMenus).map(([key, menu]) => (
                <div key={key} className="border-t border-border-light dark:border-border-dark-light pt-2">
                  <div className="px-4 py-2 text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                    {menu.icon} {menu.label}
                  </div>
                  {menu.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-6 py-2 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.text}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;