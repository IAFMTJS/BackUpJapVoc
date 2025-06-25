import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Psychology as KnowingIcon,
  Repeat as SRSIcon,
  SportsEsports as TriviaIcon,
  Help as FAQIcon,
  Person as ProfileIcon,
  Menu as MenuIcon,
  Quiz as QuizIcon,
  Translate as TranslateIcon,
  EmojiEmotions as MoodIcon,
  Public as CultureIcon,
  Animation as AnimeIcon,
  Games as GamesIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { currentUser, signOut } = useAuth();
  const { settings } = useSettings();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [anchorEls, setAnchorEls] = useState<{ [key: string]: HTMLElement | null }>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleMenuOpen = (key: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEls(prev => ({ ...prev, [key]: event.currentTarget }));
  };
  
  const handleMenuClose = (key: string) => {
    setAnchorEls(prev => ({ ...prev, [key]: null }));
  };

  // Main navigation structure with updated dropdowns
  const navItems = [
    {
      key: 'home',
      text: 'Home',
      icon: <HomeIcon />,
      path: '/',
      subpages: []
    },
    {
      key: 'vsensei',
      text: 'VSensei',
      icon: <SchoolIcon />,
      path: '/learning-path',
      subpages: []
    },
    {
      key: 'learning',
      text: 'Learning',
      icon: <SchoolIcon />,
      path: '/learning',
      subpages: [
        { label: 'Kana', path: '/learning/kana', icon: <TranslateIcon fontSize="small" /> },
        { label: 'Kanji Dictionary', path: '/learning/kanji-dictionary', icon: <SchoolIcon fontSize="small" /> },
        { label: 'Romaji', path: '/learning/romaji', icon: <TranslateIcon fontSize="small" /> },
        { label: 'Quiz', path: '/learning/quiz', icon: <QuizIcon fontSize="small" /> }
      ]
    },
    {
      key: 'knowing',
      text: 'Knowing',
      icon: <KnowingIcon />,
      path: '/knowing',
      subpages: [
        { label: 'Dictionary', path: '/knowing/dictionary', icon: <SchoolIcon fontSize="small" /> },
        { label: 'Mood', path: '/knowing/mood', icon: <MoodIcon fontSize="small" /> },
        { label: 'Culture', path: '/knowing/culture', icon: <CultureIcon fontSize="small" /> }
      ]
    },
    {
      key: 'srs',
      text: 'SRS',
      icon: <SRSIcon />,
      path: '/srs',
      subpages: []
    },
    {
      key: 'trivia',
      text: 'Trivia',
      icon: <TriviaIcon />,
      path: '/trivia',
      subpages: [
        { label: 'Anime', path: '/trivia/anime', icon: <AnimeIcon fontSize="small" /> },
        { label: 'Games', path: '/trivia/games', icon: <GamesIcon fontSize="small" /> }
      ]
    },
    {
      key: 'faq',
      text: 'FAQ',
      icon: <FAQIcon />,
      path: '/faq/scoring',
      subpages: []
    }
  ];

  // Profile dropdown
  const profileMenu = [
    { label: 'Profile', path: '/profile', icon: <ProfileIcon fontSize="small" /> },
    { label: 'Settings', path: '/settings', icon: <FAQIcon fontSize="small" /> },
    { label: 'FAQ', path: '/faq/scoring', icon: <FAQIcon fontSize="small" /> },
    { label: 'Logout', path: '/login', icon: <ProfileIcon fontSize="small" />, action: async () => { await signOut(); navigate('/login'); } }
  ];

  // Safety check for currentUser
  const userPhotoURL = currentUser?.photoURL || undefined;

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            letterSpacing: '0.1em'
          }}
        >
          JAPVOC
        </Typography>
        
        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {navItems.map(item => (
            <Box key={item.key} sx={{ position: 'relative' }}>
              <Button
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                onMouseEnter={item.subpages.length ? (e) => handleMenuOpen(item.key, e) : undefined}
                onMouseLeave={item.subpages.length ? () => handleMenuClose(item.key) : undefined}
                aria-haspopup={item.subpages.length ? 'true' : undefined}
                aria-controls={item.subpages.length ? `${item.key}-menu` : undefined}
              >
                {item.text}
              </Button>
              {item.subpages.length > 0 && (
                <Menu
                  id={`${item.key}-menu`}
                  anchorEl={anchorEls[item.key]}
                  open={Boolean(anchorEls[item.key])}
                  onClose={() => handleMenuClose(item.key)}
                  MenuListProps={{ 
                    onMouseLeave: () => handleMenuClose(item.key),
                    onMouseEnter: () => {} // Keep menu open when hovering over menu items
                  }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  sx={{
                    '& .MuiPaper-root': {
                      minWidth: 200,
                      mt: 1
                    }
                  }}
                >
                  {item.subpages.map(sub => (
                    <MenuItem
                      key={sub.path}
                      component={Link}
                      to={sub.path}
                      selected={isActive(sub.path)}
                      onClick={() => handleMenuClose(item.key)}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {sub.icon || <SchoolIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={sub.label || 'Unknown'} />
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </Box>
          ))}
          
          {/* Profile dropdown */}
          <Box sx={{ position: 'relative', ml: 2 }}>
            <IconButton
              onClick={(e) => handleMenuOpen('profile', e)}
              color="inherit"
              size="large"
              sx={{ p: 0.5 }}
            >
              <Avatar src={userPhotoURL} />
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEls['profile']}
              open={Boolean(anchorEls['profile'])}
              onClose={() => handleMenuClose('profile')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {profileMenu.map((item, idx) => (
                <MenuItem
                  key={item.label}
                  component={item.path ? Link : 'button'}
                  to={item.path}
                  onClick={async () => {
                    handleMenuClose('profile');
                    if (item.action) await item.action();
                  }}
                >
                  <ListItemIcon>{item.icon || <PersonIcon fontSize="small" />}</ListItemIcon>
                  <ListItemText>{item.label || 'Unknown'}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <ThemeToggle />
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={(e) => handleMenuOpen('mobile', e)}
            sx={{ p: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Menu
            id="mobile-menu"
            anchorEl={anchorEls['mobile']}
            open={Boolean(anchorEls['mobile'])}
            onClose={() => handleMenuClose('mobile')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
              '& .MuiPaper-root': {
                minWidth: 250,
                maxHeight: '80vh',
                overflow: 'auto'
              }
            }}
          >
            {navItems.map(item => (
              <Box key={item.key}>
                <MenuItem
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  onClick={() => handleMenuClose('mobile')}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </MenuItem>
                
                {/* Mobile submenu items */}
                {item.subpages.length > 0 && item.subpages.map(sub => (
                  <MenuItem
                    key={sub.path}
                    component={Link}
                    to={sub.path}
                    selected={isActive(sub.path)}
                    onClick={() => handleMenuClose('mobile')}
                    sx={{
                      py: 1,
                      pl: 6,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {sub.icon || <SchoolIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary={sub.label || 'Unknown'} />
                  </MenuItem>
                ))}
                
                {item.subpages.length > 0 && <Divider />}
              </Box>
            ))}
            
            <Divider />
            
            {/* Mobile profile menu */}
            {profileMenu.map((item, idx) => (
              <MenuItem
                key={item.label}
                component={item.path ? Link : 'button'}
                to={item.path}
                onClick={async () => {
                  handleMenuClose('mobile');
                  if (item.action) await item.action();
                }}
              >
                <ListItemIcon>{item.icon || <PersonIcon fontSize="small" />}</ListItemIcon>
                <ListItemText>{item.label || 'Unknown'}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
          
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;