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
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_ARTICLES;
    }
    const s = localStorage.getItem('hinov_articles');
    return s ? JSON.parse(s) : INITIAL_ARTICLES;
  });

  const [interventions, setInterventions] = useState(() => {
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_INTERVENTIONS;
    }
    const s = localStorage.getItem('hinov_interventions');
    return s ? JSON.parse(s) : INITIAL_INTERVENTIONS;
  });

  const [mouvements, setMouvements] = useState(() => {
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_MOUVEMENTS;
    }
    const s = localStorage.getItem('hinov_mouvements');
    return s ? JSON.parse(s) : INITIAL_MOUVEMENTS;
  });

  const [prestations, setPrestations] = useState(() => {
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_PRESTATIONS;
    }
    const s = localStorage.getItem('hinov_prestations');
    return s ? JSON.parse(s) : INITIAL_PRESTATIONS;
  });

  const [clientsFournisseurs, setClientsFournisseurs] = useState(() => {
    if (localStorage.getItem('hinov_prod_admin_v2') !== 'true') {
      return INITIAL_CLIENTS_FOURNISSEURS;
    }
    const s = localStorage.getItem('hinov_clients');
    return s ? JSON.parse(s) : INITIAL_CLIENTS_FOURNISSEURS;
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
  const setUserModulesForUser = (userId, enabledModuleCodes = [], isRoleAdmin = false) => {
    setUserModules((prev) => {
      const otherLinks = prev.filter((um) => um.user_id !== userId);
      const newLinks = modules.map((mod, idx) => ({
        id: `um-${Date.now()}-${idx}`,
        user_id: userId,
        module_id: mod.id,
        is_enabled: isRoleAdmin ? true : enabledModuleCodes.includes(mod.code_module) || mod.code_module === 'CAISSE_DEPENSES',
        updated_at: new Date().toISOString()
      }));
      const updated = [...otherLinks, ...newLinks];
      localStorage.setItem('hinov_user_modules', JSON.stringify(updated));
      return updated;
    });
  };

  // ==========================================
  // Gestion des Utilisateurs / Profils (Admin)
  // ==========================================
  const addProfile = (newUserData, enabledModuleCodes = []) => {
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
      is_enabled: newUserData.role === 'ADMIN' ? true : enabledModuleCodes.includes(mod.code_module) || mod.code_module === 'CAISSE_DEPENSES'
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
      supabase.from('profiles').upsert([newProfile]).catch(err => console.warn('Supabase sync profile:', err));
    }

    return newProfile;
  };

  const updateProfile = (id, updates) => {
    setProfiles(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === id && updateCurrentUser) {
      updateCurrentUser(updates);
    }
  };

  const resetUserPassword = (id, newPassword) => {
    setProfiles(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, password: newPassword, updated_at: new Date().toISOString() } : p);
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
    if (currentUser?.id === id && updateCurrentUser) {
      updateCurrentUser({ password: newPassword });
    }
  };

  const deleteProfile = (id) => {
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
  };

  const toggleUserStatus = (id) => {
    setProfiles(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, actif: !p.actif } : p);
      localStorage.setItem('hinov_profiles', JSON.stringify(updated));
      return updated;
    });
  };

  // ==========================================
  // Gestion Clients & Fournisseurs (Tiers)
  // ==========================================
  const addClientFournisseur = (item) => {
    const newItem = {
      ...item,
      id: `tier-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setClientsFournisseurs(prev => [newItem, ...prev]);
  };

  const updateClientFournisseur = (id, updates) => {
    setClientsFournisseurs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteClientFournisseur = (id) => {
    setClientsFournisseurs(prev => prev.filter(t => t.id !== id));
  };

  const getClients = () => clientsFournisseurs.filter(t => t.type === 'CLIENT');
  const getFournisseurs = () => clientsFournisseurs.filter(t => t.type === 'FOURNISSEUR');
  const getPartenaires = () => clientsFournisseurs.filter(t => t.type === 'PARTENAIRE');

  // ==========================================
  // Gestion Agents Commerciaux
  // ==========================================
  const addAgentCommercial = (agent) => {
    const newAgent = {
      ...agent,
      id: `com-${Date.now()}`,
      matricule: agent.matricule || `COM-${String(agentsCommerciaux.length + 1).padStart(3, '0')}`,
      total_ventes: 0,
      total_commissions_dues: 0,
      total_commissions_payees: 0,
      contrats_clos_count: 0,
      actif: agent.actif !== undefined ? agent.actif : true,
      created_at: new Date().toISOString()
    };
    setAgentsCommerciaux(prev => [newAgent, ...prev]);
  };

  const updateAgentCommercial = (id, updates) => {
    setAgentsCommerciaux(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAgentCommercial = (id) => {
    setAgentsCommerciaux(prev => prev.filter(a => a.id !== id));
  };

  // ==========================================
  // Gestion des Commissions
  // ==========================================
  const addCommission = (comm) => {
    const newComm = {
      ...comm,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString()
    };
    setCommissions(prev => [newComm, ...prev]);
  };

  const updateCommission = (id, updates) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCommission = (id) => {
    setCommissions(prev => prev.filter(c => c.id !== id));
  };

  // Action : Régler une commission (Génère automatiquement une sortie de caisse)
  const payerCommission = (commissionId, modeReglement = 'ESPECES') => {
    const comm = commissions.find(c => c.id === commissionId);
    if (!comm) return;

    const mvtId = `mvt-${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Mettre à jour la commission
    updateCommission(commissionId, {
      statut: 'PAYEE',
      date_reglement: now,
      mode_reglement: modeReglement,
      mouvement_caisse_id: mvtId
    });

    // 2. Générer l'écriture de sortie de caisse
    const newMvt = {
      id: mvtId,
      type: 'SORTIE',
      montant: Number(comm.montant_commission) || 0,
      motif: `Règlement commission ${comm.type} - ${comm.prestation_ref} (${comm.beneficiaire_nom})`,
      categorie: 'COMMISSION',
      beneficiaire_emetteur: comm.beneficiaire_nom,
      tier_type: comm.type === 'APPORTEUR' ? 'PARTENAIRE' : 'AUTRE',
      mode_reglement: modeReglement,
      date: now,
      created_at: now
    };
    setMouvements(prev => [newMvt, ...prev]);
  };

  // ==========================================
  // Gestion Interventions de Maintenance
  // ==========================================
  const addIntervention = (item) => {
    const newItem = {
      ...item,
      id: `int-${Date.now()}`,
      created_at: new Date().toISOString(),
      date_intervention: item.date_intervention || new Date().toISOString()
    };
    setInterventions(prev => [newItem, ...prev]);
  };

  const updateIntervention = (id, updates) => {
    setInterventions(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteIntervention = (id) => {
    setInterventions(prev => prev.filter(item => item.id !== id));
  };

  // ==========================================
  // Gestion Articles / Stocks
  // ==========================================
  const addArticle = (art) => {
    const newArt = {
      ...art,
      id: `art-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setArticles(prev => [newArt, ...prev]);
  };

  const updateArticle = (id, updates) => {
    setArticles(prev => prev.map(art => art.id === id ? { ...art, ...updates } : art));
  };

  const deleteArticle = (id) => {
    setArticles(prev => prev.filter(art => art.id !== id));
  };

  // ==========================================
  // Gestion Mouvements de Caisse
  // ==========================================
  const addMouvement = (mvt) => {
    const newMvt = {
      ...mvt,
      id: `mvt-${Date.now()}`,
      created_at: new Date().toISOString(),
      date: mvt.date || new Date().toISOString()
    };
    setMouvements(prev => [newMvt, ...prev]);
  };

  const deleteMouvement = (id) => {
    setMouvements(prev => prev.filter(m => m.id !== id));
  };

  // ==========================================
  // Gestion Prestations, Commandes & 11 Colonnes Financières
  // ==========================================
  const addPrestation = (prest) => {
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

    const prestId = `prest-${Date.now()}`;
    const prestRef = prest.reference || `CMD-${new Date().getFullYear()}-${String(prestations.length + 1).padStart(3, '0')}`;
    const designation = prest.designation || prest.description || '';

    const newPrest = {
      ...prest,
      id: prestId,
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
        beneficiaire_id: prest.apporteur_id || undefined,
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
        beneficiaire_id: prest.commercial_id || undefined,
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
        beneficiaire_id: prest.responsable_service_id || undefined,
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
  };

  const updatePrestation = (id, updates) => {
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
        return merged;
      }
      return p;
    }));
  };

  const deletePrestation = (id) => {
    setPrestations(prev => prev.filter(p => p.id !== id));
    setCommissions(prev => prev.filter(c => c.prestation_id !== id));
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
