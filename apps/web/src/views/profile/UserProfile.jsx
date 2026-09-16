import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Chip,
  CardActionArea
} from '@mui/material';

import {
  BsbCard,
  BsbButton,
  BsbTextField,
  BsbInfoBox
} from 'components/adminbsb';

import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AppsIcon from '@mui/icons-material/Apps';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Avatars de démonstration professionnels
const AVATAR_PRESETS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Profil 1' },
  { id: '2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Profil 2' },
  { id: '3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', label: 'Profil 3' },
  { id: '4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', label: 'Profil 4' },
  { id: '5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Profil 5' },
  { id: '6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', label: 'Profil 6' },
  { id: '7', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', label: 'Profil 7' },
  { id: '8', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', label: 'Profil 8' }
];

export default function UserProfile() {
  const { currentUser, isAdmin } = useAuth();
  const { updateProfile, resetUserPassword, modules, userModules } = useErpData();

  const fileInputRef = useRef(null);

  // États Informations Personnelles
  const [personalInfo, setPersonalInfo] = useState({
    nom: currentUser?.nom || '',
    poste: currentUser?.poste || '',
    email: currentUser?.email || '',
    telephone: currentUser?.telephone || '',
    avatar_url: currentUser?.avatar_url || ''
  });

  // États Mot de Passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États Notifications / Feedback
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Saisie URL custom
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Générateur de mot de passe sécurisé
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Hinov@${code}`;
  };

  // Upload d'image locale (Conversion en Base64)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop volumineuse (maximum 2 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPersonalInfo((prev) => ({ ...prev, avatar_url: base64String }));
        updateProfile(currentUser.id, { avatar_url: base64String });
        setProfileSuccessMsg('Photo de profil mise à jour avec succès !');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url) => {
    setPersonalInfo((prev) => ({ ...prev, avatar_url: url }));
    updateProfile(currentUser.id, { avatar_url: url });
    setProfileSuccessMsg('Photo de profil mise à jour avec succès !');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setPersonalInfo((prev) => ({ ...prev, avatar_url: customUrlInput.trim() }));
      updateProfile(currentUser.id, { avatar_url: customUrlInput.trim() });
      setCustomUrlInput('');
      setProfileSuccessMsg('Photo de profil mise à jour avec succès !');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const handleRemoveAvatar = () => {
    setPersonalInfo((prev) => ({ ...prev, avatar_url: '' }));
    updateProfile(currentUser.id, { avatar_url: '' });
    setProfileSuccessMsg('Photo de profil supprimée.');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    if (!personalInfo.nom || !personalInfo.email) return;

    updateProfile(currentUser.id, {
      nom: personalInfo.nom,
      poste: personalInfo.poste,
      email: personalInfo.email,
      telephone: personalInfo.telephone
    });

    setProfileSuccessMsg('Vos informations personnelles ont été enregistrées.');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!passwordForm.newPassword) {
      setPasswordErrorMsg('Veuillez saisir un nouveau mot de passe.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    resetUserPassword(currentUser.id, passwordForm.newPassword.trim());
    setPasswordSuccessMsg('Votre mot de passe a été modifié avec succès !');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  // Liste des modules autorisés pour l'utilisateur
  const myModules = modules.filter((m) => {
    if (isAdmin) return true;
    const link = userModules.find((um) => um.user_id === currentUser?.id && um.module_id === m.id);
    return link?.is_enabled || m.code_module === 'CAISSE_DEPENSES';
  });

  return (
    <Box sx={{ pb: 4 }}>
      {/* Bannière Profil Utilisateur */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          bgcolor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderLeft: '5px solid #0288D1'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 'auto' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={personalInfo.avatar_url || currentUser?.avatar_url}
                alt={currentUser?.nom}
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: isAdmin ? '#f59e0b' : '#0288D1',
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  border: '3px solid #f0f0f0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}
              >
                {currentUser?.nom ? currentUser.nom.charAt(0) : 'U'}
              </Avatar>
              <Tooltip title="Changer la photo de profil">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: '#0288D1',
                    color: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    '&:hover': { bgcolor: '#01579B' }
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: true }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a202c' }}>
                {personalInfo.nom || currentUser?.nom}
              </Typography>
              <Chip
                label={isAdmin ? '👑 ADMINISTRATEUR GÉNÉRAL' : '👤 ' + (currentUser?.role || 'UTILISATEUR')}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  bgcolor: isAdmin ? '#FEF3C7' : '#E0F2FE',
                  color: isAdmin ? '#92400E' : '#0369A1'
                }}
              />
              <Chip
                label="COMPTE ACTIF"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: '#E8F5E9',
                  color: '#2E7D32'
                }}
              />
            </Stack>

            <Typography variant="body2" sx={{ color: '#555', mt: 0.5, fontWeight: 500 }}>
              {personalInfo.poste || (isAdmin ? 'Direction & Administration' : 'Collaborateur')}
            </Typography>

            <Stack direction="row" spacing={2.5} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={0.7} alignItems="center">
                <EmailIcon sx={{ fontSize: 16, color: '#0288D1' }} />
                <Typography variant="caption" sx={{ color: '#444', fontWeight: 600 }}>
                  {personalInfo.email || currentUser?.email}
                </Typography>
              </Stack>
              {personalInfo.telephone && (
                <Stack direction="row" spacing={0.7} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                  <Typography variant="caption" sx={{ color: '#444', fontWeight: 600 }}>
                    {personalInfo.telephone}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.7} alignItems="center">
                <AppsIcon sx={{ fontSize: 16, color: '#7B1FA2' }} />
                <Typography variant="caption" sx={{ color: '#444', fontWeight: 600 }}>
                  {isAdmin ? 'Tous les modules (Accès Total)' : `${myModules.length} module(s) actif(s)`}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Input de fichier caché pour l'upload d'image */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {profileSuccessMsg && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '2px', fontWeight: 600 }}>
          {profileSuccessMsg}
        </Alert>
      )}

      {/* Cartes d'actions et de gestion de profil */}
      <Grid container spacing={3}>
        {/* Colonne Gauche: Gestion Photo de Profil */}
        <Grid size={{ xs: 12, md: 5 }}>
          <BsbCard
            title="PHOTO DE PROFIL & AVATAR"
            subtitle="Personnalisez votre photo ou choisissez un avatar professionnel"
            headerColor="teal"
          >
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Avatar
                  src={personalInfo.avatar_url || currentUser?.avatar_url}
                  sx={{
                    width: 110,
                    height: 110,
                    mx: 'auto',
                    mb: 1.5,
                    bgcolor: '#0288D1',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    border: '3px solid #E0E0E0',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  {currentUser?.nom ? currentUser.nom.charAt(0) : 'U'}
                </Avatar>

                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                  <BsbButton
                    size="sm"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Téléverser une photo
                  </BsbButton>
                  {(personalInfo.avatar_url || currentUser?.avatar_url) && (
                    <BsbButton
                      size="sm"
                      color="secondary"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={handleRemoveAvatar}
                    >
                      Supprimer
                    </BsbButton>
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
                  Formats acceptés : JPG, PNG, WEBP. Max 2 Mo.
                </Typography>
              </Box>

              <Divider />

              {/* Galerie d'avatars suggérés */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                  OU CHOISISSEZ UN AVATAR PRÉDÉFINI :
                </Typography>
                <Grid container spacing={1}>
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = personalInfo.avatar_url === preset.url;
                    return (
                      <Grid size={{ xs: 3 }} key={preset.id}>
                        <CardActionArea
                          onClick={() => handleSelectPreset(preset.url)}
                          sx={{
                            p: 0.5,
                            borderRadius: '4px',
                            border: isSelected ? '2px solid #009688' : '1px solid #e0e0e0',
                            bgcolor: isSelected ? '#E0F2F1' : 'transparent',
                            textAlign: 'center'
                          }}
                        >
                          <Avatar
                            src={preset.url}
                            alt={preset.label}
                            sx={{ width: 44, height: 44, mx: 'auto' }}
                          />
                        </CardActionArea>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              <Divider />

              {/* Saisie d'une URL d'image */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', display: 'block', mb: 0.8 }}>
                  UTILISER UNE URL D'IMAGE EXTERNE :
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <BsbTextField
                      placeholder="https://exemple.com/photo.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                    />
                  </Box>
                  <BsbButton
                    size="sm"
                    color="teal"
                    onClick={handleApplyCustomUrl}
                    disabled={!customUrlInput.trim()}
                  >
                    Appliquer
                  </BsbButton>
                </Stack>
              </Box>
            </Stack>
          </BsbCard>
        </Grid>

        {/* Colonne Droite: Informations Personnelles & Changement de Mot de Passe */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            {/* Carte Informations Personnelles */}
            <BsbCard
              title="INFORMATIONS PERSONNELLES"
              subtitle="Mettez à jour vos coordonnées et informations de contact"
              headerColor="blue"
            >
              <form onSubmit={handleSavePersonalInfo}>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <BsbTextField
                        label="Nom & Prénom(s)"
                        required
                        value={personalInfo.nom}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, nom: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <BsbTextField
                        label="Poste / Fonction"
                        value={personalInfo.poste}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, poste: e.target.value })}
                        placeholder="Ex: Responsable Commercial"
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <BsbTextField
                        label="Adresse Email"
                        type="email"
                        required
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <BsbTextField
                        label="Numéro de Téléphone"
                        value={personalInfo.telephone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, telephone: e.target.value })}
                        placeholder="+225 07 00 00 00 00"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                    <BsbButton
                      type="submit"
                      color="primary"
                      startIcon={<SaveIcon />}
                    >
                      Enregistrer les informations
                    </BsbButton>
                  </Box>
                </Stack>
              </form>
            </BsbCard>

            {/* Carte Sécurité & Changement de Mot de Passe */}
            <BsbCard
              title="SÉCURITÉ & CHANGEMENT DE MOT DE PASSE"
              subtitle="Modifiez votre mot de passe d'accès à la plateforme"
              headerColor="orange"
            >
              <form onSubmit={handleSavePassword}>
                <Stack spacing={2}>
                  {passwordErrorMsg && (
                    <Alert severity="error" sx={{ borderRadius: '2px', fontWeight: 600 }}>
                      {passwordErrorMsg}
                    </Alert>
                  )}
                  {passwordSuccessMsg && (
                    <Alert severity="success" sx={{ borderRadius: '2px', fontWeight: 600 }}>
                      {passwordSuccessMsg}
                    </Alert>
                  )}

                  <Box sx={{ p: 1.5, bgcolor: '#FFF8E1', borderRadius: '2px', border: '1px solid #FFE082' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#B78103' }}>
                        Nouveau Mot de Passe :
                      </Typography>
                      <BsbButton
                        size="xs"
                        color="teal"
                        startIcon={<AutoAwesomeIcon sx={{ fontSize: 13 }} />}
                        onClick={() => {
                          const generated = generateRandomPassword();
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: generated,
                            confirmPassword: generated
                          });
                          setShowNewPassword(true);
                          setShowConfirmPassword(true);
                        }}
                      >
                        Générer aléatoire
                      </BsbButton>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <BsbTextField
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Minimum 6 caractères"
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ color: '#666', border: '1px solid #ddd', borderRadius: '2px' }}
                      >
                        {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#444', display: 'block', mb: 0.5 }}>
                      Confirmer le Nouveau Mot de Passe :
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <BsbTextField
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Retapez le nouveau mot de passe"
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        sx={{ color: '#666', border: '1px solid #ddd', borderRadius: '2px' }}
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                    <BsbButton
                      type="submit"
                      color="orange"
                      startIcon={<VpnKeyIcon />}
                    >
                      Mettre à jour mon mot de passe
                    </BsbButton>
                  </Box>
                </Stack>
              </form>
            </BsbCard>

            {/* Carte Modules & Habilitations Actives */}
            <BsbCard
              title="MES HABILITATIONS & MODULES ERP"
              subtitle="Aperçu des modules auxquels vous avez accès"
              headerColor="light-green"
            >
              <Box sx={{ pt: 0.5 }}>
                <Stack spacing={1}>
                  {myModules.map((m) => (
                    <Box
                      key={m.id || m.code_module}
                      sx={{
                        p: 1.2,
                        bgcolor: '#F1F8E9',
                        border: '1px solid #DCEDC8',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CheckCircleOutlineIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.85rem' }}>
                            {m.nom}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#555' }}>
                            {m.description}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label="Actif"
                        size="small"
                        sx={{ bgcolor: '#C8E6C9', color: '#1B5E20', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </BsbCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

