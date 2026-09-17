import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_PROFILES, 
  INITIAL_MODULES, 
  INITIAL_USER_MODULES, 
  INITIAL_ARTICLES, 
  INITIAL_INTERVENTIONS, 
  INITIAL_MOUVEMENTS, 
  INITIAL_PRESTATIONS, 
  INITIAL_CLIENTS_FOURNISSEURS,
  INITIAL_AGENTS_COMMERCIAUX,
  INITIAL_COMMISSIONS,
  canAccessModule,
  applyToggleUserModule,
  getSupabaseClient,
  calculatePrestationLine
} from '@hinov/core';
import { useAuth } from 'context/AuthContext';

const defaultErpDataContext = {
  profiles: INITIAL_PROFILES,
  modules: INITIAL_MODULES,
  userModules: INITIAL_USER_MODULES,
  articles: INITIAL_ARTICLES,
  interventions: INITIAL_INTERVENTIONS,
  mouvements: INITIAL_MOUVEMENTS,
  prestations: INITIAL_PRESTATIONS,
  clientsFournisseurs: INITIAL_CLIENTS_FOURNISSEURS,
  agentsCommerciaux: INITIAL_AGENTS_COMMERCIAUX,
  commissions: INITIAL_COMMISSIONS,
  hasModule: () => true,
  toggleUserModule: () => {},
  addProfile: () => {},
  updateProfile: () => {},
  resetUserPassword: () => {},
  deleteProfile: () => {},
  toggleUserStatus: () => {},
  addClientFournisseur: () => {},
  updateClientFournisseur: () => {},
  deleteClientFournisseur: () => {},
  getClients: () => [],
  getFournisseurs: () => [],
  getPartenaires: () => [],
  addAgentCommercial: () => {},
  updateAgentCommercial: () => {},
  deleteAgentCommercial: () => {},
  addCommission: () => {},
  updateCommission: () => {},
  deleteCommission: () => {},
  payerCommission: () => {},
  addIntervention: () => {},
  updateIntervention: () => {},
  deleteIntervention: () => {},
  addArticle: () => {},
  updateArticle: () => {},
  deleteArticle: () => {},
  addMouvement: () => {},
  deleteMouvement: () => {},
  addPrestation: () => {},
  updatePrestation: () => {},
  deletePrestation: () => {},
  resetAllData: () => {}
};

const ErpDataContext = createContext(defaultErpDataContext);

