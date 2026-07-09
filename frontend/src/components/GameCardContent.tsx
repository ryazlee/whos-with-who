import { Box, Typography } from '@mui/material'
import type { GameSummary } from '../datastore/types'
import { formatAttemptCount, formatPostedDate, formatTag } from '../lib/formatters'
import { MATCHING_MODE_LABELS, type MatchingMode } from '../game/matchingModes'
import FaceStack, { faceStackWidth } from './FaceStack'

export type GameCardContentProps = {
  game: GameSummary
  /** Extra meta fragments (e.g. score, "locked style"). */
  metaExtras?: (string | null | undefined)[]
  tagLimit?: number
  titleVariant?: 'body1' | 'h6'
  /** Show matching mode in the meta line instead of a chip. */
  showModeInMeta?: boolean
  avatarSize?: number
  avatarMax?: number
}

function buildMetaItems(
  game: GameSummary,
  extras: (string | null | undefined)[],
  showModeInMeta: boolean,
): string[] {
  return [
    game.authorName?.trim() ? game.authorName.trim() : null,
    `${game.peopleCount} people`,
    `${formatAttemptCount(game.attemptCount)} plays`,
    formatPostedDate(game.publishedAt),
    showModeInMeta ? MATCHING_MODE_LABELS[game.ownerMatchingMode as MatchingMode] : null,
    ...extras,
  ].filter(Boolean) as string[]
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <Box className="gameCard__tags" component="ul">
      {tags.map((tag) => (
        <Box component="li" key={tag} className="gameCard__tag">
          {formatTag(tag)}
        </Box>
      ))}
    </Box>
  )
}

/** Minimal card body: faces on top, title + meta below. */
export default function GameCardContent({
  game,
  metaExtras = [],
  tagLimit,
  titleVariant = 'body1',
  showModeInMeta = true,
  avatarSize = 40,
  avatarMax = 3,
}: GameCardContentProps) {
  const stackWidth = faceStackWidth(avatarSize, avatarMax)
  const tags = tagLimit != null ? game.tags.slice(0, tagLimit) : game.tags
  const metaItems = buildMetaItems(game, metaExtras, showModeInMeta)
  const isLargeTitle = titleVariant === 'h6'

  return (
    <Box className="gameCardStack">
      <Box className="gameCard__faces" sx={{ width: stackWidth }}>
        <FaceStack
          people={game.previewPeople}
          totalCount={game.peopleCount}
          size={avatarSize}
          max={avatarMax}
        />
      </Box>

      <Box className="gameCard__body">
        <Typography
          variant={isLargeTitle ? 'h6' : 'body1'}
          component={isLargeTitle ? 'h2' : 'p'}
          className="gameCard__title"
        >
          {game.title}
        </Typography>

        {game.description ? (
          <Typography
            variant="subtitle2"
            component="p"
            className="gameCard__description"
          >
            {game.description}
          </Typography>
        ) : null}

        <Typography variant="caption" className="gameCard__meta" component="p">
          {metaItems.join(' · ')}
        </Typography>

        <TagList tags={tags} />
      </Box>
    </Box>
  )
}
