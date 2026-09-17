import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemText,
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
import { formatCurrency, calculateThirdPartyStats } from '@hinov/core';

import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function TiersManager() {
  const { currentUser, isAdmin } = useAuth();
  const {
    hasModule,
    clientsFournisseurs,
    prestations,
    interventions,
    articles,
    mouvements,
    addClientFournisseur,
    updateClientFournisseur,
    deleteClientFournisseur
  } = useErpData();

  const [activeTab, setActiveTab] = useState('ALL');
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTierForDrawer, setSelectedTierForDrawer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'CLIENT',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: 'Abidjan',
    notes: ''
  });

  // Cloisonnement : Chaque utilisateur ne voit que ses clients/fournisseurs. Seul l'admin a une vue globale.
  const userScopedClientsFournisseurs = useMemo(() => {
    if (isAdmin) return clientsFournisseurs;
    return clientsFournisseurs.filter((t) => t.cree_par === currentUser?.id);
  }, [clientsFournisseurs, isAdmin, currentUser]);

  // Analytics calculés sur le périmètre autorisé
  const stats = useMemo(() => {
    return calculateThirdPartyStats(userScopedClientsFournisseurs, prestations, mouvements, interventions, articles);
  }, [userScopedClientsFournisseurs, prestations, mouvements, interventions, articles]);

  // Filtrage selon onglet
  const filteredList = useMemo(() => {
    return userScopedClientsFournisseurs.filter((item) => {
      if (activeTab === 'ALL') return true;
      return item.type === activeTab;
    });
  }, [userScopedClientsFournisseurs, activeTab]);

  if (!isAdmin && !hasModule('CLIENTS_FOURNISSEURS')) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <BsbCard title="Module Clients & Fournisseurs Désactivé" sx={{ maxWidth: 550, textAlign: 'center' }}>
          <LockOutlinedIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            L'administrateur a désactivé le module <strong>Clients & Fournisseurs</strong> pour votre profil.
          </Typography>
        </BsbCard>
      </Box>
    );
  }

  const handleOpenCreate = (type = 'CLIENT') => {
    setEditingId(null);
    setFormData({
      type: type,
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      ville: 'Abidjan',
      notes: ''
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      type: item.type,
      nom: item.nom,
      telephone: item.telephone || '',
      email: item.email || '',
      adresse: item.adresse || '',
      ville: item.ville || 'Abidjan',
      notes: item.notes || ''
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;

    if (editingId) {
      updateClientFournisseur(editingId, formData);
    } else {
      addClientFournisseur({
        ...formData,
        cree_par: currentUser?.id || 'usr-admin-1',
        cree_par_nom: currentUser?.nom || currentUser?.email || 'Utilisateur'
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id, nom) => {
    if (window.confirm(`Confirmez-vous la suppression du tiers "${nom}" ?`)) {
      deleteClientFournisseur(id);
    }
  };

  // Récupérer l'historique croisé pour le tiers sélectionné
  const tierHistory = useMemo(() => {
    if (!selectedTierForDrawer) return null;
    const tier = selectedTierForDrawer;

    const relatedPrestations = prestations.filter(
      (p) => p.client_id === tier.id || p.client_nom === tier.nom
    );
    const relatedInterventions = interventions.filter(
      (i) => i.client_id === tier.id || i.client_nom === tier.nom
    );
    const relatedArticles = articles.filter(
      (a) => a.fournisseur_id === tier.id || a.fournisseur_nom === tier.nom
    );
    const relatedMouvements = mouvements.filter(
      (m) => m.tier_id === tier.id || m.tier_nom === tier.nom || m.beneficiaire_emetteur === tier.nom
    );

    const caTotal = relatedPrestations.reduce((sum, p) => sum + (Number(p.montant_total_vente) || 0), 0);
    const depensesTotal = relatedMouvements
      .filter((m) => m.type === 'SORTIE')
      .reduce((sum, m) => sum + (Number(m.montant) || 0), 0);
    const encaissementsTotal = relatedMouvements
      .filter((m) => m.type === 'ENTREE')
      .reduce((sum, m) => sum + (Number(m.montant) || 0), 0);

    return {
      tier,
      relatedPrestations,
      relatedInterventions,
      relatedArticles,
      relatedMouvements,
      caTotal,
      depensesTotal,
      encaissementsTotal
    };
  }, [selectedTierForDrawer, prestations, interventions, articles, mouvements]);

  const getTypeChip = (type) => {
    switch (type) {
      case 'CLIENT':
        return <Chip label="CLIENT" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'FOURNISSEUR':
        return <Chip label="FOURNISSEUR" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'PARTENAIRE':
        return <Chip label="PARTENAIRE" size="small" sx={{ bgcolor: '#f3e5f5', color: '#6a1b9a', fontWeight: 700, fontSize: '0.68rem' }} />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'type',
        label: 'Type',
        render: (tier) => getTypeChip(tier.type)
      },
      {
        id: 'nom',
        label: 'Nom / Raison Sociale',
        render: (tier) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#222' }}>
              {tier.nom}
            </Typography>
            {tier.notes && (
              <Typography variant="caption" sx={{ color: '#888', display: 'block', maxWidth: 280 }}>
                {tier.notes}
              </Typography>
            )}
          </Box>
        )
      },
      {
        id: 'contact',
        label: 'Contact',
        render: (tier) => (
          <Stack spacing={0.3}>
            {tier.telephone && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PhoneIcon sx={{ fontSize: 13, color: '#777' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
                  {tier.telephone}
                </Typography>
              </Stack>
            )}
            {tier.email && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmailIcon sx={{ fontSize: 13, color: '#777' }} />
                <Typography variant="caption" sx={{ color: '#0288d1' }}>
                  {tier.email}
                </Typography>
              </Stack>
            )}
          </Stack>
        )
      },
      {
        id: 'localisation',
        label: 'Localisation',
        render: (tier) => (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 14, color: '#777' }} />
            <Typography variant="body2" sx={{ color: '#555', fontSize: '0.8rem' }}>
              {tier.ville ? `${tier.ville}, ` : ''}{tier.adresse || 'N/A'}
            </Typography>
          </Stack>
        )
      },
      {
        id: 'liaisons',
        label: 'Liaisons ERP',
        render: (tier) => {
          const cmdCount = prestations.filter((p) => p.client_id === tier.id || p.client_nom === tier.nom).length;
          const intCount = interventions.filter((i) => i.client_id === tier.id || i.client_nom === tier.nom).length;
          const artCount = articles.filter((a) => a.fournisseur_id === tier.id || a.fournisseur_nom === tier.nom).length;

          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {tier.type === 'CLIENT' && (
                <>
                  <Chip size="small" label={`${cmdCount} cmd`} sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                  <Chip size="small" label={`${intCount} pannes`} sx={{ bgcolor: '#f5f5f5', color: '#666', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                </>
              )}
              {tier.type === 'FOURNISSEUR' && (
                <Chip size="small" label={`${artCount} articles`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
              )}
            </Stack>
          );
        }
      },
      ...(isAdmin ? [{
        id: 'cree_par',
        label: 'Créateur / Portefeuille',
        render: (tier) => (
          <Chip
            size="small"
            label={tier.cree_par_nom || (tier.cree_par === 'usr-admin-1' ? 'Direction (Admin)' : 'Direction')}
            sx={{
              bgcolor: tier.cree_par === 'usr-admin-1' ? '#fef3c7' : '#e0f2fe',
              color: tier.cree_par === 'usr-admin-1' ? '#92400e' : '#0369a1',
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 22
            }}
          />
        )
      }] : []),
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        sortable: false,
        render: (tier) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <BsbButton
              size="xs"
              color="blue"
              onClick={() => setSelectedTierForDrawer(tier)}
              tooltip="Voir l'historique croisé"
            >
              <VisibilityIcon sx={{ fontSize: 14 }} />
            </BsbButton>
            <BsbButton
              size="xs"
              color="teal"
              onClick={() => handleOpenEdit(tier)}
              tooltip="Modifier"
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </BsbButton>
            <BsbButton
              size="xs"
              color="red"
              onClick={() => handleDelete(tier.id, tier.nom)}
              tooltip="Supprimer"
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </BsbButton>
          </Stack>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userScopedClientsFournisseurs, isAdmin, prestations, interventions, articles]
  );

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Cards Row (AdminBSB Info-Boxes) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="blue"
            icon={<BusinessIcon />}
            title={isAdmin ? "TOTAL CLIENTS ACTIFS" : "MES CLIENTS ACTIFS"}
            number={stats.clientsCount}
            subtitle={`CA généré : ${formatCurrency(stats.totalVentesClients)}`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="orange"
            icon={<StoreIcon />}
            title={isAdmin ? "TOTAL FOURNISSEURS" : "MES FOURNISSEURS"}
            number={stats.fournisseursCount}
            subtitle={`Achats payés : ${formatCurrency(stats.totalDecaissementsFournisseurs)}`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="green"
            icon={<ReceiptIcon />}
            title="ENCAISSEMENTS CLIENTS"
            number={formatCurrency(stats.totalEncaissementsClients)}
            subtitle={`Marge brute : ${formatCurrency(stats.totalMargeClients)}`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="purple"
            icon={<HandshakeIcon />}
            title="PARTENAIRES"
            number={stats.partenairesCount}
            subtitle={`Portefeuille : ${stats.totalTiers} Tiers`}
          />
        </Grid>
      </Grid>

      {/* Main DataTable Card */}
      <BsbCard
        title={isAdmin ? "ANNUAIRE GLOBAL DES TIERS (VUE ADMINISTRATEUR CONSOLIDÉE)" : "MES CLIENTS & FOURNISSEURS"}
        subtitle={isAdmin ? "Accès superviseur à l'intégralité des tiers de tous les collaborateurs" : "Gestion de votre portefeuille dédié de clients, fournisseurs et partenaires"}
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenCreate('CLIENT')}
          >
            Nouveau Tiers
          </BsbButton>
        }
      >
        {/* Tabs Filter */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.78rem',
                minWidth: 100
              }
            }}
          >
            <Tab label={`Tous (${userScopedClientsFournisseurs.length})`} value="ALL" />
            <Tab label={`Clients (${stats.clientsCount})`} value="CLIENT" />
            <Tab label={`Fournisseurs (${stats.fournisseursCount})`} value="FOURNISSEUR" />
            <Tab label={`Partenaires (${stats.partenairesCount})`} value="PARTENAIRE" />
          </Tabs>
        </Box>

        <BsbDataTable
          columns={columns}
          rows={filteredList}
          searchPlaceholder="Rechercher nom, contact, ville..."
        />
      </BsbCard>

      {/* Modal Création / Modification Tiers (AdminBSB Modal) */}
      <BsbModal
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'MODIFIER LA FICHE TIERS' : 'NOUVEAU TIERS (CLIENT / FOURNISSEUR)'}
        subtitle="Enregistrement des coordonnées et informations générales"
        headerColor="primary"
        maxWidth="sm"
        actions={
          <>
            <BsbButton
              variant="outlined"
              color="blue-grey"
              size="sm"
              onClick={handleCloseModal}
            >
              Annuler
            </BsbButton>
            <BsbButton
              color="primary"
              size="sm"
              onClick={handleSubmit}
            >
              {editingId ? 'Mettre à jour' : 'Enregistrer le Tiers'}
            </BsbButton>
          </>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <BsbSelect
              label="Type de Tiers"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'CLIENT', label: 'Client (Entreprises, institutions, particuliers)' },
                { value: 'FOURNISSEUR', label: 'Fournisseur (Grossistes, distributeurs, matériel)' },
                { value: 'PARTENAIRE', label: 'Partenaire (Sous-traitants, prestataires)' }
              ]}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BsbTextField
              label="Nom / Raison Sociale"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Société Générale, Afric Distribution..."
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="+225 07 00 00 00 00"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              type="email"
              label="Email de contact"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@entreprise.ci"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Ville"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Adresse / Commune / Rue"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              placeholder="Ex: Plateau Rue du Commerce"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BsbTextField
              multiline
              rows={2}
              label="Notes / Remarques"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Spécificités, conditions de règlement..."
            />
          </Grid>
        </Grid>
      </BsbModal>

      {/* Drawer Historique Croisé Tiers */}
      <Drawer
        anchor="right"
        open={Boolean(selectedTierForDrawer)}
        onClose={() => setSelectedTierForDrawer(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3, borderRadius: '3px 0 0 3px' } }}
      >
        {tierHistory && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#333', textTransform: 'uppercase' }}>
                Fiche & Historique Croisé
              </Typography>
              {getTypeChip(tierHistory.tier.type)}
            </Stack>

            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: '2px', mb: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#222' }}>
                {tierHistory.tier.nom}
              </Typography>
              <Typography variant="body2" sx={{ color: '#777', mt: 0.3 }}>
                {tierHistory.tier.telephone || 'Aucun numéro'} • {tierHistory.tier.email || 'Aucun email'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.3 }}>
                {tierHistory.tier.adresse}, {tierHistory.tier.ville}
              </Typography>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {tierHistory.tier.type === 'CLIENT' && (
                <>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '2px' }}>
                      <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 700 }}>CA TOTAL VENTES</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0d47a1' }}>
                        {formatCurrency(tierHistory.caTotal)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 1.5, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '2px' }}>
                      <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700 }}>ENCAISSEMENTS</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                        {formatCurrency(tierHistory.encaissementsTotal)}
                      </Typography>
                    </Paper>
                  </Grid>
                </>
              )}
              {tierHistory.tier.type === 'FOURNISSEUR' && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '2px' }}>
                    <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700 }}>TOTAL DÉPENSES PAYÉES</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#bf360c' }}>
                      {formatCurrency(tierHistory.depensesTotal)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>

            {tierHistory.relatedPrestations.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#555', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                  Commandes & Devis ({tierHistory.relatedPrestations.length})
                </Typography>
                <List dense sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
                  {tierHistory.relatedPrestations.map((p) => (
                    <ListItem key={p.id} divider>
                      <ListItemText
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.reference} - {p.description}</Typography>}
                        secondary={`Montant : ${formatCurrency(p.montant_total_vente)} | Statut : ${p.statut}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <BsbButton fullWidth variant="outlined" color="blue-grey" onClick={() => setSelectedTierForDrawer(null)}>
              Fermer la Fiche
            </BsbButton>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
