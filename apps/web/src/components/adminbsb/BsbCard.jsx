import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

/**
 * AdminBSB Material Design Card Component (.card)
 * 
 * @param {string} [title] - Header title in uppercase
 * @param {string} [subtitle] - Header sub-caption (small text)
 * @param {React.ReactNode} [headerAction] - Right-aligned header actions / buttons / dropdown
 * @param {string} [headerBg] - Optional colored header (e.g. 'bg-red', '#F44336', etc.)
 * @param {React.ReactNode} children - Card body content
 * @param {object} [sx] - Additional MUI sx styling
 * @param {object} [bodySx] - Styling for the .body container
 */
export default function BsbCard({
  title,
  subtitle,
  headerAction,
  headerBg,
  children,
  sx = {},
  bodySx = {},
  ...props
}) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <Paper
      elevation={1}
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '3px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        mb: 3,
        ...sx
      }}
      {...props}
    >
      {hasHeader && (
        <Box
          sx={{
            p: '16px 20px',
            borderBottom: headerBg ? 'none' : '1px solid #f4f4f4',
            bgcolor: headerBg || 'transparent',
            color: headerBg ? '#ffffff' : '#333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Box>
            {title && (
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: headerBg ? '#ffffff' : '#333333',
                  lineHeight: 1.2
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: headerBg ? 'rgba(255,255,255,0.85)' : '#888888',
                  fontSize: '0.75rem',
                  mt: 0.25
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {headerAction && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {headerAction}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ p: 2.5, ...bodySx }}>
        {children}
      </Box>
    </Paper>
  );
}

