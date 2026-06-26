import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Select from './Select'
import MultiSelect from './MultiSelect'
import DroneToggle from './DroneToggle'
import {
  TONICS,
  TONALITIES,
  getDiatonicTriads,
  getDiatonicSevenths,
  pickRandomChord,
  pickInterchangeChord,
  tonicToPC,
  getChordPitchClasses,
  getChordLabel,
  getChordRootName,
  spellNoteName,
  midiNoteToPC,
  getKeyDisplay,
  displayNotation
} from '../utils/musicTheory'

const CHORD_TYPE_OPTIONS = [
  { value: 'triads', label: 'Triads' },
  { value: 'sevenths', label: 'Sevenths' }
]

const CHROMATICISM_OPTIONS = [
  { value: 'diatonic', label: 'Diatonic' },
  { value: 'modal-interchange', label: 'Modal Interchange' }
]

const INTERCHANGE_MODE_OPTIONS = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' }
]

const MODE_LABELS = { major: 'Major', minor: 'Minor' }

/**
 * ChordsPractice — practice identifying diatonic chords by ear.
 *
 * Flow:
 *   1. User selects Key (tonic + tonality), Chord Types, and Chromaticism
 *   2. Click GENERATE → random Roman numeral appears
 *   3. User plays all chord notes simultaneously on MIDI keyboard or clicks keys
 *   4. App checks: all chord pitch classes present, no extra pitch classes
 *   5. Correct → auto-advance after delay
 */
