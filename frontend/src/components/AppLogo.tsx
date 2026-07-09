import { APP_LOGO, APP_NAME } from '../lib/brand'

type Props = {
  /** Show app name beside the mark (desktop header). */
  showName?: boolean
}

export default function AppLogo({ showName = false }: Props) {
  return (
    <>
      <span className="brandMark" aria-hidden>
        {APP_LOGO}
      </span>
      {showName ? <span className="brandText">{APP_NAME}</span> : null}
    </>
  )
}
