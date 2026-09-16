// ==============================|| ADMINBSB MATERIAL DESIGN - PALETTE ||============================== //
import { DEFAULT_SKIN } from './skins';

export default function palette(mode = 'light', skin = DEFAULT_SKIN) {
  const primaryMain = skin?.hex || DEFAULT_SKIN.hex;
  const primaryDark = skin?.dark || DEFAULT_SKIN.dark;
  const primaryLight = skin?.light || DEFAULT_SKIN.light;

  const lightPalette = {
    common: {
      black: '#212121',
      white: '#ffffff'
    },
    primary: {
      lighter: primaryLight,
      light: primaryLight,
      main: primaryMain,
      dark: primaryDark,
      darker: primaryDark,
      contrastText: '#ffffff'
    },
    secondary: {
      lighter: '#e0f7fa',
      light: '#4dd0e1',
      main: '#00bcd4', // Cyan Material
      dark: '#0097a7',
      darker: '#006064',
      contrastText: '#ffffff'
    },
    error: {
      lighter: '#ffebee',
      light: '#ef5350',
      main: '#f44336', // Red Material
      dark: '#d32f2f',
      darker: '#b71c1c',
      contrastText: '#ffffff'
    },
    warning: {
      lighter: '#fff8e1',
      light: '#ffb74d',
      main: '#ff9800', // Orange Material
      dark: '#f57c00',
      darker: '#e65100',
      contrastText: '#ffffff'
    },
    info: {
      lighter: '#e1f5fe',
      light: '#29b6f6',
      main: '#03a9f4', // Light Blue Material
      dark: '#0288d1',
      darker: '#01579b',
      contrastText: '#ffffff'
    },
    success: {
      lighter: '#e8f5e9',
      light: '#81c784',
      main: '#4caf50', // Green Material
      dark: '#388e3c',
      darker: '#1b5e20',
      contrastText: '#ffffff'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    bg: {
      100: '#f4f6f9'
    },
    text: {
      primary: '#333333',
      secondary: '#777777',
      dark: '#111111'
    },
    divider: '#e9e9e9',
    background: {
      paper: '#ffffff',
      default: '#e9e9e9' // Fond caractéristique AdminBSB
    },
    menu: {
      hover: '#f5f5f5',
      selected: primaryLight
    }
  };

  return {
    mode,
    ...lightPalette
  };
}
