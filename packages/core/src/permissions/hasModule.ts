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