export default function ChordsPractice({ activeNotes, midiSupported, ensureAudioContext, autoAdvanceDelay = 600, holdOnCorrect = true, onClearAllNotes, droneVolume = 0, tonic, effectiveTonic, tonality, onTonicChange, onTonalityChange, mentalPractice = false, onMentalPracticeChange, simulateNoteOn }) {
  // Settings
  const [selectedChordTypes, setSelectedChordTypes] = useState(['triads'])
  const [chromaticism, setChromaticism] = useState('diatonic')
  const [borrowedModes, setBorrowedModes] = useState([])
  const [interchangeProbability, setInterchangeProbability] = useState(0.7)

  // Practice state
  const [hasStarted, setHasStarted] = useState(false)
  const [currentChord, setCurrentChord] = useState(null)
  const [lastChord, setLastChord] = useState(null)
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong' | 'revealed'
  const [score, setScore] = useState({ correct: 0, answered: 0 })

  // Track the last checked configuration to avoid duplicate checks
  const lastCheckedKeyRef = useRef('')

  // Build combined chord list from all selected chord types
  const chords = useMemo(() => {
    const lists = selectedChordTypes.map(type =>
      type === 'sevenths' ? getDiatonicSevenths(tonality) : getDiatonicTriads(tonality)
    )
    return lists.flat()
  }, [selectedChordTypes, tonality])
  const tonicPC = tonicToPC(effectiveTonic)
  const targetPCs = useMemo(() => {
    if (!currentChord) return null
    return new Set(getChordPitchClasses(tonicPC, currentChord))
  }, [tonicPC, currentChord])
  const targetChordLabel = useMemo(() => {
    if (!currentChord) return null
    return getChordLabel(tonicPC, currentChord, effectiveTonic, tonality)
  }, [tonicPC, currentChord, effectiveTonic, tonality])
  const targetNoteNames = useMemo(() => {
    if (!currentChord) return null
    const pcs = getChordPitchClasses(tonicPC, currentChord)
    return pcs.map(pc => spellNoteName(pc, effectiveTonic, tonality))
  }, [tonicPC, currentChord, effectiveTonic, tonality])

  // Generate a new chord
  const pickNextChord = useCallback((lastChordArg) => {
    if (chromaticism === 'modal-interchange') {
      return pickInterchangeChord({
        tonicPC,
        tonality,
        selectedChordTypes,
        borrowedModes,
        probability: interchangeProbability,
        lastChord: lastChordArg,
      })
    }
    return pickRandomChord(chords, lastChordArg)
  }, [chromaticism, tonicPC, tonality, selectedChordTypes, borrowedModes, interchangeProbability, chords])

  const handleGenerate = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    const pick = pickNextChord(lastChord)
    setCurrentChord(pick)
    setLastChord(pick)
    setResult(null)
    setHasStarted(true)
    lastCheckedKeyRef.current = ''
    if (onClearAllNotes) onClearAllNotes()
  }, [pickNextChord, lastChord, ensureAudioContext, onClearAllNotes])

  // Watch active notes and check against target chord
  useEffect(() => {
    if (!currentChord || !targetPCs || result === 'correct' || result === 'revealed' || mentalPractice) return

    // Extract unique pitch classes from active notes
    const activePCs = new Set()
    for (const note of activeNotes) {
      activePCs.add(midiNoteToPC(note))
    }

    if (activePCs.size === 0) {
      lastCheckedKeyRef.current = ''
      return
    }

    // Create a key for this configuration to avoid re-checking
    const configKey = Array.from(activePCs).sort((a, b) => a - b).join(',')
    if (configKey === lastCheckedKeyRef.current) return
    lastCheckedKeyRef.current = configKey

    // Check for extra notes (pitch classes not in the chord)
    const hasExtra = Array.from(activePCs).some(pc => !targetPCs.has(pc))
    // Check if all chord tones are present
    const allPresent = Array.from(targetPCs).every(pc => activePCs.has(pc))

    if (allPresent && !hasExtra) {
      // Correct! All chord tones present, no extras
      setResult('correct')
      setScore(s => ({ correct: s.correct + 1, answered: s.answered + 1 }))
      if (!holdOnCorrect) {
        setTimeout(() => {
          const nextPick = pickNextChord(currentChord)
          setCurrentChord(nextPick)
          setLastChord(nextPick)
          setResult(null)
          lastCheckedKeyRef.current = ''
          if (onClearAllNotes) onClearAllNotes()
        }, autoAdvanceDelay)
      }
      // If holdOnCorrect, the release-watcher effect will handle advancing
    } else if (hasExtra) {
      // Wrong: there are notes not in the chord
      setResult('wrong')
      setScore(s => ({ ...s, answered: s.answered + 1 }))
      // Clear notes immediately so the effect doesn't re-trigger
      if (onClearAllNotes) onClearAllNotes()
      // Reset after delay so user can try again
      setTimeout(() => {
        setResult(null)
        lastCheckedKeyRef.current = ''
      }, 600)
    }
    // If subset (all notes are chord tones but not all present) → waiting, do nothing
  }, [activeNotes, currentChord, targetPCs, result, pickNextChord, autoAdvanceDelay, holdOnCorrect, onClearAllNotes, mentalPractice])

  // Hold-on-correct: when result is 'correct' and all notes released, advance after delay
  useEffect(() => {
    if (!holdOnCorrect || result !== 'correct') return
    if (activeNotes.size > 0) return
    const timer = setTimeout(() => {
      const nextPick = pickNextChord(currentChord)
      setCurrentChord(nextPick)
      setLastChord(nextPick)
      setResult(null)
      lastCheckedKeyRef.current = ''
      if (onClearAllNotes) onClearAllNotes()
    }, autoAdvanceDelay)
    return () => clearTimeout(timer)
  }, [holdOnCorrect, result, activeNotes, currentChord, pickNextChord, autoAdvanceDelay, onClearAllNotes])

  // Press-and-hold NEXT: press reveals answer, release advances after delay
  const advanceTimerRef = useRef(null)

  const handlePress = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    if (hasStarted && currentChord && result === null) {
      setResult('revealed')
      if (mentalPractice) {
        // Play all chord notes
        const pcs = getChordPitchClasses(tonicPC, currentChord)
        pcs.forEach(pc => {
          if (simulateNoteOn) simulateNoteOn(pc + 60)
        })
      } else {
        setScore(s => ({ ...s, answered: s.answered + 1 }))
      }
    } else if (!hasStarted) {
      handleGenerate()
    }
  }, [handleGenerate, hasStarted, currentChord, result, ensureAudioContext, mentalPractice, tonicPC, simulateNoteOn])

  const handleRelease = useCallback(() => {
    if (hasStarted && result === 'revealed') {
      if (mentalPractice) {
        handleGenerate()
      } else {
        advanceTimerRef.current = setTimeout(() => {
          advanceTimerRef.current = null
          handleGenerate()
        }, autoAdvanceDelay)
      }
    }
  }, [handleGenerate, hasStarted, result, autoAdvanceDelay, mentalPractice])

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

  // Reset practice when key settings change
  const handleSettingChange = () => {
    if (hasStarted) {
      setHasStarted(false)
      setCurrentChord(null)
      setResult(null)
      setScore({ correct: 0, answered: 0 })
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
    setBorrowedModes(prev => prev.filter(m => m !== v))
    handleSettingChange()
  }
  const handleChordTypesChange = (v) => { setSelectedChordTypes(v); handleSettingChange() }
  const handleChromaticismChange = (v) => { setChromaticism(v); handleSettingChange() }
  const handleBorrowedModesChange = (v) => {
    setBorrowedModes(v.filter(m => m !== tonality))
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
            options={[{ value: 'random', label: tonic === 'random' ? `Random → ${displayNotation(effectiveTonic)}` : 'Random' }, ...TONICS.map(t => ({ value: t, label: displayNotation(t) }))]}
          />
          <Select
            label="Tonality"
            value={tonality}
            onChange={handleTonalityChange}
            options={TONALITIES}
          />
        </div>

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Chord Types */}
        <MultiSelect
          label="Chord Types"
          values={selectedChordTypes}
          onChange={handleChordTypesChange}
          options={CHORD_TYPE_OPTIONS}
        />

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Chromaticism */}
        <Select
          label="Chromaticism"
          value={chromaticism}
          onChange={handleChromaticismChange}
          options={CHROMATICISM_OPTIONS}
        />

        {chromaticism === 'modal-interchange' && (
          <>
            <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

            {/* Borrowed Modes */}
            <MultiSelect
              label="Borrowed Modes"
              values={[tonality, ...borrowedModes]}
              onChange={handleBorrowedModesChange}
              options={INTERCHANGE_MODE_OPTIONS.map(opt => ({
                ...opt,
                disabled: opt.value === tonality,
              }))}
            />

            {/* Probability slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Main: {Math.round(interchangeProbability * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={interchangeProbability}
                onChange={(e) => setInterchangeProbability(parseFloat(e.target.value))}
                className="w-32 sm:w-40 h-[44px] cursor-pointer accent-accent"
              />
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Drone toggle */}
        <DroneToggle tonic={effectiveTonic} ensureAudioContext={ensureAudioContext} droneVolume={droneVolume} />

        {/* Mental Practice toggle */}
        <button
          onClick={() => onMentalPracticeChange(!mentalPractice)}
          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors min-h-[40px] sm:min-h-[44px] whitespace-nowrap
            ${mentalPractice
              ? 'bg-accent text-white'
              : 'bg-bg-700 text-gray-300 hover:bg-bg-600 hover:text-white'
            }`}
        >
          <span className="hidden sm:inline">Mental Practice</span>
          <span className="sm:hidden">Mental</span>
        </button>

        {/* Score display (hidden in mental practice mode) */}
        {hasStarted && !mentalPractice && (
          <div className="flex items-center gap-4 pb-2.5">
            <div className="text-sm text-gray-400">
              Score: <span className="text-white font-bold">{score.correct}</span>
              <span className="text-gray-600"> / </span>
              <span className="text-white font-bold">{score.answered}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main display area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 gap-6">
        {!hasStarted ? (
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              Key: <span className="text-accent-light font-bold music-notation">{getKeyDisplay(effectiveTonic, tonality)}</span>
              {' · '}
              <span className="capitalize">{selectedChordTypes.join(' + ')}</span>
              {' · '}
              <span className="capitalize">{chromaticism}</span>
            </div>
            <div className="text-gray-600 text-sm">
              Press START to start practicing chords
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Key display */}
            <div className="text-gray-500 text-sm">
              Key: <span className="text-accent-light font-bold music-notation">{getKeyDisplay(effectiveTonic, tonality)}</span>
            </div>

            {/* Roman numeral display */}
            <div
              className={`music-notation text-7xl sm:text-8xl font-extrabold transition-all duration-300
                ${result === 'correct' ? 'text-green-400 correct-pulse' : ''}
                ${result === 'wrong' ? 'text-keyred shake' : ''}
                ${result === 'revealed' ? 'text-yellow-400 correct-pulse' : ''}
                ${result === null ? (currentChord?.isBorrowed ? 'text-blue-400' : 'text-white') : ''}
              `}
            >
              {displayNotation(currentChord?.roman)}
            </div>
            {currentChord?.isBorrowed && (
              <div className={`text-xl sm:text-2xl font-bold transition-all duration-300
                ${result === 'correct' ? 'text-green-400' : ''}
                ${result === 'wrong' ? 'text-keyred' : ''}
                ${result === 'revealed' ? 'text-yellow-400' : ''}
                ${result === null ? 'text-blue-400' : ''}
              `}>
                ({MODE_LABELS[currentChord.sourceMode]})
              </div>
            )}

            {/* Feedback */}
            <div className="h-12 flex flex-col items-center gap-1">
              {result === 'correct' && (
                <div className="text-green-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Correct! That was <span className="music-notation">{displayNotation(targetChordLabel)}</span> (<span className="music-notation">{targetNoteNames?.map(displayNotation).join('–')}</span>)
                </div>
              )}
              {result === 'revealed' && (
                <div className="text-yellow-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Answer: <span className="music-notation">{displayNotation(targetChordLabel)}</span> (<span className="music-notation">{targetNoteNames?.map(displayNotation).join('–')}</span>)
                </div>
              )}
              {result === 'wrong' && (
                <div className="text-keyred text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Not quite — try again
                </div>
              )}
              {result === null && hasStarted && (
                <div className="text-gray-600 text-xs text-center">
                  {mentalPractice ? 'Press and hold NEXT to hear the chord' : 'Play all chord notes simultaneously on your MIDI keyboard or hold Cmd/Ctrl while clicking keys'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MIDI status warning for unsupported devices (hidden in mental practice) */}
        {!midiSupported && !mentalPractice && (
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
