import { Profile, ModuleCode, UserModule, ERPModule } from '../types/database';

/**
 * Vérifie si un utilisateur a le droit d'accéder à un module spécifique
 * Règle : Un ADMIN a toujours accès à tous les modules.
 * Un utilisateur USER a accès si et seulement si is_enabled === true pour ce module.
 */
export function canAccessModule(
  user: Profile | null | undefined,
  moduleCode: ModuleCode | string,
  userModules: UserModule[] = [],
  allModules: ERPModule[] = []
): boolean {
  if (!user) return false;

  // 1. Les administrateurs ont un accès universel complet
  if (user.role === 'ADMIN') {
    return true;
  }

  // 2. Trouver l'ID du module correspondant au code
  const targetModule = allModules.find(m => m.code_module === moduleCode || m.id === moduleCode);
  const moduleId = targetModule ? targetModule.id : moduleCode;
  const canonicalCode = targetModule ? targetModule.code_module : moduleCode;

  // 3. Vérifier dans la table de liaison user_modules
  const userModuleLink = userModules.find(
    um => um.user_id === user.id && (
      um.module_id === moduleId || 
      um.module_id === canonicalCode ||
      (targetModule && (um.module_id === targetModule.id || um.module_id === targetModule.code_module))
    )
  );

  return !!userModuleLink?.is_enabled;
}

/**
 * Filtre la liste complète des modules ERP pour ne retourner que ceux autorisés pour l'utilisateur
 */
export function getAuthorizedModules(
  user: Profile | null | undefined,
  allModules: ERPModule[],
  userModules: UserModule[]
): ERPModule[] {
  if (!user) return [];
  if (user.role === 'ADMIN') return allModules;

  return allModules.filter(module => {
    const link = userModules.find(
      um => um.user_id === user.id && (um.module_id === module.id || um.module_id === module.code_module)
    );
    return !!link?.is_enabled;
  });
}

/**
 * Vérifie si un utilisateur a accès à un tiers (client/fournisseur/partenaire)
 * Règles :
 * 1. L'administrateur a une vue universelle sur tous les tiers de l'entreprise.
 * 2. Un utilisateur standard a accès aux tiers :
 *    - Qu'il a créés (par ID, email ou nom)
 *    - Qui sont des tiers historiques/partagés (sans créateur exclusif assigné)
 */
export function canAccessTier(
  user: { id?: string; email?: string; nom?: string; role?: string } | null | undefined,
  tier: { id?: string; cree_par?: string; cree_par_nom?: string } | null | undefined
): boolean {
  if (!tier) return false;
  if (!user) return true;
  if (user.role === 'ADMIN') return true;

  // Créé par l'utilisateur (par ID ou email)
  if (tier.cree_par) {
    if (tier.cree_par === user.id) return true;
    if (user.email && tier.cree_par.toLowerCase() === user.email.toLowerCase()) return true;
    if (tier.cree_par === 'all' || tier.cree_par === 'PUBLIC') return true;
  }

  // Créé par l'utilisateur (par nom de créateur)
  if (tier.cree_par_nom && user.nom) {
    if (tier.cree_par_nom.trim().toLowerCase() === user.nom.trim().toLowerCase()) return true;
  }

  // Tiers existants/historiques sans créateur exclusif tiers
  if (!tier.cree_par && !tier.cree_par_nom) {
    return true;
  }

  return false;
}

/**
 * Filtre la liste des tiers (clients/fournisseurs) pour un utilisateur
 */
export function filterTiersForUser<T extends { id?: string; cree_par?: string; cree_par_nom?: string }>(
  tiers: T[] = [],
  user: { id?: string; email?: string; nom?: string; role?: string } | null | undefined
): T[] {
  if (!user || user.role === 'ADMIN') return tiers;
  return tiers.filter(t => canAccessTier(user, t));
}


