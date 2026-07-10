import type { ReactNode } from 'react'
import Page from './Page'
import PageError from './PageError'
import PageLoading from './PageLoading'

type Props = {
  loading?: boolean
  error?: string | null
  missing?: boolean
  missingMessage?: string
  children: ReactNode
}

/** Early-return loading/error wrapper for game and data pages. */
export default function PageQueryState({
  loading,
  error,
  missing,
  missingMessage = 'Not found',
  children,
}: Props) {
  if (loading) {
    return (
      <Page>
        <PageLoading />
      </Page>
    )
  }

  if (error || missing) {
    return (
      <Page>
        <PageError message={error ?? missingMessage} />
      </Page>
    )
  }

  return <>{children}</>
}
