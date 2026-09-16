import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
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

import { useErpData } from 'context/ErpDataContext';
import { formatCurrency, calculateCommercialsStats } from '@hinov/core';

import BadgeIcon from '@mui/icons-material/Badge';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function CommerciauxManager() {
  const {
    hasModule,
    agentsCommerciaux,
    prestations,
    commissions,
    addAgentCommercial,
    updateAgentCommercial,
    deleteAgentCommercial
  } = useErpData();

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAgentForDrawer, setSelectedAgentForDrawer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    zone_secteur: 'Abidjan',
    taux_commission_defaut: 5,
    actif: true
  });

  if (!hasModule('COMMERCIAUX')) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <BsbCard title="Module Agents Commerciaux Désactivé" sx={{ maxWidth: 550, textAlign: 'center' }}>
          <LockOutlinedIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            L'administrateur a désactivé l'accès au module <strong>Agents Commerciaux</strong> pour votre profil.
          </Typography>
        </BsbCard>
      </Box>
    );
  }

  // Analytics Commerciaux
  const stats = calculateCommercialsStats(agentsCommerciaux, prestations, commissions);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      matricule: `COM-${String(agentsCommerciaux.length + 1).padStart(3, '0')}`,
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      zone_secteur: 'Abidjan',
      taux_commission_defaut: 5,
      actif: true
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      matricule: item.matricule || '',
      nom: item.nom,
      prenom: item.prenom || '',
      telephone: item.telephone || '',
      email: item.email || '',
      zone_secteur: item.zone_secteur || 'Abidjan',
      taux_commission_defaut: item.taux_commission_defaut || 5,
      actif: item.actif !== undefined ? item.actif : true
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
      updateAgentCommercial(editingId, formData);
    } else {
      addAgentCommercial(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id, nom) => {
    if (window.confirm(`Confirmez-vous la suppression de l'agent commercial "${nom}" ?`)) {
      deleteAgentCommercial(id);
    }
  };

  // Prestations liées pour le drawer
  const agentHistory = useMemo(() => {
    if (!selectedAgentForDrawer) return null;
    const agent = selectedAgentForDrawer;
    const agentPrestations = prestations.filter(
      (p) => p.commercial_id === agent.id || p.commercial_nom === agent.nom || p.commercial_nom === `${agent.prenom} ${agent.nom}`
    );
    const agentCommissions = commissions.filter(
      (c) => c.beneficiaire_id === agent.id || c.beneficiaire_nom === agent.nom || c.beneficiaire_nom === `${agent.prenom} ${agent.nom}`
    );

    return {
      agent,
      prestations: agentPrestations,
      commissions: agentCommissions
    };
  }, [selectedAgentForDrawer, prestations, commissions]);

  const columns = useMemo(
    () => [
      {
        id: 'matricule',
        label: 'Matricule',
        render: (agent) => (
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0288d1' }}>
            {agent.matricule || 'N/A'}
          </span>
        )
      },
      {
        id: 'nom',
        label: 'Agent Commercial',
        render: (agent) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#222' }}>
              {agent.nom} {agent.prenom || ''}
            </Typography>
            <Typography variant="caption" sx={{ color: '#888' }}>
              Taux standard : {agent.taux_commission_defaut || 5}%
            </Typography>
          </Box>
        )
      },
      {
        id: 'telephone',
        label: 'Coordonnées',
        render: (agent) => (
          <Stack spacing={0.3}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PhoneIcon sx={{ fontSize: 13, color: '#777' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
                {agent.telephone}
              </Typography>
            </Stack>
            {agent.email && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmailIcon sx={{ fontSize: 13, color: '#777' }} />
                <Typography variant="caption" sx={{ color: '#0288d1' }}>
                  {agent.email}
                </Typography>
              </Stack>
            )}
          </Stack>
        )
      },
      {
        id: 'zone_secteur',
        label: 'Zone / Secteur',
        render: (agent) => agent.zone_secteur || 'Abidjan'
      },
      {
        id: 'totalVentes',
        label: 'CA Réalisé',
        align: 'right',
        render: (agent) => (
          <Box>
            <span style={{ fontWeight: 700, color: '#2e7d32' }}>
              {formatCurrency(agent.totalVentes)}
            </span>
            <Typography variant="caption" display="block" sx={{ color: '#888', fontSize: '0.68rem' }}>
              {agent.contratsClosCount} contrat(s)
            </Typography>
          </Box>
        )
      },
      {
        id: 'totalCommissionsDues',
        label: 'Commissions',
        align: 'right',
        render: (agent) => (
          <Box>
            <span style={{ fontWeight: 800, color: '#e65100' }}>
              {formatCurrency(agent.totalCommissionsDues)}
            </span>
            {agent.totalCommissionsPayees > 0 && (
              <Typography variant="caption" display="block" sx={{ color: '#2e7d32', fontSize: '0.68rem' }}>
                Payé : {formatCurrency(agent.totalCommissionsPayees)}
              </Typography>
            )}
          </Box>
        )
      },
      {
        id: 'actif',
        label: 'Statut',
        align: 'center',
        render: (agent) => (
          <Chip
            label={agent.actif ? 'ACTIF' : 'INACTIF'}
            size="small"
            sx={{
              bgcolor: agent.actif ? '#e8f5e9' : '#f5f5f5',
              color: agent.actif ? '#2e7d32' : '#888',
              fontWeight: 700,
              fontSize: '0.65rem'
            }}
          />
        )
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        sortable: false,
        render: (agent) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <BsbButton
              size="xs"
              color="blue"
              onClick={() => setSelectedAgentForDrawer(agent)}
              tooltip="Voir la fiche détaillée"
            >
              <VisibilityIcon sx={{ fontSize: 14 }} />
            </BsbButton>
            <BsbButton
              size="xs"
              color="teal"
              onClick={() => handleOpenEdit(agent)}
              tooltip="Modifier"
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </BsbButton>
            <BsbButton
              size="xs"
              color="red"
              onClick={() => handleDelete(agent.id, agent.nom)}
              tooltip="Supprimer"
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </BsbButton>
          </Stack>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats.commercialsSummary]
  );

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Cards Row (AdminBSB Info-Boxes) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="deep-orange"
            icon={<BadgeIcon />}
            title="COMMERCIAUX ACTIFS"
            number={`${stats.agentsActifsCount} / ${stats.agentsCount}`}
            subtitle="Négociateurs de l'équipe"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="green"
            icon={<TrendingUpIcon />}
            title="CA TOTAL NÉGOCIÉ"
            number={formatCurrency(stats.totalVentesEquipe)}
            subtitle="Volume clos par la force de vente"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="orange"
            icon={<MonetizationOnIcon />}
            title="COMMISSIONS COMMERCIALES"
            number={formatCurrency(stats.totalCommissionsEquipe)}
            subtitle="Commissions générées sur contrats"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="purple"
            icon={<ReceiptIcon />}
            title="CONTRATS CLOS"
            number={`${prestations.filter(p => Boolean(p.commercial_id || p.commercial_nom)).length} deals`}
            subtitle="Dossiers attribués aux agents"
          />
        </Grid>
      </Grid>

      {/* Main DataTable Card */}
      <BsbCard
        title="PORTEFEUILLE DES AGENTS COMMERCIAUX"
        subtitle="Gestion de l'équipe commerciale, affaires négociées et commissions acquises"
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenCreate}
          >
            Nouvel Agent Commercial
          </BsbButton>
        }
      >
        <BsbDataTable
          columns={columns}
          rows={stats.commercialsSummary}
          searchPlaceholder="Rechercher nom, matricule, zone..."
        />
      </BsbCard>

      {/* Modal Création / Edition (AdminBSB Modal) */}
      <BsbModal
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'MODIFIER LA FICHE AGENT' : 'NOUVEL AGENT COMMERCIAL'}
        subtitle="Informations contractuelles et taux de commission par défaut"
        headerColor="deep-orange"
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
              color="deep-orange"
              size="sm"
              onClick={handleSubmit}
            >
              {editingId ? 'Mettre à jour' : "Enregistrer l'Agent"}
            </BsbButton>
          </>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Matricule"
              value={formData.matricule}
              onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
              placeholder="COM-00X"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              type="number"
              label="Taux Commission Standard (%)"
              value={formData.taux_commission_defaut}
              onChange={(e) => setFormData({ ...formData, taux_commission_defaut: Number(e.target.value) })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Nom de famille"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Prénom(s)"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              type="email"
              label="Email professionnel"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BsbTextField
              label="Zone d'intervention / Secteur"
              value={formData.zone_secteur}
              onChange={(e) => setFormData({ ...formData, zone_secteur: e.target.value })}
              placeholder="Ex: Abidjan Sud, Zone Industrielle..."
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BsbSelect
              label="Statut"
              value={formData.actif ? 'ACTIF' : 'INACTIF'}
              onChange={(e) => setFormData({ ...formData, actif: e.target.value === 'ACTIF' })}
              options={[
                { value: 'ACTIF', label: 'Actif (En activité)' },
                { value: 'INACTIF', label: 'Inactif (Suspendu / Départ)' }
              ]}
            />
          </Grid>
        </Grid>
      </BsbModal>

      {/* Drawer Historique Performance Agent */}
      <Drawer
        anchor="right"
        open={Boolean(selectedAgentForDrawer)}
        onClose={() => setSelectedAgentForDrawer(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3, borderRadius: '3px 0 0 3px' } }}
      >
        {agentHistory && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#333', textTransform: 'uppercase', mb: 2 }}>
              Fiche Performance Commerciale
            </Typography>

            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: '2px', mb: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#222' }}>
                {agentHistory.agent.nom} {agentHistory.agent.prenom || ''} ({agentHistory.agent.matricule})
              </Typography>
              <Typography variant="body2" sx={{ color: '#777', mt: 0.3 }}>
                {agentHistory.agent.telephone} • {agentHistory.agent.email || 'Pas d\'email'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.3 }}>
                Secteur : {agentHistory.agent.zone_secteur}
              </Typography>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 1.5, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '2px' }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700 }}>TOTAL VENTES</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                    {formatCurrency(agentHistory.agent.totalVentes)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 1.5, bgcolor: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '2px' }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700 }}>COMMISSIONS</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#bf360c' }}>
                    {formatCurrency(agentHistory.agent.totalCommissionsDues)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 800, color: '#555', textTransform: 'uppercase', mb: 1, display: 'block' }}>
              Contrats Clos par l'Agent ({agentHistory.prestations.length})
            </Typography>
            <List dense sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: '2px', mb: 3 }}>
              {agentHistory.prestations.length === 0 ? (
                <ListItem><ListItemText secondary="Aucun contrat directement associé." /></ListItem>
              ) : (
                agentHistory.prestations.map((p) => (
                  <ListItem key={p.id} divider>
                    <ListItemText
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.reference} - {p.client_nom || 'Client'}</Typography>}
                      secondary={`Vente : ${formatCurrency(p.montant_total_vente)} | Commission : ${formatCurrency(p.commission_commercial_montant || 0)}`}
                    />
                  </ListItem>
                ))
              )}
            </List>

            <BsbButton fullWidth variant="outlined" color="blue-grey" onClick={() => setSelectedAgentForDrawer(null)}>
              Fermer la Fiche
            </BsbButton>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
