import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function GameGrid({ children }: Props) {
  return <div className="gameGrid">{children}</div>
}
