import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// material-ui
import {
  Box,
  Stack,
  Typography,
  Alert,
  IconButton
} from '@mui/material';

// components
import { BsbButton, BsbTextField } from 'components/adminbsb';

// context
import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

// ==============================|| AUTH - LOGIN ||============================== //

export default function AuthLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { profiles } = useErpData();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const result = login(email.trim(), password, profiles);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Identifiants invalides.');
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors de la tentative de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2.5}>
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: '2px', fontWeight: 600 }}>
            {errorMessage}
          </Alert>
        )}

        <Box>
          <BsbTextField
            label="Adresse Email Professionnelle"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@hinovgroup.com"
            autoFocus
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#555', display: 'block', mb: 0.5 }}>
            MOT DE PASSE :
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <BsbTextField
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
              />
            </Box>
            <IconButton
              size="small"
              onClick={() => setShowPassword(!showPassword)}
              sx={{ color: '#666', border: '1px solid #ddd', borderRadius: '2px' }}
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Stack>
        </Box>

        <BsbButton
          type="submit"
          color="primary"
          size="lg"
          disabled={loading}
          startIcon={<LoginIcon />}
          sx={{ width: '100%', py: 1.2, fontWeight: 800, fontSize: '0.95rem' }}
        >
          {loading ? 'Connexion en cours...' : 'SE CONNECTER À L’ERP'}
        </BsbButton>
      </Stack>
    </Box>
  );
}
