import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Tooltip,
} from '@mui/material'
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
  { key: 'search', label: 'Search', to: '/search', icon: SearchOutlinedIcon },
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

export default function PageShell({ children }: Props) {
  const path = useLocation().pathname
  const { mode, toggleMode } = useThemeMode()
  const activeKey = activeKeyFromPath(path)

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="shellInner topBarInner">
          <Link to="/" className="brand">
            <OwlMascot size={24} />
            <span>Who&apos;s With Who?</span>
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
              size="small"
              className="themeToggle"
              sx={{ color: 'text.secondary' }}
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </div>
      </header>

      <main>
        <div className="shellInner">{children}</div>
      </main>

      <div className="bottomNavWrap">
        <BottomNavigation value={activeKey} showLabels sx={{ height: 64 }}>
          {NAV.map(({ key, label, to, icon: Icon }) => (
            <BottomNavigationAction
              key={key}
              label={label}
              value={key}
              icon={<Icon fontSize="small" />}
              component={Link}
              to={to}
            />
          ))}
        </BottomNavigation>
      </div>
    </div>
  )
}
