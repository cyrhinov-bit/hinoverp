import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import { useAdminTheme } from 'context/ThemeCustomizationContext';

const COLOR_MAP = {
  red: '#F44336',
  pink: '#E91E63',
  purple: '#9C27B0',
  indigo: '#3F51B5',
  blue: '#2196F3',
  cyan: '#00BCD4',
  teal: '#009688',
  green: '#4CAF50',
  amber: '#FFC107',
  orange: '#FF9800',
  'deep-orange': '#FF5722',
  'blue-grey': '#607D8B'
};

/**
 * AdminBSB Material Design Modal Dialog Component
 * 
 * @param {boolean} open - Modal visibility
 * @param {Function} onClose - Close handler
 * @param {string} title - Modal title (uppercase)
 * @param {string} [subtitle] - Optional subtitle
 * @param {string} [headerColor='primary'] - 'primary', 'red', 'cyan', 'green', 'orange', 'indigo', etc.
 * @param {string} [maxWidth='sm'] - 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} [actions] - Modal footer action buttons
 */
export default function BsbModal({
  open,
  onClose,
  title,
  subtitle,
  headerColor = 'primary',
  maxWidth = 'sm',
  children,
  actions,
  ...props
}) {
  const { currentSkin } = useAdminTheme();

  const resolvedHeaderBg = headerColor === 'primary' 
    ? (currentSkin?.hex || '#F44336')
    : (COLOR_MAP[headerColor] || headerColor);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '3px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }
      }}
      {...props}
    >
      {/* AdminBSB Modal Header */}
      <DialogTitle
        sx={{
          bgcolor: resolvedHeaderBg,
          color: '#ffffff',
          p: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', display: 'block', mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#ffffff',
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* AdminBSB Modal Body */}
      <DialogContent sx={{ p: 3, pt: '24px !important' }}>
        {children}
      </DialogContent>

      {/* AdminBSB Modal Footer */}
      {actions && (
        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: '#fafafa',
            borderTop: '1px solid #eeeeee',
            gap: 1
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

