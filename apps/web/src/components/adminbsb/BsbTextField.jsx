import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAdminTheme } from 'context/ThemeCustomizationContext';

/**
 * AdminBSB Material Design Floating Input Field (.form-group.form-float .form-line)
 * 
 * @param {string} label - Input label that floats
 * @param {string|number} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} [type='text'] - Input type (text, number, date, email, etc.)
 * @param {string} [placeholder] - Placeholder text
 * @param {boolean} [required=false] - If required
 * @param {boolean} [disabled=false] - If disabled
 * @param {string} [error] - Error message
 * @param {string} [helperText] - Helper text
 * @param {React.ReactNode} [startAdornment] - Left icon or prefix
 * @param {React.ReactNode} [endAdornment] - Right icon or suffix
 * @param {number} [rows] - If multiline
 * @param {boolean} [multiline=false] - If true, renders a textarea
 */
export default function BsbTextField({
  label,
  value = '',
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  error,
  helperText,
  startAdornment,
  endAdornment,
  rows,
  multiline = false,
  sx = {},
  inputProps = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const { currentSkin } = useAdminTheme();

  const isFilled = value !== '' && value !== null && value !== undefined;
  const isFloating = focused || isFilled || type === 'date' || type === 'time' || type === 'datetime-local' || Boolean(placeholder);

  const activeColor = error ? '#F44336' : currentSkin?.hex || '#F44336';

  return (
    <Box sx={{ mb: 2.5, width: '100%', position: 'relative', ...sx }}>
      <Box
        className={`form-group form-float ${focused ? 'focused' : ''} ${error ? 'error' : ''}`}
        sx={{
          position: 'relative',
          width: '100%'
        }}
      >
        <Box
          className="form-line"
          sx={{
            position: 'relative',
            width: '100%',
            borderBottom: error ? '1px solid #F44336' : '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            pt: label ? 2.2 : 1,
            pb: 0.6,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -1,
              left: 0,
              width: '100%',
              height: 2,
              bgcolor: activeColor,
              transform: focused ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          {startAdornment && (
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: focused ? activeColor : '#777' }}>
              {startAdornment}
            </Box>
          )}

          {multiline ? (
            <textarea
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={disabled}
              placeholder={focused ? placeholder : ''}
              rows={rows || 3}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: `'Roboto', 'Helvetica Neue', Arial, sans-serif`,
                fontSize: '0.9rem',
                color: disabled ? '#999' : '#333',
                resize: 'vertical',
                padding: '4px 0'
              }}
              {...inputProps}
              {...props}
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={disabled}
              placeholder={focused ? placeholder : ''}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: `'Roboto', 'Helvetica Neue', Arial, sans-serif`,
                fontSize: '0.9rem',
                color: disabled ? '#999' : '#333',
                padding: '4px 0',
                height: 26
              }}
              {...inputProps}
              {...props}
            />
          )}

          {endAdornment && (
            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', color: focused ? activeColor : '#777' }}>
              {endAdornment}
            </Box>
          )}
        </Box>

        {label && (
          <Typography
            component="label"
            sx={{
              position: 'absolute',
              left: startAdornment ? 28 : 0,
              top: isFloating ? -2 : 18,
              fontSize: isFloating ? '0.72rem' : '0.875rem',
              fontWeight: isFloating ? 700 : 400,
              color: error ? '#F44336' : focused ? activeColor : '#888888',
              pointerEvents: 'none',
              transition: 'all 0.2s ease-out',
              textTransform: isFloating ? 'uppercase' : 'none',
              letterSpacing: isFloating ? '0.04em' : 'normal'
            }}
          >
            {label} {required && <span style={{ color: '#F44336' }}>*</span>}
          </Typography>
        )}
      </Box>

      {(error || helperText) && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            fontSize: '0.72rem',
            color: error ? '#F44336' : '#777777',
            fontWeight: error ? 600 : 400
          }}
        >
          {error || helperText}
        </Typography>
      )}
    </Box>
  );
}

