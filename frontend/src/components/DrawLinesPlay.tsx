import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import type { MatchAllSelections } from '../datastore/types'
import type { Person } from '../game/types'
import {
  clearPerson,
  countPairingProgress,
  selectionsToTapPairAssigned,
  setPair,
  setSingle,
  tapPairsToSelections,
  type TapPairAssignment,
} from '../game/pairMatching'
import { PairingProgress } from './PairingUI'
import PersonAvatar from './PersonAvatar'
import { computeDrawLinesLayout } from '../game/drawLinesLayout'

type Props = {
  people: Person[]
  allowSingleChoice: boolean
  singlesInGame: number
  pairsInGame: number
  selections: MatchAllSelections
  onChange: (selections: MatchAllSelections) => void
  readOnly?: boolean
}

type NodePos = { x: number; y: number; person: Person }

function circlePosition(index: number, total: number, radius: number, cx: number, cy: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join(':')
}

export default function DrawLinesPlay({
  people,
  allowSingleChoice,
  singlesInGame,
  pairsInGame,
  selections,
  onChange,
  readOnly = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(360)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragFromId, setDragFromId] = useState<string | null>(null)
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(w)
    })
    ro.observe(node)
    setWidth(node.clientWidth)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(
    () => computeDrawLinesLayout(people.length, width),
    [people.length, width],
  )

  const { height, cx, cy, radius, avatarSize, hitRadius, showName, lineStroke } = layout

  const nodes: NodePos[] = useMemo(
    () =>
      people.map((person, index) => ({
        person,
        ...circlePosition(index, people.length, radius, cx, cy),
      })),
    [people, radius, cx, cy],
  )

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.person.id, n])), [nodes])

  const assignedMap = useMemo(
    () => selectionsToTapPairAssigned(people.map((p) => p.id), selections),
    [people, selections],
  )

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])

  function pushAssigned(next: Record<string, TapPairAssignment>) {
    onChange(tapPairsToSelections(people.map((p) => p.id), next))
  }

  function connectPeople(fromId: string, toId: string) {
    if (fromId === toId) return
    pushAssigned(setPair(assignedMap, fromId, toId))
    setSelectedId(null)
    setDragFromId(null)
    setDragPoint(null)
  }

  function localPoint(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function hitTestPerson(x: number, y: number): string | null {
    for (const node of nodes) {
      const dx = x - node.x
      const dy = y - node.y
      if (Math.hypot(dx, dy) <= hitRadius) return node.person.id
    }
    return null
  }

  function handleCanvasPointerUp(e: React.PointerEvent) {
    if (!dragFromId) return
    const pt = localPoint(e.clientX, e.clientY)
    if (!pt) return
    const targetId = hitTestPerson(pt.x, pt.y)
    if (targetId && targetId !== dragFromId) {
      connectPeople(dragFromId, targetId)
    } else {
      setDragFromId(null)
      setDragPoint(null)
    }
  }

  function handlePointerDown(personId: string, e: React.PointerEvent) {
    e.preventDefault()
    setSelectedId(personId)
    setDragFromId(personId)
    const pt = localPoint(e.clientX, e.clientY)
    setDragPoint(pt)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragFromId) return
    const pt = localPoint(e.clientX, e.clientY)
    if (pt) setDragPoint(pt)
  }

  function handlePointerUp(personId: string, e: React.PointerEvent) {
    if (dragFromId && dragFromId !== personId) {
      connectPeople(dragFromId, personId)
    } else if (selectedId && selectedId !== personId) {
      connectPeople(selectedId, personId)
    } else {
      setSelectedId(personId)
    }
    setDragFromId(null)
    setDragPoint(null)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  function handleMarkSingle() {
    if (!selectedId || !allowSingleChoice) return
    pushAssigned(setSingle(assignedMap, selectedId))
    setSelectedId(null)
    setDragFromId(null)
    setDragPoint(null)
  }

  const pairs: Array<[Person, Person]> = []
  const singles: Person[] = []
  const seen = new Set<string>()

  for (const p of people) {
    if (seen.has(p.id)) continue
    const v = assignedMap[p.id]
    if (v === 'single') {
      singles.push(p)
      seen.add(p.id)
    } else if (typeof v === 'string' && v !== 'single') {
      const partner = peopleById.get(v)
      if (partner) {
        pairs.push([p, partner])
        seen.add(p.id)
        seen.add(partner.id)
      }
    }
  }

  const { assigned: assignedCount } = countPairingProgress(
    people.map((p) => p.id),
    assignedMap,
  )
  const pairedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [a, b] of pairs) {
      ids.add(a.id)
      ids.add(b.id)
    }
    for (const s of singles) ids.add(s.id)
    return ids
  }, [pairs, singles])

  return (
    <Stack spacing={2}>
      <PairingProgress
        total={people.length}
        assigned={assignedCount}
        singlesInGame={singlesInGame}
        pairsInGame={pairsInGame}
        hint={
          readOnly
            ? 'Your submitted picks'
            : 'Drag a line between two people, or tap one then another'
        }
      />

      <Box className="surfaceCard" sx={{ p: 1.5, overflow: 'hidden' }}>
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            width: '100%',
            height,
            mx: 'auto',
            touchAction: readOnly ? 'auto' : 'none',
            userSelect: 'none',
          }}
          onPointerMove={readOnly ? undefined : handlePointerMove}
          onPointerUp={readOnly ? undefined : handleCanvasPointerUp}
          onPointerLeave={
            readOnly
              ? undefined
              : () => {
                  if (dragFromId) setDragPoint(null)
                }
          }
        >
          <Box
            component="svg"
            width={width}
            height={height}
            sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {pairs.map(([a, b]) => {
              const na = nodeById.get(a.id)
              const nb = nodeById.get(b.id)
              if (!na || !nb) return null
              return (
                <line
                  key={pairKey(a.id, b.id)}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="currentColor"
                  strokeWidth={lineStroke}
                  strokeLinecap="round"
                  opacity={0.55}
                />
              )
            })}
            {dragFromId && dragPoint ? (() => {
              const from = nodeById.get(dragFromId)
              if (!from) return null
              return (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={dragPoint.x}
                  y2={dragPoint.y}
                  stroke="currentColor"
                  strokeWidth={Math.max(2, lineStroke - 0.5)}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  opacity={0.75}
                />
              )
            })() : null}
          </Box>

          {nodes.map((node) => (
              <Box
                key={node.person.id}
                sx={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: selectedId === node.person.id || dragFromId === node.person.id ? 2 : 1,
                }}
                onPointerDown={readOnly ? undefined : (e) => handlePointerDown(node.person.id, e)}
                onPointerUp={readOnly ? undefined : (e) => handlePointerUp(node.person.id, e)}
              >
                <PersonAvatar
                  person={node.person}
                  size={avatarSize}
                  selected={selectedId === node.person.id || dragFromId === node.person.id}
                  paired={pairedIds.has(node.person.id)}
                  showName={showName}
                  compact={avatarSize < 46}
                />
              </Box>
            ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          {readOnly
            ? 'Lines show the pairs you submitted.'
            : 'Lines show your pairs. Drag from one face to another to connect them.'}
        </Typography>
      </Box>

      {!readOnly && selectedId && allowSingleChoice ? (
        <Button variant="outlined" onClick={handleMarkSingle} fullWidth sx={{ py: 1.1, borderStyle: 'dashed' }}>
          Mark {peopleById.get(selectedId)?.name} as single
        </Button>
      ) : null}

      {!readOnly && selectedId ? (
        <Button
          variant="text"
          color="inherit"
          onClick={() => {
            const next = { ...assignedMap }
            clearPerson(next, selectedId)
            pushAssigned(next)
            setSelectedId(null)
            setDragFromId(null)
            setDragPoint(null)
          }}
          fullWidth
          sx={{ color: 'text.secondary' }}
        >
          Clear {peopleById.get(selectedId)?.name}
        </Button>
      ) : null}
    </Stack>
  )
}
