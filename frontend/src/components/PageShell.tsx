import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useThemeMode } from './MuiAppProvider'
import OwlMascot from './OwlMascot'

type Props = {
  children: ReactNode
}

const NAV = [
  { key: 'home', label: 'Home', to: '/', icon: HomeOutlinedIcon },
  { key: 'search', label: 'Browse', to: '/search', icon: SearchOutlinedIcon },
  { key: 'create', label: 'Create', to: '/create', icon: AddOutlinedIcon },
  { key: 'me', label: 'Me', to: '/me', icon: PersonOutlineOutlinedIcon },
] as const

function activeKeyFromPath(path: string): string {
  if (path === '/create' || path.includes('/edit')) return 'create'
  if (path.startsWith('/search')) return 'search'
  if (path.startsWith('/me')) return 'me'
  if (path === '/') return 'home'
  return ''
}

function isImmersivePath(path: string): boolean {
  return /\/play$/.test(path) || /\/result$/.test(path)
}

function immersiveTitle(path: string): string {
  if (/\/play$/.test(path)) return 'Match couples'
  if (/\/result$/.test(path)) return 'Your score'
  return ''
}

function shellLayoutClass(path: string, immersive: boolean): string {
  if (immersive || path === '/create' || path.startsWith('/me')) {
    return 'shellInner shellInner--focus'
  }
  return 'shellInner shellInner--wide'
}

export default function PageShell({ children }: Props) {
  const path = useLocation().pathname
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const activeKey = activeKeyFromPath(path)
  const immersive = isImmersivePath(path)
  const shellClass = shellLayoutClass(path, immersive)

  return (
    <div className={immersive ? 'appShell appShell--immersive' : 'appShell'}>
      <header className="topBar">
        <div className={`${shellClass} topBarInner`}>
          {immersive ? (
            <>
              <IconButton
                onClick={() => navigate(-1)}
                aria-label="Go back"
                sx={{ color: 'text.primary', ml: -0.5 }}
              >
                <ArrowBackOutlinedIcon />
              </IconButton>
              <span className="immersiveTitle">{immersiveTitle(path)}</span>
              <IconButton
                onClick={() => toggleMode()}
                aria-label="Toggle theme"
                sx={{ color: 'text.secondary', mr: -0.5, display: { xs: 'none', md: 'inline-flex' } }}
              >
                {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
              </IconButton>
              <Box sx={{ width: 40, display: { xs: 'block', md: 'none' } }} />
            </>
          ) : (
            <>
              <Link to="/" className="brand">
                <OwlMascot size={28} />
                <span className="brandText brandText--hideMobile">Who&apos;s With Who?</span>
              </Link>

              <nav className="desktopNav" aria-label="Main">
                {NAV.map(({ key, label, to }) => (
                  <Link
                    key={key}
                    to={to}
                    className={activeKey === key ? 'desktopNavLink active' : 'desktopNavLink'}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                <IconButton
                  onClick={() => toggleMode()}
                  className="themeToggle"
                  sx={{ color: 'text.secondary' }}
                  aria-label="Toggle theme"
                >
                  {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </header>

      <main>
        <div className={shellClass}>{children}</div>
      </main>

      {!immersive ? (
        <div className="bottomNavWrap">
          <BottomNavigation value={activeKey} showLabels sx={{ height: 64 }}>
            {NAV.map(({ key, label, to, icon: Icon }) => (
              <BottomNavigationAction
                key={key}
                label={label}
                value={key}
                icon={<Icon />}
                component={Link}
                to={to}
                sx={{
                  minWidth: 0,
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </div>
      ) : null}
    </div>
  )
}
