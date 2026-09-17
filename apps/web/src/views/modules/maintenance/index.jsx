import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip
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

import { useErpData } from 'context/ErpDataContext';
import { calculateMaintenanceStats, formatCurrency } from '@hinov/core';

import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BusinessIcon from '@mui/icons-material/Business';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function MaintenanceModule() {
  const { hasModule, interventions, clientsFournisseurs, addIntervention, updateIntervention, deleteIntervention } = useErpData();
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');

  // Confirmation Modal State: { type: 'PRISE_EN_MAIN' | 'CLOTURER' | 'DELETE', item: Object } | null
  const [confirmModal, setConfirmModal] = useState(null);

  const clients = useMemo(() => clientsFournisseurs.filter((t) => t.type === 'CLIENT'), [clientsFournisseurs]);

  // Formulaire d'ajout / modification
  const [formData, setFormData] = useState({
    client_id: '',
    client_nom: '',
    site_agence: '',
    utilisateur_concerne: '',
    equipement: '',
    observation: '',
    travaux: '',
    quantite: 1,
    prix_unitaire: '',
    priorite: 'MOYENNE',
    technicien_assigne: '',
    date_intervention: new Date().toISOString().split('T')[0]
  });

  // Calcul automatique du coût total pour le formulaire
  const calculatedTotalCost = useMemo(() => {
    const qty = Number(formData.quantite) || 0;
    const unitPrice = Number(formData.prix_unitaire) || 0;
    return qty * unitPrice;
  }, [formData.quantite, formData.prix_unitaire]);

  if (!hasModule('MAINTENANCE')) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <BsbCard sx={{ maxWidth: 550, textAlign: 'center', p: 4, borderTop: '3px solid #FF9800' }}>
          <LockOutlinedIcon sx={{ fontSize: 64, color: '#FF9800', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#E65100', mb: 1 }}>
            Module Maintenance Désactivé
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 3 }}>
            L'administrateur de l'ERP a désactivé le module <strong>Maintenance & Interventions</strong> pour votre profil.
          </Typography>
          <Alert severity="warning" sx={{ textAlign: 'left', borderRadius: '2px' }}>
            Si vous devez accéder à ce service, contactez un administrateur pour activer l'interrupteur toggle correspondant.
          </Alert>
        </BsbCard>
      </Box>
    );
  }

  const stats = calculateMaintenanceStats(interventions);

  const handleClientSelect = (clientId) => {
    if (!clientId) {
      setFormData((prev) => ({ ...prev, client_id: '', client_nom: '' }));
      return;
    }
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        client_id: found.id,
        client_nom: found.nom,
        site_agence: prev.site_agence || `${found.nom} (${found.ville || 'Site Principal'})`
      }));
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      client_id: '',
      client_nom: '',
      site_agence: '',
      utilisateur_concerne: '',
      equipement: '',
      observation: '',
      travaux: '',
      quantite: 1,
      prix_unitaire: '',
      priorite: 'MOYENNE',
      technicien_assigne: '',
      date_intervention: new Date().toISOString().split('T')[0]
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const dateVal = item.date_intervention 
      ? (item.date_intervention.includes('T') ? item.date_intervention.split('T')[0] : item.date_intervention)
      : new Date().toISOString().split('T')[0];
    setFormData({
      client_id: item.client_id || '',
      client_nom: item.client_nom || '',
      site_agence: item.site_agence || '',
      utilisateur_concerne: item.utilisateur_concerne || '',
      equipement: item.equipement || '',
      observation: item.observation || '',
      travaux: item.travaux || '',
      quantite: item.quantite || 1,
      prix_unitaire: item.prix_unitaire !== undefined ? String(item.prix_unitaire) : (item.prix && item.quantite ? String(item.prix / item.quantite) : ''),
      priorite: item.priorite || 'MOYENNE',
      technicien_assigne: item.technicien_assigne || '',
      date_intervention: dateVal
    });
    setOpenModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.site_agence || !formData.equipement) return;

    const qty = Number(formData.quantite) || 1;
    const unitPrice = Number(formData.prix_unitaire) || 0;
    const totalCost = qty * unitPrice;
    const isoDate = formData.date_intervention ? new Date(formData.date_intervention).toISOString() : new Date().toISOString();

    const payload = {
      ...formData,
      quantite: qty,
      prix_unitaire: unitPrice,
      prix: totalCost,
      date_intervention: isoDate
    };

    if (editingItem) {
      updateIntervention(editingItem.id, payload);
    } else {
      addIntervention({
        ...payload,
        statut: 'EN_ATTENTE'
      });
    }

    setEditingItem(null);
    setFormData({
      client_id: '',
      client_nom: '',
      site_agence: '',
      utilisateur_concerne: '',
      equipement: '',
      observation: '',
      travaux: '',
      quantite: 1,
      prix_unitaire: '',
      priorite: 'MOYENNE',
      technicien_assigne: '',
      date_intervention: new Date().toISOString().split('T')[0]
    });
    setOpenModal(false);
  };

  const handleExecuteConfirmedAction = () => {
    if (!confirmModal || !confirmModal.item) return;

    const { type, item } = confirmModal;
    if (type === 'PRISE_EN_MAIN') {
      updateIntervention(item.id, { statut: 'EN_COURS' });
    } else if (type === 'CLOTURER') {
      updateIntervention(item.id, { statut: 'TERMINEE' });
    } else if (type === 'DELETE') {
      deleteIntervention(item.id);
    }
    setConfirmModal(null);
  };

  const filtered = interventions.filter((item) => {
    const matchStatus = statusFilter === 'ALL' || item.statut === statusFilter;
    const matchClient = clientFilter === 'ALL' || item.client_id === clientFilter || item.client_nom === clientFilter;
    return matchStatus && matchClient;
  });

  const getStatusChip = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return <Chip label="En attente" size="small" sx={{ bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 700, borderRadius: '3px' }} />;
      case 'EN_COURS':
        return <Chip label="En cours" size="small" sx={{ bgcolor: '#E1F5FE', color: '#0288D1', fontWeight: 700, borderRadius: '3px' }} />;
      case 'TERMINEE':
        return <Chip label="Clôturée" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, borderRadius: '3px' }} />;
      case 'ANNULEE':
        return <Chip label="Annulée" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 700, borderRadius: '3px' }} />;
      default:
        return <Chip label={statut} size="small" />;
    }
  };

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Info Boxes AdminBSB */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="amber"
            icon={<PendingActionsIcon />}
            title="EN ATTENTE"
            number={stats.enAttente}
            subtitle="Tickets à prendre en main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="light-blue"
            icon={<AutorenewIcon />}
            title="EN COURS"
            number={stats.enCours}
            subtitle="Travaux en traitement"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="light-green"
            icon={<CheckCircleOutlineIcon />}
            title="CLÔTURÉES"
            number={stats.terminees}
            subtitle="Interventions terminées"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-zoom"
            color="blue-grey"
            icon={<BuildIcon />}
            title="COÛT ENGAGÉ"
            number={formatCurrency(stats.coutTotal)}
            subtitle="Montant total des travaux"
          />
        </Grid>
      </Grid>

      {/* Main AdminBSB Card: Table des Interventions */}
      <BsbCard
        title="JOURNAL DES INTERVENTIONS & SUIVI SITES"
        subtitle="Gestion des tickets techniques, suivi de la prise en main et clôture des pannes"
        headerColor="blue-grey"
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nouvelle Intervention
          </BsbButton>
        }
      >
        {/* Filtres de recherche */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Box sx={{ minWidth: 240 }}>
            <BsbSelect
              label="Filtrer par Client"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tous les clients' },
                ...clients.map((c) => ({ value: c.id, label: c.nom }))
              ]}
            />
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {[
              { id: 'ALL', label: 'Tous' },
              { id: 'EN_ATTENTE', label: 'En attente' },
              { id: 'EN_COURS', label: 'En cours' },
              { id: 'TERMINEE', label: 'Clôturées' }
            ].map((st) => (
              <Chip
                key={st.id}
                label={st.label}
                clickable
                color={statusFilter === st.id ? 'primary' : 'default'}
                onClick={() => setStatusFilter(st.id)}
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: '2px',
                  bgcolor: statusFilter === st.id ? '#009688' : '#eee',
                  color: statusFilter === st.id ? '#fff' : '#444'
                }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Table AdminBSB */}
        <BsbDataTable
          columns={[
            {
              id: 'date_intervention',
              label: 'Date Intervention',
              render: (row) => {
                const d = row.date_intervention || row.created_at;
                const formatted = d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
                return (
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <EventIcon sx={{ fontSize: 16, color: '#009688' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {formatted}
                    </Typography>
                  </Stack>
                );
              }
            },
            {
              id: 'client_site',
              label: 'Client / Site & Agence',
              render: (row) => (
                <Box>
                  {row.client_nom && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.2 }}>
                      <BusinessIcon sx={{ fontSize: 15, color: '#009688' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00796B', fontSize: '0.8rem' }}>
                        {row.client_nom}
                      </Typography>
                    </Stack>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.82rem' }}>
                    {row.site_agence}
                  </Typography>
                  {row.utilisateur_concerne && (
                    <Typography variant="caption" display="block" sx={{ color: '#777', fontSize: '0.72rem' }}>
                      Demandeur : {row.utilisateur_concerne}
                    </Typography>
                  )}
                </Box>
              )
            },
            {
              id: 'equipement',
              label: 'Équipement',
              render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', fontSize: '0.82rem' }}>
                  {row.equipement}
                </Typography>
              )
            },
            {
              id: 'observation',
              label: 'Panne & Travaux',
              render: (row) => (
                <Box sx={{ maxWidth: 260 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#C62828', fontSize: '0.8rem' }}>
                    {row.observation}
                  </Typography>
                  {row.travaux && (
                    <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
                      Travaux : {row.travaux}
                    </Typography>
                  )}
                </Box>
              )
            },
            {
              id: 'quantite',
              label: 'Qté',
              align: 'center',
              render: (row) => (
                <Chip
                  label={row.quantite || 1}
                  size="small"
                  sx={{
                    bgcolor: '#E0F2F1',
                    color: '#00695C',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '2px',
                    minWidth: 28
                  }}
                />
              )
            },
            {
              id: 'prix_unitaire',
              label: 'Prix Unitaire',
              align: 'right',
              render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#555', fontSize: '0.8rem' }}>
                  {formatCurrency(row.prix_unitaire ?? (row.prix && row.quantite ? row.prix / row.quantite : row.prix ?? 0))}
                </Typography>
              )
            },
            {
              id: 'prix',
              label: 'Coût Total',
              align: 'right',
              render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#111', fontSize: '0.85rem' }}>
                  {formatCurrency(row.prix ?? ((row.prix_unitaire || 0) * (row.quantite || 1)))}
                </Typography>
              )
            },
            {
              id: 'technicien',
              label: 'Technicien Assigné',
              render: (row) => (
                <Chip
                  label={row.technicien_assigne || 'Non assigné'}
                  size="small"
                  sx={{
                    bgcolor: row.technicien_assigne ? '#ECEFF1' : '#FFF3E0',
                    color: row.technicien_assigne ? '#37474F' : '#E65100',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    borderRadius: '2px'
                  }}
                />
              )
            },
            {
              id: 'statut',
              label: 'Statut',
              align: 'center',
              render: (row) => getStatusChip(row.statut)
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'center',
              render: (row) => (
                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                  {row.statut === 'EN_ATTENTE' && (
                    <BsbButton
                      size="xs"
                      color="info"
                      startIcon={<PlayArrowIcon sx={{ fontSize: '0.85rem !important' }} />}
                      onClick={() => setConfirmModal({ type: 'PRISE_EN_MAIN', item: row })}
                    >
                      Prise en main
                    </BsbButton>
                  )}
                  {row.statut === 'EN_COURS' && (
                    <BsbButton
                      size="xs"
                      color="success"
                      startIcon={<TaskAltIcon sx={{ fontSize: '0.85rem !important' }} />}
                      onClick={() => setConfirmModal({ type: 'CLOTURER', item: row })}
                    >
                      Clôturer
                    </BsbButton>
                  )}
                  <Tooltip title="Modifier cette intervention">
                    <IconButton
                      size="small"
                      sx={{ color: '#1976D2', '&:hover': { bgcolor: '#E3F2FD' } }}
                      onClick={() => handleOpenEdit(row)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      sx={{ color: '#E53935', '&:hover': { bgcolor: '#FFEBEE' } }}
                      onClick={() => setConfirmModal({ type: 'DELETE', item: row })}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )
            }
          ]}
          data={filtered}
          emptyMessage="Aucune intervention trouvée."
        />
      </BsbCard>

      {/* Modal de Confirmation d'Action */}
      <BsbModal
        open={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        title={
          confirmModal?.type === 'PRISE_EN_MAIN'
            ? 'CONFIRMER LA PRISE EN MAIN'
            : confirmModal?.type === 'CLOTURER'
            ? "CLÔTURER L'INTERVENTION"
            : "SUPPRIMER L'INTERVENTION"
        }
        headerColor={
          confirmModal?.type === 'PRISE_EN_MAIN'
            ? 'light-blue'
            : confirmModal?.type === 'CLOTURER'
            ? 'light-green'
            : 'red'
        }
        maxWidth="xs"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setConfirmModal(null)}>
              Annuler
            </BsbButton>
            <BsbButton
              color={
                confirmModal?.type === 'PRISE_EN_MAIN'
                  ? 'info'
                  : confirmModal?.type === 'CLOTURER'
                  ? 'success'
                  : 'danger'
              }
              onClick={handleExecuteConfirmedAction}
            >
              {confirmModal?.type === 'PRISE_EN_MAIN'
                ? 'Confirmer la prise en main'
                : confirmModal?.type === 'CLOTURER'
                ? "Confirmer la clôture"
                : 'Supprimer définitivement'}
            </BsbButton>
          </>
        }
      >
        {confirmModal && (
          <Box sx={{ py: 1 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <WarningAmberIcon
                sx={{
                  fontSize: 36,
                  color:
                    confirmModal.type === 'PRISE_EN_MAIN'
                      ? '#0288D1'
                      : confirmModal.type === 'CLOTURER'
                      ? '#2E7D32'
                      : '#D32F2F',
                  flexShrink: 0
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                  {confirmModal.type === 'PRISE_EN_MAIN' && "Démarrer l'intervention technique ?"}
                  {confirmModal.type === 'CLOTURER' && "Valider la fin des réparations ?"}
                  {confirmModal.type === 'DELETE' && "Êtes-vous sûr de vouloir supprimer cette fiche ?"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  {confirmModal.type === 'PRISE_EN_MAIN' &&
                    "L'intervention passera au statut « En cours de traitement ». L'équipe sera informée que les travaux ont débuté."}
                  {confirmModal.type === 'CLOTURER' &&
                    "L'intervention sera marquée comme « Clôturée / Terminée avec succès ». Les coûts engagés seront figés."}
                  {confirmModal.type === 'DELETE' &&
                    "Cette intervention sera définitivement retirée du journal. Cette action est irréversible."}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '2px', border: '1px solid #e9ecef' }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, display: 'block', mb: 0.5 }}>
                DÉTAILS DE L'INTERVENTION :
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
                {confirmModal.item.equipement}
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                Site : {confirmModal.item.site_agence} {confirmModal.item.client_nom ? `(${confirmModal.item.client_nom})` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#00796B', fontWeight: 600, display: 'block', mt: 0.3 }}>
                Date d'intervention : {confirmModal.item.date_intervention ? new Date(confirmModal.item.date_intervention).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
              </Typography>
              {confirmModal.item.observation && (
                <Typography variant="caption" sx={{ color: '#C62828', display: 'block', mt: 0.5 }}>
                  Panne : {confirmModal.item.observation}
                </Typography>
              )}
              <Stack direction="row" spacing={2} sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed #ddd' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Quantité</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{confirmModal.item.quantite || 1}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Prix Unitaire</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(confirmModal.item.prix_unitaire ?? (confirmModal.item.prix / (confirmModal.item.quantite || 1)))}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>Coût Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    {formatCurrency(confirmModal.item.prix)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}
      </BsbModal>

      {/* Modal d'ajout / modification d'intervention */}
      <BsbModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingItem ? "MODIFIER LA FICHE D'INTERVENTION" : "NOUVELLE FICHE D'INTERVENTION"}
        headerColor={editingItem ? "info" : "primary"}
        maxWidth="md"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setOpenModal(false)}>
              Annuler
            </BsbButton>
            <BsbButton color="primary" onClick={handleSubmit}>
              {editingItem ? "Enregistrer les modifications" : "Enregistrer l'intervention"}
            </BsbButton>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <BsbSelect
              label="Client rattaché (Optionnel)"
              value={formData.client_id}
              onChange={(e) => handleClientSelect(e.target.value)}
              options={[
                { value: '', label: '-- Sélectionner un client ou saisir manuellement ci-dessous --' },
                ...clients.map((c) => ({ value: c.id, label: `${c.nom} (${c.ville || 'Abidjan'})` }))
              ]}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Site / Agence concernée"
                  required
                  value={formData.site_agence}
                  onChange={(e) => setFormData({ ...formData, site_agence: e.target.value })}
                  placeholder="Ex: Agence Centrale Plateau"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Demandeur / Utilisateur concerné"
                  value={formData.utilisateur_concerne}
                  onChange={(e) => setFormData({ ...formData, utilisateur_concerne: e.target.value })}
                  placeholder="Ex: Mme Kouassi (Chef d'agence)"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Date d'intervention"
                  type="date"
                  required
                  value={formData.date_intervention}
                  onChange={(e) => setFormData({ ...formData, date_intervention: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Technicien assigné"
                  value={formData.technicien_assigne}
                  onChange={(e) => setFormData({ ...formData, technicien_assigne: e.target.value })}
                  placeholder="Ex: Koffi Paul (Tech Froid)"
                />
              </Grid>
            </Grid>

            <BsbTextField
              label="Équipement en panne"
              required
              value={formData.equipement}
              onChange={(e) => setFormData({ ...formData, equipement: e.target.value })}
              placeholder="Ex: Climatiseur 24000 BTU, Onduleur..."
            />

            <BsbTextField
              label="Observation / Description de la panne"
              multiline
              rows={2}
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Ex: Fuite de gaz et coupure automatique..."
            />

            <BsbTextField
              label="Travaux à réaliser / Pièces requises"
              multiline
              rows={2}
              value={formData.travaux}
              onChange={(e) => setFormData({ ...formData, travaux: e.target.value })}
              placeholder="Ex: Remplacement du compresseur et recharge gaz..."
            />

            {/* Calcul Automatique : Quantité x Prix Unitaire = Coût Total */}
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 3 }}>
                <BsbTextField
                  label="Quantité"
                  type="number"
                  required
                  value={formData.quantite}
                  onChange={(e) => setFormData({ ...formData, quantite: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <BsbTextField
                  label="Prix Unitaire (FCFA)"
                  type="number"
                  required
                  value={formData.prix_unitaire}
                  onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                  placeholder="Ex: 85000"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#E8F5E9',
                    border: '1px solid #A5D6A7',
                    borderRadius: '2px',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700, display: 'block' }}>
                    COÛT TOTAL (AUTOMATIQUE)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B5E20' }}>
                    {formatCurrency(calculatedTotalCost)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </form>
      </BsbModal>
    </Box>
  );
}
