import { useState, useMemo } from 'react'
import Select from './Select'
import {
  TONICS,
  TONALITIES,
  DIATONIC_DEGREES,
  getDiatonicTriads,
  getDiatonicSevenths,
  tonicToPC,
  degreeToPitchClass,
  getChordPitchClasses,
  getChordLabel,
  spellNoteName,
  getKeyDisplay,
  midiNoteToPC,
  generateMidiRange,
  isBlackKey
} from '../utils/musicTheory'

const DEGREE_NAMES = {
  '1': 'Tonic', '2': 'Supertonic', 'b3': 'Mediant', '3': 'Mediant',
  '4': 'Subdominant', '5': 'Dominant', 'b6': 'Submediant', '6': 'Submediant',
  'b7': 'Subtonic', '7': 'Leading Tone'
}

const TABS = [
  { value: 'degrees', label: 'Degrees' },
  { value: 'chords', label: 'Chords' }
]

const CHORD_VARIANT_OPTIONS = [
  { value: 'triads', label: 'Triads' },
  { value: 'sevenths', label: 'Sevenths' }
]

export default function TheoryOverview({ activeNotes }) {
  const [tonic, setTonic] = useState('C')
  const [tab, setTab] = useState('degrees')
  const [chordVariant, setChordVariant] = useState('triads')
  const [selectedCell, setSelectedCell] = useState(null) // { type: 'row'|'cell', tonality, degreeIndex? }

  const tonicPC = tonicToPC(tonic)

  // Compute highlight pitch classes based on selection
  const highlightPCs = useMemo(() => {
    if (!selectedCell) return []
    const { tonality, degreeIndex, type } = selectedCell

    if (type === 'row') {
      // Highlight all scale notes for this tonality
      const degrees = DIATONIC_DEGREES[tonality]
      return degrees.map(d => degreeToPitchClass(tonicPC, d.semitones))
    } else if (type === 'cell' && degreeIndex != null) {
      // Highlight chord notes for this specific cell
      const chords = chordVariant === 'sevenths'
        ? getDiatonicSevenths(tonality)
        : getDiatonicTriads(tonality)
      const chord = chords[degreeIndex]
      return getChordPitchClasses(tonicPC, chord)
    }
    return []
  }, [selectedCell, tonicPC, chordVariant])

  // Build degree data for the table
  const degreeData = useMemo(() => {
    return TONALITIES.map(({ value: tonality, label }) => {
      const degrees = DIATONIC_DEGREES[tonality]
      const notes = degrees.map(d => ({
        degree: d.degree,
        semitones: d.semitones,
        pc: degreeToPitchClass(tonicPC, d.semitones),
        name: spellNoteName(degreeToPitchClass(tonicPC, d.semitones), tonic, tonality)
      }))
      return { tonality, label, notes }
    })
  }, [tonicPC, tonic])

  // Build chord data for the table
  const chordData = useMemo(() => {
    return TONALITIES.map(({ value: tonality, label }) => {
      const chords = chordVariant === 'sevenths'
        ? getDiatonicSevenths(tonality)
        : getDiatonicTriads(tonality)
      const cells = chords.map((chord, i) => ({
        index: i,
        roman: chord.roman,
        label: getChordLabel(tonicPC, chord, tonic, tonality),
        notes: getChordPitchClasses(tonicPC, chord).map(pc =>
          spellNoteName(pc, tonic, tonality)
        )
      }))
      return { tonality, label, cells }
    })
  }, [tonicPC, tonic, chordVariant])

  const handleTonicChange = (v) => {
    setTonic(v)
    setSelectedCell(null)
  }

  const handleTabChange = (v) => {
    setTab(v)
    setSelectedCell(null)
  }

  const handleChordVariantChange = (v) => {
    setChordVariant(v)
    setSelectedCell(null)
  }

  const isRowSelected = (tonality) =>
    selectedCell?.type === 'row' && selectedCell?.tonality === tonality

  const isCellSelected = (tonality, degreeIndex) =>
    selectedCell?.type === 'cell' && selectedCell?.tonality === tonality && selectedCell?.degreeIndex === degreeIndex

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: tonic selector + tabs */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4 px-4 sm:px-8 pt-6 pb-4">
        <Select
          label="Tonic"
          value={tonic}
          onChange={handleTonicChange}
          options={TONICS.map(t => ({ value: t, label: t }))}
        />

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Tabs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">View</label>
          <div className="flex bg-bg-700 rounded-xl border border-bg-500 p-1 min-h-[44px]">
            {TABS.map(t => (
              <button
                key={t.value}
                onClick={() => handleTabChange(t.value)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${tab === t.value
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-bg-600'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'chords' && (
          <>
            <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>
            <Select
              label="Chord Type"
              value={chordVariant}
              onChange={handleChordVariantChange}
              options={CHORD_VARIANT_OPTIONS}
            />
          </>
        )}

        <div className="flex-1" />

        {/* Key display */}
        <div className="pb-2.5">
          <div className="text-sm text-gray-400">
            Key: <span className="text-accent-light font-bold">{getKeyDisplay(tonic, tab === 'degrees' ? 'major/minor' : 'major/minor')}</span>
          </div>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 pb-4">
        {tab === 'degrees' ? (
          <DegreesTable
            degreeData={degreeData}
            isRowSelected={isRowSelected}
            onSelectRow={(tonality) => {
              setSelectedCell(prev =>
                prev?.type === 'row' && prev?.tonality === tonality
                  ? null
                  : { type: 'row', tonality }
              )
            }}
          />
        ) : (
          <ChordsTable
            chordData={chordData}
            isCellSelected={isCellSelected}
            onSelectCell={(tonality, degreeIndex) => {
              setSelectedCell(prev =>
                prev?.type === 'cell' && prev?.tonality === tonality && prev?.degreeIndex === degreeIndex
                  ? null
                  : { type: 'cell', tonality, degreeIndex }
              )
            }}
          />
        )}
      </div>

      {/* Compact keyboard visualization */}
      <CompactKeyboard
        highlightPCs={highlightPCs}
        activeNotes={activeNotes}
      />
    </div>
  )
}

// ── Degrees Table ─────────────────────────────────────────────────────────

function DegreesTable({ degreeData, isRowSelected, onSelectRow }) {
  const degreeCount = 7
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-bg-600">
              Mode
            </th>
            {Array.from({ length: degreeCount }, (_, i) => (
              <th key={i} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-bg-600">
                {degreeData[0].notes[i]?.degree}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {degreeData.map(({ tonality, label, notes }) => (
            <tr
              key={tonality}
              onClick={() => onSelectRow(tonality)}
              className={`cursor-pointer transition-colors group
                ${isRowSelected(tonality) ? 'bg-accent/15' : 'hover:bg-bg-700/50'}
              `}
            >
              <td className="px-4 py-3 text-sm font-bold text-white border-b border-bg-700/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRowSelected(tonality) ? 'bg-accent' : 'bg-transparent'}`} />
                  {label}
                </div>
              </td>
              {notes.map((note, i) => (
                <td
                  key={i}
                  className={`px-3 py-3 text-center border-b border-bg-700/50
                    ${isRowSelected(tonality) ? 'text-white' : 'text-gray-300'}
                  `}
                >
                  <div className="font-bold text-sm">{note.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{DEGREE_NAMES[note.degree] || ''}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-gray-500 text-xs mt-3">
        Click a row to highlight scale notes on the keyboard below.
      </div>
    </div>
  )
}

// ── Chords Table ──────────────────────────────────────────────────────────

function ChordsTable({ chordData, isCellSelected, onSelectCell }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-bg-600">
              Mode
            </th>
            {chordData[0].cells.map((cell, i) => (
              <th key={i} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-bg-600">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chordData.map(({ tonality, label, cells }) => (
            <tr key={tonality} className="group">
              <td className="px-4 py-3 text-sm font-bold text-white border-b border-bg-700/50">
                {label}
              </td>
              {cells.map((cell, i) => (
                <td
                  key={i}
                  onClick={() => onSelectCell(tonality, i)}
                  className={`px-3 py-3 text-center border-b border-bg-700/50 cursor-pointer transition-colors
                    ${isCellSelected(tonality, i) ? 'bg-accent/20' : 'hover:bg-bg-700/50'}
                  `}
                >
                  <div className={`font-bold text-sm ${isCellSelected(tonality, i) ? 'text-white' : 'text-gray-200'}`}>
                    {cell.roman}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{cell.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{cell.notes.join('–')}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-gray-500 text-xs mt-3">
        Click a chord cell to highlight its notes on the keyboard below.
      </div>
    </div>
  )
}

// ── Compact Keyboard ──────────────────────────────────────────────────────

function CompactKeyboard({ highlightPCs = [], activeNotes }) {
  // Fixed one-octave range C4–B4 (MIDI 60–71), each pitch class appears once, centered around F4
  const notes = useMemo(() => generateMidiRange(60, 71), [])

  const whiteKeys = useMemo(() => notes.filter(n => !isBlackKey(midiNoteToPC(n))), [notes])
  const blackKeys = useMemo(() => notes.filter(n => isBlackKey(midiNoteToPC(n))), [notes])

  const whiteKeyWidth = 100 / whiteKeys.length
  const blackKeyWidth = whiteKeyWidth * 0.6

  const blackKeyPositions = useMemo(() => {
    return blackKeys.map(bn => {
      const precedingWhite = whiteKeys.filter(wn => wn < bn)
      const whiteIndex = precedingWhite.length - 1
      const leftPct = (whiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2
      return { note: bn, leftPct }
    })
  }, [blackKeys, whiteKeys, whiteKeyWidth, blackKeyWidth])

  const highlightSet = useMemo(() => new Set(highlightPCs), [highlightPCs])

  return (
    <div className="h-[140px] sm:h-[160px] flex-shrink-0 bg-bg-900 border-t border-bg-700 px-2 pb-2 pt-1 select-none">
      <div className="relative w-full h-full">
        {/* White keys */}
        <div className="flex w-full h-full gap-[2px]">
          {whiteKeys.map(note => {
            const pc = midiNoteToPC(note)
            const isHighlighted = highlightSet.has(pc)
            const isActive = activeNotes.has(note)
            const isC = pc === 0
            return (
              <div
                key={note}
                className={`relative flex-1 rounded-b-md flex items-end justify-center pb-2
                  transition-colors duration-100
                  ${isActive
                    ? 'bg-keyred'
                    : isHighlighted
                      ? 'bg-accent'
                      : 'bg-keywhite'
                  }`}
                style={{ minWidth: 0 }}
              >
                {isC && (
                  <span className={`text-[10px] font-bold ${isActive || isHighlighted ? 'text-white' : 'text-gray-500'}`}>
                    C{Math.floor(note / 12) - 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Black keys */}
        <div className="absolute inset-x-0 top-0" style={{ height: '60%' }}>
          {blackKeyPositions.map(({ note, leftPct }) => {
            const pc = midiNoteToPC(note)
            const isHighlighted = highlightSet.has(pc)
            const isActive = activeNotes.has(note)
            return (
              <div
                key={note}
                className={`absolute rounded-b-md transition-colors duration-100
                  ${isActive
                    ? 'bg-keyred'
                    : isHighlighted
                      ? 'bg-accent'
                      : 'bg-keyblack'
                  }`}
                style={{
                  left: `${leftPct}%`,
                  width: `${blackKeyWidth}%`,
                  height: '100%',
                  boxShadow: isActive || isHighlighted
                    ? '0 0 12px rgba(239,68,68,0.4)'
                    : '0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
