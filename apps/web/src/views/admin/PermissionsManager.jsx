import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  Tooltip,
  Snackbar,
  Card,
  CardContent,
  Stack
} from '@mui/material';

import MainCard from 'components/cards/MainCard';
import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';
import { buildUserModulesMatrix } from '@hinov/core';

import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';

export default function PermissionsManager() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, switchUser } = useAuth();
  const { profiles, modules, userModules, toggleUserModule } = useErpData();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const matrix = buildUserModulesMatrix(profiles, modules, userModules);

  const handleToggle = async (userId, moduleId, currentVal, userName, moduleName) => {
    const newVal = !currentVal;
    await toggleUserModule(userId, moduleId, newVal);
    setSnackbar({
      open: true,
      message: `Module "${moduleName}" ${newVal ? 'ACTIVÉ' : 'DÉSACTIVÉ'} pour ${userName}`
    });
  };

  const handleTestProfile = (userRow) => {
    switchUser(userRow);
    navigate('/dashboard/default');
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* En-tête de section */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <AdminPanelSettingsTwoToneIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Administration & Contrôle d'Accès par Toggles
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Activez ou désactivez les modules applicatifs en temps réel pour chaque utilisateur. Les modifications sont répercutées instantanément sur leur interface et leur navigation.
        </Typography>
      </Box>

      {/* Alertes & Renseignements */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>Fonctionnement de la table de liaison `user_modules`</AlertTitle>
            Chaque interrupteur ci-dessous pilote l'état booléen <code>is_enabled</code> dans la table Supabase <code>user_modules</code>.
            Les utilisateurs avec le rôle <strong>ADMIN</strong> disposent d'un droit universel par défaut.
          </Alert>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 700 }}>
                💡 Astuce de démonstration :
              </Typography>
              <Typography variant="body2" sx={{ color: '#15803d', fontSize: '0.82rem', mt: 0.5 }}>
                Basculez les interrupteurs ci-dessous, puis cliquez sur <strong>"Tester ce profil"</strong> pour voir l'impact immédiat sur le menu latéral et le tableau de bord !
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Matrice des Utilisateurs et Toggles */}
      <MainCard title="Matrice des Permissions Applicatives">
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#334155', py: 2 }}>Utilisateur & Rôle</TableCell>
                {modules.map((mod) => (
                  <TableCell key={mod.id} align="center" sx={{ fontWeight: 700, color: '#334155', minWidth: 140 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {mod.nom}
                      </Typography>
                      <Chip 
                        label={mod.code_module} 
                        size="small" 
                        sx={{ fontSize: '0.65rem', height: 18, mt: 0.5, bgcolor: '#e2e8f0', color: '#475569' }} 
                      />
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Action Démo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matrix.map((userRow) => {
                const isCurrentActive = currentUser?.id === userRow.id;
                const isRowAdmin = userRow.role === 'ADMIN';

                return (
                  <TableRow 
                    key={userRow.id} 
                    hover 
                    sx={{ 
                      bgcolor: isCurrentActive ? 'rgba(59, 130, 246, 0.04)' : 'inherit',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                    }}
                  >
                    {/* Profil Utilisateur */}
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar 
                          src={userRow.avatar_url} 
                          alt={userRow.nom}
                          sx={{ width: 40, height: 40, bgcolor: isRowAdmin ? '#f59e0b' : '#3b82f6' }}
                        >
                          {userRow.nom.charAt(0)}
                        </Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {userRow.nom}
                            </Typography>
                            {isCurrentActive && (
                              <Chip label="Connecté" color="primary" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                            )}
                          </Stack>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {userRow.email}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={isRowAdmin ? 'ADMIN' : 'UTILISATEUR'} 
                              size="small" 
                              color={isRowAdmin ? 'warning' : 'default'}
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Colonnes des Modules avec boutons Toggle */}
                    {userRow.modules.map((m) => {
                      return (
                        <TableCell key={m.module_id} align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip 
                              title={
                                isRowAdmin 
                                  ? "Accès accordé d'office (Administrateur)" 
                                  : `Cliquer pour ${m.is_enabled ? 'désactiver' : 'activer'} ce module`
                              }
                            >
                              <span>
                                <Switch
                                  checked={m.is_enabled}
                                  disabled={isRowAdmin}
                                  onChange={() => handleToggle(userRow.id, m.module_id, m.is_enabled, userRow.nom, m.nom)}
                                  color={m.is_enabled ? 'primary' : 'default'}
                                  inputProps={{ 'aria-label': `${m.nom} toggle` }}
                                />
                              </span>
                            </Tooltip>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 700, 
                                color: m.is_enabled ? '#16a34a' : '#94a3b8',
                                fontSize: '0.72rem'
                              }}
                            >
                              {m.is_enabled ? 'ACTIF (ON)' : 'INACTIF (OFF)'}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    })}

                    {/* Action rapide : Se connecter en tant que ce profil */}
                    <TableCell align="center">
                      <Chip
                        label={isCurrentActive ? "Profil actif" : "Tester ce profil"}
                        clickable={!isCurrentActive}
                        onClick={() => handleTestProfile(userRow)}
                        color={isCurrentActive ? "success" : "primary"}
                        variant={isCurrentActive ? "filled" : "outlined"}
                        icon={isCurrentActive ? <CheckCircleOutlineIcon /> : <ToggleOnIcon />}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Snackbar de notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
