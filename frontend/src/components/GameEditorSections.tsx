import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import CreatorMatchingModeSettings from './CreatorMatchingModeSettings'
import GameVisibilityPicker from './GameVisibilityPicker'
import PersonPhotoUpload from './PersonPhotoUpload'
import RelationshipEditor, {
  type DraftPerson,
  type DraftRelationships,
  hasSingles,
} from './RelationshipEditor'
import SectionCard from './SectionCard'
import TagInput from './TagInput'
import type { MatchingMode } from '../game/matchingModes'

type DetailsProps = {
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  tags: string[]
  onTagsChange: (value: string[]) => void
  visibility: 'public' | 'unlisted'
  onVisibilityChange: (value: 'public' | 'unlisted') => void
  ownerMatchingMode: MatchingMode
  onOwnerMatchingModeChange: (value: MatchingMode) => void
  modeLocked: boolean
  onModeLockedChange: (value: boolean) => void
  allowedMatchingModes: MatchingMode[]
  onAllowedMatchingModesChange: (value: MatchingMode[]) => void
  disabled?: boolean
}

export function GameEditorDetailsSection({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  tags,
  onTagsChange,
  visibility,
  onVisibilityChange,
  ownerMatchingMode,
  onOwnerMatchingModeChange,
  modeLocked,
  onModeLockedChange,
  allowedMatchingModes,
  onAllowedMatchingModesChange,
  disabled,
}: DetailsProps) {
  return (
    <SectionCard title="Details">
      <Stack spacing={2}>
        <TextField
          label="Game title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          fullWidth
          placeholder="Friend group reunion"
          disabled={disabled}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          placeholder="What's this game about? Give players a little context."
          disabled={disabled}
        />

        <Box>
          <Typography className="section-label" component="p" sx={{ mb: 0.75 }}>
            Tags
          </Typography>
          <TagInput value={tags} onChange={onTagsChange} disabled={disabled} />
        </Box>

        <GameVisibilityPicker value={visibility} onChange={onVisibilityChange} disabled={disabled} />

        <CreatorMatchingModeSettings
          modeLocked={modeLocked}
          onModeLockedChange={onModeLockedChange}
          lockedMode={ownerMatchingMode}
          onLockedModeChange={onOwnerMatchingModeChange}
          allowedModes={allowedMatchingModes}
          onAllowedModesChange={onAllowedMatchingModesChange}
        />
      </Stack>
    </SectionCard>
  )
}

type PeopleProps = {
  people: DraftPerson[]
  onUpdatePerson: (id: string, patch: Partial<DraftPerson>) => void
  onAddPerson: () => void
  onRemovePerson: (id: string) => void
}

export function GameEditorPeopleSection({
  people,
  onUpdatePerson,
  onAddPerson,
  onRemovePerson,
}: PeopleProps) {
  return (
    <SectionCard title="People" subtitle="Photo and name required for each person" noPadding>
      <Stack spacing={0} divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
        {people.map((person, index) => (
          <Box
            key={person.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              alignItems: 'stretch',
              px: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <PersonPhotoUpload
                value={person.photoDataUrl}
                onChange={(photoDataUrl) => onUpdatePerson(person.id, { photoDataUrl })}
                required
              />
              <Typography variant="caption" color="text.secondary">
                Person {index + 1}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                label="Name"
                value={person.name}
                onChange={(e) => onUpdatePerson(person.id, { name: e.target.value })}
                fullWidth
                placeholder="Alex"
                required
              />
              <IconButton
                onClick={() => onRemovePerson(person.id)}
                disabled={people.length <= 2}
                aria-label="Remove person"
                sx={{ mt: 0.5, flexShrink: 0 }}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Stack>
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <Button
          startIcon={<AddOutlinedIcon />}
          onClick={onAddPerson}
          variant="outlined"
          fullWidth
          sx={{ py: 1.1, borderStyle: 'dashed' }}
        >
          Add person
        </Button>
      </Box>
    </SectionCard>
  )
}

type AnswerKeyProps = {
  people: DraftPerson[]
  relationships: DraftRelationships
  onRelationshipsChange: (value: DraftRelationships) => void
}

export function GameEditorAnswerKeySection({
  people,
  relationships,
  onRelationshipsChange,
}: AnswerKeyProps) {
  return (
    <SectionCard title="Answer key" subtitle="The real couples — players try to match these">
      {hasSingles(relationships) ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Singles are allowed in this game.
        </Typography>
      ) : null}
      <RelationshipEditor
        people={people}
        relationships={relationships}
        onChange={onRelationshipsChange}
      />
    </SectionCard>
  )
}
