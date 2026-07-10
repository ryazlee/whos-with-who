import { Box } from '@mui/material'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function MeGameList({ children }: Props) {
  return <Box className="meGameList">{children}</Box>
}

type ItemProps = {
  showDivider?: boolean
  children: ReactNode
}

export function MeGameListItem({ showDivider, children }: ItemProps) {
  return (
    <Box>
      {showDivider ? <Box className="meGameList__divider" role="separator" /> : null}
      {children}
    </Box>
  )
}
