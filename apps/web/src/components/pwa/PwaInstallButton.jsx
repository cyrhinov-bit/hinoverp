import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import { usePwaInstall } from 'hooks/usePwaInstall';
import { BsbButton } from 'components/adminbsb';

import GetAppIcon from '@mui/icons-material/GetApp';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IosShareIcon from '@mui/icons-material/IosShare';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DevicesIcon from '@mui/icons-material/Devices';
import SpeedIcon from '@mui/icons-material/Speed';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloseIcon from '@mui/icons-material/Close';

export default function PwaInstallButton({ variant = 'header', sx = {} }) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [openModal, setOpenModal] = useState(false);

  // Si l'application est déjà installée en mode standalone
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <Box sx={{ p: 1.5, mx: 1.5, my: 1, bgcolor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '4px', textAlign: 'center', ...sx }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />
            <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700 }}>
              Application Installée (PWA)
            </Typography>
          </Stack>
        </Box>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setOpenModal(true);
      return;
    }

    const outcome = await promptInstall();
    if (!outcome) {
      // Si le prompt natif n'est pas prêt, ouvrir le guide d'installation
      setOpenModal(true);
    }
  };

  return (
    <>
      {/* Rendu Header (Barre supérieure) */}
      {variant === 'header' && (
        <Tooltip title="Installer l'application Hinov ERP sur cet appareil">
          <Button
            variant="contained"
            size="small"
            onClick={handleInstallClick}
            startIcon={<GetAppIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.22)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '3px',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.35)',
                borderColor: '#ffffff'
              },
              ...sx
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Installer App
            </Box>
          </Button>
        </Tooltip>
      )}

      {/* Rendu Sidebar (Volet latéral) */}
      {variant === 'sidebar' && (
        <Box
          sx={{
            p: 1.5,
            mx: 1.5,
            my: 1,
            bgcolor: '#E0F2FE',
            border: '1px solid #BAE6FD',
            borderRadius: '4px',
            ...sx
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <InstallMobileIcon sx={{ fontSize: 20, color: '#0284C7' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '0.8rem' }}>
                Hinov ERP sur Mobile & PC
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#0C4A6E', fontSize: '0.72rem', display: 'block', lineHeight: 1.3 }}>
              Installez l'application web pour un accès direct depuis votre écran d'accueil.
            </Typography>
            <BsbButton
              size="xs"
              color="primary"
              startIcon={<GetAppIcon sx={{ fontSize: 14 }} />}
              onClick={handleInstallClick}
              sx={{ width: '100%', py: 0.6, fontWeight: 700 }}
            >
              Installer l'application
            </BsbButton>
          </Stack>
        </Box>
      )}

      {/* Rendu Bouton Standard / Page de Login */}
      {variant === 'button' && (
        <BsbButton
          size="sm"
          color="default"
          startIcon={<InstallMobileIcon />}
          onClick={handleInstallClick}
          sx={{
            bgcolor: '#ffffff',
            color: '#1a237e',
            border: '1px solid #c5cae9',
            fontWeight: 700,
            '&:hover': { bgcolor: '#e8eaf6' },
            ...sx
          }}
        >
          Installer l'Application PWA
        </BsbButton>
      )}

      {/* Modal Guide d'installation PWA */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '4px', overflow: 'hidden' } }}
      >
        <Box sx={{ p: 2, bgcolor: '#0288D1', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <GetAppIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Installer Hinov ERP (PWA)
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setOpenModal(false)} sx={{ color: '#ffffff' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Avantages */}
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                ✨ Avantages de l'application installée :
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SpeedIcon sx={{ fontSize: 16, color: '#0288D1' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                    Chargement ultra-rapide et écran complet sans barre d'adresse
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WifiOffIcon sx={{ fontSize: 16, color: '#0288D1' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                    Support hors-ligne et mise en cache réactive
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DevicesIcon sx={{ fontSize: 16, color: '#0288D1' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                    Compatible Android, iPhone/iPad, Windows et Mac
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Instructions selon OS */}
            {isIOS ? (
              <Box sx={{ p: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '4px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1D4ED8', mb: 1 }}>
                  📱 Installation sur iPhone / iPad (Safari) :
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <IosShareIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="1. Appuyez sur le bouton Partager en bas de Safari."
                      primaryTypographyProps={{ fontSize: '0.8rem', color: '#1E40AF' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <AddBoxIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="2. Sélectionnez 'Sur l'écran d'accueil'."
                      primaryTypographyProps={{ fontSize: '0.8rem', color: '#1E40AF' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="3. Validez en cliquant sur 'Ajouter'."
                      primaryTypographyProps={{ fontSize: '0.8rem', color: '#1E40AF' }}
                    />
                  </ListItem>
                </List>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '4px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803D', mb: 1 }}>
                  💻 Installation Chrome / Edge / Android :
                </Typography>
                <Typography variant="caption" sx={{ color: '#166534', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                  Cliquez sur le bouton ci-dessous pour déclencher l'installation native dans votre navigateur.
                </Typography>
                <BsbButton
                  size="sm"
                  color="success"
                  startIcon={<GetAppIcon />}
                  onClick={async () => {
                    await promptInstall();
                    setOpenModal(false);
                  }}
                  sx={{ width: '100%', fontWeight: 700 }}
                >
                  Lancer l'installation maintenant
                </BsbButton>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <BsbButton size="sm" color="default" onClick={() => setOpenModal(false)}>
            Fermer
          </BsbButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

PwaInstallButton.propTypes = {
  variant: PropTypes.oneOf(['header', 'sidebar', 'button']),
  sx: PropTypes.object
};
