import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  TableCell,
  TableRow
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
import { calculatePrestationsStats, calculatePrestationLine, formatCurrency } from '@hinov/core';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckIcon from '@mui/icons-material/Check';
import DescriptionIcon from '@mui/icons-material/Description';
import PaidIcon from '@mui/icons-material/Paid';

export default function PrestationsModule() {
  const { 
    hasModule, 
    prestations, 
    clientsFournisseurs, 
    agentsCommerciaux, 
    profiles, 
    addPrestation, 
    updatePrestation, 
    deletePrestation 
  } = useErpData();
  
  const [openModal, setOpenModal] = useState(false);
  const [clientFilter, setClientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const clients = clientsFournisseurs.filter((t) => t.type === 'CLIENT');
  const partenairesApporteurs = clientsFournisseurs.filter((t) => t.type === 'PARTENAIRE' || t.type === 'CLIENT');

  // Formulaire nouvelle prestation (11 colonnes)
  const [formData, setFormData] = useState({
    client_id: '',
    client_nom: '',
    reference: '',
    designation: '',
    quantite: '1',
    cout_unitaire_achat: '',
    prix_unitaire_vente: '',
    commission_apporteur_taux: 10,
    commission_apporteur_montant: '',
    apporteur_id: '',
    apporteur_nom: '',
    commission_responsable_montant: '',
    responsable_service_id: '',
    responsable_service_nom: '',
    commission_commercial_montant: '',
    commercial_id: '',
    commercial_nom: '',
    statut: 'CONFIRMEE'
  });

  // Simulateur de marge en direct (11 colonnes)
  const [simulQte, setSimulQte] = useState(1);
  const [simulCoutUnit, setSimulCoutUnit] = useState(400000);
  const [simulPrixUnit, setSimulPrixUnit] = useState(1000000);
  const [simulCommApporteur, setSimulCommApporteur] = useState(100000);
  const [simulCommCommercial, setSimulCommCommercial] = useState(50000);
  const [simulCommResponsable, setSimulCommResponsable] = useState(25000);

  if (!hasModule('PRESTATIONS')) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <BsbCard title="Module Prestations & Commandes Désactivé" sx={{ maxWidth: 550, textAlign: 'center' }}>
          <LockOutlinedIcon sx={{ fontSize: 64, color: '#F44336', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            L'administrateur a désactivé le module <strong>Prestations & Commandes</strong> pour votre profil.
          </Typography>
        </BsbCard>
      </Box>
    );
  }

  const stats = calculatePrestationsStats(prestations);
  const simulResult = calculatePrestationLine(
    simulQte,
    simulCoutUnit,
    simulPrixUnit,
    simulCommApporteur,
    simulCommResponsable,
    simulCommCommercial
  );

  // Calcul instantané des 11 colonnes pour le formulaire actif
  const liveFormCalc = calculatePrestationLine(
    Number(formData.quantite) || 1,
    Number(formData.cout_unitaire_achat) || 0,
    Number(formData.prix_unitaire_vente) || 0,
    formData.commission_apporteur_montant !== '' ? Number(formData.commission_apporteur_montant) : null,
    Number(formData.commission_responsable_montant) || 0,
    Number(formData.commission_commercial_montant) || 0,
    Number(formData.commission_apporteur_taux || 10)
  );

  // Mise à jour automatique de la commission apporteur (10% par défaut)
  const handlePrixOuQteChange = (field, val) => {
    const nextQte = field === 'quantite' ? (Number(val) || 1) : (Number(formData.quantite) || 1);
    const nextPrixUnit = field === 'prix_unitaire_vente' ? (Number(val) || 0) : (Number(formData.prix_unitaire_vente) || 0);
    const nextTotalVente = nextQte * nextPrixUnit;
    const autoCommApp = Math.round(nextTotalVente * (Number(formData.commission_apporteur_taux || 10) / 100));

    setFormData((prev) => ({
      ...prev,
      [field]: val,
      commission_apporteur_montant: autoCommApp > 0 ? String(autoCommApp) : prev.commission_apporteur_montant
    }));
  };

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
        client_nom: found.nom
      }));
    }
  };

  const handleCommercialSelect = (commercialId) => {
    if (!commercialId) {
      setFormData((prev) => ({ ...prev, commercial_id: '', commercial_nom: '' }));
      return;
    }
    const found = agentsCommerciaux.find((a) => a.id === commercialId);
    if (found) {
      const q = Number(formData.quantite) || 1;
      const pu = Number(formData.prix_unitaire_vente) || 0;
      const totalVente = q * pu;
      const autoComm = found.taux_commission_defaut ? Math.round(totalVente * (found.taux_commission_defaut / 100)) : 0;
      setFormData((prev) => ({
        ...prev,
        commercial_id: found.id,
        commercial_nom: `${found.prenom ? found.prenom + ' ' : ''}${found.nom}`,
        commission_commercial_montant: prev.commission_commercial_montant || (autoComm > 0 ? String(autoComm) : '')
      }));
    }
  };

  const handleApporteurSelect = (apporteurId) => {
    if (!apporteurId) {
      setFormData((prev) => ({ ...prev, apporteur_id: '', apporteur_nom: '' }));
      return;
    }
    const found = partenairesApporteurs.find((p) => p.id === apporteurId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        apporteur_id: found.id,
        apporteur_nom: found.nom
      }));
    }
  };

  const handleResponsableSelect = (profileId) => {
    if (!profileId) {
      setFormData((prev) => ({ ...prev, responsable_service_id: '', responsable_service_nom: '' }));
      return;
    }
    const found = profiles.find((p) => p.id === profileId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        responsable_service_id: found.id,
        responsable_service_nom: found.nom
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.designation || !formData.prix_unitaire_vente) return;

    addPrestation({
      ...formData,
      description: formData.designation,
      quantite: Number(formData.quantite) || 1,
      cout_unitaire_achat: Number(formData.cout_unitaire_achat) || 0,
      prix_unitaire_vente: Number(formData.prix_unitaire_vente) || 0,
      commission_apporteur_taux: Number(formData.commission_apporteur_taux) || 10,
      commission_apporteur_montant: formData.commission_apporteur_montant !== '' ? Number(formData.commission_apporteur_montant) : null,
      commission_commercial_montant: Number(formData.commission_commercial_montant) || 0,
      commission_responsable_montant: Number(formData.commission_responsable_montant) || 0
    });

    setFormData({
      client_id: '',
      client_nom: '',
      reference: '',
      designation: '',
      quantite: '1',
      cout_unitaire_achat: '',
      prix_unitaire_vente: '',
      commission_apporteur_taux: 10,
      commission_apporteur_montant: '',
      apporteur_id: '',
      apporteur_nom: '',
      commission_commercial_montant: '',
      commercial_id: '',
      commercial_nom: '',
      commission_responsable_montant: '',
      responsable_service_id: '',
      responsable_service_nom: '',
      statut: 'CONFIRMEE'
    });
    setOpenModal(false);
  };

  const filtered = prestations.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.statut === statusFilter;
    const matchClient =
      clientFilter === 'ALL' || p.client_id === clientFilter || p.client_nom === clientFilter;
    return matchStatus && matchClient;
  });

  const getStatusChip = (statut) => {
    switch (statut) {
      case 'DEVIS':
        return <Chip label="Devis" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57f17', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'CONFIRMEE':
        return <Chip label="Confirmée" size="small" sx={{ bgcolor: '#e1f5fe', color: '#0288d1', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'FACTUREE':
        return <Chip label="Facturée" size="small" sx={{ bgcolor: '#ede7f6', color: '#512da8', fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'PAYEE':
        return <Chip label="Payée" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.68rem' }} />;
      default:
        return <Chip label={statut} size="small" />;
    }
  };

  // Totaux calculés pour le pied du tableau des 11 colonnes
  const tableTotals = filtered.reduce(
    (acc, p) => {
      const qte = Number(p.quantite) || 1;
      const coutUnit = p.cout_unitaire_achat !== undefined ? Number(p.cout_unitaire_achat) : (Number(p.cout_total_revient) / qte || 0);
      const coutFinal = p.cout_total_revient !== undefined ? Number(p.cout_total_revient) : (qte * coutUnit);
      const prixUnit = p.prix_unitaire_vente !== undefined ? Number(p.prix_unitaire_vente) : (Number(p.montant_total_vente) / qte || 0);
      const prixFinal = p.montant_total_vente !== undefined ? Number(p.montant_total_vente) : (qte * prixUnit);
      const margeInt = p.marge_interne !== undefined ? Number(p.marge_interne) : (prixFinal - coutFinal);
      const commApp = Number(p.commission_apporteur_montant) || (prixFinal * 0.10);
      const commResp = Number(p.commission_responsable_montant) || 0;
      const commCom = Number(p.commission_commercial_montant) || 0;
      const benefice = p.benefice_reel !== undefined ? Number(p.benefice_reel) : (margeInt - commApp - commResp - commCom);

      acc.totalQte += qte;
      acc.totalCoutFinal += coutFinal;
      acc.totalPrixFinal += prixFinal;
      acc.totalMargeInterne += margeInt;
      acc.totalCommApporteur += commApp;
      acc.totalCommResp += commResp;
      acc.totalCommCom += commCom;
      acc.totalBeneficeReel += benefice;
      return acc;
    },
    {
      totalQte: 0,
      totalCoutFinal: 0,
      totalPrixFinal: 0,
      totalMargeInterne: 0,
      totalCommApporteur: 0,
      totalCommResp: 0,
      totalCommCom: 0,
      totalBeneficeReel: 0
    }
  );

  // Définition des colonnes de la BsbDataTable (11 colonnes financières)
  const columns = useMemo(
    () => [
      {
        id: 'designation',
        label: '1. Désignations',
        minWidth: 200,
        render: (p) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#222' }}>
              {p.designation || p.description}
            </Typography>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.25 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#0288d1', fontWeight: 700 }}>
                {p.reference}
              </Typography>
              {p.client_nom && (
                <Typography variant="caption" sx={{ color: '#777' }}>
                  • {p.client_nom}
                </Typography>
              )}
            </Stack>
          </Box>
        )
      },
      {
        id: 'quantite',
        label: '2. Qte',
        align: 'center',
        render: (p) => <strong>{Number(p.quantite) || 1}</strong>
      },
      {
        id: 'cout_unitaire_achat',
        label: '3. Coût Unit.',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const cu = p.cout_unitaire_achat !== undefined ? Number(p.cout_unitaire_achat) : (Number(p.cout_total_revient) / qte || 0);
          return formatCurrency(cu);
        }
      },
      {
        id: 'cout_total_revient',
        label: '4. Coût Final',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const cu = p.cout_unitaire_achat !== undefined ? Number(p.cout_unitaire_achat) : (Number(p.cout_total_revient) / qte || 0);
          const cf = p.cout_total_revient !== undefined ? Number(p.cout_total_revient) : (qte * cu);
          return <span style={{ fontWeight: 700 }}>{formatCurrency(cf)}</span>;
        }
      },
      {
        id: 'prix_unitaire_vente',
        label: '5. Mt Vente Unit.',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const pu = p.prix_unitaire_vente !== undefined ? Number(p.prix_unitaire_vente) : (Number(p.montant_total_vente) / qte || 0);
          return formatCurrency(pu);
        }
      },
      {
        id: 'montant_total_vente',
        label: '6. Prix Client Final',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const pu = p.prix_unitaire_vente !== undefined ? Number(p.prix_unitaire_vente) : (Number(p.montant_total_vente) / qte || 0);
          const pf = p.montant_total_vente !== undefined ? Number(p.montant_total_vente) : (qte * pu);
          return (
            <span style={{ backgroundColor: '#fff59d', padding: '2px 6px', borderRadius: '2px', fontWeight: 800, color: '#e65100' }}>
              {formatCurrency(pf)}
            </span>
          );
        }
      },
      {
        id: 'marge_interne',
        label: '7. Marge Interne',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const cu = p.cout_unitaire_achat !== undefined ? Number(p.cout_unitaire_achat) : (Number(p.cout_total_revient) / qte || 0);
          const cf = p.cout_total_revient !== undefined ? Number(p.cout_total_revient) : (qte * cu);
          const pu = p.prix_unitaire_vente !== undefined ? Number(p.prix_unitaire_vente) : (Number(p.montant_total_vente) / qte || 0);
          const pf = p.montant_total_vente !== undefined ? Number(p.montant_total_vente) : (qte * pu);
          const mi = p.marge_interne !== undefined ? Number(p.marge_interne) : (pf - cf);
          return <span style={{ fontWeight: 700, color: '#1565c0' }}>{formatCurrency(mi)}</span>;
        }
      },
      {
        id: 'commission_apporteur_montant',
        label: '8. Comm. Apporteur',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const pu = p.prix_unitaire_vente !== undefined ? Number(p.prix_unitaire_vente) : (Number(p.montant_total_vente) / qte || 0);
          const pf = p.montant_total_vente !== undefined ? Number(p.montant_total_vente) : (qte * pu);
          const comm = Number(p.commission_apporteur_montant) || (pf * 0.10);
          return (
            <Box>
              <span style={{ color: '#e65100', fontWeight: 600 }}>{formatCurrency(comm)}</span>
              {p.apporteur_nom && (
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: '#999' }}>
                  {p.apporteur_nom}
                </Typography>
              )}
            </Box>
          );
        }
      },
      {
        id: 'commission_responsable_montant',
        label: '9. Comm. Resp',
        align: 'right',
        render: (p) => {
          const comm = Number(p.commission_responsable_montant) || 0;
          return comm > 0 ? (
            <Box>
              <span style={{ color: '#0097a7', fontWeight: 600 }}>{formatCurrency(comm)}</span>
              {p.responsable_service_nom && (
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: '#999' }}>
                  {p.responsable_service_nom}
                </Typography>
              )}
            </Box>
          ) : '-';
        }
      },
      {
        id: 'commission_commercial_montant',
        label: '10. Comm. Agent',
        align: 'right',
        render: (p) => {
          const comm = Number(p.commission_commercial_montant) || 0;
          return comm > 0 ? (
            <Box>
              <span style={{ color: '#6a1b9a', fontWeight: 600 }}>{formatCurrency(comm)}</span>
              {p.commercial_nom && (
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: '#999' }}>
                  {p.commercial_nom}
                </Typography>
              )}
            </Box>
          ) : '-';
        }
      },
      {
        id: 'benefice_reel',
        label: '11. Bénéfice Réel',
        align: 'right',
        render: (p) => {
          const qte = Number(p.quantite) || 1;
          const cu = p.cout_unitaire_achat !== undefined ? Number(p.cout_unitaire_achat) : (Number(p.cout_total_revient) / qte || 0);
          const cf = p.cout_total_revient !== undefined ? Number(p.cout_total_revient) : (qte * cu);
          const pu = p.prix_unitaire_vente !== undefined ? Number(p.prix_unitaire_vente) : (Number(p.montant_total_vente) / qte || 0);
          const pf = p.montant_total_vente !== undefined ? Number(p.montant_total_vente) : (qte * pu);
          const mi = p.marge_interne !== undefined ? Number(p.marge_interne) : (pf - cf);
          const commApp = Number(p.commission_apporteur_montant) || (pf * 0.10);
          const commResp = Number(p.commission_responsable_montant) || 0;
          const commCom = Number(p.commission_commercial_montant) || 0;
          const benefice = p.benefice_reel !== undefined ? Number(p.benefice_reel) : (mi - commApp - commResp - commCom);

          return (
            <span
              style={{
                backgroundColor: benefice >= 0 ? '#c8e6c9' : '#ffcdd2',
                color: benefice >= 0 ? '#1b5e20' : '#b71c1c',
                padding: '2px 6px',
                borderRadius: '2px',
                fontWeight: 800
              }}
            >
              {formatCurrency(benefice)}
            </span>
          );
        }
      },
      {
        id: 'statut',
        label: 'Statut',
        align: 'center',
        render: (p) => getStatusChip(p.statut)
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        sortable: false,
        render: (p) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            {p.statut === 'DEVIS' && (
              <BsbButton
                size="xs"
                color="blue"
                onClick={() => updatePrestation(p.id, { statut: 'CONFIRMEE' })}
                tooltip="Confirmer le devis"
              >
                <CheckIcon sx={{ fontSize: 14 }} />
              </BsbButton>
            )}
            {p.statut === 'CONFIRMEE' && (
              <BsbButton
                size="xs"
                color="deep-purple"
                onClick={() => updatePrestation(p.id, { statut: 'FACTUREE' })}
                tooltip="Émettre la facture"
              >
                <DescriptionIcon sx={{ fontSize: 14 }} />
              </BsbButton>
            )}
            {p.statut === 'FACTUREE' && (
              <BsbButton
                size="xs"
                color="green"
                onClick={() => updatePrestation(p.id, { statut: 'PAYEE' })}
                tooltip="Encaisser le paiement"
              >
                <PaidIcon sx={{ fontSize: 14 }} />
              </BsbButton>
            )}
            {deletePrestation && (
              <BsbButton
                size="xs"
                color="red"
                onClick={() => {
                  if (window.confirm('Supprimer cette prestation ?')) {
                    deletePrestation(p.id);
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
    [prestations]
  );

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Cards Row (AdminBSB Info-Boxes) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="amber"
            icon={<ReceiptLongIcon />}
            title="PRIX CLIENT FINAL"
            number={formatCurrency(tableTotals.totalPrixFinal)}
            subtitle={`${stats.totalCommandes} prestations facturées`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="blue"
            icon={<TrendingUpIcon />}
            title="MARGE INTERNE TOTALE"
            number={formatCurrency(tableTotals.totalMargeInterne)}
            subtitle="Coûts directs d'achat déduits"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="orange"
            icon={<MonetizationOnIcon />}
            title="TOTAL 3 COMMISSIONS"
            number={formatCurrency(tableTotals.totalCommApporteur + tableTotals.totalCommResp + tableTotals.totalCommCom)}
            subtitle={`Apporteurs, Responsables & Commerciaux`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="green"
            icon={<TrendingUpIcon />}
            title="BÉNÉFICE RÉEL TOTAL"
            number={formatCurrency(tableTotals.totalBeneficeReel)}
            subtitle={`Rentabilité nette : ${stats.rentabiliteMoyenne}%`}
          />
        </Grid>
      </Grid>

      {/* AdminBSB Card: Live Simulator */}
      <BsbCard
        title="SIMULATEUR INSTANTANÉ SELON LA GRILLE DES 11 COLONNES"
        subtitle="Calculez la cascade financière en temps réel avant saisie"
        sx={{ mb: 3 }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <BsbTextField
              label="Quantité"
              type="number"
              value={simulQte}
              onChange={(e) => {
                const q = Math.max(1, Number(e.target.value) || 1);
                setSimulQte(q);
                setSimulCommApporteur(Math.round(q * simulPrixUnit * 0.10));
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <BsbTextField
              label="Coût Unit. Achat"
              type="number"
              value={simulCoutUnit}
              onChange={(e) => setSimulCoutUnit(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <BsbTextField
              label="Prix Vente Unit."
              type="number"
              value={simulPrixUnit}
              onChange={(e) => {
                const pu = Number(e.target.value);
                setSimulPrixUnit(pu);
                setSimulCommApporteur(Math.round(simulQte * pu * 0.10));
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <BsbTextField
              label="Comm. Apporteur (10%)"
              type="number"
              value={simulCommApporteur}
              onChange={(e) => setSimulCommApporteur(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <BsbTextField
              label="Comm. Resp. Service"
              type="number"
              value={simulCommResponsable}
              onChange={(e) => setSimulCommResponsable(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <BsbTextField
              label="Comm. Commercial"
              type="number"
              value={simulCommCommercial}
              onChange={(e) => setSimulCommCommercial(Number(e.target.value))}
            />
          </Grid>

          {/* Result Banner */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: '2px', border: '1px solid #e0e0e0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="caption" sx={{ color: '#777', fontWeight: 700, display: 'block' }}>4. Coût Final Achat :</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333' }}>
                    {formatCurrency(simulResult.coutFinalAchat)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 800, display: 'block' }}>6. Prix Client Final :</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#e65100', bgcolor: '#fff59d', px: 1, py: 0.2, borderRadius: '2px', display: 'inline-block' }}>
                    {formatCurrency(simulResult.prixClientFinal)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 800, display: 'block' }}>7. Marge Interne :</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1565c0' }}>
                    {formatCurrency(simulResult.margeInterne)} ({simulResult.tauxMarge}%)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 800, display: 'block' }}>Total Commissions :</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#e65100' }}>
                    {formatCurrency(simulResult.totalCommissions)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 800, display: 'block' }}>11. Bénéfice Réel :</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: simulResult.beneficeReel >= 0 ? '#2e7d32' : '#c62828', bgcolor: '#c8e6c9', px: 1, py: 0.2, borderRadius: '2px', display: 'inline-block' }}>
                    {formatCurrency(simulResult.beneficeReel)} ({simulResult.tauxMargeNette}%)
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </BsbCard>

      {/* AdminBSB Card: Main DataTable */}
      <BsbCard
        title="JOURNAL DES PRESTATIONS (GRILLE DES 11 COLONNES)"
        subtitle="Tableau interactif des commandes avec calcul en cascade, tri et recherche multi-colonnes"
        headerAction={
          <Stack direction="row" spacing={1} alignItems="center">
            <BsbButton
              color="primary"
              size="sm"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
            >
              Nouvelle Prestation
            </BsbButton>
          </Stack>
        }
      >
        <BsbDataTable
          columns={columns}
          rows={filtered}
          searchPlaceholder="Rechercher désignation, client, référence..."
          footerRow={
            <TableRow sx={{ bgcolor: '#f5f5f5', borderTop: '2px solid #333' }}>
              <TableCell sx={{ fontWeight: 900, color: '#111' }}>TOTAUX GÉNÉRAUX</TableCell>
              <TableCell align="center" sx={{ fontWeight: 900 }}>{tableTotals.totalQte}</TableCell>
              <TableCell align="right" sx={{ color: '#999' }}>-</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900 }}>{formatCurrency(tableTotals.totalCoutFinal)}</TableCell>
              <TableCell align="right" sx={{ color: '#999' }}>-</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, bgcolor: '#fff59d', color: '#e65100' }}>{formatCurrency(tableTotals.totalPrixFinal)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: '#1565c0' }}>{formatCurrency(tableTotals.totalMargeInterne)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: '#e65100' }}>{formatCurrency(tableTotals.totalCommApporteur)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: '#0097a7' }}>{formatCurrency(tableTotals.totalCommResp)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: '#6a1b9a' }}>{formatCurrency(tableTotals.totalCommCom)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, bgcolor: '#c8e6c9', color: '#1b5e20' }}>{formatCurrency(tableTotals.totalBeneficeReel)}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          }
        />
      </BsbCard>

      {/* Modal Ajout Prestation (AdminBSB Modal avec Formulaires Flottants) */}
      <BsbModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="NOUVELLE PRESTATION — GRILLE DES 11 COLONNES"
        subtitle="Saisie des coûts, prix de vente et calcul automatique des marges"
        headerColor="primary"
        maxWidth="md"
        actions={
          <>
            <BsbButton
              variant="outlined"
              color="blue-grey"
              size="sm"
              onClick={() => setOpenModal(false)}
            >
              Annuler
            </BsbButton>
            <BsbButton
              color="primary"
              size="sm"
              onClick={handleSubmit}
            >
              Enregistrer la Prestation
            </BsbButton>
          </>
        }
      >
        <Grid container spacing={2.5}>
          {/* Section 1 : Client & Désignations */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textTransform: 'uppercase' }}>
              1. DÉSIGNATIONS & CLIENT CONCERNÉ
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbSelect
              label="Client Associé"
              value={formData.client_id}
              onChange={(e) => handleClientSelect(e.target.value)}
              options={[
                { value: '', label: '-- Sélectionner un client enregistré --' },
                ...clients.map((c) => ({ value: c.id, label: `${c.nom} (${c.ville || 'Abidjan'})` }))
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="Nom du Client (si non enregistré)"
              value={formData.client_nom}
              onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
              placeholder="Ex: Société Générale, Particulier..."
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BsbTextField
              label="1. DÉSIGNATIONS (Intitulé des travaux)"
              required
              multiline
              rows={2}
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Ex: Installation réseau 24 postes + baie informatique..."
            />
          </Grid>

          {/* Section 2 : Quantités, Coûts & Prix Unitaires */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textTransform: 'uppercase' }}>
              2. QUANTITÉS, COÛTS D'ACHAT & PRIX DE VENTE CLIENT
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <BsbTextField
              label="2. QUANTITÉS"
              type="number"
              required
              value={formData.quantite}
              onChange={(e) => handlePrixOuQteChange('quantite', e.target.value)}
              placeholder="1"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <BsbTextField
              label="3. COÛT UNITAIRE ACHAT (FCFA)"
              type="number"
              required
              value={formData.cout_unitaire_achat}
              onChange={(e) => setFormData({ ...formData, cout_unitaire_achat: e.target.value })}
              placeholder="Ex: 20000"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <BsbTextField
              label="5. MONTANT VENTE UNITAIRE (FCFA)"
              type="number"
              required
              value={formData.prix_unitaire_vente}
              onChange={(e) => handlePrixOuQteChange('prix_unitaire_vente', e.target.value)}
              placeholder="Ex: 35000"
            />
          </Grid>

          {/* Section 3 : Les 3 Commissions */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textTransform: 'uppercase' }}>
              3. RÉPARTITION DES 3 COMMISSIONS (APPORTEUR 10%, RESPONSABLE & COMMERCIAL)
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbSelect
              label="Apporteur d'Affaires Associé"
              value={formData.apporteur_id}
              onChange={(e) => handleApporteurSelect(e.target.value)}
              options={[
                { value: '', label: '-- Sélectionner un apporteur --' },
                ...partenairesApporteurs.map((p) => ({ value: p.id, label: `[${p.type}] ${p.nom}` }))
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="8. COMMISSION APPORTEUR (10% auto)"
              type="number"
              value={formData.commission_apporteur_montant}
              onChange={(e) => setFormData({ ...formData, commission_apporteur_montant: e.target.value })}
              helperText="10% du Prix Client Final calculé automatiquement (modifiable)"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbSelect
              label="Responsable de Service"
              value={formData.responsable_service_id}
              onChange={(e) => handleResponsableSelect(e.target.value)}
              options={[
                { value: '', label: '-- Sélectionner un responsable --' },
                ...profiles.map((u) => ({ value: u.id, label: `${u.nom} (${u.role})` }))
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="9. COMMISSION RESP SERVICE (FCFA)"
              type="number"
              value={formData.commission_responsable_montant}
              onChange={(e) => setFormData({ ...formData, commission_responsable_montant: e.target.value })}
              placeholder="Ex: 20000"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbSelect
              label="Agent Commercial Négociateur"
              value={formData.commercial_id}
              onChange={(e) => handleCommercialSelect(e.target.value)}
              options={[
                { value: '', label: '-- Sélectionner un commercial --' },
                ...agentsCommerciaux.map((a) => ({ value: a.id, label: `${a.nom} ${a.prenom || ''} (${a.matricule || 'Agent'})` }))
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BsbTextField
              label="10. COMMISSION AGENT COMMERCIAL (FCFA)"
              type="number"
              value={formData.commission_commercial_montant}
              onChange={(e) => setFormData({ ...formData, commission_commercial_montant: e.target.value })}
              placeholder="Ex: 42500"
            />
          </Grid>

          {/* Synthèse Live Formulaire */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: '2px', border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#333', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                ⚡ RÉCAPITULATIF EN DIRECT :
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#777', display: 'block' }}>4. Coût Final Achat :</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333' }}>
                    {formatCurrency(liveFormCalc.coutFinalAchat)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700, display: 'block' }}>6. Prix Client Final :</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', bgcolor: '#fff59d', px: 0.8, py: 0.2, borderRadius: '2px', display: 'inline-block' }}>
                    {formatCurrency(liveFormCalc.prixClientFinal)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 700, display: 'block' }}>7. Marge Interne :</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565c0' }}>
                    {formatCurrency(liveFormCalc.margeInterne)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 800, display: 'block' }}>11. Bénéfice Réel :</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: liveFormCalc.beneficeReel >= 0 ? '#2e7d32' : '#c62828', bgcolor: '#c8e6c9', px: 0.8, py: 0.2, borderRadius: '2px', display: 'inline-block' }}>
                    {formatCurrency(liveFormCalc.beneficeReel)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BsbSelect
              label="Statut initial du dossier"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              options={[
                { value: 'DEVIS', label: 'Devis en cours de négociation' },
                { value: 'CONFIRMEE', label: 'Commande Confirmée & Validée' },
                { value: 'FACTUREE', label: 'Prestation Réalisée & Facturée' },
                { value: 'PAYEE', label: 'Prestation Soldée / Payée' }
              ]}
            />
          </Grid>
        </Grid>
      </BsbModal>
    </Box>
  );
}
