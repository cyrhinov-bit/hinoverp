import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';

// project imports
import UserInfo from '../UserInfo';
import NavigationDrawer from './Navigation';
import SidebarLegal from '../SidebarLegal';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| ADMINBSB DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#ffffff' }}>
      <Toolbar sx={{ minHeight: '64px !important' }} />
      {/* Signature User Info Header */}
      <UserInfo />

      {/* Main Navigation with Scroll */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <SimpleBar sx={{ height: '100%' }}>
          <Stack sx={{ p: 1, py: 1.5 }}>
            <NavigationDrawer />
          </Stack>
        </SimpleBar>
      </Box>

      {/* Signature Legal Footer */}
      <SidebarLegal />
    </Box>
  );
}
