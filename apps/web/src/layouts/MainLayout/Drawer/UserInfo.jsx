import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';
import { useAdminTheme } from 'context/ThemeCustomizationContext';

export default function UserInfo() {
  const { currentUser, switchUser, logout, isAdmin } = useAuth();
  const { profiles, resetAllData } = useErpData();
  const { currentSkin } = useAdminTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitch = (user) => {
    switchUser(user);
    handleClose();
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données de démonstration ?')) {
      resetAllData();
      handleClose();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        pb: 1.5,
        background: `linear-gradient(135deg, ${currentSkin?.dark || '#d32f2f'} 0%, ${currentSkin?.hex || '#F44336'} 100%)`,
        position: 'relative',
        boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Avatar
          src={currentUser?.avatar_url}
          alt={currentUser?.nom}
          onClick={() => navigate('/profile')}
          sx={{
            width: 48,
            height: 48,
            border: '2px solid rgba(255,255,255,0.8)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            bgcolor: isAdmin ? '#f59e0b' : '#3b82f6',
            fontSize: '1.2rem',
            fontWeight: 700,
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
          }}
        >
          {currentUser?.nom?.charAt(0)}
        </Avatar>

        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            color: '#ffffff',
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <ArrowDropDownIcon />
        </IconButton>
      </Box>

      {/* User Details */}
      <Box 
        onClick={() => navigate('/profile')}
        sx={{ mt: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: '0.925rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {currentUser?.nom}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.75rem',
            display: 'block'
          }}
        >
          {currentUser?.poste || currentUser?.email || (isAdmin ? 'Administrateur Principal' : `Rôle: ${currentUser?.role}`)}
        </Typography>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 250,
            borderRadius: 1.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            mt: 1
          }
        }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleClose();
          }}
          sx={{ py: 1.2, bgcolor: '#F0F9FF', mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <SwitchAccountIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Mon Profil & Sécurité"
            secondary="Photo, mot de passe & infos"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369A1' }}
            secondaryTypographyProps={{ fontSize: '0.7rem' }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {profiles?.length > 1 && (
          <>
            <Box sx={{ px: 2, py: 1, bgcolor: '#f9fafb' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                Changer d'utilisateur
              </Typography>
            </Box>

            {profiles.map((p) => (
              <MenuItem
                key={p.id}
                onClick={() => handleSwitch(p)}
                selected={currentUser?.id === p.id}
                sx={{ py: 0.8 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {currentUser?.id === p.id ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <SwitchAccountIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={p.nom}
                  secondary={p.poste || p.role}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: currentUser?.id === p.id ? 700 : 500 }}
                  secondaryTypographyProps={{ fontSize: '0.72rem' }}
                />
              </MenuItem>
            ))}
            <Divider sx={{ my: 0.5 }} />
          </>
        )}

        {isAdmin && (
          <MenuItem
            onClick={() => {
              navigate('/admin/users');
              handleClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <AdminPanelSettingsIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Gestion des Utilisateurs" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </MenuItem>
        )}

        <MenuItem onClick={handleReset}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <RefreshIcon fontSize="small" sx={{ color: '#757575' }} />
          </ListItemIcon>
          <ListItemText primary="Vider le cache local" primaryTypographyProps={{ fontSize: '0.85rem' }} />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            logout();
            handleClose();
            navigate('/login');
          }}
          sx={{ bgcolor: '#FFEBEE', '&:hover': { bgcolor: '#FFCDD2' } }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LogoutIcon fontSize="small" sx={{ color: '#D32F2F' }} />
          </ListItemIcon>
          <ListItemText
            primary="Se Déconnecter"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700, color: '#D32F2F' }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}

