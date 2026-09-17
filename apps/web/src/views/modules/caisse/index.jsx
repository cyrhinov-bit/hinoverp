import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';

import {
  BsbCard,
  BsbInfoBox,
  BsbDataTable,
  BsbButton,
  BsbModal,
  BsbTextField,
  BsbSelect
} from 'components/adminbsb';

import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';
import { calculateCashFlowStats, formatCurrency } from '@hinov/core';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import PercentIcon from '@mui/icons-material/Percent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';

export default function CaisseModule() {
  const { currentUser, isAdmin } = useAuth();
  const { hasModule, mouvements, clientsFournisseurs, addMouvement, deleteMouvement } = useErpData();

  const [openModal, setOpenModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  // Confirmation Modal State: { mvt: Object } | null
  const [deleteConfirmMvt, setDeleteConfirmMvt] = useState(null);

  // Droits d'accès aux modules pour l'utilisateur connecté (L'administrateur a une vue sur TOUT)
  const canPrestations = isAdmin || hasModule('PRESTATIONS');
  const canMaintenance = isAdmin || hasModule('MAINTENANCE');
  const canStocks = isAdmin || hasModule('STOCKS');
  const canCommissions = isAdmin || hasModule('COMMISSIONS');
  const canCaisse = isAdmin || hasModule('CAISSE_DEPENSES');

  const clients = useMemo(() => clientsFournisseurs.filter((t) => t.type === 'CLIENT'), [clientsFournisseurs]);
  const fournisseurs = useMemo(() => clientsFournisseurs.filter((t) => t.type === 'FOURNISSEUR'), [clientsFournisseurs]);

  // Options de modules disponibles pour la saisie selon les droits de l'utilisateur
  const availableModuleOptions = useMemo(() => {
    const opts = [];
    if (isAdmin) {
      opts.push({ value: 'GENERAL', label: 'Trésorerie Centrale & Frais Généraux' });
    }
    if (canPrestations || isAdmin) {
      opts.push({ value: 'PRESTATIONS', label: 'Prestations & Ventes' });
    }
    if (canMaintenance || isAdmin) {
      opts.push({ value: 'MAINTENANCE', label: 'Maintenance & Interventions' });
    }
    if (canStocks || isAdmin) {
      opts.push({ value: 'STOCKS', label: 'Stocks & Approvisionnements' });
    }
    if (canCommissions || isAdmin) {
      opts.push({ value: 'COMMISSIONS', label: 'Commissions & Apporteurs' });
    }
    if (opts.length === 0) {
      opts.push({ value: 'GENERAL', label: 'Caisse Opérationnelle' });
    }
    return opts;
  }, [isAdmin, canPrestations, canMaintenance, canStocks, canCommissions]);

  const [formData, setFormData] = useState({
    type: 'SORTIE',
    montant: '',
    motif: '',
    categorie: 'ACHATS',
    module_code: availableModuleOptions[0]?.value || 'GENERAL',
    tier_id: '',
    tier_type: 'FOURNISSEUR',
    tier_nom: '',
    beneficiaire_emetteur: '',
    mode_reglement: 'ESPECES'
  });



  // 1. Filtrage cloisonné par habilitation de l'utilisateur
  const userScopedMouvements = useMemo(() => {
    if (isAdmin) {
      return mouvements; // Vue globale consolidée pour l'admin
    }
    return mouvements.filter((m) => {
      // Écritures créées par l'utilisateur connecté
      if (m.cree_par && m.cree_par === currentUser?.id) return true;

      // Écritures relatives aux modules autorisés
      const mod = m.module_code || m.categorie;
      if (mod === 'PRESTATIONS' && canPrestations) return true;
      if (mod === 'MAINTENANCE' && canMaintenance) return true;
      if (mod === 'STOCKS' && canStocks) return true;
      if (mod === 'COMMISSIONS' && canCommissions) return true;
      if (mod === 'GENERAL' && canCaisse) return true;

      // Compatibilité ancienne si non renseigné
      return false;
    });
  }, [mouvements, isAdmin, currentUser, canPrestations, canMaintenance, canStocks, canCommissions, canCaisse]);

  // 2. Calcul des KPI sur le périmètre cloisonné de l'utilisateur
  const cashStats = calculateCashFlowStats(userScopedMouvements);

  // 3. Filtrage UI supplémentaire (Tiers, Sens de flux, Module)
  const filtered = useMemo(() => {
    return userScopedMouvements.filter((m) => {
      const matchType = filterType === 'ALL' || m.type === filterType;
      const matchTier =
        tierFilter === 'ALL' ||
        m.tier_id === tierFilter ||
        m.tier_nom === tierFilter ||
        m.beneficiaire_emetteur === tierFilter;
      const matchModule = moduleFilter === 'ALL' || (m.module_code || m.categorie) === moduleFilter;
      return matchType && matchTier && matchModule;
    });
  }, [userScopedMouvements, filterType, tierFilter, moduleFilter]);

  const handleTierSelect = (tierId) => {
    if (!tierId) {
      setFormData((prev) => ({ ...prev, tier_id: '', tier_nom: '', tier_type: 'AUTRE' }));
      return;
    }
    const found = clientsFournisseurs.find((t) => t.id === tierId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        tier_id: found.id,
        tier_type: found.type,
        tier_nom: found.nom,
        beneficiaire_emetteur: found.nom
      }));
    }
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      categorie: newType === 'ENTREE' ? 'PRESTATION' : 'ACHATS',
      tier_id: '',
      tier_nom: '',
      tier_type: newType === 'ENTREE' ? 'CLIENT' : 'FOURNISSEUR',
      beneficiaire_emetteur: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.motif || !formData.montant) return;

    addMouvement({
      ...formData,
      montant: Number(formData.montant),
      module_code: formData.module_code || 'GENERAL',
      cree_par: currentUser?.id || 'anonymous',
      cree_par_nom: currentUser?.nom || currentUser?.email || 'Utilisateur',
      beneficiaire_emetteur: formData.beneficiaire_emetteur || formData.tier_nom || 'Non spécifié'
    });

    setFormData({
      type: 'SORTIE',
      montant: '',
      motif: '',
      categorie: 'ACHATS',
      module_code: availableModuleOptions[0]?.value || 'GENERAL',
      tier_id: '',
      tier_type: 'FOURNISSEUR',
      tier_nom: '',
      beneficiaire_emetteur: '',
      mode_reglement: 'ESPECES'
    });
    setOpenModal(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmMvt) {
      deleteMouvement(deleteConfirmMvt.id);
      setDeleteConfirmMvt(null);
    }
  };

  const getModeReglementChip = (mode) => {
    switch (mode) {
      case 'ESPECES':
        return <Chip label="Espèces" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.72rem', borderRadius: '2px' }} />;
      case 'MOBILE_MONEY':
        return <Chip label="Mobile Money" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600, fontSize: '0.72rem', borderRadius: '2px' }} />;
      case 'CHEQUE':
        return <Chip label="Chèque" size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 600, fontSize: '0.72rem', borderRadius: '2px' }} />;
      case 'VIREMENT':
        return <Chip label="Virement" size="small" sx={{ bgcolor: '#F3E5F5', color: '#6A1B9A', fontWeight: 600, fontSize: '0.72rem', borderRadius: '2px' }} />;
      default:
        return <Chip label={mode || 'ESPECES'} size="small" sx={{ borderRadius: '2px' }} />;
    }
  };

  const getModuleChip = (moduleCode) => {
    switch (moduleCode) {
      case 'PRESTATIONS':
        return <Chip label="Prestations" size="small" sx={{ bgcolor: '#FCE4EC', color: '#C2185B', fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px' }} />;
      case 'MAINTENANCE':
        return <Chip label="Maintenance" size="small" sx={{ bgcolor: '#ECEFF1', color: '#37474F', fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px' }} />;
      case 'STOCKS':
        return <Chip label="Stocks" size="small" sx={{ bgcolor: '#F3E5F5', color: '#6A1B9A', fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px' }} />;
      case 'COMMISSIONS':
        return <Chip label="Commissions" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px' }} />;
      case 'GENERAL':
      default:
        return <Chip label="Trésorerie" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px' }} />;
    }
  };

  return (
    <Box sx={{ pb: 3 }}>
      {/* Bannière de Périmètre (Vue Consolidée vs Caisse de Service) */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2.5,
          bgcolor: isAdmin ? '#E8F5E9' : '#E1F5FE',
          border: `1px solid ${isAdmin ? '#C8E6C9' : '#B3E5FC'}`,
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isAdmin ? (
            <AdminPanelSettingsIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
          ) : (
            <SecurityIcon sx={{ color: '#0288D1', fontSize: 24 }} />
          )}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isAdmin ? '#1B5E20' : '#01579B' }}>
              {isAdmin ? 'VUE TRÉSORERIE CONSOLIDÉE (ADMINISTRATEUR)' : 'CAISSE & DÉPENSES DU SERVICE'}
            </Typography>
            <Typography variant="caption" sx={{ color: isAdmin ? '#2E7D32' : '#0288D1' }}>
              {isAdmin
                ? 'Accès centralisé à l’ensemble des flux financiers de tous les modules et services de l’entreprise.'
                : 'Cloisonnement actif : Vous gérez et visualisez uniquement les flux financiers liés à vos modules autorisés.'}
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={isAdmin ? 'Toutes les Caisses' : `${userScopedMouvements.length} écritures autorisées`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: isAdmin ? '#2E7D32' : '#0288D1',
            color: '#fff',
            borderRadius: '2px'
          }}
        />
      </Paper>

      {/* Cartes KPI Caisse - AdminBSB Signature Info-Boxes */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="light-green"
            icon={<ArrowDownwardIcon />}
            title="TOTAL RECETTES"
            number={formatCurrency(cashStats.totalEntrees)}
            subtitle={isAdmin ? 'Recettes globales entreprise' : 'Recettes de votre service'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="red"
            icon={<ArrowUpwardIcon />}
            title="TOTAL DÉPENSES"
            number={formatCurrency(cashStats.totalSorties)}
            subtitle={isAdmin ? 'Dépenses globales' : 'Dépenses de votre service'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="green"
            icon={<AccountBalanceWalletIcon />}
            title="SOLDE DE CAISSE"
            number={formatCurrency(cashStats.solde)}
            subtitle={isAdmin ? 'Trésorerie globale live' : 'Solde disponible du service'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-zoom"
            color="orange"
            icon={<PercentIcon />}
            title="DÉCAISSEMENT"
            number={`${cashStats.ratioDecaissement} %`}
            subtitle="Ratio Sorties / Entrées"
          />
        </Grid>
      </Grid>

      {/* Main AdminBSB Card: Journal des Écritures */}
      <BsbCard
        title={isAdmin ? 'JOURNAL DE CAISSE GLOBAL & FLUX DE TRÉSORERIE' : 'JOURNAL DE CAISSE & DÉPENSES DU SERVICE'}
        subtitle="Historique des mouvements financiers, encaissements et dépenses en temps réel"
        headerColor="green"
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Nouvelle Écriture
          </BsbButton>
        }
      >
        {/* Filtres de recherche */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2.5, flexWrap: 'wrap' }}>
          {/* Filtre par Module/Service */}
          <Box sx={{ minWidth: 200 }}>
            <BsbSelect
              label="Service / Module"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tous les services' },
                { value: 'PRESTATIONS', label: 'Prestations & Ventes' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
                { value: 'STOCKS', label: 'Stocks & Achats' },
                { value: 'COMMISSIONS', label: 'Commissions' },
                { value: 'GENERAL', label: 'Trésorerie Centrale' }
              ]}
            />
          </Box>

          {/* Filtre par Tiers */}
          <Box sx={{ minWidth: 220 }}>
            <BsbSelect
              label="Filtrer par Tiers"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tous les tiers' },
                ...clientsFournisseurs.map((t) => ({
                  value: t.id,
                  label: `[${t.type === 'CLIENT' ? 'Client' : 'Fourn.'}] ${t.nom}`
                }))
              ]}
            />
          </Box>

          {/* Chips Sens de flux */}
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {[
              { id: 'ALL', label: 'Toutes' },
              { id: 'ENTREE', label: 'Entrées (+)' },
              { id: 'SORTIE', label: 'Sorties (-)' }
            ].map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                clickable
                color={filterType === f.id ? 'primary' : 'default'}
                onClick={() => setFilterType(f.id)}
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: '2px',
                  bgcolor: filterType === f.id ? '#4CAF50' : '#eee',
                  color: filterType === f.id ? '#fff' : '#444'
                }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Table AdminBSB */}
        <BsbDataTable
          columns={[
            {
              id: 'date',
              label: 'Date & Heure',
              render: (row) => (
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {new Date(row.date).toLocaleDateString('fr-FR')} {new Date(row.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )
            },
            {
              id: 'module',
              label: 'Service / Module',
              align: 'center',
              render: (row) => getModuleChip(row.module_code || row.categorie)
            },
            {
              id: 'type',
              label: 'Sens Flux',
              align: 'center',
              render: (row) => {
                const isEntree = row.type === 'ENTREE';
                return (
                  <Chip
                    label={isEntree ? 'ENTRÉE (+)' : 'SORTIE (-)'}
                    size="small"
                    sx={{
                      bgcolor: isEntree ? '#E8F5E9' : '#FFEBEE',
                      color: isEntree ? '#2E7D32' : '#C62828',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      borderRadius: '2px'
                    }}
                  />
                );
              }
            },
            {
              id: 'tier',
              label: 'Tiers / Bénéficiaire',
              render: (row) => (
                <Box>
                  {row.tier_nom ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {row.tier_type === 'CLIENT' ? (
                        <BusinessIcon sx={{ fontSize: 15, color: '#1565C0' }} />
                      ) : (
                        <StoreIcon sx={{ fontSize: 15, color: '#E65100' }} />
                      )}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: row.tier_type === 'CLIENT' ? '#1565C0' : '#E65100',
                          fontSize: '0.8rem'
                        }}
                      >
                        {row.tier_nom}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, fontSize: '0.8rem' }}>
                      {row.beneficiaire_emetteur || 'Interne / Caisse'}
                    </Typography>
                  )}
                  {row.cree_par_nom && (
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', fontSize: '0.68rem' }}>
                      Saisi par : {row.cree_par_nom}
                    </Typography>
                  )}
                </Box>
              )
            },
            {
              id: 'motif',
              label: 'Motif / Justification',
              render: (row) => (
                <Box sx={{ maxWidth: 280 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: '0.82rem' }}>
                    {row.motif}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem', display: 'block' }}>
                    Catégorie : {row.categorie || 'Général'}
                  </Typography>
                </Box>
              )
            },
            {
              id: 'mode_reglement',
              label: 'Règlement',
              align: 'center',
              render: (row) => getModeReglementChip(row.mode_reglement)
            },
            {
              id: 'montant',
              label: 'Montant',
              align: 'right',
              render: (row) => {
                const isEntree = row.type === 'ENTREE';
                return (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: isEntree ? '#2E7D32' : '#C62828'
                    }}
                  >
                    {isEntree ? '+' : '-'} {formatCurrency(row.montant)}
                  </Typography>
                );
              }
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'center',
              render: (row) => (
                <Tooltip title="Supprimer cette écriture">
                  <IconButton
                    size="small"
                    sx={{ color: '#E53935', '&:hover': { bgcolor: '#FFEBEE' } }}
                    onClick={() => setDeleteConfirmMvt(row)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
          ]}
          data={filtered}
          emptyMessage="Aucune écriture de caisse trouvée pour votre périmètre."
        />
      </BsbCard>

      {/* Modal de Confirmation de Suppression */}
      <BsbModal
        open={Boolean(deleteConfirmMvt)}
        onClose={() => setDeleteConfirmMvt(null)}
        title="SUPPRIMER L'ÉCRITURE DE CAISSE"
        headerColor="red"
        maxWidth="xs"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setDeleteConfirmMvt(null)}>
              Annuler
            </BsbButton>
            <BsbButton color="danger" onClick={handleConfirmDelete}>
              Supprimer définitivement
            </BsbButton>
          </>
        }
      >
        {deleteConfirmMvt && (
          <Box sx={{ py: 1 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 36, color: '#D32F2F', flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                  Êtes-vous sûr de vouloir supprimer cette écriture ?
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  Cette opération impactera immédiatement le solde calculé de votre caisse. Cette action est irréversible.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '2px', border: '1px solid #e9ecef' }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, display: 'block', mb: 0.5 }}>
                DÉTAILS DE L'OPÉRATION :
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
                {deleteConfirmMvt.motif}
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                Sens : {deleteConfirmMvt.type === 'ENTREE' ? 'Entrée (+)' : 'Sortie (-)'} • Mode : {deleteConfirmMvt.mode_reglement}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: deleteConfirmMvt.type === 'ENTREE' ? '#2E7D32' : '#C62828', mt: 0.5 }}>
                Montant : {formatCurrency(deleteConfirmMvt.montant)}
              </Typography>
            </Box>
          </Box>
        )}
      </BsbModal>

      {/* Modal d'ajout d'écriture */}
      <BsbModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="NOUVELLE ÉCRITURE DE CAISSE"
        headerColor={formData.type === 'ENTREE' ? 'light-green' : 'red'}
        maxWidth="sm"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setOpenModal(false)}>
              Annuler
            </BsbButton>
            <BsbButton color={formData.type === 'ENTREE' ? 'success' : 'danger'} onClick={handleSubmit}>
              Enregistrer l'opération
            </BsbButton>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* Rattachement Module & Service */}
            <BsbSelect
              label="Module / Service concerné"
              value={formData.module_code}
              onChange={(e) => setFormData({ ...formData, module_code: e.target.value })}
              options={availableModuleOptions}
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbSelect
                  label="Sens du Flux"
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  options={[
                    { value: 'SORTIE', label: 'Sortie / Dépense (-)' },
                    { value: 'ENTREE', label: 'Entrée / Recette (+)' }
                  ]}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbSelect
                  label="Mode de Règlement"
                  value={formData.mode_reglement}
                  onChange={(e) => setFormData({ ...formData, mode_reglement: e.target.value })}
                  options={[
                    { value: 'ESPECES', label: 'Espèces' },
                    { value: 'MOBILE_MONEY', label: 'Mobile Money (Wave / Orange)' },
                    { value: 'CHEQUE', label: 'Chèque Bancaire' },
                    { value: 'VIREMENT', label: 'Virement Bancaire' }
                  ]}
                  required
                />
              </Grid>
            </Grid>

            {/* Sélecteur de tiers contextuel */}
            <BsbSelect
              label={formData.type === 'ENTREE' ? 'Client émetteur (Optionnel)' : 'Fournisseur / Bénéficiaire (Optionnel)'}
              value={formData.tier_id}
              onChange={(e) => handleTierSelect(e.target.value)}
              options={[
                { value: '', label: '-- Tiers non listé (saisie manuelle ci-dessous) --' },
                ...(formData.type === 'ENTREE' ? clients : fournisseurs).map((t) => ({
                  value: t.id,
                  label: `${t.nom} (${t.ville || 'Abidjan'})`
                }))
              ]}
            />

            <BsbTextField
              label="Nom du Tiers / Bénéficiaire / Émetteur"
              value={formData.beneficiaire_emetteur}
              onChange={(e) => setFormData({ ...formData, beneficiaire_emetteur: e.target.value })}
              placeholder="Ex: Afric Distribution, Koffi Paul, Direction..."
            />

            <BsbTextField
              label="Montant de l'opération (FCFA)"
              type="number"
              required
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              placeholder="Ex: 50000"
            />

            <BsbTextField
              label="Motif / Justification de l'écriture"
              required
              multiline
              rows={2}
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              placeholder="Ex: Règlement acompte prestation, Achat disjoncteurs urgents..."
            />
          </Stack>
        </form>
      </BsbModal>
    </Box>
  );
}
