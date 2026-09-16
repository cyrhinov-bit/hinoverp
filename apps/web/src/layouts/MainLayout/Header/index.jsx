import React from 'react';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

import SkinSwitcher from './SkinSwitcher';
import Profile from './Profile';
import PwaInstallButton from 'components/pwa/PwaInstallButton';
import { handlerDrawerOpen, useGetMenuMaster } from 'states/menu';
import { useAdminTheme } from 'context/ThemeCustomizationContext';
import { useAuth } from 'context/AuthContext';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { currentSkin } = useAdminTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={3}
      sx={{
        width: 1,
        zIndex: { xs: 1100, lg: 1201 },
        bgcolor: currentSkin?.hex || '#F44336',
        color: '#ffffff',
        borderBottom: `2px solid ${currentSkin?.dark || '#d32f2f'}`,
        transition: 'background-color 0.3s ease-in-out'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: { xs: 1.5, sm: 2.5 } }}>
        {/* Left Side: Burger Menu + Brand */}
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
          <IconButton
            edge="start"
            sx={{
              color: '#ffffff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
            }}
            aria-label="open drawer"
            onClick={() => handlerDrawerOpen(!drawerOpen)}
          >
            <MenuIcon />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '4px',
                bgcolor: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <DashboardIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  fontSize: { xs: '0.9rem', sm: '1.05rem' },
                  lineHeight: 1.1,
                  textTransform: 'uppercase'
                }}
              >
                HINOV ERP
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                ERP DE GESTION OPÉRATIONNELLE
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Right Side: Sync Badge + Skin Switcher + Profile */}
        <Stack direction="row" sx={{ alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Chip
            label="Supabase Realtime"
            size="small"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}
          />

          <PwaInstallButton variant="header" />
          <SkinSwitcher />
          <Profile />

          <Tooltip title="Se Déconnecter">
            <IconButton
              onClick={() => {
                logout();
                navigate('/login');
              }}
              sx={{
                color: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }
              }}
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
