import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/** Fixed bottom bar — respects nav + safe area via CSS vars in index.css */
export default function StickyActionBar({ children }: Props) {
  return <div className="stickyActionBar">{children}</div>
}
