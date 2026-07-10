import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import EmptyState from './EmptyState'
import PageLoading from './PageLoading'

type Props = {
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  children: ReactNode
}

/** Loading, error, empty, or content states inside a SectionCard. */
export default function SectionQueryContent({
  loading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: Props) {
  if (loading) {
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <PageLoading />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ px: 2, py: 1.5 }}>
        {error}
      </Typography>
    )
  }

  if (isEmpty) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }

  return <>{children}</>
}
