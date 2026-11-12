'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

let theme = createTheme({
  // Theme customization goes here as usual, including tonalOffset and/or
  // contrastThreshold as the augmentColor() function relies on these
});

theme = createTheme(theme, {
  palette: {
    mode: 'light',
    primary: {
      main: '#4f9ff8',
      dark: '#4590e6',
      light: '#9ce1f8',
    },
    secondary: {
      main: '#FF6B9D',
    },
    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
      progress: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,      
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C9A',
    },
    divider: '#E8ECEF',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 4px 8px rgba(0, 0, 0, 0.06)',
    '0px 8px 16px rgba(0, 0, 0, 0.08)',
    '0px 12px 24px rgba(0, 0, 0, 0.1)',
    '0px 16px 32px rgba(0, 0, 0, 0.12)',
    '0px 20px 40px rgba(0, 0, 0, 0.14)',
    '0px 24px 48px rgba(0, 0, 0, 0.16)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
    '0px 2px 4px rgba(0, 0, 0, 0.04)',
  ],
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',          
        },        
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.getContrastText(theme.palette.primary.main),
        },        
      },
    },
    MuiCard: {
      styleOverrides: {
        borderRadius: 16,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${theme.palette.divider}`,        
      },
    },
    MuiDrawer: {
      styleOverrides: {
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,        
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
