import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { getThemeClasses } = useTheme();
  const { currentUser } = useAuth();
  const themeClasses = getThemeClasses();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    // Main sections
    { path: '/', label: 'Home' },
    { path: '/learning', label: 'Learning' },
    { path: '/knowing', label: 'Knowing' },
    { path: '/srs', label: 'SRS' },
    { path: '/trivia', label: 'Trivia' },
    { path: '/faq', label: 'FAQ' },
    { path: '/profile', label: 'Profile' }
  ];

  // Learning submenu items
  const learningRoutes = [
    { path: '/learning/kana', label: 'Kana' },
    { path: '/learning/kanji', label: 'Kanji' },
    { path: '/learning/romaji', label: 'Romaji' },
    { path: '/learning/quiz', label: 'Quiz' }
  ];

  // Knowing submenu items
  const knowingItems = [
    { path: '/knowing/dictionary', label: 'Dictionary' },
    { path: '/knowing/mood', label: 'Mood & Emotions' },
    { path: '/knowing/culture', label: 'Culture & Rules' }
  ];

  // Trivia submenu items
  const triviaItems = [
    { path: '/trivia', label: 'Anime & Manga', tabIndex: 0 },
    { path: '/trivia', label: 'Japanese Games', tabIndex: 1 },
    { path: '/trivia', label: 'Shintoism', tabIndex: 2 },
    { path: '/trivia', label: 'Japanese History', tabIndex: 3 },
    { path: '/trivia', label: 'Japanese Cuisine', tabIndex: 4 },
    { path: '/trivia', label: 'Japanese Mythology', tabIndex: 5 }
  ];

  // FAQ submenu items
  const faqItems = [
    { path: '/faq/scoring', label: 'Scoring & Progress' },
    { path: '/faq/learning', label: 'Learning Guide' },
    { path: '/faq/features', label: 'Features & Tips' }
  ];

  const renderSubmenu = (items: typeof triviaItems, basePath: string) => {
    if (hoveredMenu !== basePath) return null;

    return (
      <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
        <div className="py-1" role="menu" aria-orientation="vertical">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              state={item.tabIndex !== undefined ? { activeTab: item.tabIndex } : undefined}
              className={`block px-4 py-2 text-sm ${
                isActive(item.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
              }`}
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <nav className={`${themeClasses.nav.background} sticky top-0 z-50 shadow-md`}>
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold ${themeClasses.text.primary} tracking-wider hover:opacity-80 transition-opacity`}>
              JAPVOC
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2 flex-nowrap justify-end">
            {navItems.map(({ path, label }) => (
              <div 
                key={path} 
                className="relative group"
                onMouseEnter={() => setHoveredMenu(path)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  to={path}
                  className={`${isActive(path) ? themeClasses.nav.link.active : themeClasses.nav.link.default} 
                    text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors duration-200`}
                >
                  {label}
                </Link>
                {path === '/learning' && renderSubmenu(learningRoutes, '/learning')}
                {path === '/knowing' && renderSubmenu(knowingItems, '/knowing')}
                {path === '/trivia' && renderSubmenu(triviaItems, '/trivia')}
                {path === '/faq' && renderSubmenu(faqItems, '/faq')}
              </div>
            ))}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${themeClasses.nav.link.default} inline-flex items-center justify-center p-2 rounded-md`}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label }) => (
              <React.Fragment key={path}>
                <div className="relative">
                  <Link
                    to={path}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
                    }`}
                    onClick={() => {
                      if (path !== '/learning' && path !== '/knowing' && path !== '/trivia' && path !== '/faq') {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                  >
                    {label}
                  </Link>
                  {(path === '/learning' || path === '/knowing' || path === '/trivia' || path === '/faq') && (
                    <div className="pl-4">
                      {(path === '/learning' ? learningRoutes : 
                        path === '/knowing' ? knowingItems : 
                        path === '/faq' ? faqItems :
                        triviaItems).map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          state={item.tabIndex !== undefined ? { activeTab: item.tabIndex } : undefined}
                          className={`block px-3 py-2 text-sm ${
                            isActive(item.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;