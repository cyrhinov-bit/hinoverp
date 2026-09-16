import React, { useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';

import MainCard from 'components/cards/MainCard';
import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';

import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Profile() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { currentUser, switchUser, logout, isAdmin } = useAuth();
  const { profiles, resetAllData } = useErpData();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleClickAway = () => setOpen(false);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box 
          onClick={handleClick}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            cursor: 'pointer',
            p: 0.5,
            px: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
          }}
        >
          <Avatar 
            src={currentUser?.avatar_url} 
            alt={currentUser?.nom} 
            sx={{ width: 34, height: 34, bgcolor: isAdmin ? '#f59e0b' : '#3b82f6' }}
          >
            {currentUser?.nom?.charAt(0)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600, lineHeight: 1.2 }}>
              {currentUser?.nom?.split('(')[0]}
            </Typography>
            <Chip 
              label={isAdmin ? '👑 ADMIN' : '👤 ' + currentUser?.role} 
              size="small" 
              sx={{ 
                height: 18, 
                fontSize: '0.65rem', 
                bgcolor: isAdmin ? '#fef3c7' : '#e0f2fe',
                color: isAdmin ? '#92400e' : '#0369a1',
                fontWeight: 700
              }} 
            />
          </Box>
        </Box>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
          disablePortal
          modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <MainCard content={false} sx={{ width: 320, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {currentUser?.nom}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {currentUser?.email}
                  </Typography>
                  <Chip 
                    label={currentUser?.role === 'ADMIN' ? 'Accès Administrateur Global' : 'Accès Utilisateur par Toggles'} 
                    size="small" 
                    color={currentUser?.role === 'ADMIN' ? 'warning' : 'primary'} 
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>

                {profiles.length > 1 && (
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', px: 1 }}>
                      Changer d'utilisateur
                    </Typography>
                    <List dense sx={{ pt: 0.5 }}>
                      {profiles.map((p) => {
                        const isSelected = p.id === currentUser?.id;
                        return (
                          <ListItemButton 
                            key={p.id} 
                            selected={isSelected}
                            onClick={() => {
                              switchUser(p);
                              setOpen(false);
                            }}
                            sx={{ borderRadius: 1.5, mb: 0.5 }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar src={p.avatar_url} sx={{ width: 26, height: 26 }}>
                                {p.nom.charAt(0)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={p.nom} 
                              secondary={p.poste || (p.role === 'ADMIN' ? 'Administrateur' : 'Collaborateur')} 
                              primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500 }}
                              secondaryTypographyProps={{ fontSize: '0.75rem' }}
                            />
                            {isSelected && <CheckCircleIcon color="primary" sx={{ fontSize: 18 }} />}
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Box>
                )}

                <Divider />

                <List dense sx={{ p: 1 }}>
                  <ListItemButton 
                    onClick={() => {
                      navigate('/profile');
                      setOpen(false);
                    }}
                    sx={{ borderRadius: 1.5, bgcolor: '#EFF6FF', mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SwitchAccountIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Mon Profil & Sécurité" 
                      secondary="Photo, mot de passe & coordonnées"
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }} 
                      secondaryTypographyProps={{ fontSize: '0.72rem' }}
                    />
                  </ListItemButton>

                  {isAdmin && (
                    <ListItemButton 
                      onClick={() => {
                        navigate('/admin/users');
                        setOpen(false);
                      }}
                      sx={{ borderRadius: 1.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AdminPanelSettingsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Gestion des Utilisateurs" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                    </ListItemButton>
                  )}

                  <ListItemButton 
                    onClick={() => {
                      if (window.confirm('Voulez-vous vider le cache local et réinitialiser les données ?')) {
                        resetAllData();
                        setOpen(false);
                      }
                    }}
                    sx={{ borderRadius: 1.5, color: '#757575' }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <RefreshIcon sx={{ color: '#757575' }} />
                    </ListItemIcon>
                    <ListItemText primary="Vider le cache local" primaryTypographyProps={{ fontSize: '0.85rem' }} />
                  </ListItemButton>

                  <Divider sx={{ my: 0.5 }} />

                  <ListItemButton 
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/login');
                    }}
                    sx={{ borderRadius: 1.5, color: '#D32F2F', bgcolor: '#FFEBEE', '&:hover': { bgcolor: '#FFCDD2' } }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LogoutIcon sx={{ color: '#D32F2F' }} />
                    </ListItemIcon>
                    <ListItemText primary="Se Déconnecter" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700, color: '#D32F2F' }} />
                  </ListItemButton>
                </List>
              </MainCard>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
