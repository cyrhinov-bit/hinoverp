import React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAdminTheme } from 'context/ThemeCustomizationContext';

const COLOR_MAP = {
  red: { main: '#F44336', dark: '#d32f2f', text: '#ffffff' },
  pink: { main: '#E91E63', dark: '#c2185b', text: '#ffffff' },
  purple: { main: '#9C27B0', dark: '#7b1fa2', text: '#ffffff' },
  'deep-purple': { main: '#673AB7', dark: '#512da8', text: '#ffffff' },
  indigo: { main: '#3F51B5', dark: '#303f9f', text: '#ffffff' },
  blue: { main: '#2196F3', dark: '#1976d2', text: '#ffffff' },
  'light-blue': { main: '#03A9F4', dark: '#0288d1', text: '#ffffff' },
  cyan: { main: '#00BCD4', dark: '#0097a7', text: '#ffffff' },
  teal: { main: '#009688', dark: '#00796b', text: '#ffffff' },
  green: { main: '#4CAF50', dark: '#388e3c', text: '#ffffff' },
  'light-green': { main: '#8BC34A', dark: '#689f38', text: '#ffffff' },
  amber: { main: '#FFC107', dark: '#ffa000', text: '#333333' },
  orange: { main: '#FF9800', dark: '#f57c00', text: '#ffffff' },
  'deep-orange': { main: '#FF5722', dark: '#e64a19', text: '#ffffff' },
  'blue-grey': { main: '#607D8B', dark: '#455a64', text: '#ffffff' },
  black: { main: '#212121', dark: '#000000', text: '#ffffff' },
  white: { main: '#ffffff', dark: '#f0f0f0', text: '#333333' }
};

/**
 * AdminBSB Button Component
 * 
 * @param {string} [color='primary'] - 'red', 'cyan', 'green', 'orange', 'indigo', 'teal', 'blue-grey', etc.
 * @param {string} [size='md'] - 'xs', 'sm', 'md', 'lg'
 * @param {boolean} [circle=false] - If true, renders a circular action button
 * @param {string} [tooltip] - Optional tooltip for icon buttons
 */
export default function BsbButton({
  children,
  color = 'primary',
  size = 'md',
  circle = false,
  tooltip,
  sx = {},
  variant = 'contained',
  ...props
}) {
  const { currentSkin } = useAdminTheme();

  let resolvedColor = COLOR_MAP[color];
  if (!resolvedColor) {
    if (color === 'primary') {
      resolvedColor = {
        main: currentSkin?.hex || '#F44336',
        dark: currentSkin?.dark || '#d32f2f',
        text: '#ffffff'
      };
    } else {
      resolvedColor = COLOR_MAP.red;
    }
  }

  // Size styles
  let sizeStyles = {
    py: 0.9,
    px: 2.2,
    fontSize: '0.8125rem',
    fontWeight: 700
  };

  if (size === 'xs') {
    sizeStyles = {
      py: 0.3,
      px: 0.8,
      minWidth: 'auto',
      fontSize: '0.7rem',
      fontWeight: 700,
      lineHeight: 1.4
    };
  } else if (size === 'sm') {
    sizeStyles = {
      py: 0.5,
      px: 1.5,
      fontSize: '0.75rem',
      fontWeight: 700
    };
  } else if (size === 'lg') {
    sizeStyles = {
      py: 1.2,
      px: 3,
      fontSize: '0.925rem',
      fontWeight: 700
    };
  }

  if (circle) {
    const btn = (
      <IconButton
        sx={{
          bgcolor: resolvedColor.main,
          color: resolvedColor.text,
          width: size === 'xs' ? 28 : size === 'sm' ? 34 : size === 'lg' ? 48 : 40,
          height: size === 'xs' ? 28 : size === 'sm' ? 34 : size === 'lg' ? 48 : 40,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: resolvedColor.dark,
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transform: 'scale(1.05)'
          },
          ...sx
        }}
        {...props}
      >
        {children}
      </IconButton>
    );

    return tooltip ? <Tooltip title={tooltip} arrow>{btn}</Tooltip> : btn;
  }

  return (
    <Button
      variant={variant}
      sx={{
        bgcolor: variant === 'contained' ? resolvedColor.main : 'transparent',
        color: variant === 'contained' ? resolvedColor.text : resolvedColor.main,
        borderColor: variant === 'outlined' ? resolvedColor.main : 'transparent',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: '2px',
        boxShadow: variant === 'contained' ? '0 2px 5px rgba(0,0,0,0.16)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: variant === 'contained' ? resolvedColor.dark : 'rgba(0,0,0,0.04)',
          borderColor: variant === 'outlined' ? resolvedColor.dark : 'transparent',
          boxShadow: variant === 'contained' ? '0 4px 10px rgba(0,0,0,0.25)' : 'none',
          transform: 'translateY(-1px)'
        },
        '&:active': {
          transform: 'translateY(1px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        },
        ...sizeStyles,
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

