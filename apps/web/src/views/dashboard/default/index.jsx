import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { BsbCard, BsbInfoBox, BsbButton } from 'components/adminbsb';
import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';
import { 
  calculateCashBalance, 
  calculateStockValuation, 
  calculateMaintenanceStats, 
  calculatePrestationsStats, 
  calculateThirdPartyStats,
  calculateCommissionsStats,
  calculateCommercialsStats,
  formatCurrency 
} from '@hinov/core';

import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function DashboardDefault() {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { 
    hasModule, 
    interventions, 
    articles, 
    mouvements, 
    prestations, 
    clientsFournisseurs, 
    agentsCommerciaux, 
    commissions 
  } = useErpData();

  // Permissions par module (L'administrateur a une vue sur TOUT)
  const canTiers = isAdmin || hasModule('CLIENTS_FOURNISSEURS');
  const canCommerciaux = isAdmin || hasModule('COMMERCIAUX');
  const canCommissions = isAdmin || hasModule('COMMISSIONS');
  const canPrestations = isAdmin || hasModule('PRESTATIONS');
  const canCaisse = isAdmin || hasModule('CAISSE_DEPENSES');
  const canStocks = isAdmin || hasModule('STOCKS');
  const canMaintenance = isAdmin || hasModule('MAINTENANCE');

  // Mouvements de caisse cloisonnés selon le périmètre de l'utilisateur
  const userScopedMouvements = useMemo(() => {
    if (isAdmin) return mouvements;
    return mouvements.filter((m) => {
      if (m.cree_par && m.cree_par === currentUser?.id) return true;
      const mod = m.module_code || m.categorie;
      if (mod === 'PRESTATIONS' && canPrestations) return true;
      if (mod === 'MAINTENANCE' && canMaintenance) return true;
      if (mod === 'STOCKS' && canStocks) return true;
      if (mod === 'COMMISSIONS' && canCommissions) return true;
      if (mod === 'GENERAL' && canCaisse) return true;
      return false;
    });
  }, [mouvements, isAdmin, currentUser, canPrestations, canMaintenance, canStocks, canCommissions, canCaisse]);

  // Tiers (Clients & Fournisseurs) cloisonnés selon le profil
  const userScopedClientsFournisseurs = useMemo(() => {
    if (isAdmin) return clientsFournisseurs;
    return clientsFournisseurs.filter((t) => t.cree_par === currentUser?.id);
  }, [clientsFournisseurs, isAdmin, currentUser]);

  // Calculs transversaux
  const cashBalance = calculateCashBalance(userScopedMouvements);
  const stockValuation = calculateStockValuation(articles);
  const maintenanceStats = calculateMaintenanceStats(interventions);
  const prestationsStats = calculatePrestationsStats(prestations);
  const thirdPartyStats = useMemo(() => {
    return calculateThirdPartyStats(userScopedClientsFournisseurs, prestations, userScopedMouvements, interventions, articles);
  }, [userScopedClientsFournisseurs, prestations, userScopedMouvements, interventions, articles]);
  const commissionsStats = useMemo(() => {
    return calculateCommissionsStats(commissions);
  }, [commissions]);
  const commercialsStats = useMemo(() => {
    return calculateCommercialsStats(agentsCommerciaux, prestations, commissions);
  }, [agentsCommerciaux, prestations, commissions]);

  // Cartes KPI dynamiques selon les modules autorisés
  const kpiCards = useMemo(() => {
    const cards = [];

    if (canPrestations) {
      cards.push({
        id: 'ventes',
        variant: 'hover-expand',
        color: 'pink',
        icon: <ShoppingCartIcon />,
        title: 'VENTES TOTALES',
        number: formatCurrency(prestationsStats?.montantTotalVentes ?? prestationsStats?.chiffreAffairesTotal ?? 0),
        subtitle: `${prestations.length} commandes enregistrées`,
        url: '/prestations'
      });
      cards.push({
        id: 'benefice',
        variant: 'hover-expand',
        color: 'cyan',
        icon: <TrendingUpIcon />,
        title: 'BÉNÉFICE RÉEL',
        number: formatCurrency(prestationsStats?.beneficeReelTotal ?? prestationsStats?.margeNetteTotale ?? 0),
        subtitle: `Marge nette: ${formatCurrency(prestationsStats?.margeNetteTotale ?? 0)}`,
        url: '/prestations'
      });
    }

    if (canCaisse) {
      cards.push({
        id: 'caisse',
        variant: 'hover-expand',
        color: 'green',
        icon: <AccountBalanceWalletIcon />,
        title: 'SOLDE DE TRÉSORERIE',
        number: formatCurrency(cashBalance),
        subtitle: `${userScopedMouvements.length} écritures de caisse`,
        url: '/caisse'
      });
    }

    if (canCommissions) {
      cards.push({
        id: 'commissions',
        variant: 'hover-expand',
        color: 'orange',
        icon: <MonetizationOnIcon />,
        title: 'COMMISSIONS DUES',
        number: formatCurrency(commissionsStats.totalRestantADecaisser),
        subtitle: 'Reste à liquider aux commerciaux',
        url: '/commissions'
      });
    }

    if (canTiers) {
      cards.push({
        id: 'tiers',
        variant: 'hover-zoom',
        color: 'indigo',
        icon: <PeopleIcon />,
        title: 'CLIENTS & FOURNISSEURS',
        number: `${thirdPartyStats.totalTiers} Tiers`,
        subtitle: `${thirdPartyStats.clientsCount} clients • ${thirdPartyStats.fournisseursCount} fournisseurs`,
        url: '/tiers'
      });
    }

    if (canCommerciaux) {
      cards.push({
        id: 'commerciaux',
        variant: 'hover-zoom',
        color: 'deep-orange',
        icon: <BadgeIcon />,
        title: 'AGENTS COMMERCIAUX',
        number: `${commercialsStats.agentsActifsCount} Actifs`,
        subtitle: `Sur ${commercialsStats.agentsCount} agents enregistrés`,
        url: '/commerciaux'
      });
    }

    if (canStocks) {
      cards.push({
        id: 'stocks',
        variant: 'hover-zoom',
        color: 'purple',
        icon: <Inventory2Icon />,
        title: 'VALEUR STOCK ACHAT',
        number: formatCurrency(stockValuation.valeurAchatTotale),
        subtitle: `${articles.length} références d'articles`,
        url: '/stocks'
      });
    }

    if (canMaintenance) {
      cards.push({
        id: 'maintenance',
        variant: 'hover-zoom',
        color: 'blue-grey',
        icon: <BuildIcon />,
        title: 'MAINTENANCE EN COURS',
        number: `${maintenanceStats.enAttente + maintenanceStats.enCours} Tickets`,
        subtitle: `${maintenanceStats.terminees} terminées`,
        url: '/maintenance'
      });
    }

    return cards;
  }, [
    canPrestations,
    canCaisse,
    canCommissions,
    canTiers,
    canCommerciaux,
    canStocks,
    canMaintenance,
    prestationsStats,
    prestations.length,
    cashBalance,
    mouvements.length,
    commissionsStats.totalRestantADecaisser,
    thirdPartyStats,
    commercialsStats,
    stockValuation.valeurAchatTotale,
    articles.length,
    maintenanceStats
  ]);

  // Calcul dynamique de la grille pour une disposition harmonieuse
  const getGridSize = (total) => {
    if (total === 1) return { xs: 12, sm: 12, md: 8, lg: 6 };
    if (total === 2) return { xs: 12, sm: 6, md: 6, lg: 6 };
    if (total === 3) return { xs: 12, sm: 6, md: 4, lg: 4 };
    if (total === 4) return { xs: 12, sm: 6, md: 3, lg: 3 };
    if (total === 5 || total === 6) return { xs: 12, sm: 6, md: 4, lg: 4 };
    return { xs: 12, sm: 6, md: 4, lg: 3 };
  };

  return (
    <Box sx={{ pb: 3 }}>
      {/* Dynamic Info-Boxes based on module permissions */}
      {kpiCards.length > 0 ? (
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {kpiCards.map((kpi) => (
            <Grid key={kpi.id} size={getGridSize(kpiCards.length)}>
              <BsbInfoBox
                variant={kpi.variant}
                color={kpi.color}
                icon={kpi.icon}
                title={kpi.title}
                number={kpi.number}
                subtitle={kpi.subtitle}
                onClick={() => navigate(kpi.url)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3.5,
            border: '1px dashed #ccc',
            borderRadius: '2px',
            bgcolor: '#fafafa',
            textAlign: 'center'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#666' }}>
            Aucun indicateur de performance disponible
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Vous n'avez pas de modules de suivi assignés à votre profil. Contactez un administrateur pour configurer vos accès.
          </Typography>
        </Paper>
      )}

      {/* AdminBSB Card: Services & Modules */}
      <BsbCard
        title="SERVICES & MODULES ERP"
        subtitle="Accès instantané aux applications selon vos habilitations"
        headerAction={
          isAdmin && (
            <BsbButton
              size="sm"
              color="primary"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate('/admin/permissions')}
            >
              Gérer les Permissions
            </BsbButton>
          )
        }
      >
        <Grid container spacing={2}>
          {canPrestations && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #E91E63',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Prestations & Marges
                  </Typography>
                  <Chip label="11 Colonnes" size="small" sx={{ bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Calcul en cascade: Coûts, Ventes, Commissions (Apporteur 10%, Resp, Agent) et Bénéfice Réel.
                </Typography>
                <BsbButton
                  size="xs"
                  color="pink"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/prestations')}
                >
                  Ouvrir Prestations
                </BsbButton>
              </Paper>
            </Grid>
          )}

          {canCommissions && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #FF9800',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Gestion des Commissions
                  </Typography>
                  <Chip label="Commissions" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Suivi des versements, validation des décaissements et historique par agent/apporteur.
                </Typography>
                <BsbButton
                  size="xs"
                  color="orange"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/commissions')}
                >
                  Gérer Versements
                </BsbButton>
              </Paper>
            </Grid>
          )}

          {canCommerciaux && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #FF5722',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Force Commerciale
                  </Typography>
                  <Chip label="Équipe" size="small" sx={{ bgcolor: '#fbe9e7', color: '#bf360c', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Portefeuille d'agents, contrats clos, volume de ventes et commissions acquises.
                </Typography>
                <BsbButton
                  size="xs"
                  color="deep-orange"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/commerciaux')}
                >
                  Voir l'Équipe
                </BsbButton>
              </Paper>
            </Grid>
          )}

          {canTiers && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #3F51B5',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Clients & Fournisseurs
                  </Typography>
                  <Chip label="Annuaire" size="small" sx={{ bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Répertoire centralisé, fiches de contact et historique des opérations associées.
                </Typography>
                <BsbButton
                  size="xs"
                  color="indigo"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/tiers')}
                >
                  Consulter Tiers
                </BsbButton>
              </Paper>
            </Grid>
          )}

          {canCaisse && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #4CAF50',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Caisse & Dépenses
                  </Typography>
                  <Chip label="Trésorerie" size="small" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Flux de trésorerie, entrées/sorties en temps réel et solde bancaire/caisse.
                </Typography>
                <BsbButton
                  size="xs"
                  color="green"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/caisse')}
                >
                  Voir Trésorerie
                </BsbButton>
              </Paper>
            </Grid>
          )}

          {canStocks && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #9C27B0',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Stocks & Approvisionnement
                  </Typography>
                  <Chip label="Inventaire" size="small" sx={{ bgcolor: '#f3e5f5', color: '#4a148c', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Gestion des articles, valorisation du stock et alertes de seuil critique.
                </Typography>
                <BsbButton
                  size="xs"
                  color="purple"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/stocks')}
                >
                  Consulter Stock
                </BsbButton>
              </Paper>
            </Grid>
          )}

          {canMaintenance && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '4px solid #607D8B',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.1)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                    Maintenance & Pannes
                  </Typography>
                  <Chip label="Technique" size="small" sx={{ bgcolor: '#eceff1', color: '#37474f', fontWeight: 700, fontSize: '0.65rem' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: '#666', my: 1, fontSize: '0.78rem' }}>
                  Suivi des pannes, fiches d'interventions sur sites et techniciens assignés.
                </Typography>
                <BsbButton
                  size="xs"
                  color="blue-grey"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/maintenance')}
                >
                  Ouvrir Maintenance
                </BsbButton>
              </Paper>
            </Grid>
          )}
        </Grid>

        {!(canPrestations || canCommissions || canCommerciaux || canTiers || canCaisse || canStocks || canMaintenance) && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#64748b' }}>
              Aucun service applicatif habilité
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
              Votre profil utilisateur ne dispose actuellement d'aucun module activé. Contactez votre administrateur pour obtenir des accès.
            </Typography>
          </Box>
        )}
      </BsbCard>
    </Box>
  );
}
