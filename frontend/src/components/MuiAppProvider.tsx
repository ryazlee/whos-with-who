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
    primary: '#111827',
    bg: '#fafafa',
    paper: '#ffffff',
    text: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    divider: '#e5e7eb',
    dividerLight: '#f3f4f6',
  },
  dark: {
    primary: '#f3f4f6',
    bg: '#111827',
    paper: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    divider: '#374151',
    dividerLight: '#1f2937',
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

const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

export default function MuiAppProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(() => detectInitialMode())

  const theme = useMemo(() => {
    const p = palette[mode]
    return createTheme({
      palette: {
        mode,
        primary: {
          main: p.primary,
          contrastText: mode === 'light' ? '#ffffff' : '#111827',
        },
        text: {
          primary: p.text,
          secondary: p.textSecondary,
        },
        background: {
          default: p.bg,
          paper: p.paper,
        },
        divider: p.divider,
        success: { main: '#059669' },
        error: { main: '#dc2626' },
      },
      shape: { borderRadius: 10 },
      typography: {
        fontFamily,
        h5: { fontWeight: 600, letterSpacing: '-0.02em' },
        button: { textTransform: 'none', fontWeight: 500 },
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
            root: {
              borderRadius: 10,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none', opacity: 0.9 },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 500 },
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
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              height: 4,
              bgcolor: p.dividerLight,
            },
            bar: { borderRadius: 4, bgcolor: p.text },
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
