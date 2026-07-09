import type { SxProps, Theme } from '@mui/material'

/** Segmented chip / pill — readable selected state in light and dark mode. */
export function selectionChipSx(active: boolean, disabled?: boolean): SxProps<Theme> {
  return {
    height: 32,
    fontSize: '0.8125rem',
    fontWeight: active ? 600 : 500,
    borderRadius: '99px',
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid',
    borderColor: active ? 'var(--text)' : 'var(--border)',
    bgcolor: active ? 'var(--text)' : 'transparent',
    color: active ? 'var(--surface)' : 'var(--text-secondary)',
    opacity: disabled ? 0.55 : 1,
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    '& .MuiChip-label': { px: 1.25 },
    '&:hover': disabled
      ? undefined
      : {
          bgcolor: active ? 'var(--text)' : 'var(--border-light)',
          borderColor: active ? 'var(--text)' : 'var(--text-muted)',
        },
  }
}

export function selectionChipSxTall(active: boolean, disabled?: boolean): SxProps<Theme> {
  return {
    ...selectionChipSx(active, disabled),
    height: 36,
    fontSize: '0.85rem',
  }
}
