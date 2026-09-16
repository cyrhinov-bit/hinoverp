import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PwaInstallButton from 'components/pwa/PwaInstallButton';

export default function SidebarLegal() {
  return (
    <Box
      sx={{
        borderTop: '1px solid #eeeeee',
        bgcolor: '#ffffff',
        textAlign: 'left'
      }}
    >
      <PwaInstallButton variant="sidebar" />
      <Box sx={{ p: 2, pt: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#555555',
          fontWeight: 700,
          display: 'block',
          fontSize: '0.75rem'
        }}
      >
        &copy; 2026 <strong>HINOV ERP</strong>
      </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#888888',
            fontSize: '0.7rem'
          }}
        >
          <b>Version: </b> 1.0.0
        </Typography>
      </Box>
    </Box>
  );
}

