import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeModeContextValue = {
  mode: ThemeMode
  toggleMode: () => void
  setMode: (m: ThemeMode) => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

const STORAGE_KEY = 'www_theme_mode'

const palette = {
  light: {
    primary: '#FF5C3A',
    secondary: '#FFD166',
    bg: '#FFF6EE',
    paper: '#FFFFFF',
    text: '#2D2420',
    textSecondary: '#7A6B62',
    divider: '#F0E4D8',
  },
  dark: {
    primary: '#FF7A5C',
    secondary: '#FFD166',
    bg: '#1A1412',
    paper: '#261E1A',
    text: '#FFF5EE',
    textSecondary: '#C4B0A4',
    divider: '#3D322C',
  },
}

function detectInitialMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  if (typeof window !== 'undefined') {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  return 'light'
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within MuiAppProvider')
  return ctx
}

const displayFont = '"Fredoka", "Nunito", system-ui, sans-serif'
const bodyFont = '"Nunito", system-ui, -apple-system, sans-serif'

export default function MuiAppProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(() => detectInitialMode())

  const theme = useMemo(() => {
    const p = palette[mode]
    return createTheme({
      palette: {
        mode,
        primary: {
          main: p.primary,
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: p.secondary,
          contrastText: '#3D2E00',
        },
        background: {
          default: p.bg,
          paper: p.paper,
        },
        text: {
          primary: p.text,
          secondary: p.textSecondary,
        },
        divider: p.divider,
        success: { main: '#5EC269' },
      },
      shape: { borderRadius: 18 },
      typography: {
        fontFamily: bodyFont,
        h3: {
          fontFamily: displayFont,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        },
        h5: {
          fontFamily: displayFont,
          fontSize: '1.4rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        h6: {
          fontFamily: displayFont,
          fontSize: '1.1rem',
          fontWeight: 600,
        },
        subtitle1: {
          fontFamily: displayFont,
          fontWeight: 600,
        },
        subtitle2: {
          fontFamily: displayFont,
          fontWeight: 600,
        },
        body2: { fontSize: '0.9rem', lineHeight: 1.55 },
        button: {
          fontFamily: displayFont,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { backgroundColor: p.bg },
          },
        },
        MuiCard: {
          defaultProps: { elevation: 0 },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 999,
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 4px 14px rgba(255, 92, 58, 0.28)' },
              '&.MuiButton-contained': {
                background: `linear-gradient(180deg, ${p.primary} 0%, ${mode === 'light' ? '#E84E2E' : p.primary} 100%)`,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 600, fontFamily: bodyFont },
          },
        },
        MuiBottomNavigation: {
          styleOverrides: {
            root: {
              backgroundColor: p.paper,
              borderTop: `2px solid ${p.divider}`,
              borderRadius: '22px 22px 0 0',
              boxShadow: mode === 'light' ? '0 -4px 24px rgba(45, 36, 32, 0.06)' : 'none',
            },
          },
        },
        MuiBottomNavigationAction: {
          styleOverrides: {
            root: {
              '&.Mui-selected': {
                color: p.primary,
              },
            },
            label: {
              fontFamily: displayFont,
              fontSize: '0.7rem !important',
            },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 999,
              height: 8,
              bgcolor: p.divider,
            },
            bar: {
              borderRadius: 999,
              background: `linear-gradient(90deg, ${p.primary}, ${p.secondary})`,
            },
          },
        },
      },
    })
  }, [mode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
    document.documentElement.classList.toggle('theme-dark', mode === 'dark')
  }, [mode])

  const value: ThemeModeContextValue = useMemo(
    () => ({
      mode,
      setMode: (m) => setModeState(m),
      toggleMode: () => setModeState((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  )

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
