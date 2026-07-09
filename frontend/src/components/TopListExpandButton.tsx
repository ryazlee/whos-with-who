import { Button } from '@mui/material'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'

type Props = {
  expanded: boolean
  onToggle: () => void
}

export default function TopListExpandButton({ expanded, onToggle }: Props) {
  return (
    <Button
      fullWidth
      onClick={onToggle}
      endIcon={
        <ExpandMoreOutlinedIcon
          sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      }
      sx={{
        justifyContent: 'space-between',
        mt: 1,
        py: 1,
        color: 'text.secondary',
        fontWeight: 500,
        borderRadius: 0,
      }}
    >
      {expanded ? 'Show top 5' : 'Show top 15'}
    </Button>
  )
}
