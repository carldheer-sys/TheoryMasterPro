import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Select from './Select'
import MultiSelect from './MultiSelect'
import TonalitySelect from './TonalitySelect'
import DroneToggle from './DroneToggle'
import RomanNumeral from './RomanNumeral'
import ChordLabel from './ChordLabel'
import {
  TONICS,
  TONALITIES,
  getDiatonicTriadsWithHarmMinor,
  getDiatonicSeventhsWithHarmMinor,
  buildProgressionFromRomans,
  tonicToPC,
  getChordPitchClasses,
  getChordLabel,
  spellNoteName,
  spellChordTones,
  midiNoteToPC,
  getKeyDisplay
} from '../utils/musicTheory'
import { DEFAULT_PROGRESSIONS, filterProgressions, CHORD_TYPE_OPTIONS, NON_DIATONIC_SOURCES } from '../utils/progressions'

// Generate a random progression of N chords from the diatonic chord list
// No two consecutive chords are the same
function generateRandomProgression(chords, count) {
  if (chords.length === 0) return []
  const result = []
  let last = null
  for (let i = 0; i < count; i++) {
    const candidates = last ? chords.filter(c => c.roman !== last.roman) : [...chords]
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    result.push(pick)
    last = pick
  }
  return result
}

export default function ChordProgressionsPractice({ activeNotes, midiSupported, ensureAudioContext, autoAdvanceDelay = 600, holdOnCorrect = true, onClearAllNotes, droneVolume = 0, progressions = DEFAULT_PROGRESSIONS, tonic, effectiveTonic, tonality, onTonicChange, onTonalityChange, playNote, setRevealedNotes }) {
  // Settings
  const [chromaticism, setChromaticism] = useState('diatonic')
  const [chordTypes, setChordTypes] = useState(['triads', 'sevenths'])
  const [sources, setSources] = useState(NON_DIATONIC_SOURCES.map(s => s.value))
  const [progressionKey, setProgressionKey] = useState('vi – IV – I – V')
  const [randomCount, setRandomCount] = useState(4)
  const [includeHarmMinor, setIncludeHarmMinor] = useState(true)

  // Practice state
  const [hasStarted, setHasStarted] = useState(false)
  const [progression, setProgression] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flashGreen, setFlashGreen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const lastCheckedKeyRef = useRef('')

  const tonicPC = tonicToPC(effectiveTonic)

  // Available progressions for current settings
  const availableProgressions = useMemo(() => {
    return filterProgressions(progressions, { tonality, chromaticism, chordTypes, sources })
  }, [progressions, tonality, chromaticism, chordTypes, sources])

  // Progression dropdown options
  const progressionOptions = useMemo(() => {
    const opts = [
      { value: 'random', label: 'Random' },
      ...availableProgressions.map(p => ({ value: p.label, label: p.label, favorite: p.favorite }))
    ]
    return opts
  }, [availableProgressions])

  // Update progression key when available progressions change
  useEffect(() => {
    if (progressionKey !== 'random' && !availableProgressions.some(p => p.label === progressionKey)) {
      setProgressionKey(availableProgressions[0]?.label || 'random')
    }
  }, [availableProgressions, progressionKey])

  // Current chord
  const currentChord = progression[currentIdx] || null
  const targetPCs = useMemo(() => {
    if (!currentChord) return null
    return new Set(getChordPitchClasses(tonicPC, currentChord))
  }, [tonicPC, currentChord])
  const currentChordLabel = useMemo(() => {
    if (!currentChord) return null
    const spellMode = currentChord.isBorrowed ? currentChord.sourceMode : tonality
    return getChordLabel(tonicPC, currentChord, effectiveTonic, spellMode)
  }, [tonicPC, currentChord, effectiveTonic, tonality])
  const currentNoteNames = useMemo(() => {
    if (!currentChord) return null
    const spellMode = currentChord.isBorrowed ? currentChord.sourceMode : tonality
    return spellChordTones(tonicPC, currentChord, effectiveTonic, spellMode)
  }, [tonicPC, currentChord, effectiveTonic, tonality])

  // Build the progression when starting
  const handleGenerate = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    let prog
    if (progressionKey === 'random') {
      const chords = chordTypes.flatMap(type =>
        type === 'sevenths' ? getDiatonicSeventhsWithHarmMinor(tonality, includeHarmMinor) : getDiatonicTriadsWithHarmMinor(tonality, includeHarmMinor)
      )
      prog = generateRandomProgression(chords, randomCount)
    } else {
      const def = availableProgressions.find(p => p.label === progressionKey)
      prog = def ? buildProgressionFromRomans(tonality, def.chordType, def.romans, includeHarmMinor) : []
    }
    setProgression(prog)
    setCurrentIdx(0)
    setFlashGreen(false)
    setRevealed(false)
    setHasStarted(true)
    lastCheckedKeyRef.current = ''
    if (onClearAllNotes) onClearAllNotes()
    if (setRevealedNotes) setRevealedNotes(new Set())
  }, [ensureAudioContext, progressionKey, randomCount, chordTypes, tonality, includeHarmMinor, availableProgressions, onClearAllNotes, setRevealedNotes])

  // Watch active notes and check against current chord
  useEffect(() => {
    if (!hasStarted || !currentChord || !targetPCs || flashGreen || revealed) return

    const activePCs = new Set()
    for (const note of activeNotes) {
      activePCs.add(midiNoteToPC(note))
    }

    if (activePCs.size === 0) {
      lastCheckedKeyRef.current = ''
      return
    }

    const configKey = Array.from(activePCs).sort((a, b) => a - b).join(',')
    if (configKey === lastCheckedKeyRef.current) return
    lastCheckedKeyRef.current = configKey

    const hasExtra = Array.from(activePCs).some(pc => !targetPCs.has(pc))
    const allPresent = Array.from(targetPCs).every(pc => activePCs.has(pc))

    if (allPresent && !hasExtra) {
      // Correct! Flash green, then advance
      setFlashGreen(true)
      if (!holdOnCorrect) {
        if (onClearAllNotes) onClearAllNotes()
        setTimeout(() => {
          setFlashGreen(false)
          setCurrentIdx(idx => (idx + 1) % progression.length)
          setRevealed(false)
          lastCheckedKeyRef.current = ''
          if (setRevealedNotes) setRevealedNotes(new Set())
        }, autoAdvanceDelay)
      }
      // If holdOnCorrect, the release-watcher effect will handle advancing
    }
  }, [activeNotes, currentChord, targetPCs, flashGreen, revealed, hasStarted, progression.length, autoAdvanceDelay, holdOnCorrect, onClearAllNotes])

  // Hold-on-correct: when flashGreen and all notes released, advance after delay
  useEffect(() => {
    if (!holdOnCorrect || !flashGreen) return
    if (activeNotes.size > 0) return
    const timer = setTimeout(() => {
      setFlashGreen(false)
      setCurrentIdx(idx => (idx + 1) % progression.length)
      setRevealed(false)
      lastCheckedKeyRef.current = ''
      if (onClearAllNotes) onClearAllNotes()
      if (setRevealedNotes) setRevealedNotes(new Set())
    }, autoAdvanceDelay)
    return () => clearTimeout(timer)
  }, [holdOnCorrect, flashGreen, activeNotes, progression.length, autoAdvanceDelay, onClearAllNotes, setRevealedNotes])

  // Press-and-hold NEXT: press reveals answer, release advances after delay
  const advanceTimerRef = useRef(null)

  const handlePress = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    if (hasStarted && !flashGreen && !revealed) {
      setRevealed(true)
      // Play all chord notes (audio only) and visualize on keyboard
      if (currentChord && targetPCs) {
        const notesToReveal = new Set()
        targetPCs.forEach(pc => {
          const midiNote = pc + 60
          if (playNote) playNote(midiNote)
          notesToReveal.add(midiNote)
        })
        if (setRevealedNotes) setRevealedNotes(notesToReveal)
      }
    } else if (!hasStarted) {
      handleGenerate()
    }
  }, [handleGenerate, hasStarted, flashGreen, revealed, ensureAudioContext, currentChord, targetPCs, playNote, setRevealedNotes])

  const handleRelease = useCallback(() => {
    if (hasStarted && (revealed || flashGreen)) {
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null
        setRevealed(false)
        setFlashGreen(false)
        setCurrentIdx(idx => (idx + 1) % progression.length)
        lastCheckedKeyRef.current = ''
        if (onClearAllNotes) onClearAllNotes()
        if (setRevealedNotes) setRevealedNotes(new Set())
      }, autoAdvanceDelay)
    }
  }, [hasStarted, revealed, flashGreen, progression.length, autoAdvanceDelay, onClearAllNotes, setRevealedNotes])

  // Spacebar behavior: press-and-hold same as NEXT button
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.key === ' ') && !e.repeat) {
        e.preventDefault()
        handlePress()
      }
    }
    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleRelease()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handlePress, handleRelease])

  // Reset when settings change
  const handleSettingChange = () => {
    if (hasStarted) {
      setHasStarted(false)
      setProgression([])
      setCurrentIdx(0)
      setFlashGreen(false)
      setRevealed(false)
      lastCheckedKeyRef.current = ''
      if (onClearAllNotes) onClearAllNotes()
    }
  }

  const handleTonicChange = (v) => {
    onTonicChange(v)
    handleSettingChange()
  }
  const handleTonalityChange = (v) => {
    onTonalityChange(v)
    handleSettingChange()
  }
  const handleChordTypesChange = (v) => { setChordTypes(v); handleSettingChange() }
  const handleChromaticismChange = (v) => { setChromaticism(v); handleSettingChange() }
  const handleSourcesChange = (v) => { setSources(v); handleSettingChange() }
  const handleProgressionChange = (v) => { setProgressionKey(v); handleSettingChange() }

  const handleRandomCountChange = (v) => {
    const n = Math.max(1, Math.floor(Number(v) || 1))
    setRandomCount(n)
    handleSettingChange()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Settings bar */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4 px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
        {/* Key section */}
        <div className="flex items-end gap-3">
          <Select
            label="Tonic"
            value={tonic}
            onChange={handleTonicChange}
            options={[{ value: 'random', label: tonic === 'random' ? `Random → ${effectiveTonic}` : 'Random' }, ...TONICS.map(t => ({ value: t, label: t }))]}
          />
          <TonalitySelect
            label="Tonality"
            value={tonality}
            onChange={handleTonalityChange}
            includeHarmMinor={includeHarmMinor}
            onHarmMinorChange={(v) => { setIncludeHarmMinor(v); handleSettingChange() }}
          />
        </div>

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Chromaticism: Diatonic / Non-Diatonic */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Chromaticism</label>
          <div className="flex gap-1 bg-bg-800 rounded-xl border border-bg-500 p-1">
            {['diatonic', 'non-diatonic'].map(c => (
              <button
                key={c}
                onClick={() => handleChromaticismChange(c)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors
                  ${chromaticism === c ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-bg-600'}`}
              >
                {c === 'non-diatonic' ? 'Non-Diatonic' : 'Diatonic'}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Chord Types: MultiSelect */}
        <MultiSelect
          label="Chord Types"
          values={chordTypes}
          onChange={handleChordTypesChange}
          options={CHORD_TYPE_OPTIONS}
        />

        {/* Sources: MultiSelect (only when non-diatonic) */}
        {chromaticism === 'non-diatonic' && (
          <>
            <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>
            <MultiSelect
              label="Sources"
              values={sources}
              onChange={handleSourcesChange}
              options={NON_DIATONIC_SOURCES}
            />
          </>
        )}

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Progression */}
        <Select
          label="Progression"
          value={progressionKey}
          onChange={handleProgressionChange}
          options={progressionOptions}
        />

        {/* Random count input — shown when Random is selected */}
        {progressionKey === 'random' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Chords</label>
            <div className="flex items-stretch">
              <button
                onClick={() => handleRandomCountChange(randomCount - 1)}
                className="px-3 rounded-l-xl border border-bg-500 bg-bg-700 text-white hover:bg-bg-600 transition-colors text-sm font-bold"
              >
                ▾
              </button>
              <input
                type="number"
                min={1}
                step={1}
                value={randomCount}
                onChange={(e) => handleRandomCountChange(e.target.value)}
                className="w-16 text-center bg-bg-700 text-white text-sm font-semibold px-2 py-3 border-y border-bg-500 focus:outline-none focus:border-accent min-h-[44px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => handleRandomCountChange(randomCount + 1)}
                className="px-3 rounded-r-xl border border-bg-500 bg-bg-700 text-white hover:bg-bg-600 transition-colors text-sm font-bold"
              >
                ▴
              </button>
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Drone toggle */}
        <DroneToggle tonic={effectiveTonic} ensureAudioContext={ensureAudioContext} droneVolume={droneVolume} />
      </div>

      {/* Main display area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 gap-6">
        {!hasStarted ? (
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              Key: <span className="text-accent-light font-bold music-notation">{getKeyDisplay(effectiveTonic, tonality)}</span>
              {' · '}
              <span className="capitalize">{chromaticism === 'non-diatonic' ? 'Non-Diatonic' : 'Diatonic'}</span>
              {' · '}
              <span className="capitalize">{progressionKey}</span>
            </div>
            <div className="text-gray-600 text-sm">
              Press START to start the progression
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
            {/* Key display */}
            <div className="text-gray-500 text-sm">
              Key: <span className="text-accent-light font-bold music-notation">{getKeyDisplay(effectiveTonic, tonality)}</span>
            </div>

            {/* Progression display */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {progression.map((chord, idx) => {
                const isCurrent = idx === currentIdx
                const isPast = idx < currentIdx
                const spellMode = chord.isBorrowed ? chord.sourceMode : tonality
                const label = getChordLabel(tonicPC, chord, effectiveTonic, spellMode)
                const isHarmMinor = chord.isHarmonicMinor === true
                const isBorrowed = chord.isBorrowed === true
                const isSecondary = chord.isSecondary === true
                const isFreeChoice = chord.isFreeChoice === true || chord.isOther === true
                return (
                  <div key={idx} className="flex items-center gap-3 sm:gap-4">
                    {idx > 0 && <span className="text-gray-600 text-2xl">→</span>}
                    <div
                      className={`music-notation px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-2xl sm:text-3xl font-extrabold transition-all duration-300
                        ${isCurrent && flashGreen ? 'bg-green-500/20 text-green-400 border-2 border-green-400 scale-110'
                          : isCurrent ? 'bg-accent/20 text-accent-light border-2 border-accent scale-110'
                          : isPast ? 'bg-bg-700/50 text-gray-600 border-2 border-transparent'
                          : isHarmMinor || isBorrowed ? 'bg-bg-700 text-blue-400 border-2 border-transparent'
                          : isSecondary ? 'bg-bg-700 text-keyred border-2 border-transparent'
                          : isFreeChoice ? 'bg-bg-700 text-purple-400 border-2 border-transparent'
                          : 'bg-bg-700 text-gray-300 border-2 border-transparent'
                        }`}
                    >
                      <RomanNumeral roman={chord.roman} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Current chord details */}
            <div className="h-12 flex flex-col items-center gap-1">
              {flashGreen ? (
                <div className="text-green-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="music-notation"><ChordLabel label={currentChordLabel} /></span> (<span className="music-notation whitespace-nowrap">{currentNoteNames?.map((n, i) => <span key={i}>{i > 0 && '–'}{n}</span>)}</span>)
                </div>
              ) : revealed ? (
                <div className="text-yellow-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Answer: <span className="music-notation"><ChordLabel label={currentChordLabel} /></span> (<span className="music-notation whitespace-nowrap">{currentNoteNames?.map((n, i) => <span key={i}>{i > 0 && '–'}{n}</span>)}</span>)
                </div>
              ) : (
                <div className="text-gray-600 text-xs text-center">
                  Play all chord notes simultaneously on your MIDI keyboard or hold Cmd/Ctrl while clicking keys
                </div>
              )}
            </div>
          </div>
        )}

        {/* MIDI status warning */}
        {!midiSupported && (
          <div className="text-yellow-500/60 text-xs text-center max-w-md">
            MIDI input not available on this device. Hold Cmd/Ctrl and tap the on-screen keys to practice chords.
          </div>
        )}
      </div>

      {/* Generate / Next button */}
      <div className="flex justify-center px-4 pb-4 sm:pb-6">
        <button
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={(e) => { e.preventDefault(); handlePress() }}
          onTouchEnd={(e) => { e.preventDefault(); handleRelease() }}
          className={`px-12 py-4 rounded-2xl text-lg font-extrabold tracking-wide
            transition-all duration-200 active:scale-95 min-h-[56px] min-w-[200px] select-none
            ${hasStarted
            ? 'bg-bg-600 text-white hover:bg-bg-500 border border-bg-500'
            : 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/30'
            }`}
        >
          {hasStarted ? 'NEXT →' : 'START'}
        </button>
      </div>
    </div>
  )
}
