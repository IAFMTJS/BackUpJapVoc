import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Book as DictionaryIcon,
  Mood as MoodIcon,
  School as CultureIcon,
  Home as HomeIcon,
  Star as StarIcon,
  Timeline as ProgressIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useProgress } from '../context/ProgressContext';
import ProfileToggle from './navigation/ProfileToggle';

interface KnowingNavigationProps {
  children: React.ReactNode;
}

export const KnowingNavigation: React.FC<KnowingNavigationProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { getSectionProgress } = useProgress();
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navigationItems = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/knowing',
      progress: 0,
    },
    {
      text: 'Dictionary',
      icon: <DictionaryIcon />,
      path: '/knowing/dictionary',
      progress: getSectionProgress('dictionary'),
    },
    {
      text: 'Mood & Emotions',
      icon: <MoodIcon />,
      path: '/knowing/mood',
      progress: getSectionProgress('mood'),
    },
    {
      text: 'Culture & Rules',
      icon: <CultureIcon />,
      path: '/knowing/culture',
      progress: getSectionProgress('culture'),
    },
    {
      text: 'Progress',
      icon: <ProgressIcon />,
      path: '/knowing/progress',
      progress: 0,
    },
    {
      text: 'Favorites',
      icon: <StarIcon />,
      path: '/knowing/favorites',
      progress: 0,
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/knowing/settings',
      progress: 0,
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
      requiresAuth: true
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Knowing Center
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
              >
                {navigationItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    onClick={() => {
                      navigate(item.path);
                      handleMobileMenuClose();
                    }}
                    selected={location.pathname === item.path}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {item.icon}
                      <Typography sx={{ ml: 1 }}>{item.text}</Typography>
                      {item.progress > 0 && (
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', width: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={item.progress}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(item.progress)}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  color={location.pathname === item.path ? 'primary' : 'inherit'}
                  sx={{ position: 'relative' }}
                >
                  {item.text}
                  {item.progress > 0 && (
                    <Box sx={{ position: 'absolute', bottom: -4, left: 0, right: 0 }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{ height: 2 }}
                      />
                    </Box>
                  )}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          pb: { xs: 8, sm: 3 },
        }}
      >
        {children}
      </Box>
      <ProfileToggle />
    </Box>
  );
}; 