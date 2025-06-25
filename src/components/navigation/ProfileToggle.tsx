import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Person as PersonIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ProfileToggle: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, forceClearAuth } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Debug logging
  console.log('ProfileToggle: currentUser =', currentUser);
  console.log('ProfileToggle: currentUser?.email =', currentUser?.email);
  console.log('ProfileToggle: currentUser?.uid =', currentUser?.uid);

  if (!currentUser) {
    console.log('ProfileToggle: No currentUser, returning null');
    return null;
  }

  console.log('ProfileToggle: Rendering with user:', currentUser.email);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug function to force clear auth state
  const handleForceClearAuth = async () => {
    try {
      await forceClearAuth();
      console.log('Auth state force cleared');
    } catch (error) {
      console.error('Error force clearing auth:', error);
    }
  };

  // Safety check function for rendering icons
  const renderIcon = (icon: React.ReactNode, fallback: React.ReactNode = <div>📄</div>) => {
    try {
      return icon || fallback;
    } catch (error) {
      console.error('Error rendering icon in ProfileToggle:', error);
      return fallback;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        gap: 1
      }}
    >
      <Tooltip title="FAQ">
        <IconButton
          color="primary"
          onClick={() => navigate('/faq/scoring')}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {renderIcon(<HelpIcon />)}
        </IconButton>
      </Tooltip>

      <Tooltip title="Profile">
        <IconButton
          color="primary"
          onClick={handleMenuOpen}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {renderIcon(<PersonIcon />)}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('/profile')}>
          <ListItemIcon>
            {renderIcon(<PersonIcon fontSize="small" />)}
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('/settings')}>
          <ListItemIcon>
            {renderIcon(<SettingsIcon fontSize="small" />)}
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('/faq/scoring')}>
          <ListItemIcon>
            {renderIcon(<HelpIcon fontSize="small" />)}
          </ListItemIcon>
          <ListItemText>FAQ</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            {renderIcon(<LogoutIcon fontSize="small" />)}
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
        {/* Debug menu item - remove in production */}
        <MenuItem onClick={handleForceClearAuth}>
          <ListItemIcon>
            {renderIcon(<div>🐛</div>)}
          </ListItemIcon>
          <ListItemText>Debug: Force Clear Auth</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfileToggle; 