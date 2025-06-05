import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import ProfileToggle from './navigation/ProfileToggle';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  SchoolIcon,
  MenuBookIcon,
  QuizIcon,
  EmojiEventsIcon,
  HelpIcon,
  PersonIcon,
  MovieIcon,
  SportsEsportsIcon,
  HistoryIcon,
  RestaurantIcon,
  ShintoIcon,
  MythologyIcon,
  MoodIcon,
  CultureIcon,
  StarIcon,
  TimelineIcon,
  TrophyIcon,
  EditIcon,
  SettingsIcon,
  ChartIcon,
  ExpandMoreIcon,
  ExpandLessIcon
} from '../index';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { getThemeClasses } = useTheme();
  const { currentUser } = useAuth();
  const themeClasses = getThemeClasses();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  // Main navigation items with their submenus
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: <HomeIcon fontSize="small" />,
      submenu: null
    },
    {
      path: '/knowing',
      label: 'Knowing Center',
      icon: <SchoolIcon fontSize="small" />,
      submenu: [
        { path: '/knowing/dictionary', label: 'Dictionary', icon: <MenuBookIcon fontSize="small" /> },
        { path: '/knowing/kanji-dictionary', label: 'Kanji Dictionary', icon: <MenuBookIcon fontSize="small" /> },
        { path: '/knowing/mood', label: 'Mood & Emotions', icon: <MoodIcon fontSize="small" /> },
        { path: '/knowing/culture', label: 'Culture & Rules', icon: <CultureIcon fontSize="small" /> },
        { path: '/knowing/favorites', label: 'Favorites', icon: <StarIcon fontSize="small" /> }
      ]
    },
    {
      path: '/learning',
      label: 'Learning',
      icon: <MenuBookIcon fontSize="small" />,
      submenu: [
        { path: '/learning/kana', label: 'Kana Practice', icon: <MenuBookIcon fontSize="small" /> },
        { path: '/learning/kanji-dictionary', label: 'Kanji Dictionary', icon: <MenuBookIcon fontSize="small" /> },
        { path: '/learning/writing', label: 'Writing Practice', icon: <MenuBookIcon fontSize="small" /> },
        { path: '/learning/quiz', label: 'Quiz Mode', icon: <QuizIcon fontSize="small" /> }
      ]
    },
    {
      path: '/srs',
      label: 'SRS',
      icon: <QuizIcon fontSize="small" />,
      submenu: [
        { path: '/srs/review', label: 'Review', icon: <MenuBookIcon fontSize="small" /> },
        { path: '/srs/stats', label: 'Statistics', icon: <ChartIcon fontSize="small" /> },
        { path: '/srs/settings', label: 'SRS Settings', icon: <SettingsIcon fontSize="small" /> }
      ]
    },
    {
      path: '/games',
      label: 'Games',
      icon: <SportsEsportsIcon fontSize="small" />,
      submenu: [
        { path: '/games/memory', label: 'Memory Game', icon: <SportsEsportsIcon fontSize="small" /> },
        { path: '/games/quiz', label: 'Quiz Game', icon: <QuizIcon fontSize="small" /> },
        { path: '/games/typing', label: 'Typing Practice', icon: <MenuBookIcon fontSize="small" /> }
      ]
    },
    {
      path: '/trivia',
      label: 'Trivia',
      icon: <EmojiEventsIcon fontSize="small" />,
      submenu: [
        { 
          path: '/trivia/anime', 
          label: 'Anime & Manga', 
          icon: <MovieIcon fontSize="small" />,
          state: { activeTopic: 'Anime & Manga' }
        },
        { 
          path: '/trivia/games', 
          label: 'Japanese Games', 
          icon: <SportsEsportsIcon fontSize="small" />,
          state: { activeTopic: 'Japanese Games' }
        },
        { 
          path: '/trivia/shinto', 
          label: 'Shintoism', 
          icon: <ShintoIcon fontSize="small" />,
          state: { activeTopic: 'Shintoism' }
        },
        { 
          path: '/trivia/history', 
          label: 'Japanese History', 
          icon: <HistoryIcon fontSize="small" />,
          state: { activeTopic: 'Japanese History' }
        },
        { 
          path: '/trivia/cuisine', 
          label: 'Japanese Cuisine', 
          icon: <RestaurantIcon fontSize="small" />,
          state: { activeTopic: 'Japanese Cuisine' }
        },
        { 
          path: '/trivia/mythology', 
          label: 'Japanese Mythology', 
          icon: <MythologyIcon fontSize="small" />,
          state: { activeTopic: 'Japanese Mythology' }
        }
      ]
    },
    {
      path: '/progress',
      label: 'Progress',
      icon: <TimelineIcon fontSize="small" />,
      submenu: [
        { path: '/progress/overview', label: 'Overview', icon: <ChartIcon fontSize="small" /> },
        { path: '/progress/achievements', label: 'Achievements', icon: <TrophyIcon fontSize="small" /> },
        { path: '/progress/goals', label: 'Learning Goals', icon: <StarIcon fontSize="small" /> },
        { path: '/progress/stats', label: 'Statistics', icon: <ChartIcon fontSize="small" /> }
      ]
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <PersonIcon fontSize="small" />,
      submenu: [
        { path: '/profile', label: 'View Profile', icon: <PersonIcon fontSize="small" /> },
        { path: '/profile/edit', label: 'Edit Profile', icon: <EditIcon fontSize="small" /> },
        { path: '/profile/settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> }
      ]
    }
  ];

  const toggleSubmenu = (path: string) => {
    setExpandedMenu(expandedMenu === path ? null : path);
  };

  const renderNavItem = (item: typeof navItems[0]) => {
    const isExpanded = expandedMenu === item.path;
    const isHovered = hoveredMenu === item.path;
    const hasSubmenu = item.submenu !== null;
    const showSubmenu = hasSubmenu && (isExpanded || isHovered);

    return (
      <div 
        key={item.path} 
        className="relative group"
        onMouseEnter={() => setHoveredMenu(item.path)}
        onMouseLeave={() => setHoveredMenu(null)}
      >
        {hasSubmenu ? (
          <div className="flex items-center">
            <Link
              to={item.path}
              className={`flex-1 flex items-center justify-between px-3 py-2 ${
                isActive(item.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
            <button
              className={`px-2 py-2 md:hidden ${
                isActive(item.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
              }`}
              onClick={() => toggleSubmenu(item.path)}
            >
              {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>
          </div>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center justify-between px-3 py-2 ${
              isActive(item.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center space-x-2">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
          </Link>
        )}
        
        {showSubmenu && (
          <div className="absolute left-0 w-56 py-1 mt-0 bg-white dark:bg-gray-800 rounded-md shadow-lg z-[100] md:block hidden transform origin-top transition-all duration-200 ease-in-out">
            <div className="relative">
              {item.submenu.map((subItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isActive(subItem.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {subItem.icon}
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile submenu */}
        {hasSubmenu && isExpanded && (
          <div className="pl-8 space-y-1 md:hidden">
            {item.submenu.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                className={`flex items-center space-x-2 px-3 py-2 text-sm ${
                  isActive(subItem.path) ? themeClasses.nav.link.active : themeClasses.nav.link.default
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {subItem.icon}
                <span>{subItem.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`${themeClasses.nav.background} sticky top-0 z-[90] shadow-md`}>
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold ${themeClasses.text.primary} tracking-wider hover:opacity-80 transition-opacity flex items-center`}>
              <SchoolIcon sx={{ mr: 1 }} />
              JAPVOC
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              {navItems.map(renderNavItem)}
              <div className="ml-2">
                <ThemeToggle />
              </div>
              {currentUser && (
                <div className="ml-2">
                  <ProfileToggle />
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {currentUser && <ProfileToggle />}
            <ThemeToggle />
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
            {navItems.map(renderNavItem)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;