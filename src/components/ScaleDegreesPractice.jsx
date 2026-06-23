import { useState, useEffect, useRef, useCallback } from 'react'
import Select from './Select'
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
export default function ScaleDegreesPractice({ activeNotes, midiSupported, playCorrectSound, ensureAudioContext }) {
  // Settings
  const [tonic, setTonic] = useState('C')
  const [tonality, setTonality] = useState('major')
  const [degreeMode, setDegreeMode] = useState('diatonic')

  // Practice state
  const [hasStarted, setHasStarted] = useState(false)
  const [currentDegree, setCurrentDegree] = useState(null)
  const [lastDegree, setLastDegree] = useState(null)
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong'
  const [attemptedNote, setAttemptedNote] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  // Track which notes we've already checked for this round
  const checkedNotesRef = useRef(new Set())

  const degrees = getScaleDegrees(degreeMode, tonality)
  const tonicPC = tonicToPC(tonic)
  const targetPC = currentDegree ? degreeToPitchClass(tonicPC, currentDegree.semitones) : null
  const targetNoteName = targetPC !== null ? spellNoteName(targetPC, tonic, tonality) : null

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
  }, [degrees, lastDegree, ensureAudioContext])

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
        setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
        if (playCorrectSound) playCorrectSound()
        // Auto-advance to next degree after showing the correct animation
        setTimeout(() => {
          const nextPick = pickRandomDegree(degrees, currentDegree)
          setCurrentDegree(nextPick)
          setLastDegree(nextPick)
          setResult(null)
          setAttemptedNote(null)
          checkedNotesRef.current = new Set()
        }, 1200)
      } else {
        setResult('wrong')
        setScore(s => ({ ...s, total: s.total + 1 }))
        // Reset checked notes so user can try again
        setTimeout(() => {
          checkedNotesRef.current = new Set()
        }, 300)
      }
    }
  }, [activeNotes, currentDegree, targetPC, result, degrees, playCorrectSound])

  // Spacebar = GENERATE/NEXT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        handleGenerate()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGenerate])

  // Reset practice when key settings change
  const handleSettingChange = () => {
    if (hasStarted) {
      setHasStarted(false)
      setCurrentDegree(null)
      setResult(null)
      setAttemptedNote(null)
    }
  }

  const handleTonicChange = (v) => {
    setTonic(v)
    handleSettingChange()
  }
  const handleTonalityChange = (v) => {
    setTonality(v)
    handleSettingChange()
  }
  const handleDegreeModeChange = (v) => {
    setDegreeMode(v)
    handleSettingChange()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Settings bar */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4 px-4 sm:px-8 pt-6 pb-4">
        {/* Key section */}
        <div className="flex items-end gap-3">
          <Select
            label="Tonic"
            value={tonic}
            onChange={handleTonicChange}
            options={TONICS.map(t => ({ value: t, label: t }))}
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

        {/* Score display */}
        {hasStarted && (
          <div className="flex items-center gap-4 pb-2.5">
            <div className="text-sm text-gray-400">
              Score: <span className="text-green-400 font-bold">{score.correct}</span>
              <span className="text-gray-600"> / </span>
              <span className="text-white font-bold">{score.total}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main display area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {!hasStarted ? (
          /* Pre-generation state */
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              Key: <span className="text-accent-light font-bold">{getKeyDisplay(tonic, tonality)}</span>
              {' · '}
              <span className="capitalize">{degreeMode}</span>
            </div>
            <div className="text-gray-600 text-sm">
              Press GENERATE to start practicing scale degrees
            </div>
          </div>
        ) : (
          /* Active practice state */
          <div className="flex flex-col items-center gap-4">
            {/* Key display */}
            <div className="text-gray-500 text-sm">
              Key: <span className="text-accent-light font-bold">{getKeyDisplay(tonic, tonality)}</span>
            </div>

            {/* Scale degree display */}
            <div
              className={`text-7xl sm:text-8xl font-extrabold transition-all duration-300
                ${result === 'correct' ? 'text-green-400 correct-pulse' : ''}
                ${result === 'wrong' ? 'text-keyred shake' : ''}
                ${result === null ? 'text-white' : ''}
              `}
            >
              {currentDegree?.degree}
            </div>

            {/* Feedback */}
            <div className="h-8">
              {result === 'correct' && (
                <div className="text-green-400 text-lg font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Correct! That was {targetNoteName}
                </div>
              )}
              {result === 'wrong' && attemptedNote !== null && (
                <div className="text-keyred text-lg font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Not quite — try again
                </div>
              )}
              {result === null && (
                <div className="text-gray-500 text-sm">
                  Play the note on your MIDI keyboard
                </div>
              )}
            </div>
          </div>
        )}

        {/* MIDI status warning for unsupported devices */}
        {!midiSupported && (
          <div className="text-yellow-500/70 text-xs text-center max-w-md">
            MIDI input not available on this device. Practice visually or connect a MIDI keyboard.
          </div>
        )}
      </div>

      {/* Generate / Next button */}
      <div className="flex justify-center px-4 pb-6">
        <button
          onClick={handleGenerate}
          className={`px-12 py-4 rounded-2xl text-lg font-extrabold tracking-wide
            transition-all duration-200 active:scale-95 min-h-[56px] min-w-[200px]
            ${hasStarted
            ? 'bg-bg-600 text-white hover:bg-bg-500 border border-bg-500'
            : 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/30'
            }`}
        >
          {hasStarted ? 'NEXT →' : 'GENERATE'}
        </button>
      </div>
    </div>
  )
}
