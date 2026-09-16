import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography, Stack, Container } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PwaInstallButton from 'components/pwa/PwaInstallButton';

export default function CommonAuthLayout({ title, subHeading, children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#eceff1',
        background: 'radial-gradient(circle at 50% 20%, #cfd8dc 0%, #b0bec5 100%)',
        p: 2
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 460 }}>
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#1a237e',
              letterSpacing: 1.5,
              textTransform: 'uppercase'
            }}
          >
            HINOV ERP
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#455a64',
              letterSpacing: 1,
              display: 'block',
              mt: 0.3
            }}
          >
            ERP DE GESTION OPÉRATIONNELLE
          </Typography>
        </Box>

        {/* Login Card AdminBSB */}
        <Card
          sx={{
            borderRadius: '4px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: 'none',
            overflow: 'hidden'
          }}
        >
          {/* Card Top Strip */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: '#0288D1',
              background: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
              color: '#ffffff',
              textAlign: 'center'
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <LockOutlinedIcon sx={{ fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                {title || 'PORTAIL DE CONNEXION'}
              </Typography>
            </Stack>
            {subHeading && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mt: 0.5 }}>
                {subHeading}
              </Typography>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            {children}
          </CardContent>
        </Card>

        {/* PWA Install Button on Login Screen */}
        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <PwaInstallButton variant="button" />
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" sx={{ color: '#546e7a', fontWeight: 600 }}>
            © {new Date().getFullYear()} HINOV GROUP • Tous droits réservés
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

CommonAuthLayout.propTypes = {
  title: PropTypes.string,
  subHeading: PropTypes.string,
  children: PropTypes.node
};
