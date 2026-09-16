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
import { calculateStockValuation, formatCurrency } from '@hinov/core';

import Inventory2Icon from '@mui/icons-material/Inventory2';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import StoreIcon from '@mui/icons-material/Store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function StocksModule() {
  const { hasModule, articles, clientsFournisseurs, addArticle, updateArticle, deleteArticle } = useErpData();
  const [openModal, setOpenModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');

  // Confirmation Modal State: { article: Object } | null
  const [deleteConfirmArt, setDeleteConfirmArt] = useState(null);

  const fournisseurs = useMemo(() => clientsFournisseurs.filter((t) => t.type === 'FOURNISSEUR'), [clientsFournisseurs]);

  const [formData, setFormData] = useState({
    code_article: '',
    designation: '',
    type_article: 'CONSOMMABLE',
    fournisseur_id: '',
    fournisseur_nom: '',
    quantite_stock: '',
    cout_unitaire_achat: '',
    prix_unitaire_vente: '',
    seuil_alerte: '5',
    unite: 'Pièce'
  });

  if (!hasModule('STOCKS')) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <BsbCard sx={{ maxWidth: 550, textAlign: 'center', p: 4, borderTop: '3px solid #9C27B0' }}>
          <LockOutlinedIcon sx={{ fontSize: 64, color: '#9C27B0', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#6A1B9A', mb: 1 }}>
            Module Stocks & Consommables Désactivé
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', mb: 3 }}>
            L'administrateur a désactivé le module <strong>Stocks & Consommables</strong> pour votre profil.
          </Typography>
          <Alert severity="warning" sx={{ textAlign: 'left', borderRadius: '2px' }}>
            Pour consulter ou gérer l'inventaire, contactez un administrateur afin d'activer le toggle correspondant.
          </Alert>
        </BsbCard>
      </Box>
    );
  }

  const stockValuation = calculateStockValuation(articles);

  const handleSupplierSelect = (fournisseurId) => {
    if (!fournisseurId) {
      setFormData((prev) => ({ ...prev, fournisseur_id: '', fournisseur_nom: '' }));
      return;
    }
    const found = fournisseurs.find((f) => f.id === fournisseurId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        fournisseur_id: found.id,
        fournisseur_nom: found.nom
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.designation) return;

    addArticle({
      ...formData,
      quantite_stock: Number(formData.quantite_stock) || 0,
      cout_unitaire_achat: Number(formData.cout_unitaire_achat) || 0,
      prix_unitaire_vente: Number(formData.prix_unitaire_vente) || 0,
      seuil_alerte: Number(formData.seuil_alerte) || 5
    });

    setFormData({
      code_article: '',
      designation: '',
      type_article: 'CONSOMMABLE',
      fournisseur_id: '',
      fournisseur_nom: '',
      quantite_stock: '',
      cout_unitaire_achat: '',
      prix_unitaire_vente: '',
      seuil_alerte: '5',
      unite: 'Pièce'
    });
    setOpenModal(false);
  };

  const handleAdjustStock = (article, delta) => {
    const newQty = Math.max(0, Number(article.quantite_stock) + delta);
    updateArticle(article.id, { quantite_stock: newQty });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmArt) {
      deleteArticle(deleteConfirmArt.id);
      setDeleteConfirmArt(null);
    }
  };

  const filtered = articles.filter((art) => {
    const matchType =
      filterType === 'ALL'
        ? true
        : filterType === 'ALERT'
        ? Number(art.quantite_stock) <= Number(art.seuil_alerte)
        : art.type_article === filterType;

    const matchSupplier =
      supplierFilter === 'ALL'
        ? true
        : art.fournisseur_id === supplierFilter || art.fournisseur_nom === supplierFilter;

    return matchType && matchSupplier;
  });

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Info Boxes AdminBSB */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="purple"
            icon={<Inventory2Icon />}
            title="ARTICLES EN STOCK"
            number={stockValuation.nombreArticles}
            subtitle={`Total : ${stockValuation.totalArticlesEnStock} unités`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="blue"
            icon={<MonetizationOnIcon />}
            title="VALEUR ACHAT"
            number={formatCurrency(stockValuation.valeurAchatTotale)}
            subtitle="Capital immobilisé"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="teal"
            icon={<TrendingUpIcon />}
            title="VALEUR VENTE"
            number={formatCurrency(stockValuation.valeurVenteTotale)}
            subtitle={`Marge pot. : ${formatCurrency(stockValuation.margePotentielle)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-zoom"
            color={stockValuation.nombreAlertes > 0 ? 'red' : 'blue-grey'}
            icon={<WarningAmberIcon />}
            title="ALERTES RUPTURE"
            number={`${stockValuation.nombreAlertes} Articles`}
            subtitle="Stock critique &le; seuil"
          />
        </Grid>
      </Grid>

      {/* Main AdminBSB Card: Catalogue des Articles */}
      <BsbCard
        title="CATALOGUE DES ARTICLES & APPROVISIONNEMENT"
        subtitle="Inventaire des consommables, matériels, valorisation et gestion des seuils critiques"
        headerColor="purple"
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Nouvel Article
          </BsbButton>
        }
      >
        {/* Filtres de recherche */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Box sx={{ minWidth: 260 }}>
            <BsbSelect
              label="Filtrer par Fournisseur"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tous les fournisseurs' },
                ...fournisseurs.map((f) => ({ value: f.id, label: f.nom }))
              ]}
            />
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {[
              { id: 'ALL', label: 'Tous' },
              { id: 'ALERT', label: `Alertes (${stockValuation.nombreAlertes})`, color: 'red' },
              { id: 'CONSOMMABLE', label: 'Consommables' },
              { id: 'EQUIPEMENT', label: 'Équipements' }
            ].map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                clickable
                color={filterType === f.id ? (f.id === 'ALERT' ? 'error' : 'primary') : 'default'}
                onClick={() => setFilterType(f.id)}
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: '2px',
                  bgcolor: filterType === f.id ? (f.id === 'ALERT' ? '#E53935' : '#9C27B0') : '#eee',
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
              id: 'code_article',
              label: 'Réf. Code',
              render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#6A1B9A', fontSize: '0.82rem' }}>
                  {row.code_article || 'N/A'}
                </Typography>
              )
            },
            {
              id: 'designation',
              label: 'Désignation',
              render: (row) => (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#333', fontSize: '0.82rem' }}>
                    {row.designation}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem' }}>
                    Type : {row.type_article}
                  </Typography>
                </Box>
              )
            },
            {
              id: 'fournisseur',
              label: 'Fournisseur Référencé',
              render: (row) => (
                <Box>
                  {row.fournisseur_nom ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StoreIcon sx={{ fontSize: 15, color: '#E65100' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#E65100', fontSize: '0.8rem' }}>
                        {row.fournisseur_nom}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Non assigné
                    </Typography>
                  )}
                </Box>
              )
            },
            {
              id: 'stock',
              label: 'Niveau Stock',
              align: 'center',
              render: (row) => {
                const isLow = Number(row.quantite_stock) <= Number(row.seuil_alerte);
                return (
                  <Stack direction="row" spacing={0.8} justifyContent="center" alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: isLow ? '#C62828' : '#2E7D32',
                        fontSize: '0.85rem'
                      }}
                    >
                      {row.quantite_stock} {row.unite || 'unités'}
                    </Typography>
                    {isLow && (
                      <Chip
                        label="Alerte"
                        size="small"
                        sx={{
                          bgcolor: '#FFEBEE',
                          color: '#C62828',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          height: 20,
                          borderRadius: '2px'
                        }}
                      />
                    )}
                  </Stack>
                );
              }
            },
            {
              id: 'cout_achat',
              label: 'Coût Achat',
              align: 'right',
              render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#555', fontSize: '0.8rem' }}>
                  {formatCurrency(row.cout_unitaire_achat)}
                </Typography>
              )
            },
            {
              id: 'prix_vente',
              label: 'Prix Vente',
              align: 'right',
              render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#2E7D32', fontSize: '0.82rem' }}>
                  {formatCurrency(row.prix_unitaire_vente)}
                </Typography>
              )
            },
            {
              id: 'ajustement',
              label: 'Ajustement',
              align: 'center',
              render: (row) => (
                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                  <BsbButton
                    size="xs"
                    color="primary"
                    onClick={() => handleAdjustStock(row, 1)}
                    tooltip="Ajouter 1 au stock"
                  >
                    <AddIcon sx={{ fontSize: 14 }} />
                  </BsbButton>
                  <BsbButton
                    size="xs"
                    color="orange"
                    onClick={() => handleAdjustStock(row, -1)}
                    tooltip="Déduire 1 du stock"
                  >
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </BsbButton>
                </Stack>
              )
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'center',
              render: (row) => (
                <Tooltip title="Supprimer cet article">
                  <IconButton
                    size="small"
                    sx={{ color: '#E53935', '&:hover': { bgcolor: '#FFEBEE' } }}
                    onClick={() => setDeleteConfirmArt(row)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
          ]}
          data={filtered}
          emptyMessage="Aucun article trouvé."
        />
      </BsbCard>

      {/* Modal Confirmation de Suppression */}
      <BsbModal
        open={Boolean(deleteConfirmArt)}
        onClose={() => setDeleteConfirmArt(null)}
        title="SUPPRIMER L'ARTICLE DU STOCK"
        headerColor="red"
        maxWidth="xs"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setDeleteConfirmArt(null)}>
              Annuler
            </BsbButton>
            <BsbButton color="danger" onClick={handleConfirmDelete}>
              Supprimer définitivement
            </BsbButton>
          </>
        }
      >
        {deleteConfirmArt && (
          <Box sx={{ py: 1 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 36, color: '#D32F2F', flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                  Êtes-vous sûr de vouloir supprimer cet article ?
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  Cette référence sera retirée de l'inventaire et des valorisations de stock.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '2px', border: '1px solid #e9ecef' }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, display: 'block', mb: 0.5 }}>
                DÉTAILS DE L'ARTICLE :
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
                {deleteConfirmArt.designation} ({deleteConfirmArt.code_article})
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                Stock actuel : {deleteConfirmArt.quantite_stock} {deleteConfirmArt.unite}
              </Typography>
            </Box>
          </Box>
        )}
      </BsbModal>

      {/* Modal d'ajout article */}
      <BsbModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="NOUVEL ARTICLE / PIÈCE DE RECHANGE"
        headerColor="purple"
        maxWidth="sm"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setOpenModal(false)}>
              Annuler
            </BsbButton>
            <BsbButton color="primary" onClick={handleSubmit}>
              Ajouter l'article
            </BsbButton>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <BsbTextField
                  label="Code Article"
                  value={formData.code_article}
                  onChange={(e) => setFormData({ ...formData, code_article: e.target.value })}
                  placeholder="ART-00X"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 7 }}>
                <BsbSelect
                  label="Catégorie"
                  value={formData.type_article}
                  onChange={(e) => setFormData({ ...formData, type_article: e.target.value })}
                  options={[
                    { value: 'CONSOMMABLE', label: 'Consommable' },
                    { value: 'EQUIPEMENT', label: 'Équipement' },
                    { value: 'PIECE_DETACHEE', label: 'Pièce Détachée' },
                    { value: 'MATERIEL', label: 'Matériel Divers' }
                  ]}
                />
              </Grid>
            </Grid>

            <BsbSelect
              label="Fournisseur Référencé (Optionnel)"
              value={formData.fournisseur_id}
              onChange={(e) => handleSupplierSelect(e.target.value)}
              options={[
                { value: '', label: '-- Aucun fournisseur assigné --' },
                ...fournisseurs.map((f) => ({ value: f.id, label: `${f.nom} (${f.ville || 'Abidjan'})` }))
              ]}
            />

            <BsbTextField
              label="Désignation de l'article"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Ex: Câble RJ45 Cat6 (Bobine 100m)"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Quantité initiale en stock"
                  type="number"
                  value={formData.quantite_stock}
                  onChange={(e) => setFormData({ ...formData, quantite_stock: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Unité"
                  value={formData.unite}
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                  placeholder="Pièce, Bobine, Kg..."
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Coût Achat Unitaire (FCFA)"
                  type="number"
                  value={formData.cout_unitaire_achat}
                  onChange={(e) => setFormData({ ...formData, cout_unitaire_achat: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Prix Vente Unitaire (FCFA)"
                  type="number"
                  value={formData.prix_unitaire_vente}
                  onChange={(e) => setFormData({ ...formData, prix_unitaire_vente: e.target.value })}
                />
              </Grid>
            </Grid>

            <BsbTextField
              label="Seuil d'Alerte de Rupture"
              type="number"
              value={formData.seuil_alerte}
              onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })}
              helperText="Une alerte sera déclenchée dès que le stock descend sous ce seuil"
            />
          </Stack>
        </form>
      </BsbModal>
    </Box>
  );
}
