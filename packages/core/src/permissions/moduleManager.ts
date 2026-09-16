import { Profile, ERPModule, UserModule, UserWithModules } from '../types/database';

/**
 * Construit la matrice complète Utilisateurs x Modules avec l'état de chaque Toggle
 */
export function buildUserModulesMatrix(
  profiles: Profile[],
  modules: ERPModule[],
  userModules: UserModule[]
): UserWithModules[] {
  return profiles.map(profile => {
    const userModList = modules.map(mod => {
      const link = userModules.find(
        um => um.user_id === profile.id && (um.module_id === mod.id || um.module_id === mod.code_module)
      );
      
      // Si l'utilisateur est admin, le toggle est actif par défaut
      const isEnabled = profile.role === 'ADMIN' ? true : !!link?.is_enabled;

      return {
        module_id: mod.id,
        code_module: mod.code_module,
        nom: mod.nom,
        is_enabled: isEnabled
      };
    });

    return {
      ...profile,
      modules: userModList
    };
  });
}

/**
 * Met à jour ou insère l'état d'un toggle utilisateur-module dans la liste locale
 */
export function applyToggleUserModule(
  userModules: UserModule[],
  userId: string,
  moduleId: string,
  isEnabled: boolean
): UserModule[] {
  const existingIndex = userModules.findIndex(
    um => um.user_id === userId && um.module_id === moduleId
  );

  if (existingIndex >= 0) {
    const updated = [...userModules];
    updated[existingIndex] = {
      ...updated[existingIndex],
      is_enabled: isEnabled,
      updated_at: new Date().toISOString()
    };
    return updated;
  }

  // Créer une nouvelle liaison
  const newLink: UserModule = {
    id: `um-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    user_id: userId,
    module_id: moduleId,
    is_enabled: isEnabled,
    updated_at: new Date().toISOString()
  };

  return [...userModules, newLink];
}

