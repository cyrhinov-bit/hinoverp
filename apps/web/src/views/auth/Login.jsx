import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonAuthLayout from './CommonAuthLayout';
import AuthLogin from 'sections/auth/AuthLogin';
import { useAuth } from 'context/AuthContext';

// ==============================|| LOGIN ||============================== //

export default function Login() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <CommonAuthLayout
      title="ESPACE DE CONNEXION"
      subHeading="Saisissez vos identifiants pour accéder aux modules ERP"
    >
      <AuthLogin />
    </CommonAuthLayout>
  );
}
