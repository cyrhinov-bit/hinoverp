import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Tabs,
  Tab,
  Alert
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
import { formatCurrency, calculateCommissionsStats } from '@hinov/core';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import DeleteIcon from '@mui/icons-material/Delete';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';

export default function CommissionsManager() {
  const { currentUser, isAdmin } = useAuth();
  const {
    hasModule,
    commissions,
    addCommission,
    updateCommission,
    deleteCommission,
    payerCommission
  } = useErpData();

  const [activeTab, setActiveTab] = useState('ALL');
  
  // Modal de paiement
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');

  // Modal création manuelle
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    prestation_ref: '',
    type: 'APPORTEUR',
    beneficiaire_nom: '',
    beneficiaire_contact: '',
    montant_prestation: '',
    taux_pourcentage: 10,
    montant_commission: '',
    statut: 'A_PAYER'
  });

  if (!isAdmin && !hasModule('COMMISSIONS')) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <BsbCard title="Module Gestion des Commissions Désactivé" sx={{ maxWidth: 550, textAlign: 'center' }}>
          <LockOutlinedIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            L'administrateur a désactivé le module <strong>Gestion des Commissions</strong> pour votre profil.
          </Typography>
        </BsbCard>
      </Box>
    );
  }

  // Analytics
  const stats = calculateCommissionsStats(commissions);

  // Filtrage selon onglet
  const filteredList = useMemo(() => {
    return commissions.filter((item) => {
      if (activeTab === 'A_PAYER') return item.statut === 'A_PAYER' || item.statut === 'A_VALIDER';
      if (activeTab === 'PAYEE') return item.statut === 'PAYEE';
      if (activeTab === 'APPORTEUR') return item.type === 'APPORTEUR';
      if (activeTab === 'AGENT_COMMERCIAL') return item.type === 'AGENT_COMMERCIAL';
      if (activeTab === 'RESPONSABLE') return item.type === 'RESPONSABLE';
      return true;
    });
  }, [commissions, activeTab]);

  const handleOpenPayment = (comm) => {
    setSelectedCommission(comm);
    setPaymentMethod('MOBILE_MONEY');
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedCommission) return;
    payerCommission(selectedCommission.id, paymentMethod);
    setPaymentModalOpen(false);
    setSelectedCommission(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.beneficiaire_nom || !formData.montant_commission) return;

    addCommission({
      ...formData,
      prestation_id: `prest-manual-${Date.now()}`,
      montant_prestation: Number(formData.montant_prestation) || 0,
      montant_commission: Number(formData.montant_commission) || 0,
      taux_pourcentage: Number(formData.taux_pourcentage) || 0
    });

    setFormData({
      prestation_ref: '',
      type: 'APPORTEUR',
      beneficiaire_nom: '',
      beneficiaire_contact: '',
      montant_prestation: '',
      taux_pourcentage: 10,
      montant_commission: '',
      statut: 'A_PAYER'
    });
    setCreateModalOpen(false);
  };

  const getStatusChip = (statut) => {
    switch (statut) {
      case 'A_VALIDER':
        return <Chip label="À Valider" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57f17', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'A_PAYER':
        return <Chip label="Validée" size="small" sx={{ bgcolor: '#e1f5fe', color: '#0288d1', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'PAYEE':
        return <Chip label="Payée (Soldée)" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'ANNULEE':
        return <Chip label="Annulée" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700, fontSize: '0.68rem' }} />;
      default:
        return <Chip label={statut} size="small" />;
    }
  };

  const getTypeChip = (type) => {
    if (type === 'APPORTEUR') {
      return (
        <Chip
          icon={<HandshakeIcon sx={{ fontSize: '14px !important' }} />}
          label="Apporteur (10%)"
          size="small"
          sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, fontSize: '0.68rem' }}
        />
      );
    }
    if (type === 'RESPONSABLE') {
      return (
        <Chip
          icon={<SupervisorAccountIcon sx={{ fontSize: '14px !important' }} />}
          label="Resp. Service"
          size="small"
          sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 700, fontSize: '0.68rem' }}
        />
      );
    }
    return (
      <Chip
        icon={<BadgeIcon sx={{ fontSize: '14px !important' }} />}
        label="Agent Commercial"
        size="small"
        sx={{ bgcolor: '#ede7f6', color: '#4a148c', fontWeight: 700, fontSize: '0.68rem' }}
      />
    );
  };

  const columns = useMemo(
    () => [
      {
        id: 'prestation_ref',
        label: 'Réf. Contrat',
        render: (comm) => (
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0288d1' }}>
            {comm.prestation_ref}
          </span>
        )
      },
      {
        id: 'type',
        label: 'Type',
        render: (comm) => getTypeChip(comm.type)
      },
      {
        id: 'beneficiaire_nom',
        label: 'Bénéficiaire',
        render: (comm) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
              {comm.beneficiaire_nom}
            </Typography>
            {comm.beneficiaire_contact && (
              <Typography variant="caption" sx={{ color: '#888' }}>
                {comm.beneficiaire_contact}
              </Typography>
            )}
          </Box>
        )
      },
      {
        id: 'montant_prestation',
        label: 'Montant Vente',
        align: 'right',
        render: (comm) => formatCurrency(comm.montant_prestation)
      },
      {
        id: 'montant_commission',
        label: 'Montant Commission',
        align: 'right',
        render: (comm) => (
          <span style={{ fontWeight: 800, color: '#e65100', fontSize: '0.9rem' }}>
            {formatCurrency(comm.montant_commission)}
          </span>
        )
      },
      {
        id: 'statut',
        label: 'Statut',
        align: 'center',
        render: (comm) => getStatusChip(comm.statut)
      },
      {
        id: 'reglement',
        label: 'Règlement',
        align: 'center',
        render: (comm) =>
          comm.statut === 'PAYEE' ? (
            <Stack alignItems="center">
              <Chip
                label={comm.mode_reglement || 'ESPECES'}
                size="small"
                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.65rem' }}
              />
              {comm.date_reglement && (
                <Typography variant="caption" sx={{ color: '#888', mt: 0.2 }}>
                  {new Date(comm.date_reglement).toLocaleDateString('fr-FR')}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="caption" sx={{ color: '#aaa' }}>
              En attente
            </Typography>
          )
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        sortable: false,
        render: (comm) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            {comm.statut === 'A_VALIDER' && (
              <BsbButton
                size="xs"
                color="blue"
                onClick={() => updateCommission(comm.id, { statut: 'A_PAYER' })}
                tooltip="Valider la commission"
              >
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              </BsbButton>
            )}
            {comm.statut === 'A_PAYER' && (
              <BsbButton
                size="xs"
                color="green"
                startIcon={<PaymentIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleOpenPayment(comm)}
                tooltip="Régler et décaisser"
              >
                Régler
              </BsbButton>
            )}
            {deleteCommission && (
              <BsbButton
                size="xs"
                color="red"
                onClick={() => {
                  if (window.confirm('Supprimer cette fiche de commission ?')) {
                    deleteCommission(comm.id);
                  }
                }}
                tooltip="Supprimer"
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </BsbButton>
            )}
          </Stack>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commissions]
  );

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Cards Row (AdminBSB Info-Boxes) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="blue"
            icon={<MonetizationOnIcon />}
            title="TOTAL GÉNÉRÉES"
            number={formatCurrency(stats.totalGenerees)}
            subtitle={`${stats.totalCommissionsCount} dossiers de commission`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="green"
            icon={<CheckCircleIcon />}
            title="COMMISSIONS PAYÉES"
            number={formatCurrency(stats.totalPayees)}
            subtitle="Décaissées du journal de caisse"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="orange"
            icon={<PendingActionsIcon />}
            title="RESTE À DÉCAISSER"
            number={formatCurrency(stats.totalRestantADecaisser)}
            subtitle="Validées en attente de paiement"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="purple"
            icon={<HandshakeIcon />}
            title="APPORTEURS (10%)"
            number={formatCurrency(stats.totalApporteurs)}
            subtitle={`Agents: ${formatCurrency(stats.totalCommerciaux)}`}
          />
        </Grid>
      </Grid>

      {/* Main Card with DataTable & Filters */}
      <BsbCard
        title="TABLEAU DE LIQUIDATION DES COMMISSIONS"
        subtitle="Suivi des versements, validation et génération automatique des sorties de caisse"
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Nouvelle Commission
          </BsbButton>
        }
      >
        {/* Filter Tabs */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.78rem',
                minWidth: 90
              }
            }}
          >
            <Tab label={`Toutes (${commissions.length})`} value="ALL" />
            <Tab label={`À Payer (${commissions.filter(c => c.statut !== 'PAYEE').length})`} value="A_PAYER" />
            <Tab label={`Payées (${commissions.filter(c => c.statut === 'PAYEE').length})`} value="PAYEE" />
            <Tab label="Apporteurs (10%)" value="APPORTEUR" />
            <Tab label="Commerciaux" value="AGENT_COMMERCIAL" />
            <Tab label="Resp. Service" value="RESPONSABLE" />
          </Tabs>
        </Box>

        <BsbDataTable
          columns={columns}
          rows={filteredList}
          searchPlaceholder="Rechercher contrat, bénéficiaire..."
        />
      </BsbCard>

      {/* Modal Règlement Commission (AdminBSB Modal) */}
      <BsbModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="RÉGLER LA COMMISSION"
        subtitle="Cette action génère une sortie de caisse automatique"
        headerColor="green"
        maxWidth="xs"
        actions={
          <>
            <BsbButton
              variant="outlined"
              color="blue-grey"
              size="sm"
              onClick={() => setPaymentModalOpen(false)}
            >
              Annuler
            </BsbButton>
            <BsbButton
              color="green"
              size="sm"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={handleConfirmPayment}
            >
              Confirmer & Décaisser
            </BsbButton>
          </>
        }
      >
        {selectedCommission && (
          <Stack spacing={2}>
            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: '2px', border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ color: '#777', textTransform: 'uppercase', fontWeight: 700 }}>
                Bénéficiaire :
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#333' }}>
                {selectedCommission.beneficiaire_nom}
              </Typography>
              <Typography variant="caption" sx={{ color: '#777', textTransform: 'uppercase', fontWeight: 700, mt: 1, display: 'block' }}>
                Montant à Décaisser :
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                {formatCurrency(selectedCommission.montant_commission)}
              </Typography>
            </Box>

            <BsbSelect
              label="Mode de Règlement"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'MOBILE_MONEY', label: 'Mobile Money (Wave / Orange / MTN)' },
                { value: 'ESPECES', label: 'Espèces (Caisse Centrale)' },
                { value: 'VIREMENT', label: 'Virement Bancaire' },
                { value: 'CHEQUE', label: 'Chèque' }
              ]}
            />

            <Alert severity="info" sx={{ borderRadius: '2px', fontSize: '0.78rem' }}>
              Un mouvement de sortie de caisse <strong>COMMISSION</strong> sera enregistré instantanément.
            </Alert>
          </Stack>
        )}
      </BsbModal>

      {/* Modal Création Manuelle de Commission (AdminBSB Modal) */}
      <BsbModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="NOUVELLE FICHE DE COMMISSION"
        subtitle="Enregistrement d'une commission manuelle ou exceptionnelle"
        headerColor="primary"
        maxWidth="sm"
        actions={
          <>
            <BsbButton
              variant="outlined"
              color="blue-grey"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Annuler
            </BsbButton>
            <BsbButton
              color="primary"
              size="sm"
              onClick={handleCreateSubmit}
            >
              Enregistrer
            </BsbButton>
          </>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Réf. Contrat / Prestation"
              value={formData.prestation_ref}
              onChange={(e) => setFormData({ ...formData, prestation_ref: e.target.value })}
              placeholder="Ex: CMD-2026-00X"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbSelect
              label="Type de Commission"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'APPORTEUR', label: "Apporteur d'Affaires (10%)" },
                { value: 'AGENT_COMMERCIAL', label: 'Agent Commercial Négociateur' },
                { value: 'RESPONSABLE', label: 'Responsable / Superviseur' }
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Nom du Bénéficiaire"
              value={formData.beneficiaire_nom}
              onChange={(e) => setFormData({ ...formData, beneficiaire_nom: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Téléphone / Contact"
              value={formData.beneficiaire_contact}
              onChange={(e) => setFormData({ ...formData, beneficiaire_contact: e.target.value })}
              placeholder="+225 07 00 00 00 00"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              type="number"
              label="Montant Vente Totale (FCFA)"
              value={formData.montant_prestation}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setFormData({
                  ...formData,
                  montant_prestation: e.target.value,
                  montant_commission: formData.type === 'APPORTEUR' ? String(Math.round(v * 0.10)) : formData.montant_commission
                });
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              type="number"
              label="Montant Commission (FCFA)"
              value={formData.montant_commission}
              onChange={(e) => setFormData({ ...formData, montant_commission: e.target.value })}
              required
            />
          </Grid>
        </Grid>
      </BsbModal>
    </Box>
  );
}
