import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PROFILES } from '@hinov/core';

const defaultAuthValue = {
  currentUser: null,
  isAuthenticated: false,
  switchUser: () => {},
  logout: () => {},
  loginAs: () => {},
  isAdmin: false
};

const AuthContext = createContext(defaultAuthValue);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hinov_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erreur parsing user', e);
    }
    return null; // Déconnecté par défaut si aucun compte enregistré en session
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hinov_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hinov_current_user');
    }
  }, [currentUser]);

  const login = (email, password, profilesList = []) => {
    let savedProfiles = [];
    try {
      const s = localStorage.getItem('hinov_profiles');
      if (s) savedProfiles = JSON.parse(s);
    } catch (e) {}

    const pool = [
      ...INITIAL_PROFILES,
      ...(Array.isArray(profilesList) ? profilesList : []),
      ...savedProfiles
    ];

    // Dédoublonnage par email
    const uniqueProfilesMap = new Map();
    pool.forEach((p) => {
      if (p && p.email) {
        uniqueProfilesMap.set(p.email.trim().toLowerCase(), p);
      }
    });

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const user = uniqueProfilesMap.get(cleanEmail);

    if (!user) {
      return { success: false, error: 'Adresse email introuvable.' };
    }

    if (user.actif === false) {
      return { success: false, error: 'Ce compte utilisateur est désactivé.' };
    }

    if (user.password && user.password !== cleanPassword) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }

    setCurrentUser(user);
    localStorage.setItem('hinov_current_user', JSON.stringify(user));
    return { success: true, user };
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('hinov_current_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hinov_current_user');
  };

  const loginAs = (userId, profilesList) => {
    const found = profilesList.find((p) => p.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('hinov_current_user', JSON.stringify(found));
    }
  };

  const updateCurrentUser = (updates) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('hinov_current_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        switchUser,
        updateCurrentUser,
        logout,
        loginAs,
        isAdmin: currentUser?.role === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
}

