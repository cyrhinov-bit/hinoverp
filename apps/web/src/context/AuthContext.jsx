import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PROFILES, getSupabaseClient } from '@hinov/core';

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

  const login = async (email, password, profilesList = []) => {
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

    const rawInput = (email || '').trim().toLowerCase();
    let cleanEmail = rawInput;
    if (cleanEmail && !cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@hinovgroup.com`;
    }
    const cleanPassword = (password || '').trim();

    // 1. Recherche par email exact ou normalisé
    let user = uniqueProfilesMap.get(cleanEmail) || uniqueProfilesMap.get(rawInput);

    // 2. Recherche par préfixe d'email ou correspondance de nom
    if (!user) {
      user = Array.from(uniqueProfilesMap.values()).find((p) => {
        if (!p) return false;
        const pEmail = (p.email || '').toLowerCase();
        const pNom = (p.nom || '').toLowerCase();
        const userPrefix = cleanEmail.split('@')[0];
        return (
          pEmail === cleanEmail ||
          pEmail === rawInput ||
          pEmail.split('@')[0] === userPrefix ||
          pNom.includes(userPrefix)
        );
      });
    }

    // 3. Si non trouvé localement, interroger Supabase en direct
    if (!user) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.ilike.${cleanEmail},email.ilike.${rawInput}`)
            .maybeSingle();

          if (data && !error) {
            user = data;
            const updated = [data, ...savedProfiles.filter((p) => p.id !== data.id)];
            localStorage.setItem('hinov_profiles', JSON.stringify(updated));
          }
        } catch (supErr) {
          console.warn('Supabase direct profile query failed:', supErr);
        }
      }
    }

    if (!user) {
      return { success: false, error: 'Adresse email introuvable.' };
    }

    if (user.actif === false) {
      return { success: false, error: 'Ce compte utilisateur est désactivé.' };
    }

    const userPwd = (user.password || '').trim();

    // Tolérance sur les mots de passe par défaut configurés
    const isPasswordValid =
      userPwd === cleanPassword ||
      (!user.password && (cleanPassword === '123654' || cleanPassword === 'Hinov@123' || cleanPassword === '04041992'));

    if (!isPasswordValid) {
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