export function ErpDataProvider({ children }) {
  const { currentUser, updateCurrentUser } = useAuth();

  // Initialisation propre pour la production
  const [profiles, setProfiles] = useState(() => {
    try {
      const s = localStorage.getItem('hinov_profiles');
      if (s) {
        const parsed = JSON.parse(s);
        const map = new Map();
        parsed.forEach((p) => {
          if (p && p.email) map.set(p.email.trim().toLowerCase(), p);
        });
        INITIAL_PROFILES.forEach((initP) => {
          const key = initP.email.trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, initP);
          } else {
            const existing = map.get(key);
            map.set(key, { ...initP, ...existing, actif: existing.actif !== false });
          }
        });
        const merged = Array.from(map.values());
        localStorage.setItem('hinov_profiles', JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('Erreur initialisation profiles:', e);
    }
    return INITIAL_PROFILES;
  });

  const [modules, setModules] = useState(() => {
    const s = localStorage.getItem('hinov_modules');
    return s ? JSON.parse(s) : INITIAL_MODULES;
  });

  const [userModules, setUserModules] = useState(() => {
    try {
      const v = localStorage.getItem('hinov_permissions_v3');
      if (v !== 'true') {
        localStorage.setItem('hinov_permissions_v3', 'true');
        localStorage.setItem('hinov_user_modules', JSON.stringify(INITIAL_USER_MODULES));
        return INITIAL_USER_MODULES;
      }
      const s = localStorage.getItem('hinov_user_modules');
      if (s) {
        const parsed = JSON.parse(s);
        const map = new Map();
        parsed.forEach((um) => {
          if (um) map.set(`${um.user_id}_${um.module_id}`, um);
        });
        INITIAL_USER_MODULES.forEach((initUm) => {
          const key = `${initUm.user_id}_${initUm.module_id}`;
          if (!map.has(key)) {
            map.set(key, initUm);
          }
        });
        const merged = Array.from(map.values());
        localStorage.setItem('hinov_user_modules', JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('Erreur initialisation user_modules:', e);
    }
    return INITIAL_USER_MODULES;
  });

  const [articles, setArticles] = useState(() => {
    try {
      const s = localStorage.getItem('hinov_articles');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erreur lecture articles localStorage:', e);
    }
    return INITIAL_ARTICLES;
  });

  const [interventions, setInterventions] = useState(() => {
    try {
      const s = localStorage.getItem('hinov_interventions');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erreur lecture interventions localStorage:', e);
    }
    return INITIAL_INTERVENTIONS;
  });

  const [mouvements, setMouvements] = useState(() => {
    const s = localStorage.getItem('hinov_mouvements');
    return s ? JSON.parse(s) : INITIAL_MOUVEMENTS;
  });

  const [prestations, setPrestations] = useState(() => {
    const s = localStorage.getItem('hinov_prestations');
    return s ? JSON.parse(s) : INITIAL_PRESTATIONS;
  });

  const [clientsFournisseurs, setClientsFournisseurs] = useState(() => {
    try {
      const s = localStorage.getItem('hinov_clients');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erreur lecture clients localStorage:', e);
    }
    return INITIAL_CLIENTS_FOURNISSEURS;
  });

  const [agentsCommerciaux, setAgentsCommerciaux] = useState(() => {
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_AGENTS_COMMERCIAUX;
    }
    const s = localStorage.getItem('hinov_commerciaux');
    return s ? JSON.parse(s) : INITIAL_AGENTS_COMMERCIAUX;
  });

  const [commissions, setCommissions] = useState(() => {
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_COMMISSIONS;
    }
    const s = localStorage.getItem('hinov_commissions');
    return s ? JSON.parse(s) : INITIAL_COMMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem('hinov_prod_admin_v2', 'true');
  }, []);

  // Synchronisation descendante au chargement si Supabase est configuré
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isMounted = true;
    async function hydrateFromSupabase() {
      try {
        const [
          profRes,
          modRes,
          umRes,
          tiersRes,
          comRes,
          artRes,
          intRes,
          mvtRes,
          prestRes,
          commRes
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('modules').select('*'),
          supabase.from('user_modules').select('*'),
          supabase.from('clients_fournisseurs').select('*'),
          supabase.from('agents_commerciaux').select('*'),
          supabase.from('catalogue_articles').select('*'),
          supabase.from('interventions_maintenance').select('*'),
          supabase.from('mouvements_caisse').select('*'),
          supabase.from('prestations_commandes').select('*'),
          supabase.from('commissions').select('*')
        ]);

        if (!isMounted) return;

        if (profRes.data && profRes.data.length > 0) {
          setProfiles((prev) => {
            const map = new Map();
            profRes.data.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }

        if (modRes.data && modRes.data.length > 0) {
          setModules(modRes.data);
        }

        if (umRes.data && umRes.data.length > 0) {
          setUserModules((prev) => {
            const map = new Map();
            umRes.data.forEach((um) => map.set(`${um.user_id}_${um.module_id}`, um));
            prev.forEach((um) => {
              const key = `${um.user_id}_${um.module_id}`;
              if (!map.has(key)) map.set(key, um);
            });
            return Array.from(map.values());
          });
        }

        if (tiersRes.data && tiersRes.data.length > 0) {
          setClientsFournisseurs((prev) => {
            const map = new Map();
            tiersRes.data.forEach((t) => map.set(t.id, t));
            prev.forEach((t) => {
              if (!map.has(t.id)) map.set(t.id, t);
            });
            return Array.from(map.values());
          });
        }

        if (comRes.data && comRes.data.length > 0) {
          setAgentsCommerciaux((prev) => {
            const map = new Map();
            comRes.data.forEach((c) => map.set(c.id, c));
            prev.forEach((c) => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            return Array.from(map.values());
          });
        }

        if (artRes.data && artRes.data.length > 0) {
          setArticles((prev) => {
            const map = new Map();
            artRes.data.forEach((a) => map.set(a.id, a));
            prev.forEach((a) => {
              if (!map.has(a.id)) map.set(a.id, a);
            });
            return Array.from(map.values());
          });
        }

        if (intRes.data && intRes.data.length > 0) {
          setInterventions((prev) => {
            const map = new Map();
            intRes.data.forEach((i) => map.set(i.id, i));
            prev.forEach((i) => {
              if (!map.has(i.id)) map.set(i.id, i);
            });
            return Array.from(map.values());
          });
        }

        if (mvtRes.data && mvtRes.data.length > 0) {
          setMouvements((prev) => {
            const map = new Map();
            mvtRes.data.forEach((m) => map.set(m.id, m));
            prev.forEach((m) => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            return Array.from(map.values());
          });
        }

        if (prestRes.data && prestRes.data.length > 0) {
          setPrestations((prev) => {
            const map = new Map();
            prestRes.data.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }

        if (commRes.data && commRes.data.length > 0) {
          setCommissions((prev) => {
            const map = new Map();
            commRes.data.forEach((c) => map.set(c.id, c));
            prev.forEach((c) => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Supabase hydration error:', err);
      }
    }

    hydrateFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem('hinov_profiles', JSON.stringify(profiles));
    localStorage.setItem('hinov_modules', JSON.stringify(modules));
    localStorage.setItem('hinov_user_modules', JSON.stringify(userModules));
    localStorage.setItem('hinov_articles', JSON.stringify(articles));
    localStorage.setItem('hinov_interventions', JSON.stringify(interventions));
    localStorage.setItem('hinov_mouvements', JSON.stringify(mouvements));
    localStorage.setItem('hinov_prestations', JSON.stringify(prestations));
    localStorage.setItem('hinov_clients', JSON.stringify(clientsFournisseurs));
    localStorage.setItem('hinov_commerciaux', JSON.stringify(agentsCommerciaux));
    localStorage.setItem('hinov_commissions', JSON.stringify(commissions));
  }, [profiles, modules, userModules, articles, interventions, mouvements, prestations, clientsFournisseurs, agentsCommerciaux, commissions]);

  // Hook / Fonction de vérification d'accès à un module pour l'utilisateur connecté
  const hasModule = (moduleCode) => {
    return canAccessModule(currentUser, moduleCode, userModules, modules);
  };

  // Toggle de permission pour l'administrateur
  const toggleUserModule = async (userId, moduleId, isEnabled) => {
    setUserModules((prev) => {
      const updated = applyToggleUserModule(prev, userId, moduleId, isEnabled, modules);
      localStorage.setItem('hinov_user_modules', JSON.stringify(updated));
      return updated;
    });

    // Si Supabase est connecté, mettre à jour la table user_modules
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('user_modules')
          .upsert({ user_id: userId, module_id: moduleId, is_enabled: isEnabled }, { onConflict: 'user_id,module_id' });
      } catch (err) {
        console.warn('Supabase toggle sync failed:', err);
      }
    }
  };

  // Mise à jour globale des modules d'un utilisateur (utilisé lors de l'édition d'un utilisateur)
  const setUserModulesForUser = async (userId, enabledModuleCodes = [], isRoleAdmin = false) => {
    const newLinks = modules.map((mod, idx) => ({
      id: `um-${Date.now()}-${idx}`,
      user_id: userId,
      module_id: mod.id,
      is_enabled: isRoleAdmin ? true : enabledModuleCodes.includes(mod.code_module),
      updated_at: new Date().toISOString()
    }));

    setUserModules((prev) => {
      const otherLinks = prev.filter((um) => um.user_id !== userId);
      const updated = [...otherLinks, ...newLinks];
      localStorage.setItem('hinov_user_modules', JSON.stringify(updated));
      return updated;
    });

    // Synchronisation Supabase de l'ensemble des modules de l'utilisateur
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('user_modules')
          .upsert(
            newLinks.map(l => ({ user_id: l.user_id, module_id: l.module_id, is_enabled: l.is_enabled })),
            { onConflict: 'user_id,module_id' }
          );
      } catch (err) {
        console.warn('Supabase batch user_modules sync failed:', err);
      }
    }
  };

  // ==========================================
  // Gestion des Utilisateurs / Profils (Admin)
  // ==========================================
  const addProfile = async (newUserData, enabledModuleCodes = []) => {
    const newUserId = `usr-${Date.now()}`;
    const cleanEmail = (newUserData.email || '').trim().toLowerCase();
    const newProfile = {
      ...newUserData,
      id: newUserId,
      email: cleanEmail,
      password: newUserData.password || 'Hinov@123',
      role: newUserData.role || 'USER',
      actif: newUserData.actif !== undefined ? newUserData.actif : true,
      avatar_url: newUserData.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString()
    };

    // Création des liaisons user_modules
    const newUserModulesLinks = modules.map((mod, idx) => ({
      id: `um-${Date.now()}-${idx}`,
      user_id: newUserId,
      module_id: mod.id,
      is_enabled: newUserData.role === 'ADMIN' ? true : enabledModuleCodes.includes(mod.code_module),
      updated_at: new Date().toISOString()
    }));

    setProfiles(prev => {
      const updated = [newProfile, ...prev.filter(p => (p.email || '').toLowerCase() !== cleanEmail)];
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    setUserModules(prev => {
      const updated = [...prev, ...newUserModulesLinks];
      localStorage.setItem('hinov_user_modules', JSON.stringify(updated));
      return updated;
    });

    // Synchronisation Supabase si connecté
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').upsert([newProfile]);
        await supabase.from('user_modules').upsert(
          newUserModulesLinks.map(l => ({ user_id: l.user_id, module_id: l.module_id, is_enabled: l.is_enabled })),
          { onConflict: 'user_id,module_id' }
        );
      } catch (err) {
        console.warn('Supabase sync profile & user_modules:', err);
      }
    }

    return newProfile;
  };

  const updateProfile = async (id, updates) => {
    setProfiles(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === id && updateCurrentUser) {
      updateCurrentUser(updates);
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update profile:', err);
      }
    }
  };

  const resetUserPassword = async (id, newPassword) => {
    setProfiles(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, password: newPassword, updated_at: new Date().toISOString() } : p);
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === id && updateCurrentUser) {
      updateCurrentUser({ password: newPassword });
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').update({ password: newPassword }).eq('id', id);
      } catch (err) {
        console.warn('Supabase reset password:', err);
      }
    }
  };

  const deleteProfile = async (id) => {
    setProfiles(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    setUserModules(prev => {
      const updated = prev.filter(um => um.user_id !== id);
      localStorage.setItem('hinov_user_modules', JSON.stringify(updated));
      return updated;
    });
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('user_modules').delete().eq('user_id', id);
        await supabase.from('profiles').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete profile:', err);
      }
    }
  };

  const toggleUserStatus = async (id) => {
    let nextActif = true;
    setProfiles(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          nextActif = !p.actif;
          return { ...p, actif: nextActif };
        }
        return p;
      });
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').update({ actif: nextActif }).eq('id', id);
      } catch (err) {
        console.warn('Supabase toggle status:', err);
      }
    }
  };

  // ==========================================
  // Gestion Clients & Fournisseurs (Tiers)
  // ==========================================
  const addClientFournisseur = async (item) => {
    const newItem = {
      ...item,
      id: item.id || `tier-${Date.now()}`,
      cree_par: item.cree_par || currentUser?.id || 'usr-admin-1',
      cree_par_nom: item.cree_par_nom || currentUser?.nom || currentUser?.email || 'Utilisateur',
      created_at: item.created_at || new Date().toISOString()
    };
    setClientsFournisseurs(prev => [newItem, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('clients_fournisseurs').upsert([newItem]);
      } catch (err) {
        console.warn('Supabase add tier:', err);
      }
    }
  };

  const updateClientFournisseur = async (id, updates) => {
    setClientsFournisseurs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('clients_fournisseurs').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update tier:', err);
      }
    }
  };

  const deleteClientFournisseur = async (id) => {
    setClientsFournisseurs(prev => prev.filter(t => t.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('clients_fournisseurs').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete tier:', err);
      }
    }
  };

  const getClients = () => {
    const list = currentUser?.role === 'ADMIN' ? clientsFournisseurs : clientsFournisseurs.filter(t => t.cree_par === currentUser?.id);
    return list.filter(t => t.type === 'CLIENT');
  };
  const getFournisseurs = () => {
    const list = currentUser?.role === 'ADMIN' ? clientsFournisseurs : clientsFournisseurs.filter(t => t.cree_par === currentUser?.id);
    return list.filter(t => t.type === 'FOURNISSEUR');
  };
  const getPartenaires = () => {
    const list = currentUser?.role === 'ADMIN' ? clientsFournisseurs : clientsFournisseurs.filter(t => t.cree_par === currentUser?.id);
    return list.filter(t => t.type === 'PARTENAIRE');
  };

  // ==========================================
  // Gestion Agents Commerciaux
  // ==========================================
  const addAgentCommercial = async (agent) => {
    const newAgent = {
      ...agent,
      id: agent.id || `com-${Date.now()}`,
      matricule: agent.matricule || `COM-${String(agentsCommerciaux.length + 1).padStart(3, '0')}`,
      total_ventes: Number(agent.total_ventes) || 0,
      total_commissions_dues: Number(agent.total_commissions_dues) || 0,
      total_commissions_payees: Number(agent.total_commissions_payees) || 0,
      contrats_clos_count: Number(agent.contrats_clos_count) || 0,
      actif: agent.actif !== undefined ? agent.actif : true,
      created_at: new Date().toISOString()
    };
    setAgentsCommerciaux(prev => [newAgent, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('agents_commerciaux').upsert([newAgent]);
      } catch (err) {
        console.warn('Supabase add commercial:', err);
      }
    }
  };

  const updateAgentCommercial = async (id, updates) => {
    setAgentsCommerciaux(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('agents_commerciaux').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update commercial:', err);
      }
    }
  };

  const deleteAgentCommercial = async (id) => {
    setAgentsCommerciaux(prev => prev.filter(a => a.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('agents_commerciaux').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete commercial:', err);
      }
    }
  };

  // ==========================================
  // Gestion des Commissions
  // ==========================================
  const addCommission = async (comm) => {
    const newComm = {
      ...comm,
      id: comm.id || `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString()
    };
    setCommissions(prev => [newComm, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('commissions').upsert([newComm]);
      } catch (err) {
        console.warn('Supabase add commission:', err);
      }
    }
  };

  const updateCommission = async (id, updates) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('commissions').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update commission:', err);
      }
    }
  };

  const deleteCommission = async (id) => {
    setCommissions(prev => prev.filter(c => c.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('commissions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete commission:', err);
      }
    }
  };

  // Action : Régler une commission (Génère automatiquement une sortie de caisse)
  const payerCommission = async (commissionId, modeReglement = 'ESPECES') => {
    const comm = commissions.find(c => c.id === commissionId);
    if (!comm) return;

    const mvtId = `mvt-${Date.now()}`;
    const now = new Date().toISOString();

    const commUpdates = {
      statut: 'PAYEE',
      date_reglement: now,
      mode_reglement: modeReglement,
      mouvement_caisse_id: mvtId
    };

    // 1. Mettre à jour la commission
    updateCommission(commissionId, commUpdates);

    // 2. Générer l'écriture de sortie de caisse
    const newMvt = {
      id: mvtId,
      type: 'SORTIE',
      montant: Number(comm.montant_commission) || 0,
      motif: `Règlement commission ${comm.type} - ${comm.prestation_ref} (${comm.beneficiaire_nom})`,
      categorie: 'COMMISSION',
      module_code: 'COMMISSIONS',
      beneficiaire_emetteur: comm.beneficiaire_nom,
      tier_type: comm.type === 'APPORTEUR' ? 'PARTENAIRE' : 'AUTRE',
      mode_reglement: modeReglement,
      date: now,
      created_at: now
    };
    addMouvement(newMvt);
  };

  // ==========================================
  // Gestion Interventions de Maintenance
  // ==========================================
  const addIntervention = async (item) => {
    const newItem = {
      ...item,
      id: item.id || `int-${Date.now()}`,
      client_id: item.client_id && item.client_id.trim() !== '' ? item.client_id : null,
      client_nom: item.client_nom || null,
      quantite: Number(item.quantite) || 1,
      prix_unitaire: Number(item.prix_unitaire) || 0,
      prix: Number(item.prix) || 0,
      created_at: item.created_at || new Date().toISOString(),
      date_intervention: item.date_intervention || new Date().toISOString()
    };
    setInterventions(prev => [newItem, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('interventions_maintenance').upsert([newItem]);
        if (error) console.error('Supabase add intervention error:', error);
      } catch (err) {
        console.warn('Supabase add intervention:', err);
      }
    }
  };

  const updateIntervention = async (id, updates) => {
    const cleanUpdates = {
      ...updates,
      ...(updates.client_id !== undefined ? { client_id: updates.client_id && updates.client_id.trim() !== '' ? updates.client_id : null } : {}),
      ...(updates.quantite !== undefined ? { quantite: Number(updates.quantite) || 1 } : {}),
      ...(updates.prix_unitaire !== undefined ? { prix_unitaire: Number(updates.prix_unitaire) || 0 } : {}),
      ...(updates.prix !== undefined ? { prix: Number(updates.prix) || 0 } : {}),
      updated_at: new Date().toISOString()
    };
    setInterventions(prev => prev.map(item => item.id === id ? { ...item, ...cleanUpdates } : item));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('interventions_maintenance').update(cleanUpdates).eq('id', id);
        if (error) console.error('Supabase update intervention error:', error);
      } catch (err) {
        console.warn('Supabase update intervention:', err);
      }
    }
  };

  const deleteIntervention = async (id) => {
    setInterventions(prev => prev.filter(item => item.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('interventions_maintenance').delete().eq('id', id);
        if (error) console.error('Supabase delete intervention error:', error);
      } catch (err) {
        console.warn('Supabase delete intervention:', err);
      }
    }
  };

  // ==========================================
  // Gestion Articles / Stocks
  // ==========================================
  const addArticle = async (art) => {
    const cleanArt = {
      ...art,
      id: art.id || `art-${Date.now()}`,
      fournisseur_id: art.fournisseur_id && art.fournisseur_id.trim() !== '' ? art.fournisseur_id : null,
      fournisseur_nom: art.fournisseur_nom || null,
      code_article: art.code_article || null,
      designation: art.designation || 'Article sans nom',
      type_article: art.type_article || 'CONSOMMABLE',
      quantite_stock: Number(art.quantite_stock) || 0,
      cout_unitaire_achat: Number(art.cout_unitaire_achat) || 0,
      prix_unitaire_vente: Number(art.prix_unitaire_vente) || 0,
      seuil_alerte: Number(art.seuil_alerte) || 5,
      unite: art.unite || 'Pièce',
      created_at: art.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setArticles(prev => [cleanArt, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('catalogue_articles').upsert([cleanArt]);
        if (error) console.error('Supabase add article error:', error);
      } catch (err) {
        console.warn('Supabase add article:', err);
      }
    }
  };

  const updateArticle = async (id, updates) => {
    const cleanUpdates = {
      ...updates,
      ...(updates.fournisseur_id !== undefined ? { fournisseur_id: updates.fournisseur_id && updates.fournisseur_id.trim() !== '' ? updates.fournisseur_id : null } : {}),
      ...(updates.quantite_stock !== undefined ? { quantite_stock: Number(updates.quantite_stock) || 0 } : {}),
      ...(updates.cout_unitaire_achat !== undefined ? { cout_unitaire_achat: Number(updates.cout_unitaire_achat) || 0 } : {}),
      ...(updates.prix_unitaire_vente !== undefined ? { prix_unitaire_vente: Number(updates.prix_unitaire_vente) || 0 } : {}),
      ...(updates.seuil_alerte !== undefined ? { seuil_alerte: Number(updates.seuil_alerte) || 5 } : {}),
      updated_at: new Date().toISOString()
    };
    setArticles(prev => prev.map(art => art.id === id ? { ...art, ...cleanUpdates } : art));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('catalogue_articles').update(cleanUpdates).eq('id', id);
        if (error) console.error('Supabase update article error:', error);
      } catch (err) {
        console.warn('Supabase update article:', err);
      }
    }
  };

  const deleteArticle = async (id) => {
    setArticles(prev => prev.filter(art => art.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('catalogue_articles').delete().eq('id', id);
        if (error) console.error('Supabase delete article error:', error);
      } catch (err) {
        console.warn('Supabase delete article:', err);
      }
    }
  };

  // ==========================================
  // Gestion Mouvements de Caisse
  // ==========================================
  const addMouvement = async (mvt) => {
    const newMvt = {
      ...mvt,
      id: mvt.id || `mvt-${Date.now()}`,
      tier_id: mvt.tier_id && String(mvt.tier_id).trim() !== '' ? mvt.tier_id : null,
      prestation_id: mvt.prestation_id && String(mvt.prestation_id).trim() !== '' ? mvt.prestation_id : null,
      montant: Number(mvt.montant) || 0,
      created_at: new Date().toISOString(),
      date: mvt.date || new Date().toISOString()
    };
    setMouvements(prev => [newMvt, ...prev]);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('mouvements_caisse').upsert([newMvt]);
      } catch (err) {
        console.warn('Supabase add mouvement:', err);
      }
    }
  };

  const deleteMouvement = async (id) => {
    setMouvements(prev => prev.filter(m => m.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('mouvements_caisse').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete mouvement:', err);
      }
    }
  };

  // ==========================================
  // Gestion Prestations, Commandes & 11 Colonnes Financières
  // ==========================================
  const addPrestation = async (prest) => {
    const qte = Number(prest.quantite) > 0 ? Number(prest.quantite) : 1;
    const coutUnit = prest.cout_unitaire_achat !== undefined 
      ? Number(prest.cout_unitaire_achat) 
      : (Number(prest.cout_total_revient) ? Number(prest.cout_total_revient) / qte : 0);
    const prixUnit = prest.prix_unitaire_vente !== undefined
      ? Number(prest.prix_unitaire_vente)
      : (Number(prest.montant_total_vente) ? Number(prest.montant_total_vente) / qte : 0);
    const commAppTaux = prest.commission_apporteur_taux !== undefined ? Number(prest.commission_apporteur_taux) : 10;

    const calc = calculatePrestationLine(
      qte,
      coutUnit,
      prixUnit,
      prest.commission_apporteur_montant !== undefined && prest.commission_apporteur_montant !== '' ? Number(prest.commission_apporteur_montant) : null,
      Number(prest.commission_responsable_montant) || 0,
      Number(prest.commission_commercial_montant) || 0,
      commAppTaux
    );

    const prestId = prest.id || `prest-${Date.now()}`;
    const prestRef = prest.reference || `CMD-${new Date().getFullYear()}-${String(prestations.length + 1).padStart(3, '0')}`;
    const designation = prest.designation || prest.description || '';

    const newPrest = {
      ...prest,
      id: prestId,
      client_id: prest.client_id && String(prest.client_id).trim() !== '' ? prest.client_id : null,
      agent_commercial_id: prest.agent_commercial_id && String(prest.agent_commercial_id).trim() !== '' ? prest.agent_commercial_id : null,
      apporteur_id: prest.apporteur_id && String(prest.apporteur_id).trim() !== '' ? prest.apporteur_id : null,
      responsable_service_id: prest.responsable_service_id && String(prest.responsable_service_id).trim() !== '' ? prest.responsable_service_id : null,
      reference: prestRef,
      designation: designation,
      description: designation,
      quantite: calc.quantite,
      cout_unitaire_achat: calc.coutUnitaireAchat,
      cout_total_revient: calc.coutFinalAchat,
      prix_unitaire_vente: calc.prixUnitaireVente,
      montant_total_vente: calc.prixClientFinal,
      marge_interne: calc.margeInterne,
      marge_brute: calc.margeInterne,
      commission_apporteur_taux: commAppTaux,
      commission_apporteur_montant: calc.commissionApporteur,
      commission_responsable_montant: calc.commissionResponsable,
      commission_commercial_montant: calc.commissionCommercial,
      benefice_reel: calc.beneficeReel,
      marge_nette: calc.beneficeReel,
      created_at: new Date().toISOString(),
      date_commande: prest.date_commande || new Date().toISOString()
    };

    setPrestations(prev => [newPrest, ...prev]);

    // Génération automatique des fiches de commission (3 types de commissions)
    const generatedCommissions = [];

    // 1. Commission Apporteur d'affaires (10% auto)
    if (calc.commissionApporteur > 0) {
      generatedCommissions.push({
        id: `comm-${Date.now()}-app`,
        prestation_id: prestId,
        prestation_ref: prestRef,
        type: 'APPORTEUR',
        beneficiaire_id: (prest.apporteur_id && String(prest.apporteur_id).trim() !== '') ? prest.apporteur_id : null,
        beneficiaire_nom: prest.apporteur_nom || 'Apporteur d\'affaires',
        montant_prestation: calc.prixClientFinal,
        taux_pourcentage: commAppTaux,
        montant_commission: calc.commissionApporteur,
        statut: 'A_VALIDER',
        created_at: new Date().toISOString()
      });
    }

    // 2. Commission Agent Commercial
    if (calc.commissionCommercial > 0) {
      generatedCommissions.push({
        id: `comm-${Date.now()}-com`,
        prestation_id: prestId,
        prestation_ref: prestRef,
        type: 'AGENT_COMMERCIAL',
        beneficiaire_id: (prest.commercial_id && String(prest.commercial_id).trim() !== '') ? prest.commercial_id : null,
        beneficiaire_nom: prest.commercial_nom || 'Agent Commercial',
        montant_prestation: calc.prixClientFinal,
        montant_commission: calc.commissionCommercial,
        statut: 'A_PAYER',
        created_at: new Date().toISOString()
      });
    }

    // 3. Commission Responsable de Service
    if (calc.commissionResponsable > 0) {
      generatedCommissions.push({
        id: `comm-${Date.now()}-resp`,
        prestation_id: prestId,
        prestation_ref: prestRef,
        type: 'RESPONSABLE',
        beneficiaire_id: (prest.responsable_service_id && String(prest.responsable_service_id).trim() !== '') ? prest.responsable_service_id : null,
        beneficiaire_nom: prest.responsable_service_nom || 'Responsable de Service',
        montant_prestation: calc.prixClientFinal,
        montant_commission: calc.commissionResponsable,
        statut: 'A_PAYER',
        created_at: new Date().toISOString()
      });
    }

    if (generatedCommissions.length > 0) {
      setCommissions(prev => [...generatedCommissions, ...prev]);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('prestations_commandes').upsert([newPrest]);
        if (generatedCommissions.length > 0) {
          await supabase.from('commissions').upsert(generatedCommissions);
        }
      } catch (err) {
        console.warn('Supabase add prestation & commissions:', err);
      }
    }
  };

  const updatePrestation = async (id, updates) => {
    let updatedObj = null;
    setPrestations(prev => prev.map(p => {
      if (p.id === id) {
        const merged = { ...p, ...updates };
        const qte = Number(merged.quantite) > 0 ? Number(merged.quantite) : 1;
        const coutUnit = merged.cout_unitaire_achat !== undefined
          ? Number(merged.cout_unitaire_achat)
          : (Number(merged.cout_total_revient) / qte || 0);
        const prixUnit = merged.prix_unitaire_vente !== undefined
          ? Number(merged.prix_unitaire_vente)
          : (Number(merged.montant_total_vente) / qte || 0);
        const commAppTaux = merged.commission_apporteur_taux !== undefined ? Number(merged.commission_apporteur_taux) : 10;

        const calc = calculatePrestationLine(
          qte,
          coutUnit,
          prixUnit,
          merged.commission_apporteur_montant !== undefined ? Number(merged.commission_apporteur_montant) : null,
          Number(merged.commission_responsable_montant) || 0,
          Number(merged.commission_commercial_montant) || 0,
          commAppTaux
        );

        merged.quantite = calc.quantite;
        merged.cout_unitaire_achat = calc.coutUnitaireAchat;
        merged.cout_total_revient = calc.coutFinalAchat;
        merged.prix_unitaire_vente = calc.prixUnitaireVente;
        merged.montant_total_vente = calc.prixClientFinal;
        merged.marge_interne = calc.margeInterne;
        merged.marge_brute = calc.margeInterne;
        merged.commission_apporteur_montant = calc.commissionApporteur;
        merged.commission_responsable_montant = calc.commissionResponsable;
        merged.commission_commercial_montant = calc.commissionCommercial;
        merged.benefice_reel = calc.beneficeReel;
        merged.marge_nette = calc.beneficeReel;
        updatedObj = merged;
        return merged;
      }
      return p;
    }));

    const supabase = getSupabaseClient();
    if (supabase && updatedObj) {
      try {
        await supabase.from('prestations_commandes').update(updatedObj).eq('id', id);
      } catch (err) {
        console.warn('Supabase update prestation:', err);
      }
    }
  };

  const deletePrestation = async (id) => {
    setPrestations(prev => prev.filter(p => p.id !== id));
    setCommissions(prev => prev.filter(c => c.prestation_id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('commissions').delete().eq('prestation_id', id);
        await supabase.from('prestations_commandes').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete prestation:', err);
      }
    }
  };

  const resetAllData = () => {
    setProfiles(INITIAL_PROFILES);
    setModules(INITIAL_MODULES);
    setUserModules(INITIAL_USER_MODULES);
    setArticles([]);
    setInterventions([]);
    setMouvements([]);
    setPrestations([]);
    setClientsFournisseurs([]);
    setAgentsCommerciaux([]);
    setCommissions([]);
    localStorage.clear();
    localStorage.setItem('hinov_prod_admin_v2', 'true');
    localStorage.setItem('hinov_profiles', JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem('hinov_modules', JSON.stringify(INITIAL_MODULES));
    localStorage.setItem('hinov_user_modules', JSON.stringify(INITIAL_USER_MODULES));
    localStorage.setItem('hinov_current_user', JSON.stringify(INITIAL_PROFILES[0]));
    if (updateCurrentUser) {
      updateCurrentUser(INITIAL_PROFILES[0]);
    }
  };

  return (
    <ErpDataContext.Provider
      value={{
        profiles,
        modules,
        userModules,
        addProfile,
        updateProfile,
        resetUserPassword,
        deleteProfile,
        toggleUserStatus,
        articles,
        interventions,
        mouvements,
        prestations,
        clientsFournisseurs,
        agentsCommerciaux,
        commissions,
        hasModule,
        toggleUserModule,
        setUserModulesForUser,
        addClientFournisseur,
        updateClientFournisseur,
        deleteClientFournisseur,
        getClients,
        getFournisseurs,
        getPartenaires,
        addAgentCommercial,
        updateAgentCommercial,
        deleteAgentCommercial,
        addCommission,
        updateCommission,
        deleteCommission,
        payerCommission,
        addIntervention,
        updateIntervention,
        deleteIntervention,
        addArticle,
        updateArticle,
        deleteArticle,
        addMouvement,
        deleteMouvement,
        addPrestation,
        updatePrestation,
        deletePrestation,
        resetAllData
      }}
    >
      {children}
    </ErpDataContext.Provider>
  );
}

export function useErpData() {
  const context = useContext(ErpDataContext);
  if (!context) {
    return defaultErpDataContext;
  }
  return context;
}
