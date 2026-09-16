import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// project imports
import palette from './palette';
import componentsOverride from './overrides';
import typography from './typography';
import { ThemeCustomizationProvider, useAdminTheme } from '../context/ThemeCustomizationContext';

// ==============================|| THEME CUSTOMIZATION INNER ||============================== //

function ThemeCustomizationInner({ children }) {
  const { currentSkin } = useAdminTheme();

  const theme = useMemo(() => {
    const themePalette = palette('light', currentSkin);
    const themeDefault = createTheme({
      palette: themePalette,
      shape: {
        borderRadius: 2 // Material Design sharp-rounded corners (2-3px)
      },
      typography: typography()
    });

    themeDefault.components = componentsOverride(themeDefault);
    return themeDefault;
  }, [currentSkin]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

ThemeCustomizationInner.propTypes = { children: PropTypes.any };

// ==============================|| THEME CUSTOMIZATION MAIN WRAPPER ||============================== //

export default function ThemeCustomization({ children }) {
  return (
    <ThemeCustomizationProvider>
      <ThemeCustomizationInner>{children}</ThemeCustomizationInner>
    </ThemeCustomizationProvider>
  );
}

ThemeCustomization.propTypes = { children: PropTypes.any };
