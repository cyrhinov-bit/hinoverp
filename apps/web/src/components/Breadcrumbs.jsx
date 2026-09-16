import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

// project imports
import { APP_DEFAULT_PATH } from 'config';
import menuItems from 'menu-items';

const homeBreadcrumb = { title: 'Accueil', url: APP_DEFAULT_PATH, icon: HomeIcon };

// ==============================|| ADMINBSB BREADCRUMBS ||============================== //

export default function Breadcrumbs({ data, title, sx, ...rest }) {
  const location = useLocation();

  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const [activeItem, setActiveItem] = useState();

  useEffect(() => {
    if (data?.length) {
      dataHandler(data);
    } else {
      for (const menu of menuItems?.items ?? []) {
        if (menu.type && menu.type === 'group') {
          const matchedParents = findParentElements(menu.children || [], location.pathname);
          dataHandler(matchedParents || []);
          if (matchedParents) break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, location]);

  const dataHandler = (data) => {
    const filtered = data;
    const active = filtered.at(-1);
    const linkItems = filtered.slice(0, -1);
    if (active && active.url !== homeBreadcrumb.url) {
      const home = { ...homeBreadcrumb };
      linkItems.unshift(home);
    }
    setActiveItem(active);
    setBreadcrumbItems(linkItems);
  };

  function findParentElements(navItems, targetUrl, parents = []) {
    for (const item of navItems) {
      const newParents = [...parents, item];
      if (item.url && item.url === targetUrl) {
        return newParents;
      }
      if (item.children) {
        const result = findParentElements(item.children, targetUrl, newParents);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  if (!activeItem || activeItem.breadcrumbs === false) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: '#333333',
          textTransform: 'uppercase',
          letterSpacing: '0.03em'
        }}
      >
        {title || activeItem?.title}
      </Typography>

      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#999', fontSize: 16 }} />}
        aria-label="breadcrumb"
        sx={{ mt: 0.5 }}
        {...rest}
      >
        {breadcrumbItems.map((item, index) => (
          <Typography
            key={index}
            {...(item.url && { component: Link, to: item.url })}
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              color: '#777777',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              ...(item.url && { cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } })
            }}
          >
            {item.icon && <item.icon sx={{ fontSize: 14 }} />}
            {item.title}
          </Typography>
        ))}
        {activeItem && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              color: 'primary.main',
              fontWeight: 700
            }}
          >
            {activeItem.title}
          </Typography>
        )}
      </MuiBreadcrumbs>
    </Box>
  );
}

Breadcrumbs.propTypes = {
  data: PropTypes.array,
  title: PropTypes.string,
  sx: PropTypes.any
};
