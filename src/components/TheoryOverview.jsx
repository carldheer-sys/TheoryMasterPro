import { useState, useMemo } from 'react'
import Select from './Select'
import DroneToggle from './DroneToggle'
import RomanNumeral from './RomanNumeral'
import ChordLabel from './ChordLabel'
import {
  TONICS,
  MODES,
  DIATONIC_DEGREES,
  getDiatonicTriads,
  getDiatonicSevenths,
  tonicToPC,
  degreeToPitchClass,
  getChordPitchClasses,
  getChordLabel,
  spellNoteName,
  spellChordTones,
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

const VIEW_MODES = [
  { value: 'major-minor', label: 'Major/Minor' },
  { value: 'all-modes', label: 'All Modes' }
]

// Rows for major-minor view: Major, Natural Minor, Harmonic Minor
const THEORY_TONALITIES = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Natural Minor' },
  { value: 'harmonic-minor', label: 'Harmonic Minor' },
]

export default function TheoryOverview({ range, activeNotes, ensureAudioContext, droneVolume = 0, tonic, onTonicChange }) {
  const [tab, setTab] = useState('degrees')
  const [chordVariant, setChordVariant] = useState('triads')
  const [viewMode, setViewMode] = useState('major-minor')
  const [selectedCell, setSelectedCell] = useState(null) // { type: 'row'|'cell', tonality, degreeIndex? }

  const tonicPC = tonicToPC(tonic)

  // Fixed keyboard range: A3 → C6 (MIDI 57–84)
  const tonicRange = useMemo(() => ({ start: 57, end: 84 }), [])

  // Rows to display based on view mode
  const rows = viewMode === 'all-modes' ? MODES : THEORY_TONALITIES

  // Compute highlight MIDI notes (one per pitch class, closest to center of tonic range)
  const highlightNotes = useMemo(() => {
    if (!selectedCell) return new Set()
    const { tonality, degreeIndex, type } = selectedCell

    let pcs = []
    if (type === 'row') {
      const degrees = DIATONIC_DEGREES[tonality]
      pcs = degrees.map(d => degreeToPitchClass(tonicPC, d.semitones))
    } else if (type === 'cell' && degreeIndex != null) {
      const chords = chordVariant === 'sevenths'
        ? getDiatonicSevenths(tonality)
        : getDiatonicTriads(tonality)
      const chord = chords[degreeIndex]
      pcs = getChordPitchClasses(tonicPC, chord)
    }
    if (pcs.length === 0) return new Set()

    const result = new Set()

    if (type === 'row') {
      // For scale degrees: start from the first tonic note at/after C4 (MIDI 60),
      // then highlight each subsequent degree going up.
      // This ensures the left-most highlighted note is always the tonic.
      const degrees = DIATONIC_DEGREES[tonality]
      let currentMidi = 60 + ((tonicPC - 0 + 12) % 12) // first tonic at/after C4
      if (currentMidi < tonicRange.start) currentMidi += 12
      for (const d of degrees) {
        const noteMidi = currentMidi + d.semitones
        if (noteMidi <= tonicRange.end) {
          result.add(noteMidi)
        }
      }
    } else {
      // For chord cells: pick notes closest to center of keyboard
      const centerMidi = (tonicRange.start + tonicRange.end) / 2
      for (const pc of pcs) {
        let bestNote = null
        let bestDist = Infinity
        for (let n = tonicRange.start; n <= tonicRange.end; n++) {
          if (midiNoteToPC(n) === pc) {
            const dist = Math.abs(n - centerMidi)
            if (dist < bestDist) {
              bestDist = dist
              bestNote = n
            }
          }
        }
        if (bestNote != null) result.add(bestNote)
      }
    }
    return result
  }, [selectedCell, tonicPC, chordVariant, tonicRange.start, tonicRange.end])

  // Build degree data for the table
  const degreeData = useMemo(() => {
    return rows.map(({ value: tonality, label }) => {
      const degrees = DIATONIC_DEGREES[tonality]
      const notes = degrees.map(d => ({
        degree: d.degree,
        semitones: d.semitones,
        pc: degreeToPitchClass(tonicPC, d.semitones),
        name: spellNoteName(degreeToPitchClass(tonicPC, d.semitones), tonic, tonality)
      }))
      return { tonality, label, notes }
    })
  }, [tonicPC, tonic, rows])

  // Build chord data for the table
  const chordData = useMemo(() => {
    return rows.map(({ value: tonality, label }) => {
      const chords = chordVariant === 'sevenths'
        ? getDiatonicSevenths(tonality)
        : getDiatonicTriads(tonality)
      const cells = chords.map((chord, i) => ({
        index: i,
        roman: chord.roman,
        label: getChordLabel(tonicPC, chord, tonic, tonality),
        notes: spellChordTones(tonicPC, chord, tonic, tonality)
      }))
      return { tonality, label, cells }
    })
  }, [tonicPC, tonic, chordVariant, rows])

  const handleTonicChange = (v) => {
    onTonicChange(v)
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

  const handleViewModeChange = (v) => {
    setViewMode(v)
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

        {/* View Mode toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Modes</label>
          <div className="flex bg-bg-700 rounded-xl border border-bg-500 p-1 min-h-[44px]">
            {VIEW_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => handleViewModeChange(m.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                  ${viewMode === m.value
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-bg-600'
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

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

        {/* Drone toggle */}
        <DroneToggle tonic={tonic} ensureAudioContext={ensureAudioContext} droneVolume={droneVolume} />

        {/* Key display */}
        <div className="pb-2.5">
          <div className="text-sm text-gray-400">
            Key: <span className="text-accent-light font-bold music-notation">{tonic}</span>
            <span className="text-gray-500 ml-1">{viewMode === 'all-modes' ? 'All Modes' : 'Major/Minor'}</span>
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

      {/* Compact keyboard visualization (tonic-based range) */}
      <CompactKeyboard
        range={tonicRange}
        highlightNotes={highlightNotes}
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
                {degreeData[0].notes[i] && degreeData[0].notes[i].degree}
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
                  <div className="music-notation font-bold text-sm text-white">{note.degree}</div>
                  <div className="music-notation text-xs text-gray-400 mt-0.5">{note.name}</div>
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
                  <div className={`music-notation font-bold text-sm text-white`}>
                    <RomanNumeral roman={cell.roman} />
                  </div>
                  <div className="music-notation text-xs text-gray-400 mt-0.5"><ChordLabel label={cell.label} /></div>
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

function CompactKeyboard({ range, highlightNotes = new Set(), activeNotes }) {
  const notes = useMemo(() => generateMidiRange(range.start, range.end), [range.start, range.end])

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

  return (
    <div className="h-[140px] sm:h-[160px] flex-shrink-0 bg-bg-900 border-t border-bg-700 px-2 pb-2 pt-1 select-none">
      <div className="relative w-full h-full">
        {/* White keys */}
        <div className="flex w-full h-full gap-[2px]">
          {whiteKeys.map(note => {
            const pc = midiNoteToPC(note)
            const isHighlighted = highlightNotes.has(note)
            const isActive = activeNotes.has(note)
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
                {pc === 0 && (
                  <span className={`text-[10px] font-bold ${isActive || isHighlighted ? 'text-white' : 'text-gray-600'}`}>
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
            const isHighlighted = highlightNotes.has(note)
            const isActive = activeNotes.has(note)
            return (
              <div
                key={note}
                className={`absolute rounded-b-md transition-colors duration-100
                  ${isActive
                    ? 'bg-keyred'
                    : isHighlighted
                      ? 'bg-[#3d2d99]'
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
