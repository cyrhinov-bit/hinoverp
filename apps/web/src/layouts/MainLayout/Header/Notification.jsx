import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// material-ui
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';

// project imports
import MainCard from 'components/cards/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { useErpData } from 'context/ErpDataContext';
import { formatCurrency } from '@hinov/core';

// icons
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Récemment';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return 'Hier';
  return `Il y a ${diffDays} j`;
}

function NotificationItem({ title, time, message, type, icon, color }) {
  return (
    <ListItemButton sx={{ py: 1, px: 2 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: color, width: 36, height: 36, fontSize: '0.85rem' }}>
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
              {title}
            </Typography>
            <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
              <AccessTimeTwoToneIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {time}
              </Typography>
            </Stack>
          </Stack>
        }
        secondary={
          <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3 }}>
            {message}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default function Notification() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { prestations, mouvements, interventions } = useErpData();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? 'notification-popper' : undefined;

  // Récupérer les événements récents réels du système
  const realNotifications = useMemo(() => {
    const items = [];

    // Prestations récentes
    (prestations || []).slice(-3).reverse().forEach((p) => {
      items.push({
        id: `prest-${p.id}`,
        date: p.date || p.created_at,
        title: p.client_nom || 'Prestation',
        message: `Vente: ${formatCurrency(p.montant_total_vente || 0)} (${p.designation || 'Dossier'})`,
        type: 'PRESTATION',
        icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />,
        color: '#1976D2'
      });
    });

    // Mouvements de caisse récents
    (mouvements || []).slice(-3).reverse().forEach((m) => {
      const isEntree = m.type === 'ENTREE';
      items.push({
        id: `mvt-${m.id}`,
        date: m.date || m.created_at,
        title: isEntree ? 'Encaissement Caisse' : 'Dépense Caisse',
        message: `${isEntree ? '+' : '-'}${formatCurrency(m.montant || 0)} : ${m.motif || m.categorie}`,
        type: 'CAISSE',
        icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
        color: isEntree ? '#2E7D32' : '#D32F2F'
      });
    });

    // Interventions récentes
    (interventions || []).slice(-2).reverse().forEach((i) => {
      items.push({
        id: `int-${i.id}`,
        date: i.date_intervention || i.created_at,
        title: `Maintenance: ${i.client_nom || i.equipement}`,
        message: `${i.statut === 'TERMINEE' ? 'Clôturée' : 'En cours'} - ${i.technicien_assigne || 'Technicien'}`,
        type: 'MAINTENANCE',
        icon: <BuildIcon sx={{ fontSize: 18 }} />,
        color: '#009688'
      });
    });

    // Trier par date décroissante
    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 6);
  }, [prestations, mouvements, interventions]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <IconButton size="small" onClick={handleClick}>
          <Badge badgeContent={realNotifications.length > 0 ? realNotifications.length : null} color="error">
            <NotificationsNoneTwoToneIcon sx={{ fontSize: { sm: 24 }, color: 'background.paper' }} />
          </Badge>
        </IconButton>

        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
          disablePortal
          modifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={100}>
              <MainCard content={false} sx={{ width: 320, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    ACTIVITÉ & NOTIFICATIONS
                  </Typography>
                  <Chip label={`${realNotifications.length} récentes`} size="small" color="primary" sx={{ fontWeight: 700, height: 22 }} />
                </Box>
                <SimpleBar sx={{ maxHeight: 340 }}>
                  {realNotifications.length > 0 ? (
                    <List disablePadding>
                      {realNotifications.map((item) => (
                        <NotificationItem
                          key={item.id}
                          title={item.title}
                          time={formatRelativeTime(item.date)}
                          message={item.message}
                          type={item.type}
                          icon={item.icon}
                          color={item.color}
                        />
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 32, mb: 0.5 }} />
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Aucune nouvelle notification
                      </Typography>
                    </Box>
                  )}
                </SimpleBar>
              </MainCard>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

NotificationItem.propTypes = {
  title: PropTypes.string,
  time: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.string,
  icon: PropTypes.node,
  color: PropTypes.string
};
