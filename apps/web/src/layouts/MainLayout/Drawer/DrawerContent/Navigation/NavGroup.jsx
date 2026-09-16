import PropTypes from 'prop-types';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavCollapse from './NavCollapse';
import NavItem from './NavItem';

// ==============================|| ADMINBSB NAV GROUP ||============================== //

export default function NavGroup({ item }) {
  const renderNavItem = (menuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return <NavCollapse key={menuItem.id} item={menuItem} level={1} />;
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  };

  return (
    <List
      component="div"
      disablePadding
      subheader={
        item.title ? (
          <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                color: '#999999',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block'
              }}
            >
              -- {item.title}
            </Typography>
          </Box>
        ) : null
      }
      sx={{ mb: 1 }}
    >
      {item.children?.map((menuItem) => renderNavItem(menuItem))}
    </List>
  );
}

NavGroup.propTypes = { item: PropTypes.any };
