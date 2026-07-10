import { Alert, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  GameEditorAnswerKeySection,
  GameEditorDetailsSection,
  GameEditorPeopleSection,
} from '../components/GameEditorSections'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import PrimaryActionButton from '../components/PrimaryActionButton'
import SignInGate from '../components/SignInGate'
import { useAuth } from '../contexts/AuthContext'
import { queryKeys } from '../hooks/queryKeys'
import { useGameEditorDraft } from '../hooks/useGameEditorDraft'
import { getSupabaseSetupMessage } from '../lib/supabaseConfig'
import { publishGame } from '../services/publishGame'
import { isSupabaseEnabled } from '../services/gameService'

export default function CreateGamePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()

  const draft = useGameEditorDraft()

  const canPublish = draft.formReady && Boolean(user) && isSupabaseEnabled

  const publishMutation = useMutation({
    mutationFn: () =>
      publishGame({
        title: draft.title,
        description: draft.description,
        tags: draft.tags,
        visibility: draft.visibility,
        ownerMatchingMode: draft.ownerMatchingMode,
        modeLocked: draft.modeLocked,
        allowedMatchingModes: draft.allowedMatchingModes,
        people: draft.people,
        relationships: draft.relationships,
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myGames })
      void queryClient.invalidateQueries({ queryKey: queryKeys.popularGames })
      navigate(`/game/${result.slug}/play`)
    },
  })

  function publishButtonLabel() {
    if (!isSupabaseEnabled) return 'Supabase required to publish'
    if (!user) return 'Sign in to publish'
    if (!draft.formReady) return 'Fill in all fields to publish'
    if (publishMutation.isPending) return 'Publishing…'
    return 'Publish game'
  }

  if (!isSupabaseEnabled) {
    return (
      <Page>
        <PageHeader title="Create" subtitle="Add photos, names, and who is actually with who." />
        <Alert severity="warning">{getSupabaseSetupMessage()}</Alert>
      </Page>
    )
  }

  return (
    <SignInGate
      user={user}
      loading={authLoading}
      title="Sign in to create"
      subtitle="An account is required to publish games."
    >
      <Page>
        <PageHeader
          title="Create"
          subtitle="Add photos, names, and who is actually with who."
        />

        {user?.email ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: -0.5, lineHeight: 1.5 }}>
            Publishing as <strong>{user.email}</strong>
          </Typography>
        ) : null}

        {publishMutation.error ? (
          <Alert severity="error">
            {publishMutation.error instanceof Error
              ? publishMutation.error.message
              : 'Could not publish game.'}
          </Alert>
        ) : null}

        <GameEditorDetailsSection
          title={draft.title}
          onTitleChange={draft.setTitle}
          description={draft.description}
          onDescriptionChange={draft.setDescription}
          tags={draft.tags}
          onTagsChange={draft.setTags}
          visibility={draft.visibility}
          onVisibilityChange={draft.setVisibility}
          ownerMatchingMode={draft.ownerMatchingMode}
          onOwnerMatchingModeChange={draft.setOwnerMatchingMode}
          modeLocked={draft.modeLocked}
          onModeLockedChange={draft.setModeLocked}
          allowedMatchingModes={draft.allowedMatchingModes}
          onAllowedMatchingModesChange={draft.setAllowedMatchingModes}
        />

        <GameEditorPeopleSection
          people={draft.people}
          onUpdatePerson={draft.updatePerson}
          onAddPerson={draft.addPerson}
          onRemovePerson={draft.removePerson}
        />

        <GameEditorAnswerKeySection
          people={draft.people}
          relationships={draft.relationships}
          onRelationshipsChange={draft.setRelationships}
        />

        <PrimaryActionButton
          disabled={!canPublish || publishMutation.isPending}
          onClick={() => publishMutation.mutate()}
          label={publishButtonLabel()}
        />
      </Page>
    </SignInGate>
  )
}
