import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Paper,
  Divider
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

import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BadgeIcon from '@mui/icons-material/Badge';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function UsersManager() {
  const { currentUser, isAdmin } = useAuth();
  const {
    profiles,
    modules,
    userModules,
    addProfile,
    updateProfile,
    resetUserPassword,
    deleteProfile,
    toggleUserStatus,
    toggleUserModule,
    setUserModulesForUser
  } = useErpData();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permissionsModalUser, setPermissionsModalUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [createdSuccessUser, setCreatedSuccessUser] = useState(null);

  // Form validation & error feedback
  const [formError, setFormError] = useState('');

  // Toast notification feedback
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Password reset state
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedSuccessCredentials, setCopiedSuccessCredentials] = useState(false);

  // Formulaire Nouvel Utilisateur / Édition
  const [formData, setFormData] = useState({
    nom: '',
    poste: '',
    email: '',
    telephone: '',
    password: '',
    role: 'USER',
    actif: true,
    enabledModules: ['CAISSE_DEPENSES', 'PRESTATIONS']
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Hinov@${code}`;
  };

  // KPI Stats
  const stats = useMemo(() => {
    const total = profiles.length;
    const admins = profiles.filter((p) => p.role === 'ADMIN').length;
    const actifs = profiles.filter((p) => p.actif !== false).length;
    const inactifs = total - actifs;
    return { total, admins, actifs, inactifs };
  }, [profiles]);

  const allModuleCodes = useMemo(() => modules.map((m) => m.code_module), [modules]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormError('');
    setFormData({
      nom: '',
      poste: '',
      email: '',
      telephone: '',
      password: generateRandomPassword(),
      role: 'USER',
      actif: true,
      enabledModules: allModuleCodes.length > 0 ? allModuleCodes : ['MAINTENANCE', 'STOCKS', 'CAISSE_DEPENSES', 'PRESTATIONS', 'CLIENTS_FOURNISSEURS', 'COMMERCIAUX', 'COMMISSIONS']
    });
    setShowFormPassword(true);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormError('');
    // Trouver les modules activés de cet utilisateur
    const enabled = modules
      .filter((m) => {
        const link = userModules.find((um) => um.user_id === user.id && um.module_id === m.id);
        return link?.is_enabled;
      })
      .map((m) => m.code_module);

    setFormData({
      nom: user.nom || '',
      poste: user.poste || '',
      email: user.email || '',
      telephone: user.telephone || '',
      password: '', // Optionnel lors de l'édition
      role: user.role || 'USER',
      actif: user.actif !== false,
      enabledModules: enabled.length > 0 ? enabled : ['CAISSE_DEPENSES']
    });
    setShowFormPassword(false);
    setCreateModalOpen(true);
  };

  const handleOpenPasswordReset = (user) => {
    setPasswordModalUser(user);
    setNewPasswordInput(generateRandomPassword());
    setShowPassword(true);
    setCopiedNotification(false);
  };

  const handleSavePasswordReset = () => {
    if (passwordModalUser && newPasswordInput.trim()) {
      resetUserPassword(passwordModalUser.id, newPasswordInput.trim());
      setToast({
        open: true,
        message: `Mot de passe réinitialisé avec succès pour ${passwordModalUser.nom}.`,
        severity: 'success'
      });
      setPasswordModalUser(null);
      setNewPasswordInput('');
    }
  };

  const handleCopyPassword = () => {
    if (newPasswordInput) {
      navigator.clipboard.writeText(newPasswordInput);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const handleCopyCredentials = (user) => {
    if (!user) return;
    const pwd = user.plainPassword || user.password || 'Non renseigné';
    const text = `🏢 HINOV ERP - Accès Utilisateur\n------------------------------------\n👤 Nom : ${user.nom}\n📧 Identifiant (Email) : ${user.email}\n🔑 Mot de passe : ${pwd}\n🌐 Lien d'accès : ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedSuccessCredentials(true);
    setTimeout(() => setCopiedSuccessCredentials(false), 3000);
  };

  const handleModuleCheckboxToggle = (moduleCode) => {
    setFormData((prev) => {
      const exists = prev.enabledModules.includes(moduleCode);
      const updated = exists
        ? prev.enabledModules.filter((code) => code !== moduleCode)
        : [...prev.enabledModules, moduleCode];
      return { ...prev, enabledModules: updated };
    });
  };

  const handleSaveUser = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');

    const cleanNom = (formData.nom || '').trim();
    const cleanEmail = (formData.email || '').trim().toLowerCase();

    if (!cleanNom) {
      setFormError('Le nom et prénom(s) sont obligatoires.');
      return;
    }
    if (!cleanEmail) {
      setFormError("L'adresse email est obligatoire.");
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Veuillez saisir une adresse email valide (ex: contact@hinovgroup.com).');
      return;
    }

    if (editingUser) {
      const updateData = {
        nom: cleanNom,
        poste: formData.poste?.trim() || '',
        email: cleanEmail,
        telephone: formData.telephone?.trim() || '',
        role: formData.role,
        actif: formData.actif
      };
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim();
      }
      updateProfile(editingUser.id, updateData);
      // Mettre à jour les modules de façon atomique
      setUserModulesForUser(editingUser.id, formData.enabledModules, formData.role === 'ADMIN');
      setToast({
        open: true,
        message: `Compte utilisateur ${cleanNom} mis à jour avec succès.`,
        severity: 'success'
      });
      setCreateModalOpen(false);
    } else {
      const userPassword = formData.password?.trim() || generateRandomPassword();
      const newCreatedUser = addProfile(
        {
          nom: cleanNom,
          poste: formData.poste?.trim() || '',
          email: cleanEmail,
          telephone: formData.telephone?.trim() || '',
          password: userPassword,
          role: formData.role,
          actif: formData.actif
        },
        formData.enabledModules
      );

      setCreateModalOpen(false);
      // Ouvrir immédiatement la boîte modale de confirmation avec les identifiants
      setCreatedSuccessUser({
        ...newCreatedUser,
        plainPassword: userPassword
      });
      setToast({
        open: true,
        message: `Compte utilisateur créé avec succès pour ${cleanNom} !`,
        severity: 'success'
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmUser) {
      const nom = deleteConfirmUser.nom;
      deleteProfile(deleteConfirmUser.id);
      setToast({
        open: true,
        message: `Utilisateur ${nom} supprimé.`,
        severity: 'info'
      });
      setDeleteConfirmUser(null);
    }
  };

  const getUserEnabledModules = (userId, role) => {
    if (role === 'ADMIN') {
      return [{ code_module: 'TOUS', nom: 'Accès Total (Admin)', is_all: true }];
    }
    return modules.filter((m) => {
      const link = userModules.find((um) => um.user_id === userId && um.module_id === m.id);
      return link?.is_enabled || m.code_module === 'CAISSE_DEPENSES';
    });
  };

  const getModuleBadgeColor = (code) => {
    switch (code) {
      case 'PRESTATIONS':
        return { bg: '#FCE4EC', color: '#C2185B' };
      case 'MAINTENANCE':
        return { bg: '#ECEFF1', color: '#37474F' };
      case 'STOCKS':
        return { bg: '#F3E5F5', color: '#6A1B9A' };
      case 'COMMISSIONS':
        return { bg: '#FFF3E0', color: '#E65100' };
      case 'CLIENTS_FOURNISSEURS':
        return { bg: '#E8EAF6', color: '#1A237E' };
      case 'COMMERCIAUX':
        return { bg: '#FBE9E7', color: '#BF360C' };
      case 'CAISSE_DEPENSES':
      default:
        return { bg: '#E8F5E9', color: '#2E7D32' };
    }
  };

  return (
    <Box sx={{ pb: 3 }}>
      {/* KPI Info Boxes AdminBSB */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="blue"
            icon={<PeopleIcon />}
            title="TOTAL UTILISATEURS"
            number={stats.total}
            subtitle="Comptes enregistrés"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="teal"
            icon={<AdminPanelSettingsIcon />}
            title="ADMINISTRATEURS"
            number={stats.admins}
            subtitle="Gestionnaires système"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-expand"
            color="light-green"
            icon={<CheckCircleOutlineIcon />}
            title="UTILISATEURS ACTIFS"
            number={stats.actifs}
            subtitle="Accès opérationnels"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BsbInfoBox
            variant="hover-zoom"
            color={stats.inactifs > 0 ? 'orange' : 'blue-grey'}
            icon={<BlockIcon />}
            title="COMPTES DÉSACTIVÉS"
            number={stats.inactifs}
            subtitle="Accès suspendus"
          />
        </Grid>
      </Grid>

      {/* Main AdminBSB Card: Table des Utilisateurs */}
      <BsbCard
        title="GESTION DES UTILISATEURS & COMPTES D'ACCÈS"
        subtitle="Création des profils, affectation des postes, rôles et habilitations applicatives"
        headerColor="blue"
        headerAction={
          <BsbButton
            color="primary"
            size="sm"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenCreate}
          >
            Nouvel Utilisateur
          </BsbButton>
        }
      >
        <BsbDataTable
          columns={[
            {
              id: 'user',
              label: 'Utilisateur / Collaborateur',
              render: (row) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={row.avatar_url}
                    alt={row.nom}
                    sx={{ width: 38, height: 38, bgcolor: '#0288D1', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    {row.nom ? row.nom.charAt(0) : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222', fontSize: '0.85rem' }}>
                      {row.nom}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', fontSize: '0.72rem' }}>
                      {row.poste || (row.role === 'ADMIN' ? 'Administrateur Général' : 'Collaborateur')}
                    </Typography>
                  </Box>
                </Stack>
              )
            },
            {
              id: 'contact',
              label: 'Email & Téléphone',
              render: (row) => (
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <EmailIcon sx={{ fontSize: 13, color: '#777' }} />
                    <Typography variant="body2" sx={{ color: '#0288D1', fontSize: '0.78rem', fontWeight: 600 }}>
                      {row.email}
                    </Typography>
                  </Stack>
                  {row.telephone && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.3 }}>
                      <PhoneIcon sx={{ fontSize: 13, color: '#777' }} />
                      <Typography variant="caption" sx={{ color: '#555', fontSize: '0.72rem' }}>
                        {row.telephone}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              )
            },
            {
              id: 'role',
              label: 'Rôle',
              align: 'center',
              render: (row) => (
                <Chip
                  icon={row.role === 'ADMIN' ? <AdminPanelSettingsIcon sx={{ fontSize: '14px !important' }} /> : <BadgeIcon sx={{ fontSize: '14px !important' }} />}
                  label={row.role === 'ADMIN' ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                  size="small"
                  sx={{
                    bgcolor: row.role === 'ADMIN' ? '#EDE7F6' : '#E3F2FD',
                    color: row.role === 'ADMIN' ? '#512DA8' : '#1565C0',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    borderRadius: '2px'
                  }}
                />
              )
            },
            {
              id: 'statut',
              label: 'Statut',
              align: 'center',
              render: (row) => {
                const isActif = row.actif !== false;
                return (
                  <Chip
                    label={isActif ? 'Actif' : 'Inactif'}
                    size="small"
                    onClick={() => toggleUserStatus(row.id)}
                    sx={{
                      bgcolor: isActif ? '#E8F5E9' : '#ECEFF1',
                      color: isActif ? '#2E7D32' : '#78909C',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      '&:hover': { opacity: 0.85 }
                    }}
                  />
                );
              }
            },
            {
              id: 'modules',
              label: 'Modules Habilités',
              render: (row) => {
                const userMods = getUserEnabledModules(row.id, row.role);
                if (row.role === 'ADMIN') {
                  return (
                    <Chip
                      label="Tous les modules (Accès Total)"
                      size="small"
                      sx={{ bgcolor: '#E8F5E9', color: '#1B5E20', fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px' }}
                    />
                  );
                }
                return (
                  <Stack direction="row" spacing={0.4} sx={{ flexWrap: 'wrap', gap: 0.4 }}>
                    {userMods.map((m) => {
                      const style = getModuleBadgeColor(m.code_module);
                      return (
                        <Chip
                          key={m.id || m.code_module}
                          label={m.nom ? m.nom.split(' ')[0] : m.code_module}
                          size="small"
                          sx={{
                            bgcolor: style.bg,
                            color: style.color,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            borderRadius: '2px'
                          }}
                        />
                      );
                    })}
                  </Stack>
                );
              }
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'center',
              render: (row) => (
                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                  <BsbButton
                    size="xs"
                    color="primary"
                    onClick={() => handleOpenEdit(row)}
                    tooltip="Modifier l'utilisateur"
                  >
                    <EditIcon sx={{ fontSize: 13 }} />
                  </BsbButton>
                  <BsbButton
                    size="xs"
                    color="teal"
                    onClick={() => setPermissionsModalUser(row)}
                    tooltip="Gérer les permissions de modules"
                  >
                    <ToggleOnIcon sx={{ fontSize: 15 }} />
                  </BsbButton>
                  <BsbButton
                    size="xs"
                    color="orange"
                    onClick={() => handleOpenPasswordReset(row)}
                    tooltip="Réinitialiser le mot de passe"
                  >
                    <LockResetIcon sx={{ fontSize: 14 }} />
                  </BsbButton>
                  {row.id !== currentUser?.id && (
                    <Tooltip title="Supprimer l'utilisateur">
                      <IconButton
                        size="small"
                        sx={{ color: '#E53935', '&:hover': { bgcolor: '#FFEBEE' } }}
                        onClick={() => setDeleteConfirmUser(row)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              )
            }
          ]}
          data={profiles}
          emptyMessage="Aucun utilisateur enregistré."
        />
      </BsbCard>

      {/* Modal Création / Modification d'un Utilisateur */}
      <BsbModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingUser ? "MODIFIER L'UTILISATEUR" : "NOUVEL UTILISATEUR DE L'ERP"}
        subtitle="Renseignez les informations du compte, le mot de passe et définissez ses accès initiaux"
        headerColor="blue"
        maxWidth="sm"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </BsbButton>
            <BsbButton color="primary" onClick={handleSaveUser}>
              {editingUser ? 'Enregistrer les modifications' : "Créer l'utilisateur"}
            </BsbButton>
          </>
        }
      >
        <form onSubmit={handleSaveUser}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: '2px', py: 0.5 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Nom & Prénom(s)"
                  required
                  value={formData.nom}
                  onChange={(e) => {
                    setFormData({ ...formData, nom: e.target.value });
                    if (formError) setFormError('');
                  }}
                  placeholder="Ex: Eric Kouassi"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Poste / Fonction"
                  value={formData.poste}
                  onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                  placeholder="Ex: Chef de Service Maintenance"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbTextField
                  label="Adresse Email (Identifiant)"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="eric.kouassi@entreprise.ci"
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
            </Grid>

            {/* Mot de passe */}
            <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: '2px', border: '1px solid #e0e0e0' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>
                  {editingUser ? 'MODIFIER LE MOT DE PASSE (OPTIONNEL)' : 'MOT DE PASSE INITIAL DU COMPTE *'}
                </Typography>
                <BsbButton
                  size="xs"
                  color="teal"
                  startIcon={<AutoAwesomeIcon sx={{ fontSize: 13 }} />}
                  onClick={() => {
                    setFormData({ ...formData, password: generateRandomPassword() });
                    setShowFormPassword(true);
                  }}
                >
                  Générer
                </BsbButton>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <BsbTextField
                    type={showFormPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Laisser vide pour conserver le mot de passe actuel' : 'Ex: Hinov@2026!'}
                    required={!editingUser}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setShowFormPassword(!showFormPassword)}
                  sx={{ color: '#666', border: '1px solid #ddd', borderRadius: '2px' }}
                >
                  {showFormPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </Stack>
              <Typography variant="caption" sx={{ color: '#777', display: 'block', mt: 0.5 }}>
                {editingUser
                  ? 'Laissez ce champ vide si vous ne souhaitez pas modifier le mot de passe de cet utilisateur.'
                  : 'Ce mot de passe permettra à l’utilisateur de se connecter à la plateforme.'}
              </Typography>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <BsbSelect
                  label="Rôle Système"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={[
                    { value: 'USER', label: 'Utilisateur Standard (Accès selon modules)' },
                    { value: 'ADMIN', label: 'Administrateur Général (Accès Total)' }
                  ]}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.actif}
                      onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Compte Actif (Autoriser la connexion)
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>

            {/* Affectation des modules si rôle USER */}
            {formData.role !== 'ADMIN' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '2px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>
                    MODULES HABILITÉS POUR CET UTILISATEUR :
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <BsbButton
                      size="xs"
                      color="teal"
                      onClick={() => setFormData((prev) => ({ ...prev, enabledModules: allModuleCodes }))}
                    >
                      Tout activer
                    </BsbButton>
                    <BsbButton
                      size="xs"
                      color="secondary"
                      onClick={() => setFormData((prev) => ({ ...prev, enabledModules: ['CAISSE_DEPENSES'] }))}
                    >
                      Désactiver
                    </BsbButton>
                  </Stack>
                </Stack>
                <Grid container spacing={1}>
                  {modules.map((m) => {
                    const isChecked = formData.enabledModules.includes(m.code_module) || m.code_module === 'CAISSE_DEPENSES';
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={m.id}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={isChecked}
                              disabled={m.code_module === 'CAISSE_DEPENSES'}
                              onChange={() => handleModuleCheckboxToggle(m.code_module)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ fontWeight: isChecked ? 700 : 500 }}>
                              {m.nom} {m.code_module === 'CAISSE_DEPENSES' ? '(Universel)' : ''}
                            </Typography>
                          }
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Stack>
        </form>
      </BsbModal>

      {/* Modal d'Assignation Rapide des Permissions */}
      <BsbModal
        open={Boolean(permissionsModalUser)}
        onClose={() => setPermissionsModalUser(null)}
        title="HABILITATIONS DES MODULES ERP"
        subtitle={`Configuration des accès pour ${permissionsModalUser?.nom}`}
        headerColor="teal"
        maxWidth="sm"
        actions={
          <BsbButton color="primary" onClick={() => setPermissionsModalUser(null)}>
            Terminer & Fermer
          </BsbButton>
        }
      >
        {permissionsModalUser && (
          <Box sx={{ py: 1 }}>
            {permissionsModalUser.role === 'ADMIN' ? (
              <Box sx={{ p: 2, bgcolor: '#EDE7F6', borderRadius: '2px', textAlign: 'center' }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 40, color: '#512DA8', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#512DA8' }}>
                  Rôle Administrateur Général
                </Typography>
                <Typography variant="body2" sx={{ color: '#673AB7', mt: 0.5 }}>
                  Cet utilisateur dispose d'un droit universel d'accès à l'ensemble des modules, statistiques et outils d'administration.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {modules.map((m) => {
                  const link = userModules.find(
                    (um) => um.user_id === permissionsModalUser.id && um.module_id === m.id
                  );
                  const isEnabled = link?.is_enabled || m.code_module === 'CAISSE_DEPENSES';
                  const isUniversal = m.code_module === 'CAISSE_DEPENSES';

                  return (
                    <Box
                      key={m.id}
                      sx={{
                        p: 1.5,
                        bgcolor: isEnabled ? '#F1F8E9' : '#FAFAFA',
                        border: `1px solid ${isEnabled ? '#C5E1A5' : '#E0E0E0'}`,
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isEnabled ? '#2E7D32' : '#555' }}>
                          {m.nom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#777' }}>
                          {isUniversal ? 'Accessible à tous (cloisonné selon les modules actifs)' : m.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={isEnabled}
                        disabled={isUniversal}
                        onChange={(e) => toggleUserModule(permissionsModalUser.id, m.id, e.target.checked)}
                        color="success"
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}
      </BsbModal>

      {/* Modal Confirmation de Suppression */}
      <BsbModal
        open={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        title="SUPPRIMER L'UTILISATEUR"
        headerColor="red"
        maxWidth="xs"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setDeleteConfirmUser(null)}>
              Annuler
            </BsbButton>
            <BsbButton color="danger" onClick={handleConfirmDelete}>
              Supprimer définitivement
            </BsbButton>
          </>
        }
      >
        {deleteConfirmUser && (
          <Box sx={{ py: 1 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 36, color: '#D32F2F', flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333' }}>
                  Supprimer le compte de {deleteConfirmUser.nom} ?
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  Toutes les permissions de cet utilisateur seront révoquées et son accès sera supprimé.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '2px', border: '1px solid #e9ecef' }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, display: 'block', mb: 0.5 }}>
                RÉCAPITULATIF DU PROFIL :
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
                {deleteConfirmUser.nom} ({deleteConfirmUser.role})
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                Email : {deleteConfirmUser.email}
              </Typography>
            </Box>
          </Box>
        )}
      </BsbModal>

      {/* Modal Réinitialisation du Mot de Passe */}
      <BsbModal
        open={Boolean(passwordModalUser)}
        onClose={() => setPasswordModalUser(null)}
        title="RÉINITIALISER LE MOT DE PASSE"
        subtitle={`Définir un nouveau mot de passe pour ${passwordModalUser?.nom}`}
        headerColor="orange"
        maxWidth="xs"
        actions={
          <>
            <BsbButton color="secondary" onClick={() => setPasswordModalUser(null)}>
              Annuler
            </BsbButton>
            <BsbButton
              color="primary"
              disabled={!newPasswordInput.trim()}
              onClick={handleSavePasswordReset}
            >
              Enregistrer le mot de passe
            </BsbButton>
          </>
        }
      >
        {passwordModalUser && (
          <Box sx={{ py: 1 }}>
            {/* Profil info */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, p: 1.5, bgcolor: '#FFF8E1', borderRadius: '2px', border: '1px solid #FFE082' }}>
              <Avatar
                src={passwordModalUser.avatar_url}
                sx={{ width: 42, height: 42, bgcolor: '#FF8F00', fontWeight: 700 }}
              >
                {passwordModalUser.nom ? passwordModalUser.nom.charAt(0) : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>
                  {passwordModalUser.nom}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  {passwordModalUser.email} • {passwordModalUser.poste || passwordModalUser.role}
                </Typography>
              </Box>
            </Stack>

            {/* Password input & controls */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#444' }}>
                  NOUVEAU MOT DE PASSE :
                </Typography>
                <BsbButton
                  size="xs"
                  color="teal"
                  startIcon={<AutoAwesomeIcon sx={{ fontSize: 13 }} />}
                  onClick={() => setNewPasswordInput(generateRandomPassword())}
                >
                  Générer aléatoire
                </BsbButton>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <BsbTextField
                    type={showPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Saisissez ou générez un mot de passe"
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ color: '#666', border: '1px solid #ddd', borderRadius: '2px' }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
                <Tooltip title="Copier le mot de passe">
                  <IconButton
                    size="small"
                    onClick={handleCopyPassword}
                    sx={{ color: '#0288D1', border: '1px solid #0288D1', borderRadius: '2px', bgcolor: copiedNotification ? '#E1F5FE' : 'transparent' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {copiedNotification && (
                <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700, display: 'block', mt: 0.5 }}>
                  ✓ Mot de passe copié dans le presse-papier !
                </Typography>
              )}
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: '2px', border: '1px solid #e9ecef' }}>
              <Typography variant="caption" sx={{ color: '#555', display: 'block', lineHeight: 1.4 }}>
                ℹ️ Ce nouveau mot de passe prendra effet immédiatement. Vous pourrez le transmettre de manière sécurisée au collaborateur.
              </Typography>
            </Box>
          </Box>
        )}
      </BsbModal>

      {/* Modal Succès Création d'Utilisateur avec Identifiants Copiables */}
      <BsbModal
        open={Boolean(createdSuccessUser)}
        onClose={() => setCreatedSuccessUser(null)}
        title="UTILISATEUR CRÉÉ AVEC SUCCÈS"
        subtitle="Le profil est enregistré et actif. Transmettez ces identifiants au collaborateur."
        headerColor="light-green"
        maxWidth="sm"
        actions={
          <BsbButton
            color="primary"
            onClick={() => setCreatedSuccessUser(null)}
          >
            Fermer & Terminer
          </BsbButton>
        }
      >
        {createdSuccessUser && (
          <Box sx={{ py: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                bgcolor: '#E8F5E9',
                border: '1px solid #A5D6A7',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 32, color: '#2E7D32' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1B5E20' }}>
                  Compte opérationnel & Enregistré !
                </Typography>
                <Typography variant="caption" sx={{ color: '#2E7D32', display: 'block' }}>
                  Le compte peut désormais se connecter sur tous les terminaux autorisés.
                </Typography>
              </Box>
            </Paper>

            <Box
              sx={{
                p: 2.5,
                bgcolor: '#FAFAFA',
                border: '1px solid #E0E0E0',
                borderRadius: '2px',
                mb: 2.5
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#555', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                FICHE D'IDENTIFIANTS D'ACCÈS
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#777', fontWeight: 600 }}>
                    Nom & Prénom(s) :
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222' }}>
                    {createdSuccessUser.nom}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#777', fontWeight: 600 }}>
                    Identifiant / Email :
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0288D1' }}>
                    {createdSuccessUser.email}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#777', fontWeight: 600 }}>
                    Mot de passe initial :
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: '#D84315',
                        bgcolor: '#FBE9E7',
                        px: 1.2,
                        py: 0.4,
                        borderRadius: '2px',
                        letterSpacing: 1
                      }}
                    >
                      {createdSuccessUser.plainPassword || createdSuccessUser.password}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#777', fontWeight: 600 }}>
                    Rôle Système :
                  </Typography>
                  <Chip
                    size="small"
                    label={createdSuccessUser.role === 'ADMIN' ? 'ADMINISTRATEUR GÉNÉRAL' : 'COLLABORATEUR'}
                    sx={{
                      bgcolor: createdSuccessUser.role === 'ADMIN' ? '#EDE7F6' : '#E3F2FD',
                      color: createdSuccessUser.role === 'ADMIN' ? '#512DA8' : '#1565C0',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      borderRadius: '2px'
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            <BsbButton
              fullWidth
              color={copiedSuccessCredentials ? 'teal' : 'primary'}
              startIcon={<ContentCopyIcon />}
              onClick={() => handleCopyCredentials(createdSuccessUser)}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              {copiedSuccessCredentials ? '✓ Identifiants copiés dans le presse-papier !' : 'Copier les identifiants pour le collaborateur'}
            </BsbButton>
          </Box>
        )}
      </BsbModal>

      {/* Snackbar Global pour les notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '2px', fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

