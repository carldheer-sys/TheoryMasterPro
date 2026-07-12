import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Select from './Select'
import TonalitySelect from './TonalitySelect'
import MultiSelect from './MultiSelect'
import GroupedMultiSelect from './GroupedMultiSelect'
import DroneToggle from './DroneToggle'
import RomanNumeral from './RomanNumeral'
import ChordLabel from './ChordLabel'
import {
  TONICS,
  TONALITIES,
  getDiatonicTriadsWithHarmMinor,
  getDiatonicSeventhsWithHarmMinor,
  pickRandomChord,
  pickInterchangeChord,
  pickSecondaryChord,
  getSecondaryChordTarget,
  getAvailableSecondaryChords,
  SECONDARY_CHORDS,
  tonicToPC,
  getChordPitchClasses,
  getChordLabel,
  getChordRootName,
  spellNoteName,
  midiNoteToPC,
  getKeyDisplay,
  assignInversion,
  getBassPC,
  getBassScaleDegree,
  getFiguredBass
} from '../utils/musicTheory'

const CHORD_TYPE_OPTIONS = [
  { value: 'triads', label: 'Triads' },
  { value: 'sevenths', label: 'Sevenths' }
]

const CHROMATICISM_OPTIONS = [
  { value: 'diatonic', label: 'Diatonic' },
  { value: 'modal-interchange', label: 'Modal Interchange' },
  { value: 'secondary-chords', label: 'Secondary Chords' }
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
export default function ChordsPractice({ activeNotes, midiSupported, ensureAudioContext, autoAdvanceDelay = 300, holdOnCorrect = true, onClearAllNotes, droneVolume = 0, tonic, effectiveTonic, tonality, onTonicChange, onTonalityChange, playNote, setRevealedNotes }) {
  // Settings
  const [selectedChordTypes, setSelectedChordTypes] = useState(['triads'])
  const [chromaticism, setChromaticism] = useState('diatonic')
  const [borrowedModes, setBorrowedModes] = useState([])
  const [interchangeProbability, setInterchangeProbability] = useState(0.7)
  const [selectedSecondaryChords, setSelectedSecondaryChords] = useState([])
  const [secondaryProbability, setSecondaryProbability] = useState(0.7)
  const [includeHarmMinor, setIncludeHarmMinor] = useState(true)
  const [includeInversions, setIncludeInversions] = useState(false)
  const [inversionNotation, setInversionNotation] = useState('slash') // 'slash' | 'figured-bass'

  // Practice state
  const [hasStarted, setHasStarted] = useState(false)
  const [currentChord, setCurrentChord] = useState(null)
  const [lastChord, setLastChord] = useState(null)
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong' | 'revealed'
  const [score, setScore] = useState({ correct: 0, answered: 0 })

  // Track the last checked configuration to avoid duplicate checks
  const lastCheckedKeyRef = useRef('')
  // Track pending target chord after a secondary chord (must follow with its diatonic target)
  const pendingTargetRef = useRef(null)
  // Track the last secondary chord ID used (to prevent same secondary chord twice in a row)
  const lastSecondaryIdRef = useRef(null)

  // Build combined chord list from all selected chord types
  const chords = useMemo(() => {
    const lists = selectedChordTypes.map(type =>
      type === 'sevenths' ? getDiatonicSeventhsWithHarmMinor(tonality, includeHarmMinor) : getDiatonicTriadsWithHarmMinor(tonality, includeHarmMinor)
    )
    return lists.flat()
  }, [selectedChordTypes, tonality, includeHarmMinor])
  const tonicPC = tonicToPC(effectiveTonic)
  const targetPCs = useMemo(() => {
    if (!currentChord) return null
    return new Set(getChordPitchClasses(tonicPC, currentChord))
  }, [tonicPC, currentChord])
  const targetChordLabel = useMemo(() => {
    if (!currentChord) return null
    const spellMode = currentChord.isBorrowed ? currentChord.sourceMode : tonality
    return getChordLabel(tonicPC, currentChord, effectiveTonic, spellMode)
  }, [tonicPC, currentChord, effectiveTonic, tonality])
  const isHarmonicMinorChord = currentChord?.isHarmonicMinor === true
  const targetNoteNames = useMemo(() => {
    if (!currentChord) return null
    const spellMode = currentChord.isBorrowed ? currentChord.sourceMode : tonality
    const pcs = getChordPitchClasses(tonicPC, currentChord)
    return pcs.map(pc => spellNoteName(pc, effectiveTonic, spellMode))
  }, [tonicPC, currentChord, effectiveTonic, tonality])

  // Inversion display: figured bass or slash notation
  const displayFiguredBass = useMemo(() => {
    if (!currentChord || !includeInversions || currentChord.inversion == null) return null
    return getFiguredBass(currentChord, currentChord.inversion)
  }, [currentChord, includeInversions])

  const displayBassDegree = useMemo(() => {
    if (!currentChord || !includeInversions || currentChord.inversion == null || currentChord.inversion === 0) return null
    return getBassScaleDegree(tonicPC, currentChord, currentChord.inversion)
  }, [tonicPC, currentChord, includeInversions])

  // Bass note pitch class for inversion checking.
  // When inversions are enabled, we ALWAYS check the bass note — even for root position
  // (inversion=0), the lowest note must be the root.
  const targetBassPC = useMemo(() => {
    if (!currentChord || !includeInversions || currentChord.inversion == null) return null
    return getBassPC(tonicPC, currentChord, currentChord.inversion)
  }, [tonicPC, currentChord, includeInversions])

  // Build grouped options for secondary chords dropdown (filtered by tonality)
  const secondaryChordGroups = useMemo(() => {
    const available = getAvailableSecondaryChords(tonality)
    const dominants = available.filter(sc => sc.type === 'dominant')
    const leadingTones = available.filter(sc => sc.type === 'leading-tone')
    const groups = []
    if (dominants.length > 0) {
      groups.push({
        label: 'Secondary Dominants',
        options: dominants.map(sc => ({
          value: sc.id,
          label: `${sc.label} (${sc.equivalentRoman})`,
        })),
      })
    }
    if (leadingTones.length > 0) {
      groups.push({
        label: 'Secondary Leading-Tone Chords',
        options: leadingTones.map(sc => ({
          value: sc.id,
          label: `${sc.label} (${sc.equivalentRoman})`,
        })),
      })
    }
    return groups
  }, [tonality])

  // Generate a new chord
  const pickNextChord = useCallback((lastChordArg) => {
    // If there's a pending target from a secondary chord, return it
    if (pendingTargetRef.current) {
      const target = pendingTargetRef.current
      pendingTargetRef.current = null
      return target
    }

    if (chromaticism === 'modal-interchange') {
      return pickInterchangeChord({
        tonicPC,
        tonality,
        selectedChordTypes,
        borrowedModes,
        probability: interchangeProbability,
        lastChord: lastChordArg,
        includeHarmMinor,
      })
    }
    if (chromaticism === 'secondary-chords') {
      const pick = pickSecondaryChord({
        tonicPC,
        tonality,
        selectedChordTypes,
        selectedSecondaryChords: selectedSecondaryChords
          .map(id => SECONDARY_CHORDS.find(sc => sc.id === id))
          .filter(Boolean),
        probability: secondaryProbability,
        lastChord: lastChordArg,
        lastSecondaryId: lastSecondaryIdRef.current,
        includeHarmMinor,
      })
      if (pick.isSecondary) {
        lastSecondaryIdRef.current = pick.id
        const targetChord = getSecondaryChordTarget(pick, tonality, selectedChordTypes)
        if (targetChord) {
          pendingTargetRef.current = { ...targetChord, sourceMode: tonality, isSecondary: false }
        }
      } else {
        lastSecondaryIdRef.current = null
      }
      return pick
    }
    return pickRandomChord(chords, lastChordArg)
  }, [chromaticism, tonicPC, tonality, selectedChordTypes, borrowedModes, interchangeProbability, selectedSecondaryChords, secondaryProbability, chords, includeHarmMinor])

  const handleGenerate = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    const pick = pickNextChord(lastChord)
    // Assign a random inversion if inversions are enabled
    if (includeInversions) {
      pick.inversion = assignInversion(pick)
    } else {
      pick.inversion = 0
    }
    setCurrentChord(pick)
    setLastChord(pick)
    setResult(null)
    setHasStarted(true)
    lastCheckedKeyRef.current = ''
    if (onClearAllNotes) onClearAllNotes()
    if (setRevealedNotes) setRevealedNotes(new Set())
  }, [pickNextChord, lastChord, ensureAudioContext, onClearAllNotes, setRevealedNotes, includeInversions])

  // Watch active notes and check against target chord
  useEffect(() => {
    if (!currentChord || !targetPCs || result === 'correct' || result === 'revealed') return

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
    // Include bass note info so different bass notes trigger re-check
    const configKey = Array.from(activePCs).sort((a, b) => a - b).join(',')
    if (configKey === lastCheckedKeyRef.current) return
    lastCheckedKeyRef.current = configKey

    // Check for extra notes (pitch classes not in the chord)
    const hasExtra = Array.from(activePCs).some(pc => !targetPCs.has(pc))
    // Check if all chord tones are present
    const allPresent = Array.from(targetPCs).every(pc => activePCs.has(pc))

    // If inversions are enabled and chord has a non-zero inversion,
    // the lowest played note must match the target bass pitch class
    let bassCorrect = true
    if (targetBassPC != null && activeNotes.size > 0) {
      const lowestNote = Math.min(...activeNotes)
      const lowestPC = midiNoteToPC(lowestNote)
      bassCorrect = lowestPC === targetBassPC
    }

    if (allPresent && !hasExtra && bassCorrect) {
      // Correct! All chord tones present, no extras, correct bass
      setResult('correct')
      setScore(s => ({ correct: s.correct + 1, answered: s.answered + 1 }))
      if (!holdOnCorrect) {
        setTimeout(() => {
          const nextPick = pickNextChord(currentChord)
          if (includeInversions) {
            nextPick.inversion = assignInversion(nextPick)
          } else {
            nextPick.inversion = 0
          }
          setCurrentChord(nextPick)
          setLastChord(nextPick)
          setResult(null)
          lastCheckedKeyRef.current = ''
          if (onClearAllNotes) onClearAllNotes()
        }, autoAdvanceDelay)
      }
      // If holdOnCorrect, the release-watcher effect will handle advancing
    } else if (hasExtra || (allPresent && !bassCorrect)) {
      // Wrong: there are notes not in the chord, or bass note is incorrect
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
  }, [activeNotes, currentChord, targetPCs, targetBassPC, result, pickNextChord, autoAdvanceDelay, holdOnCorrect, onClearAllNotes, includeInversions])

  // Hold-on-correct: when result is 'correct' and all notes released, advance after delay
  useEffect(() => {
    if (!holdOnCorrect || result !== 'correct') return
    if (activeNotes.size > 0) return
    const timer = setTimeout(() => {
      const nextPick = pickNextChord(currentChord)
      if (includeInversions) {
        nextPick.inversion = assignInversion(nextPick)
      } else {
        nextPick.inversion = 0
      }
      setCurrentChord(nextPick)
      setLastChord(nextPick)
      setResult(null)
      lastCheckedKeyRef.current = ''
      if (onClearAllNotes) onClearAllNotes()
    }, autoAdvanceDelay)
    return () => clearTimeout(timer)
  }, [holdOnCorrect, result, activeNotes, currentChord, pickNextChord, autoAdvanceDelay, onClearAllNotes, includeInversions])

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
      // Play all chord notes (audio only) and visualize on keyboard
      const pcs = getChordPitchClasses(tonicPC, currentChord)
      const notesToReveal = new Set()
      pcs.forEach(pc => {
        const midiNote = pc + 60
        if (playNote) playNote(midiNote)
        notesToReveal.add(midiNote)
      })
      if (setRevealedNotes) setRevealedNotes(notesToReveal)
      setScore(s => ({ ...s, answered: s.answered + 1 }))
    } else if (hasStarted && result === 'revealed') {
      // Already revealed — press again advances immediately
      handleGenerate()
    } else if (!hasStarted) {
      handleGenerate()
    }
  }, [handleGenerate, hasStarted, currentChord, result, ensureAudioContext, tonicPC, playNote, setRevealedNotes])

  const handleRelease = useCallback(() => {
    if (hasStarted && result === 'revealed') {
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null
        handleGenerate()
      }, autoAdvanceDelay)
    }
  }, [handleGenerate, hasStarted, result, autoAdvanceDelay])

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
    pendingTargetRef.current = null
    lastSecondaryIdRef.current = null
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
    setBorrowedModes(prev => {
      const filtered = prev.filter(m => m !== v)
      if (chromaticism === 'modal-interchange' && filtered.length === 0) {
        const oppositeMode = v === 'major' ? 'minor' : 'major'
        return [oppositeMode]
      }
      return filtered
    })
    setSelectedSecondaryChords(prev => {
      const available = getAvailableSecondaryChords(v)
      const availableIds = new Set(available.map(sc => sc.id))
      const filtered = prev.filter(id => availableIds.has(id))
      if (chromaticism === 'secondary-chords' && filtered.length === 0) {
        return available.map(sc => sc.id)
      }
      return filtered
    })
    handleSettingChange()
  }
  const handleChordTypesChange = (v) => { setSelectedChordTypes(v); handleSettingChange() }
  const handleChromaticismChange = (v) => {
    setChromaticism(v)
    if (v === 'modal-interchange' && borrowedModes.length === 0) {
      const oppositeMode = tonality === 'major' ? 'minor' : 'major'
      setBorrowedModes([oppositeMode])
    }
    if (v === 'secondary-chords' && selectedSecondaryChords.length === 0) {
      const available = getAvailableSecondaryChords(tonality)
      setSelectedSecondaryChords(available.map(sc => sc.id))
    }
    handleSettingChange()
  }
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

        {chromaticism === 'secondary-chords' && (
          <>
            <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

            {/* Secondary Chords */}
            <GroupedMultiSelect
              label="Secondary Chords"
              values={selectedSecondaryChords}
              onChange={(v) => { setSelectedSecondaryChords(v); handleSettingChange() }}
              groups={secondaryChordGroups}
              placeholder="Select chords…"
            />

            {/* Probability slider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Main: {Math.round(secondaryProbability * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={secondaryProbability}
                onChange={(e) => { setSecondaryProbability(parseFloat(e.target.value)); handleSettingChange() }}
                className="w-32 sm:w-40 h-[44px] cursor-pointer accent-accent"
              />
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Score display — always visible so right-side buttons don't shift */}
        <div className="flex items-center gap-4 pb-2.5 min-w-[120px]">
          <div className="text-sm text-gray-400">
            Score: <span className="text-white font-bold">{score.correct}</span>
            <span className="text-gray-600"> / </span>
            <span className="text-white font-bold">{score.answered}</span>
          </div>
        </div>

        {/* Include inversions toggle + format selector */}
        <div className="relative flex flex-col">
          <button
            onClick={() => { setIncludeInversions(v => !v); handleSettingChange() }}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors min-h-[40px] sm:min-h-[44px]
              flex items-center gap-1.5
              ${includeInversions
                ? 'bg-accent text-white'
                : 'bg-bg-700 text-gray-400 hover:bg-bg-600 hover:text-white'
              }`}
          >
            Inversions
          </button>
          {includeInversions && (
            <div className="absolute top-full left-0 pt-1.5 flex flex-col gap-0.5 z-10">
              <label className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 pl-1">Format</label>
              <select
                value={inversionNotation}
                onChange={(e) => setInversionNotation(e.target.value)}
                className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium bg-bg-700 text-gray-400 border border-bg-600 cursor-pointer hover:text-white transition-colors"
              >
                <option value="slash">Slash Notation</option>
                <option value="figured-bass">Figured Bass</option>
              </select>
            </div>
          )}
        </div>

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
                ${result === null ? (currentChord?.isBorrowed || isHarmonicMinorChord ? 'text-blue-400' : currentChord?.isSecondary ? 'text-keyred' : 'text-white') : ''}
              `}
            >
              <RomanNumeral
                roman={currentChord?.roman}
                figuredBass={inversionNotation === 'figured-bass' ? displayFiguredBass : null}
                bassDegree={inversionNotation === 'slash' ? displayBassDegree : null}
              />
            </div>
            {currentChord?.isSecondary && (
              <div className={`text-xl sm:text-2xl font-bold transition-all duration-300
                ${result === 'correct' ? 'text-green-400' : ''}
                ${result === 'wrong' ? 'text-keyred' : ''}
                ${result === 'revealed' ? 'text-yellow-400' : ''}
                ${result === null ? 'text-keyred' : ''}
              `}>
                (<RomanNumeral
                  roman={currentChord.equivalentRoman}
                  figuredBass={inversionNotation === 'figured-bass' ? displayFiguredBass : null}
                  bassDegree={inversionNotation === 'slash' ? displayBassDegree : null}
                />)
              </div>
            )}
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
            {isHarmonicMinorChord && (
              <div className={`text-xl sm:text-2xl font-bold transition-all duration-300
                ${result === 'correct' ? 'text-green-400' : ''}
                ${result === 'wrong' ? 'text-keyred' : ''}
                ${result === 'revealed' ? 'text-yellow-400' : ''}
                ${result === null ? 'text-blue-400' : ''}
              `}>
                (harm. minor)
              </div>
            )}

            {/* Feedback */}
            <div className="h-12 flex flex-col items-center gap-1">
              {result === 'correct' && (
                <div className="text-green-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Correct! That was <span className="music-notation"><ChordLabel label={targetChordLabel} /></span> (<span className="music-notation whitespace-nowrap">{targetNoteNames?.map((n, i) => <span key={i}>{i > 0 && '–'}{n}</span>)}</span>)
                </div>
              )}
              {result === 'revealed' && (
                <div className="text-yellow-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Answer: <span className="music-notation"><ChordLabel label={targetChordLabel} /></span> (<span className="music-notation whitespace-nowrap">{targetNoteNames?.map((n, i) => <span key={i}>{i > 0 && '–'}{n}</span>)}</span>)
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
                  Play all chord notes simultaneously on your MIDI keyboard or hold Cmd/Ctrl while clicking keys
                </div>
              )}
            </div>
          </div>
        )}

        {/* MIDI status warning for unsupported devices */}
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
