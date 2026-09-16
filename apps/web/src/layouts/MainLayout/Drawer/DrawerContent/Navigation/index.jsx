import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import menuItems from 'menu-items';
import NavGroup from './NavGroup';
import { useAuth } from 'context/AuthContext';
import { useErpData } from 'context/ErpDataContext';

export default function NavigationDrawer() {
  const { currentUser, isAdmin } = useAuth();
  const { hasModule } = useErpData();

  // Filtrer les éléments du menu selon les permissions de l'utilisateur connecté
  const filteredGroups = menuItems.items
    .map((group) => {
      // Si le groupe est réservé aux administrateurs
      if (group.adminOnly && !isAdmin) {
        return null;
      }

      // Si le groupe a des enfants (services ERP), filtrer chaque élément
      if (group.children) {
        const filteredChildren = group.children.filter((item) => {
          // Si l'élément a un moduleCode spécifique, vérifier l'autorisation par toggle
          if (item.moduleCode) {
            return typeof hasModule === 'function' ? hasModule(item.moduleCode) : true;
          }
          return true;
        });

        // Si le groupe n'a plus d'enfants autorisés, on ne l'affiche pas
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...group,
          children: filteredChildren
        };
      }

      return group;
    })
    .filter(Boolean);

  const navGroups = filteredGroups.map((item, index) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id || index} item={item} />;
      default:
        return (
          <Typography key={index} variant="h6" color="error" align="center">
            Navigation Group Erreur
          </Typography>
        );
    }
  });

  return <Box sx={{ transition: 'all 0.3s ease-in-out' }}>{navGroups}</Box>;
}
