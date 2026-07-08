type Props = {
  size?: number
  className?: string
}

export default function OwlMascot({ size = 28, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Owl mascot"
    >
      <path
        d="M14 24c0-8 7-14 18-14s18 6 18 14v12c0 11-8 19-18 19S14 47 14 36V24z"
        fill="#374151"
      />
      <path d="M23 22c-6 0-10-4-10-10 5 0 10 3 10 10z" fill="#e5e7eb" />
      <path d="M41 22c6 0 10-4 10-10-5 0-10 3-10 10z" fill="#e5e7eb" />
      <ellipse cx="26" cy="30" rx="5.5" ry="6.5" fill="#111827" />
      <ellipse cx="38" cy="30" rx="5.5" ry="6.5" fill="#111827" />
      <circle cx="24.5" cy="28.5" r="2" fill="#ffffff" />
      <circle cx="36.5" cy="28.5" r="2" fill="#ffffff" />
      <path d="M32 34l-4.5 6.5h9l-4.5-6.5z" fill="#6b7280" />
    </svg>
  )
}
