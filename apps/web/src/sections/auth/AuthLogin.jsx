import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// material-ui
import {
  Box,
  Stack,
  Typography,
  Alert,
  IconButton,
  FormControlLabel,
  Checkbox
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

  const [email, setEmail] = useState(() => {
    return localStorage.getItem('hinov_saved_email') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('hinov_saved_password') || '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('hinov_remember_me');
    return saved !== null ? saved === 'true' : true;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password, profiles);
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('hinov_remember_me', 'true');
          localStorage.setItem('hinov_saved_email', email.trim());
          localStorage.setItem('hinov_saved_password', password);
        } else {
          localStorage.setItem('hinov_remember_me', 'false');
          localStorage.removeItem('hinov_saved_email');
          localStorage.removeItem('hinov_saved_password');
        }
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
            autoFocus={!email}
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

        {/* Option : Se souvenir de moi */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: -0.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
                sx={{
                  color: '#9C27B0',
                  '&.Mui-checked': {
                    color: '#9C27B0'
                  }
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#444', fontSize: '0.85rem', userSelect: 'none' }}>
                Se souvenir de moi
              </Typography>
            }
          />
        </Stack>

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
