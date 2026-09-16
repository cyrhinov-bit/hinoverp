import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import { handlerActiveItem, handlerDrawerOpen, useGetMenuMaster } from 'states/menu';

// assets
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ==============================|| ADMINBSB NAV ITEM ||============================== //

export default function NavItem({ item, level = 0 }) {
  const theme = useTheme();
  const { menuMaster } = useGetMenuMaster();
  const openItem = menuMaster.openedItem;

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();

  const isSelected = location.pathname === item.url || openItem === item.id;

  useEffect(() => {
    if (location.pathname === item.url) handlerActiveItem(item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const itemHandler = () => {
    if (downLG) handlerDrawerOpen(false);
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? <Icon sx={{ fontSize: 20 }} /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />;

  return (
    <ListItemButton
      id={`${item.id}-btn`}
      {...(item.url && { component: Link, to: item.url })}
      {...(item.target && { target: item.target })}
      selected={isSelected}
      disabled={item.disabled}
      onClick={itemHandler}
      sx={{
        color: isSelected ? theme.palette.primary.main : '#555555',
        mb: 0.5,
        borderRadius: '3px',
        px: 1.5,
        py: 1,
        borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
        bgcolor: isSelected ? '#f5f5f5' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: '#f0f0f0',
          color: theme.palette.primary.main,
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main
          }
        },
        '&.Mui-selected': {
          bgcolor: '#eeeeee',
          color: theme.palette.primary.main,
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main
          },
          '&:hover': {
            bgcolor: '#e8e8e8'
          }
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: 34, 
          color: isSelected ? theme.palette.primary.main : '#777777',
          transition: 'color 0.2s'
        }}
      >
        {itemIcon}
      </ListItemIcon>

      <ListItemText
        primary={
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: isSelected ? 700 : 500,
              fontSize: '0.85rem',
              color: 'inherit'
            }}
          >
            {item.title}
          </Typography>
        }
      />

      {item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={typeof item.chip.avatar === 'string' ? <Avatar>{item.chip.avatar}</Avatar> : item.chip.avatar}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
        />
      )}
    </ListItemButton>
  );
}

NavItem.propTypes = { item: PropTypes.any, level: PropTypes.number };
