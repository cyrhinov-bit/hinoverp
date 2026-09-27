import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Paper,
  Alert,
  AlertTitle,
  Button,
  Avatar
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
  formatCurrency,
  filterTiersForUser
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
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PublicIcon from '@mui/icons-material/Public';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Composants de Diagrammes Évolutifs
import RevenueEvolutionChart from './components/RevenueEvolutionChart';
import CashFlowEvolutionChart from './components/CashFlowEvolutionChart';
import ExpenseDistributionChart from './components/ExpenseDistributionChart';
import OperationalTrendChart from './components/OperationalTrendChart';

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
    commissions,
    selectedUserFilter,
    setSelectedUserFilter,
    effectiveFilteredUser
  } = useErpData();

  // Permissions par module (L'administrateur a une vue sur TOUT)
  const canTiers = isAdmin || hasModule('CLIENTS_FOURNISSEURS');
  const canCommerciaux = isAdmin || hasModule('COMMERCIAUX');
  const canCommissions = isAdmin || hasModule('COMMISSIONS');
  const canPrestations = isAdmin || hasModule('PRESTATIONS');
  const canCaisse = isAdmin || hasModule('CAISSE_DEPENSES');
  const canStocks = isAdmin || hasModule('STOCKS');
  const canMaintenance = isAdmin || hasModule('MAINTENANCE');

  // Utilisateur cible effectif pour le filtrage
  const effectiveTargetUser = useMemo(() => {
    if (!isAdmin) return currentUser;
    return effectiveFilteredUser; // null si 'ALL' (Vue Globale)
  }, [isAdmin, currentUser, effectiveFilteredUser]);

  // Prestations cloisonnées selon le périmètre sélectionné
  const userScopedPrestations = useMemo(() => {
    if (!effectiveTargetUser) return prestations;
    return prestations.filter((p) => 
      p.cree_par === effectiveTargetUser.id || 
      p.commercial_id === effectiveTargetUser.id || 
      p.commercial_nom === effectiveTargetUser.nom ||
      p.apporteur_id === effectiveTargetUser.id ||
      p.responsable_service_id === effectiveTargetUser.id
    );
  }, [prestations, effectiveTargetUser]);

  // Mouvements de caisse cloisonnés selon le périmètre sélectionné
  const userScopedMouvements = useMemo(() => {
    if (!effectiveTargetUser) return mouvements;
    return mouvements.filter((m) => {
      if (m.cree_par && m.cree_par === effectiveTargetUser.id) return true;
      if (m.beneficiaire_emetteur && m.beneficiaire_emetteur === effectiveTargetUser.nom) return true;
      if (m.tier_id && m.tier_id === effectiveTargetUser.id) return true;
      return false;
    });
  }, [mouvements, effectiveTargetUser]);

  // Tiers (Clients & Fournisseurs) cloisonnés selon le profil
  const userScopedClientsFournisseurs = useMemo(() => {
    if (!effectiveTargetUser) return clientsFournisseurs;
    return filterTiersForUser(clientsFournisseurs, effectiveTargetUser);
  }, [clientsFournisseurs, effectiveTargetUser]);

  // Interventions cloisonnées selon le profil
  const userScopedInterventions = useMemo(() => {
    if (!effectiveTargetUser) return interventions;
    return interventions.filter((i) => 
      i.technicien_assigne === effectiveTargetUser.nom || 
      i.utilisateur_concerne === effectiveTargetUser.nom ||
      i.client_id === effectiveTargetUser.id ||
      i.client_nom === effectiveTargetUser.nom
    );
  }, [interventions, effectiveTargetUser]);

  // Commissions cloisonnées selon le profil
  const userScopedCommissions = useMemo(() => {
    if (!effectiveTargetUser) return commissions;
    return commissions.filter((c) => 
      c.beneficiaire_id === effectiveTargetUser.id || 
      c.beneficiaire_nom === effectiveTargetUser.nom
    );
  }, [commissions, effectiveTargetUser]);

  // Calculs transversaux
  const cashBalance = calculateCashBalance(userScopedMouvements);
  const stockValuation = calculateStockValuation(articles);
  const maintenanceStats = calculateMaintenanceStats(userScopedInterventions);
  const prestationsStats = calculatePrestationsStats(userScopedPrestations);
  const thirdPartyStats = useMemo(() => {
    return calculateThirdPartyStats(userScopedClientsFournisseurs, userScopedPrestations, userScopedMouvements, userScopedInterventions, articles);
  }, [userScopedClientsFournisseurs, userScopedPrestations, userScopedMouvements, userScopedInterventions, articles]);
  const commissionsStats = useMemo(() => {
    return calculateCommissionsStats(userScopedCommissions);
  }, [userScopedCommissions]);
  const commercialsStats = useMemo(() => {
    return calculateCommercialsStats(agentsCommerciaux, userScopedPrestations, userScopedCommissions);
  }, [agentsCommerciaux, userScopedPrestations, userScopedCommissions]);

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
      {/* Bandeau d'information si un filtre utilisateur est sélectionné par le Directeur */}
      {isAdmin && selectedUserFilter !== 'ALL' && effectiveFilteredUser && (
        <Alert
          severity="info"
          icon={<FilterAltIcon fontSize="inherit" />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setSelectedUserFilter('ALL')}
              sx={{ fontWeight: 800, textTransform: 'none' }}
            >
              Réinitialiser à la Vue Globale
            </Button>
          }
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid #90caf9',
            bgcolor: '#e3f2fd',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={effectiveFilteredUser.avatar_url}
              sx={{ width: 32, height: 32, border: '2px solid #1976d2' }}
            >
              {effectiveFilteredUser.nom?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0d47a1' }}>
                Filtre Direction Actif : {effectiveFilteredUser.nom}
              </Typography>
              <Typography variant="caption" sx={{ color: '#1565c0' }}>
                Les KPIs, ventes, dépenses et activités ci-dessous correspondent exclusivement à ce collaborateur ({effectiveFilteredUser.poste || effectiveFilteredUser.email}).
              </Typography>
            </Box>
          </Stack>
        </Alert>
      )}

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

      {/* ========================================================================= */}
      {/* SECTION DES DIAGRAMMES D'ÉVOLUTION ANALYTIQUES (CHARTS DYNAMIQUES)        */}
      {/* ========================================================================= */}

      {/* 1. Évolution du Chiffre d'Affaires & Bénéfice Réel */}
      {canPrestations && (
        <Box sx={{ mb: 3.5 }}>
          <RevenueEvolutionChart prestations={userScopedPrestations} />
        </Box>
      )}

      {/* 2. Flux de Trésorerie & Répartition des Dépenses */}
      {canCaisse && (
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <CashFlowEvolutionChart mouvements={userScopedMouvements} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <ExpenseDistributionChart mouvements={userScopedMouvements} />
          </Grid>
        </Grid>
      )}

      {/* 3. Tendance des Activités Opérationnelles */}
      {(canPrestations || canMaintenance) && (
        <Box sx={{ mb: 1 }}>
          <OperationalTrendChart
            prestations={userScopedPrestations}
            interventions={userScopedInterventions}
            canPrestations={canPrestations}
            canMaintenance={canMaintenance}
          />
        </Box>
      )}

      {/* Message si aucun module graphique n'est habilité */}
      {!(canPrestations || canCaisse || canMaintenance) && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px dashed #cbd5e1',
            borderRadius: 2,
            bgcolor: '#f8fafc',
            textAlign: 'center'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
            Aucun diagramme d'évolution financière ou opérationnelle pour ce profil
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, maxWidth: 600, mx: 'auto' }}>
            Vos habilitations actuelles ({canStocks ? 'Stocks ' : ''}{canTiers ? 'Clients & Fournisseurs ' : ''}{canCommissions ? 'Commissions ' : ''}{canCommerciaux ? 'Équipe Commerciale ' : ''}) ne nécessitent pas de diagramme de flux. Utilisez le menu latéral pour consulter vos modules dédiés.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
