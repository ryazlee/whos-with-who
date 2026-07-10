import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import EmailCodeLogin from './EmailCodeLogin'
import Page from './Page'
import PageHeader from './PageHeader'
import PageLoading from './PageLoading'

type Props = {
  user: User | null
  loading: boolean
  title: string
  subtitle: string
  children: ReactNode
}

/** Shows loading, sign-in prompt, or page content based on auth state. */
export default function SignInGate({ user, loading, title, subtitle, children }: Props) {
  if (loading) {
    return (
      <Page>
        <PageLoading />
      </Page>
    )
  }

  if (!user) {
    return (
      <Page>
        <PageHeader title={title} subtitle={subtitle} />
        <EmailCodeLogin />
      </Page>
    )
  }

  return <>{children}</>
}
