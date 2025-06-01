import React from 'react';
import Box from '@mui/material/Box';
import Navigation from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navigation />
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 