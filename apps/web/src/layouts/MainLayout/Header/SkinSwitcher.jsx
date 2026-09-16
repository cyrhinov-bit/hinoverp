import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import { useAdminTheme } from 'context/ThemeCustomizationContext';

export default function SkinSwitcher() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentSkin, setSkin, allSkins } = useAdminTheme();

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box>
        <Tooltip title="Personnaliser la couleur du thème" arrow>
          <IconButton
            onClick={handleToggle}
            sx={{
              color: '#ffffff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
            }}
          >
            <PaletteIcon />
          </IconButton>
        </Tooltip>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
          disablePortal
          sx={{ zIndex: 1300, pt: 1 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={6}
                sx={{
                  width: 300,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  bgcolor: '#ffffff'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', color: '#555' }}>
                  🎨 COULEUR DU THÈME
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1.2
                  }}
                >
                  {allSkins.map((skin) => {
                    const isSelected = currentSkin.id === skin.id;
                    return (
                      <Tooltip key={skin.id} title={skin.name} placement="top">
                        <Box
                          onClick={() => {
                            setSkin(skin.id);
                            setOpen(false);
                          }}
                          sx={{
                            height: 44,
                            borderRadius: 1.5,
                            bgcolor: skin.hex,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#ffffff',
                            boxShadow: isSelected ? '0 0 0 3px #333, 0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                            transform: isSelected ? 'scale(1.05)' : 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.08)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                            }
                          }}
                        >
                          {isSelected && <CheckIcon sx={{ fontSize: 20 }} />}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

