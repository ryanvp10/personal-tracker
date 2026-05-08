// Brutalist Theme Configuration
// Black #000000 bg, white #FFFFFF text, 6px solid white borders, no shadows, no rounded corners

const theme = {
  colors: {
    background: '#000000',
    text: '#FFFFFF',
    textMuted: '#888888',
    border: '#FFFFFF',
    accent: '#FFFFFF',
    income: '#FFFFFF',
    outgoing: '#FFFFFF',
    danger: '#FFFFFF',
    success: '#FFFFFF',
    cardBg: '#000000',
    inputBg: '#000000',
    hover: '#FFFFFF',
    hoverText: '#000000',
  },
  borders: {
    width: '6px',
    style: 'solid',
    color: '#FFFFFF',
  },
  typography: {
    fontFamily: "'Courier New', Courier, monospace",
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    sizes: {
      xs: '0.7rem',
      sm: '0.85rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2.5rem',
      xxl: '4rem',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: '0px',
  boxShadow: 'none',
  transition: 'none',
};

export default theme;
