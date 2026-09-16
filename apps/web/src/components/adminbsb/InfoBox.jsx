import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

/**
 * AdminBSB Material Design Info-Box Widget
 * 
 * @param {string} bg - Background color of the icon box (e.g. '#F44336', '#00BCD4', '#4CAF50', '#FF9800', '#3F51B5')
 * @param {React.ReactNode} icon - Icon component
 * @param {string} title - Uppercase title text (e.g. "VENTES TOTALES")
 * @param {string|number} number - Main numeric value or formatted string
 * @param {string} [subtitle] - Optional subtitle or change indicator
 * @param {boolean} [fullColored] - If true, paints the whole card in `bg` color
 * @param {Function} [onClick] - Optional click handler
 */
export default function InfoBox({
  bg = '#F44336',
  icon,
  title,
  number,
  subtitle,
  fullColored = false,
  onClick
}) {
  if (fullColored) {
    return (
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          bgcolor: bg,
          color: '#ffffff',
          borderRadius: '3px',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.25s ease-in-out',
          '&:hover': {
            transform: onClick ? 'translateY(-3px)' : 'none',
            boxShadow: '0 6px 15px rgba(0,0,0,0.25)'
          }
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              display: 'block'
            }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', my: 0.5 }}>
            {number}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 48
          }}
        >
          {icon}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: '3px',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        minHeight: 84,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s ease-in-out',
        '&:hover': {
          transform: onClick ? 'translateY(-2px)' : 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
        }
      }}
    >
      {/* Icon Square */}
      <Box
        sx={{
          width: 80,
          bgcolor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}
      >
        {React.isValidElement(icon) ? (
          React.cloneElement(icon, { sx: { fontSize: 36, color: '#ffffff' } })
        ) : (
          icon
        )}
      </Box>

      {/* Content Text */}
      <Box sx={{ p: 1.5, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#777777',
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#333333',
            mt: 0.25,
            lineHeight: 1.2
          }}
        >
          {number}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: '#999999',
              fontSize: '0.68rem',
              mt: 0.25
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

