import React from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, id, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={id || `tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel; 