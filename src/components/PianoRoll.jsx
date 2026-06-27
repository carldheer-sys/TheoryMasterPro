import { useMemo } from 'react'
import {
  generateMidiRange,
  isBlackKey,
  midiNoteToPC,
  midiNoteToName,
  pitchClassToName
} from '../utils/musicTheory'

/**
 * PianoRoll — renders a piano keyboard at the bottom of the screen.
 * - White keys are laid out in a flex row.
 * - Black keys are absolutely positioned on top.
 * - Any note in `activeNotes` (Set of MIDI note numbers) is highlighted red.
 *
 * Props:
 *   - range: { start, end } MIDI note numbers
 *   - activeNotes: Set<number> of currently pressed MIDI notes
 *   - targetPCs: array of pitch classes to highlight as target (optional, green outline)
 *   - revealedNotes: Set<number> of MIDI notes to highlight as revealed answer (yellow)
 */
export default function PianoRoll({ range, activeNotes, targetPCs = [], revealedNotes, onNoteOn, onNoteOff, onClearAll, chordMode = false }) {
  const notes = useMemo(() => generateMidiRange(range.start, range.end), [range.start, range.end])

  const whiteKeys = useMemo(() => notes.filter(n => !isBlackKey(midiNoteToPC(n))), [notes])
  const blackKeys = useMemo(() => notes.filter(n => isBlackKey(midiNoteToPC(n))), [notes])

  const whiteKeyWidth = 100 / whiteKeys.length // percentage
  const blackKeyWidth = whiteKeyWidth * 0.6

  // Find the index of the white key immediately preceding each black key
  const blackKeyPositions = useMemo(() => {
    return blackKeys.map(bn => {
      const precedingWhite = whiteKeys.filter(wn => wn < bn)
      const whiteIndex = precedingWhite.length - 1 // 0-based index of the white key before this black key
      // Position: right edge of the preceding white key, minus half the black key width
      const leftPct = (whiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2
      return { note: bn, leftPct }
    })
  }, [blackKeys, whiteKeys, whiteKeyWidth, blackKeyWidth])

  const targetSet = useMemo(() => new Set(targetPCs), [targetPCs])
  const revealedSet = useMemo(() => revealedNotes || new Set(), [revealedNotes])

  return (
    <div className="relative w-full h-full bg-bg-900 px-2 pb-2 pt-1 select-none">
      {/* White keys */}
      <div className="flex w-full h-full gap-[2px]">
        {whiteKeys.map(note => {
          const pc = midiNoteToPC(note)
          const isActive = activeNotes.has(note)
          const isTarget = targetSet.has(pc)
          const isRevealed = revealedSet.has(note)
          const isC = pc === 0
          return (
            <div
              key={note}
              onPointerDown={(e) => {
                e.preventDefault()
                if (chordMode) {
                  if (e.metaKey || e.ctrlKey) {
                    if (activeNotes.has(note)) onNoteOff?.(note)
                    else onNoteOn?.(note)
                  } else {
                    onClearAll?.()
                    onNoteOn?.(note)
                  }
                } else {
                  onNoteOn?.(note)
                }
              }}
              onPointerUp={() => { if (!chordMode) onNoteOff?.(note) }}
              onPointerLeave={() => { if (!chordMode && activeNotes.has(note)) onNoteOff?.(note) }}
              className={`relative flex-1 rounded-b-md flex items-end justify-center pb-2
                transition-colors duration-75 cursor-pointer touch-none
                ${isActive
                  ? 'bg-keyred'
                  : isRevealed
                    ? 'bg-yellow-400'
                    : 'bg-keywhite hover:bg-gray-200'
                }
                ${isTarget && !isActive && !isRevealed ? 'ring-2 ring-green-400 ring-inset' : ''}
              `}
              style={{ minWidth: 0 }}
            >
              {/* Note label on C keys */}
              {isC && (
                <span className={`music-notation text-[10px] font-bold ${isActive || isRevealed ? 'text-white' : 'text-gray-500'}`}>
                  {midiNoteToName(note)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Black keys — absolutely positioned overlay */}
      <div className="absolute inset-x-2 top-1" style={{ height: '60%' }}>
        {blackKeyPositions.map(({ note, leftPct }) => {
          const pc = midiNoteToPC(note)
          const isActive = activeNotes.has(note)
          const isTarget = targetSet.has(pc)
          const isRevealed = revealedSet.has(note)
          return (
            <div
              key={note}
              onPointerDown={(e) => {
                e.preventDefault()
                if (chordMode) {
                  if (e.metaKey || e.ctrlKey) {
                    if (activeNotes.has(note)) onNoteOff?.(note)
                    else onNoteOn?.(note)
                  } else {
                    onClearAll?.()
                    onNoteOn?.(note)
                  }
                } else {
                  onNoteOn?.(note)
                }
              }}
              onPointerUp={() => { if (!chordMode) onNoteOff?.(note) }}
              onPointerLeave={() => { if (!chordMode && activeNotes.has(note)) onNoteOff?.(note) }}
              className={`absolute rounded-b-md transition-colors duration-75 cursor-pointer touch-none
                ${isActive
                  ? 'bg-keyred'
                  : isRevealed
                    ? 'bg-yellow-400'
                    : 'bg-keyblack hover:bg-gray-800'
                }
                ${isTarget && !isActive && !isRevealed ? 'ring-2 ring-green-400 ring-inset' : ''}
              `}
              style={{
                left: `${leftPct}%`,
                width: `${blackKeyWidth}%`,
                height: '100%',
                boxShadow: isActive
                  ? '0 0 12px rgba(255,59,59,0.5)'
                  : isRevealed
                    ? '0 0 12px rgba(250,204,21,0.5)'
                    : '0 2px 4px rgba(0,0,0,0.5)'
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
