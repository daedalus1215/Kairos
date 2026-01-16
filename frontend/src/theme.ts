import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00F5FF',
      light: '#66F9FF',
      dark: '#00C4CC',
    },
    secondary: {
      main: '#FF00FF',
      light: '#FF66FF',
      dark: '#CC00CC',
    },
    warning: {
      main: '#FFD700',
    },
    background: {
      default: '#0a0a1a',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.5)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 245, 255, 0.5)',
          '&:hover': {
            borderColor: '#00F5FF',
            backgroundColor: 'rgba(0, 245, 255, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 245, 255, 0.2)',
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 245, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 245, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00F5FF',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
