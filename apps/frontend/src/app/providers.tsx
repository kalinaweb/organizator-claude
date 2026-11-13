'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ThemeProvider, createTheme, type Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const THEME_STORAGE_KEY = 'todo-app-theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'light',
  toggleTheme: () => {},
});

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') return stored;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

const BASE_PRIMARY = {
  main: '#4f9ff8',
  dark: '#4590e6',
  light: '#54cbf3',
  background: {
    backlists: 'url(/background-lists.svg)',
  },
};

const BASE_SECONDARY = {
  main: '#FF6B9D',
};

const LIGHT_COLORS = {
  background: {
    default: '#F7F8FA',
    paper: '#FFFFFF',
    backlists: 'url(/background-lists.svg)',
  },
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C9A',
  },
  divider: '#E8ECEF',
};

const DARK_COLORS = {
  background: {
    default: 'rgb(26, 32, 53)',
    paper: 'rgb(32, 41, 64)',
    system: 'rgb(31, 40, 62)',
  },
  text: {
    primary: '#E6EDF3',
    secondary: '#8B949E',
  },
  divider: '#30363D',
};

function buildTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const base = createTheme({
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      h4: { fontWeight: 600, fontSize: '1.75rem', letterSpacing: '-0.02em' },
      h5: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, fontSize: '1.125rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
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
    ],
  });

  return createTheme(base, {
    palette: {
      mode,
      primary: { main: BASE_PRIMARY.main, dark: BASE_PRIMARY.dark, light: BASE_PRIMARY.light },
      secondary: BASE_SECONDARY,
      background: {
        ...colors.background,
        progress: `linear-gradient(90deg, ${BASE_PRIMARY.light} 0%, ${BASE_PRIMARY.dark} 100%)`,
      },
      text: colors.text,
      divider: colors.divider,
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: { borderRadius: 8, padding: '8px 16px' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' },
            background: `linear-gradient(135deg, ${BASE_PRIMARY.light} 0%, ${BASE_PRIMARY.main} 100%)`,
            color: base.palette.getContrastText(BASE_PRIMARY.main),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          borderRadius: 16,
          boxShadow: isDark ? '0px 4px 12px rgba(0, 0, 0, 0.3)' : '0px 4px 12px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${base.palette.divider}`,
        },
      },
      MuiDrawer: {
        styleOverrides: {
          backgroundColor: base.palette.background.paper,
          borderRight: `1px solid ${base.palette.divider}`,
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: base.palette.background.paper,
            borderBottom: `1px solid ${base.palette.divider}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundColor: base.palette.background.paper, backgroundImage: 'none' },
        },
      },
    },
  });
}

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialTheme());
  const [mounted, setMounted] = useState(false);

  // Применяем тему после монтирования
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeMode);
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode, mounted]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  const contextValue = useMemo(() => ({ themeMode, toggleTheme }), [themeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
