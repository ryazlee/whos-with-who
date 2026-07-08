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
  { key: 'home', label: 'Play', to: '/', icon: HomeOutlinedIcon },
  { key: 'search', label: 'Browse', to: '/search', icon: SearchOutlinedIcon },
  { key: 'create', label: 'Make', to: '/create', icon: AddOutlinedIcon },
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
  const location = useLocation()
  const path = location.pathname
  const { mode, toggleMode } = useThemeMode()
  const activeKey = activeKeyFromPath(path)

  return (
    <div className="appShell">
      <header className="topBar">
        <Link to="/" className="brand">
          <OwlMascot size={34} />
          <span>Who&apos;s With Who?</span>
        </Link>

        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton
            onClick={() => toggleMode()}
            size="small"
            sx={{
              color: 'text.secondary',
              ml: 'auto',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'secondary.main', color: 'secondary.contrastText' },
            }}
            aria-label="Toggle theme"
          >
            {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </header>

      <main>{children}</main>

      <div className="bottomNavWrap">
        <BottomNavigation
          value={activeKey}
          showLabels
          sx={{ height: 68 }}
        >
          {NAV.map(({ key, label, to, icon: Icon }) => (
            <BottomNavigationAction
              key={key}
              label={label}
              value={key}
              icon={<Icon />}
              component={Link}
              to={to}
            />
          ))}
        </BottomNavigation>
      </div>
    </div>
  )
}
