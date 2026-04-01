import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

interface GcPageContainerProps {
  children: React.ReactNode;
  noPaper?: boolean;
}

const GcPageContainer: React.FC<GcPageContainerProps> = ({ children, noPaper = false }) => {
  if (noPaper) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, maxWidth: 1400, mx: 'auto' }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, maxWidth: 1400, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Paper>
    </Box>
  );
};

export default GcPageContainer;
