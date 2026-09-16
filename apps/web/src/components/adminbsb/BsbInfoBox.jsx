import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';

const COLOR_MAP = {
  red: '#F44336',
  pink: '#E91E63',
  purple: '#9C27B0',
  'deep-purple': '#673AB7',
  indigo: '#3F51B5',
  blue: '#2196F3',
  'light-blue': '#03A9F4',
  cyan: '#00BCD4',
  teal: '#009688',
  green: '#4CAF50',
  'light-green': '#8BC34A',
  amber: '#FFC107',
  orange: '#FF9800',
  'deep-orange': '#FF5722',
  'blue-grey': '#607D8B',
  black: '#212121'
};

/**
 * AdminBSB Official Info-Box KPI Widget
 * 
 * @param {'classic'|'hover-expand'|'hover-zoom'|'progress'} [variant='classic']
 * @param {string} [color='red'] - 'red', 'pink', 'cyan', 'green', 'orange', 'indigo', 'purple', 'blue-grey', or hex
 * @param {React.ReactNode} icon - Icon component
 * @param {string} title - Uppercase title (e.g. "NEW ORDERS", "TOTAL SALES")
 * @param {string|number} number - Main metric number
 * @param {string} [subtitle] - Optional subtitle
 * @param {number} [progress] - Optional progress value (0-100) for variant='progress'
 * @param {Function} [onClick] - Click handler
 */
export default function BsbInfoBox({
  variant = 'classic',
  color = 'red',
  icon,
  title,
  number,
  subtitle,
  progress,
  onClick,
  sx = {}
}) {
  const resolvedBg = COLOR_MAP[color] || color;

  // Variant 2: Hover-Expand (Full Colored Background with Watermark Icon)
  if (variant === 'hover-expand') {
    return (
      <Paper
        elevation={1}
        onClick={onClick}
        sx={{
          bgcolor: resolvedBg,
          color: '#ffffff',
          borderRadius: '3px',
          p: 2.2,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 90,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            transform: onClick ? 'translateY(-3px)' : 'none',
            '& .bsb-watermark-icon': {
              transform: 'scale(1.15) rotate(-5deg)',
              opacity: 0.4
            }
          },
          ...sx
        }}
      >
        <Box sx={{ zIndex: 2, position: 'relative' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
              display: 'block'
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              my: 0.25,
              fontSize: '1.45rem',
              lineHeight: 1.2
            }}
          >
            {number}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          className="bsb-watermark-icon"
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 4,
            color: '#ffffff',
            opacity: 0.25,
            fontSize: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 1,
            pointerEvents: 'none',
            '& svg': { fontSize: 'inherit' }
          }}
        >
          {icon}
        </Box>
      </Paper>
    );
  }

  // Variant 1 (Classic) & Variant 3 (Hover-Zoom) & Variant 4 (Progress)
  const isZoom = variant === 'hover-zoom';

  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '3px',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.18)',
          transform: onClick ? 'translateY(-2px)' : 'none',
          ...(isZoom && {
            '& .bsb-icon-box svg': {
              transform: 'scale(1.25)',
              transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }
          })
        },
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', minHeight: 84 }}>
        {/* Square Icon Box */}
        <Box
          className="bsb-icon-box"
          sx={{
            width: 80,
            bgcolor: resolvedBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            '& svg': {
              fontSize: 34,
              transition: 'transform 0.3s ease'
            }
          }}
        >
          {icon}
        </Box>

        {/* Content */}
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
              mt: 0.3,
              fontSize: '1.25rem',
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
                mt: 0.3
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {variant === 'progress' && progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            bgcolor: 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': { bgcolor: resolvedBg }
          }}
        />
      )}
    </Paper>
  );
}

