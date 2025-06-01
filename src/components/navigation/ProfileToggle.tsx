import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ProfileToggle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Tooltip title="Profile">
        <IconButton
          color="primary"
          onClick={() => navigate('/profile')}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <PersonIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProfileToggle; 