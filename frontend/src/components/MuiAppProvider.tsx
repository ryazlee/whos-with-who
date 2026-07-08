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

/** Muted terracotta — warm orange-coral, low saturation, easy on the eyes. */
const palette = {
  light: {
    primary: '#b86a52',
    bg: '#f6f4f1',
    paper: '#fffcfa',
    text: '#2a2623',
    textSecondary: '#6e6660',
    divider: '#e5dfd8',
  },
  dark: {
    primary: '#e8a48c',
    bg: '#121110',
    paper: '#1c1a18',
    text: '#f2eeea',
    textSecondary: '#a39d96',
    divider: '#2e2a27',
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

export default function MuiAppProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(() => detectInitialMode())

  const theme = useMemo(() => {
    const p = palette[mode]
    return createTheme({
      palette: {
        mode,
        primary: {
          main: p.primary,
          contrastText: mode === 'dark' ? '#1a1512' : '#fffaf7',
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
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: '"Outfit", system-ui, -apple-system, "Segoe UI", sans-serif',
        h5: {
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '1.35rem',
          fontWeight: 600,
          letterSpacing: '-0.03em',
        },
        h6: {
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: '1.05rem',
          fontWeight: 600,
        },
        subtitle1: {
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
        },
        body2: { fontSize: '0.875rem', lineHeight: 1.55 },
        button: { textTransform: 'none', fontWeight: 600 },
        overline: { fontFamily: '"Outfit", system-ui, sans-serif' },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { backgroundColor: p.bg },
          },
        },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: {
              border: `1px solid ${p.divider}`,
              backgroundImage: 'none',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 500 },
            outlined: { borderColor: p.divider },
          },
        },
        MuiBottomNavigation: {
          styleOverrides: {
            root: {
              backgroundColor: p.paper,
              borderTop: `1px solid ${p.divider}`,
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
