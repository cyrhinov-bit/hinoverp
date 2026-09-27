import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';

import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export default function UserScopeFilter({ size = 'small', sx = {} }) {
  const { isAdmin } = useAuth();
  const { profiles, selectedUserFilter, setSelectedUserFilter, effectiveFilteredUser } = useErpData();

  // Ce filtre n'est accessible et visible que pour la Direction (ADMIN)
  if (!isAdmin) return null;

  const handleChange = (e) => {
    setSelectedUserFilter(e.target.value);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setSelectedUserFilter('ALL');
  };

  const isFiltered = selectedUserFilter !== 'ALL';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ...sx }}>
      <FormControl size={size} sx={{ minWidth: { xs: 180, sm: 240 } }}>
        <Select
          value={selectedUserFilter}
          onChange={handleChange}
          displayEmpty
          sx={{
            bgcolor: isFiltered ? 'rgba(255, 235, 238, 0.95)' : 'rgba(255, 255, 255, 0.18)',
            color: isFiltered ? '#c62828' : '#ffffff',
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.82rem',
            border: isFiltered ? '2px solid #ef5350' : '1px solid rgba(255, 255, 255, 0.4)',
            '& .MuiSelect-icon': {
              color: isFiltered ? '#c62828' : '#ffffff'
            },
            '&:hover': {
              bgcolor: isFiltered ? 'rgba(255, 205, 210, 0.95)' : 'rgba(255, 255, 255, 0.28)'
            }
          }}
          renderValue={(selected) => {
            if (selected === 'ALL') {
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PublicIcon sx={{ fontSize: 18, color: 'inherit' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    Vue Globale (Tous)
                  </Typography>
                </Stack>
              );
            }
            return (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 1 }}>
                <Avatar
                  src={effectiveFilteredUser?.avatar_url}
                  sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
                >
                  {effectiveFilteredUser?.nom?.charAt(0) || <PersonIcon sx={{ fontSize: 14 }} />}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: 'inherit' }} noWrap>
                  {effectiveFilteredUser?.nom || selected}
                </Typography>
              </Stack>
            );
          }}
        >
          <MenuItem value="ALL" sx={{ py: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976d2', color: '#ffffff' }}>
                <PublicIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                  🌍 Vue Globale Entreprise
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Consolidation de tous les utilisateurs et collaborateurs
                </Typography>
              </Box>
            </Stack>
          </MenuItem>

          {profiles.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{ py: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                <Avatar src={p.avatar_url} sx={{ width: 28, height: 28 }}>
                  {p.nom?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {p.nom}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    {p.poste || p.email}
                  </Typography>
                </Box>
                <Chip
                  label={p.role}
                  size="small"
                  color={p.role === 'ADMIN' ? 'error' : 'default'}
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                />
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isFiltered && (
        <Tooltip title="Réinitialiser à la Vue Globale">
          <IconButton
            size="small"
            onClick={handleReset}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#d32f2f',
              '&:hover': { bgcolor: '#ffffff' }
            }}
          >
            <ClearIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
