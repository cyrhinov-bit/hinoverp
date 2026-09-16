import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material';

import MainCard from 'components/cards/MainCard';
import { useErpData } from 'context/ErpDataContext';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CodeIcon from '@mui/icons-material/Code';

export default function SupabaseStatus() {
  const { 
    profiles, 
    modules, 
    userModules, 
    interventions, 
    articles, 
    mouvements, 
    prestations,
    clientsFournisseurs,
    agentsCommerciaux,
    commissions
  } = useErpData();

  const tables = [
    { name: 'profiles', count: profiles.length, desc: 'Utilisateurs et rôles (ADMIN/USER)' },
    { name: 'modules', count: modules.length, desc: 'Modules fonctionnels enregistrés' },
    { name: 'user_modules', count: userModules.length, desc: 'Permissions dynamiques par toggle' },
    { name: 'clients_fournisseurs', count: clientsFournisseurs.length, desc: 'Annuaire croisé Clients, Fournisseurs et Partenaires' },
    { name: 'agents_commerciaux', count: agentsCommerciaux.length, desc: 'Équipe commerciale et taux de commission' },
    { name: 'prestations_commandes', count: prestations.length, desc: 'Commandes, prestations et calculs financiers 11 colonnes' },
    { name: 'commissions_apporteurs', count: commissions.length, desc: 'Commissions apporteurs (10%), agents et responsables' },
    { name: 'mouvements_caisse', count: mouvements.length, desc: 'Journal de trésorerie (entrées/sorties réelles)' },
    { name: 'catalogue_articles', count: articles.length, desc: 'Stock et consommables' },
    { name: 'interventions_maintenance', count: interventions.length, desc: 'Tickets et pannes de maintenance' }
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <StorageIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            État de la Base de Données Supabase
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Schéma PostgreSQL, sécurité Row-Level-Security (RLS), tables métier et synchronisation en direct.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard title="Tables Supabase & Volumes Actuels">
            <Grid container spacing={2}>
              {tables.map((tbl) => (
                <Grid size={{ xs: 12, sm: 6 }} key={tbl.name}>
                  <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#1e40af' }}>
                          {tbl.name}
                        </Typography>
                        <Chip label={`${tbl.count} enregistrements`} size="small" color="primary" sx={{ fontWeight: 600 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#64748b', mt: 1, fontSize: '0.8rem' }}>
                        {tbl.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Configuration & Synchronisation">
            <Alert severity="success" icon={<CheckCircleTwoToneIcon fontSize="inherit" />} sx={{ mb: 2, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>Moteur Synchrone Actif</AlertTitle>
              Mode persistant avec bascule automatique entre Supabase Cloud et le stockage local réactif.
            </Alert>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Scripts de migration :
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mb: 2 }}>
              Tous les scripts SQL complets de création des tables et des triggers automatiques sont disponibles dans :
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5, mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CodeIcon fontSize="small" color="action" />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  supabase/schema.sql
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <CodeIcon fontSize="small" color="action" />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  supabase/seed.sql
                </Typography>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
