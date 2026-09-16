import { useEffect, useMemo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Drawer from './Drawer';
import Header from './Header';
import Breadcrumbs from 'components/Breadcrumbs';

import { DRAWER_WIDTH } from 'config';
import { handlerDrawerOpen, useGetMenuMaster } from 'states/menu';
import { useAuth } from 'context/AuthContext';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const upLG = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  useEffect(() => {
    handlerDrawerOpen(upLG);
  }, [upLG]);

  // Si l'utilisateur n'est pas connecté, redirection automatique vers la page de login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // drawer toggle handler on resize window
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drawer = useMemo(() => <Drawer />, [drawerOpen]);

  return (
    <Stack direction="row" width={1} sx={{ bgcolor: '#e9e9e9', minHeight: '100vh' }}>
      <Header />
      {drawer}
      <Box
        component="main"
        sx={{
          width: { xs: 1, lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : 1 },
          minHeight: '100vh',
          bgcolor: '#e9e9e9',
          p: { xs: 2, sm: 3, md: 4 },
          ml: { xs: 0, lg: 'auto' }
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Breadcrumbs />
        <Outlet />
      </Box>
    </Stack>
  );
}
