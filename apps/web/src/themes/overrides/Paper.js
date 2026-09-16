// ==============================|| ADMINBSB OVERRIDES - PAPER ||============================== //

export default function Paper(theme) {
  return {
    MuiPaper: {
      styleOverrides: {
        root: { 
          backgroundImage: 'none' 
        },
        elevation1: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)'
        },
        rounded: {
          borderRadius: 2
        }
      }
    }
  };
}
