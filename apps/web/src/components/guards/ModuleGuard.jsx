import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BsbCard, BsbButton } from 'components/adminbsb';
import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityIcon from '@mui/icons-material/Security';

/**
 * Route Guard pour protéger l'accès aux modules et pages d'administration.
 * 
 * @param {React.ReactNode} children - Composant de la vue à afficher si autorisé
 * @param {string} [moduleCode] - Code du module requis (ex: 'STOCKS', 'PRESTATIONS', etc.)
 * @param {boolean} [adminOnly=false] - Si la route est strictement réservée au rôle ADMIN
 */
export default function ModuleGuard({ children, moduleCode, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth();
  const { hasModule } = useErpData();
  const navigate = useNavigate();

  // 1. Redirection si non authentifié
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Vérification des accès réservés à l'Administrateur
  if (adminOnly && !isAdmin) {
    return (
      <Box sx={{ p: 3, maxWidth: 650, mx: 'auto', mt: 4 }}>
        <BsbCard
          title="ACCÈS RÉSERVÉ AUX ADMINISTRATEURS"
          subtitle="Section restreinte de configuration et sécurité"
          headerColor="red"
        >
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <LockOutlinedIcon sx={{ fontSize: 52, color: '#D32F2F', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              Autorisation Système Insuffisante
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3, lineHeight: 1.6 }}>
              Cette page est strictement réservée à l'<strong>Administrateur Général</strong> de Hinov ERP.
              <br />
              Votre compte actuel (<strong>{currentUser.nom}</strong>) possède le rôle <strong>{currentUser.role}</strong>.
            </Typography>
            <BsbButton
              color="primary"
              onClick={() => navigate('/dashboard/default')}
              startIcon={<SecurityIcon />}
              sx={{ px: 3, py: 1, fontWeight: 700 }}
            >
              Retourner au Tableau de Bord
            </BsbButton>
          </Box>
        </BsbCard>
      </Box>
    );
  }

  // 3. Vérification des habilitations par module
  if (moduleCode && !hasModule(moduleCode)) {
    return (
      <Box sx={{ p: 3, maxWidth: 650, mx: 'auto', mt: 4 }}>
        <BsbCard
          title="MODULE NON HABILITÉ"
          subtitle="Accès restreint par l'administration"
          headerColor="orange"
        >
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <LockOutlinedIcon sx={{ fontSize: 52, color: '#F57C00', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              Module Métier Non Accessible
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3, lineHeight: 1.6 }}>
              L'accès au module <strong>{moduleCode}</strong> n'est pas activé sur votre profil utilisateur (<strong>{currentUser.nom}</strong>).
              <br />
              Veuillez contacter votre administrateur pour activer ce service sur votre compte.
            </Typography>
            <BsbButton
              color="primary"
              onClick={() => navigate('/dashboard/default')}
              sx={{ px: 3, py: 1, fontWeight: 700 }}
            >
              Retourner au Tableau de Bord
            </BsbButton>
          </Box>
        </BsbCard>
      </Box>
    );
  }

  return children;
}
