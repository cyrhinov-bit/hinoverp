// ==============================|| ADMINBSB OVERRIDES - CARD HEADER ||============================== //

export default function CardHeader(theme) {
  return {
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          borderBottom: '1px solid #f4f4f4'
        },
        title: {
          ...theme.typography.h6,
          fontWeight: 700,
          color: '#333333',
          textTransform: 'uppercase',
          letterSpacing: '0.02em'
        },
        subheader: {
          fontSize: '0.75rem',
          color: '#888888'
        }
      }
    }
  };
}
