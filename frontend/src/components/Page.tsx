import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  withActionBar?: boolean
  className?: string
}

export default function Page({ children, withActionBar, className }: Props) {
  const classes = ['page', withActionBar ? 'page--withActionBar' : null, className]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
