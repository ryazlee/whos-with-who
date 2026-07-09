import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { APP_HOME_HREF } from '../lib/appBase'
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
import AppLogo from './AppLogo'
import { APP_NAME } from '../lib/brand'

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

export default function PageShell({ children }: Props) {
  const path = useLocation().pathname
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const activeKey = activeKeyFromPath(path)
  const immersive = isImmersivePath(path)

  return (
    <div className={immersive ? 'appShell appShell--immersive' : 'appShell'}>
      <header className="topBar">
        <div className="shellInner topBarInner">
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
              <Box className="themeToggle">
                <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                  <IconButton
                    onClick={() => toggleMode()}
                    aria-label="Toggle theme"
                    sx={{ color: 'text.secondary', mr: -0.5 }}
                  >
                    {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          ) : (
            <>
              <a href={APP_HOME_HREF} className="brand" aria-label={`${APP_NAME} home`}>
                <AppLogo showName />
              </a>

              <nav className="desktopNav" aria-label="Main">
                {NAV.map(({ key, label, to }) =>
                  key === 'home' ? (
                    <a
                      key={key}
                      href={APP_HOME_HREF}
                      className={activeKey === key ? 'desktopNavLink active' : 'desktopNavLink'}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      key={key}
                      to={to}
                      className={activeKey === key ? 'desktopNavLink active' : 'desktopNavLink'}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </nav>

              <Box className="themeToggle">
                <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                  <IconButton
                    onClick={() => toggleMode()}
                    sx={{ color: 'text.secondary' }}
                    aria-label="Toggle theme"
                  >
                    {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          )}
        </div>
      </header>

      <main>
        <div className="shellInner">{children}</div>
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
                component={key === 'home' ? 'a' : Link}
                {...(key === 'home' ? { href: APP_HOME_HREF } : { to })}
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
