import { useState, useEffect, useRef, useCallback } from 'react'
import Select from './Select'
import DroneToggle from './DroneToggle'
import {
  TONICS,
  TONALITIES,
  getScaleDegrees,
  pickRandomDegree,
  tonicToPC,
  degreeToPitchClass,
  spellNoteName,
  midiNoteToPC,
  getKeyDisplay
} from '../utils/musicTheory'

const DEGREE_MODES = [
  { value: 'diatonic', label: 'Diatonic' },
  { value: 'chromatic', label: 'Chromatic' }
]

/**
 * ScaleDegreesPractice — the main practice space for the "Scale Degrees" mode.
 *
 * Flow:
 *   1. User selects Key (tonic + tonality) and Scale Degrees mode (diatonic/chromatic)
 *   2. Click GENERATE → random scale degree appears, button changes to NEXT
 *   3. User plays the correct note on MIDI keyboard
 *   4. App checks pitch class match → shows correct/wrong feedback
 *   5. Click NEXT → new random degree
 */
export default function ScaleDegreesPractice({ activeNotes, midiSupported, ensureAudioContext, autoAdvanceDelay = 300, holdOnCorrect = true, onClearAllNotes, droneVolume = 0, tonic, effectiveTonic, tonality, onTonicChange, onTonalityChange, playNote, setRevealedNotes }) {
  // Settings
  const [degreeMode, setDegreeMode] = useState('diatonic')

  // Practice state
  const [hasStarted, setHasStarted] = useState(false)
  const [currentDegree, setCurrentDegree] = useState(null)
  const [lastDegree, setLastDegree] = useState(null)
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong' | 'revealed'
  const [attemptedNote, setAttemptedNote] = useState(null)
  const [score, setScore] = useState({ correct: 0, answered: 0 })

  // Track which notes we've already checked for this round
  const checkedNotesRef = useRef(new Set())

  const degrees = getScaleDegrees(degreeMode, tonality)
  const tonicPC = tonicToPC(effectiveTonic)
  const targetPC = currentDegree ? degreeToPitchClass(tonicPC, currentDegree.semitones) : null
  const targetNoteName = targetPC !== null ? spellNoteName(targetPC, effectiveTonic, tonality) : null

  // Generate a new scale degree
  const handleGenerate = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    const pick = pickRandomDegree(degrees, lastDegree)
    setCurrentDegree(pick)
    setLastDegree(pick)
    setResult(null)
    setAttemptedNote(null)
    setHasStarted(true)
    checkedNotesRef.current = new Set()
    if (onClearAllNotes) onClearAllNotes()
    if (setRevealedNotes) setRevealedNotes(new Set())
  }, [degrees, lastDegree, ensureAudioContext, onClearAllNotes, setRevealedNotes])

  // Watch active notes and check against target
  useEffect(() => {
    if (!currentDegree || result === 'correct') return

    // Check each active note
    for (const note of activeNotes) {
      if (checkedNotesRef.current.has(note)) continue
      checkedNotesRef.current.add(note)

      const playedPC = midiNoteToPC(note)
      setAttemptedNote(note)

      if (playedPC === targetPC) {
        setResult('correct')
        setScore(s => ({ correct: s.correct + 1, answered: s.answered + 1 }))
        if (!holdOnCorrect) {
          // Auto-advance to next degree after showing the correct animation
          setTimeout(() => {
            const nextPick = pickRandomDegree(degrees, currentDegree)
            setCurrentDegree(nextPick)
            setLastDegree(nextPick)
            setResult(null)
            setAttemptedNote(null)
            checkedNotesRef.current = new Set()
            if (onClearAllNotes) onClearAllNotes()
          }, autoAdvanceDelay)
        }
        // If holdOnCorrect, the release-watcher effect will handle advancing
      } else {
        setResult('wrong')
        setScore(s => ({ ...s, answered: s.answered + 1 }))
        // Reset checked notes so user can try again
        setTimeout(() => {
          checkedNotesRef.current = new Set()
        }, 300)
      }
    }
  }, [activeNotes, currentDegree, targetPC, result, degrees, autoAdvanceDelay, holdOnCorrect, onClearAllNotes])

  // Hold-on-correct: when result is 'correct' and all notes released, advance after delay
  useEffect(() => {
    if (!holdOnCorrect || result !== 'correct') return
    if (activeNotes.size > 0) return
    // All notes released — start advance timer
    const timer = setTimeout(() => {
      const nextPick = pickRandomDegree(degrees, currentDegree)
      setCurrentDegree(nextPick)
      setLastDegree(nextPick)
      setResult(null)
      setAttemptedNote(null)
      checkedNotesRef.current = new Set()
      if (onClearAllNotes) onClearAllNotes()
    }, autoAdvanceDelay)
    return () => clearTimeout(timer)
  }, [holdOnCorrect, result, activeNotes, currentDegree, degrees, autoAdvanceDelay, onClearAllNotes])

  // Press-and-hold NEXT: press reveals answer, release advances after delay
  const advanceTimerRef = useRef(null)

  const handlePress = useCallback(() => {
    if (ensureAudioContext) ensureAudioContext()
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    if (hasStarted && currentDegree && result === null) {
      setResult('revealed')
      // Play the target note (audio only) and visualize on keyboard
      const noteToPlay = targetPC + 60
      if (playNote) playNote(noteToPlay)
      if (setRevealedNotes) setRevealedNotes(new Set([noteToPlay]))
      setScore(s => ({ ...s, answered: s.answered + 1 }))
    } else if (hasStarted && result === 'revealed') {
      // Already revealed — press again advances immediately
      handleGenerate()
    } else if (!hasStarted) {
      handleGenerate()
    }
  }, [handleGenerate, hasStarted, currentDegree, result, ensureAudioContext, targetPC, playNote, setRevealedNotes])

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
    if (hasStarted) {
      setHasStarted(false)
      setCurrentDegree(null)
      setResult(null)
      setAttemptedNote(null)
      setScore({ correct: 0, answered: 0 })
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
  const handleDegreeModeChange = (v) => {
    setDegreeMode(v)
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
          <Select
            label="Tonality"
            value={tonality}
            onChange={handleTonalityChange}
            options={TONALITIES}
          />
        </div>

        <div className="hidden sm:flex items-center text-gray-500 text-2xl font-light pb-2.5">·</div>

        {/* Scale degrees mode */}
        <Select
          label="Scale Degrees"
          value={degreeMode}
          onChange={handleDegreeModeChange}
          options={DEGREE_MODES}
        />

        <div className="flex-1" />

        {/* Drone toggle */}
        <DroneToggle tonic={effectiveTonic} ensureAudioContext={ensureAudioContext} droneVolume={droneVolume} />

        {/* Score display */}
        {hasStarted && (
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
          /* Pre-generation state */
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              Key: <span className="text-accent-light font-bold music-notation">{getKeyDisplay(effectiveTonic, tonality)}</span>
              {' · '}
              <span className="capitalize">{degreeMode}</span>
            </div>
            <div className="text-gray-600 text-sm">
              Press START to start practicing scale degrees
            </div>
          </div>
        ) : (
          /* Active practice state */
          <div className="flex flex-col items-center gap-4">
            {/* Key display */}
            <div className="text-gray-500 text-sm">
              Key: <span className="text-accent-light font-bold music-notation">{getKeyDisplay(effectiveTonic, tonality)}</span>
            </div>

            {/* Scale degree display */}
            <div
              className={`music-notation text-7xl sm:text-8xl font-extrabold transition-all duration-300
                ${result === 'correct' ? 'text-green-400 correct-pulse' : ''}
                ${result === 'wrong' ? 'text-keyred shake' : ''}
                ${result === 'revealed' ? 'text-yellow-400 correct-pulse' : ''}
                ${result === null ? 'text-white' : ''}
              `}
            >
              {currentDegree?.degree}
            </div>

            {/* Feedback */}
            <div className="h-10">
              {result === 'correct' && (
                <div className="text-green-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Correct! That was <span className="music-notation">{targetNoteName}</span>
                </div>
              )}
              {result === 'revealed' && (
                <div className="text-yellow-400 text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Answer: <span className="music-notation">{targetNoteName}</span>
                </div>
              )}
              {result === 'wrong' && attemptedNote !== null && (
                <div className="text-keyred text-2xl font-bold flex items-center gap-2">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Not quite — try again
                </div>
              )}
              {result === null && hasStarted && (
                <div className="text-gray-600 text-xs">
                  Play the note on your MIDI keyboard or tap a key
                </div>
              )}
            </div>
          </div>
        )}

        {/* MIDI status warning for unsupported devices */}
        {!midiSupported && (
          <div className="text-yellow-500/60 text-xs text-center max-w-md">
            MIDI input not available on this device. Tap the on-screen keys to practice.
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
