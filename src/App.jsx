import { useState, useCallback } from 'react'
import MenuBar from './components/MenuBar'
import PianoRoll from './components/PianoRoll'
import ScaleDegreesPractice from './components/ScaleDegreesPractice'
import ChordsPractice from './components/ChordsPractice'
import ChordProgressionsPractice from './components/ChordProgressionsPractice'
import TheoryOverview from './components/TheoryOverview'
import Modal from './components/Modal'
import KeyboardRangeModal from './components/KeyboardRangeModal'
import AutoAdvanceDelayModal from './components/AutoAdvanceDelayModal'
import VolumeModal from './components/VolumeModal'
import ProgressionsCatalog from './components/ProgressionsCatalog'
import { useMidi } from './hooks/useMidi'
import { DEFAULT_RANGE, TONICS } from './utils/musicTheory'
import { DEFAULT_PROGRESSIONS, cloneProgressions } from './utils/progressions'

export default function App() {
  // Training mode
  const [trainingMode, setTrainingMode] = useState('scale-degrees')

  // Shared key state (persists across mode switches, resets only on reload)
  const [tonic, setTonic] = useState('C')
  const [effectiveTonic, setEffectiveTonic] = useState('C')
  const [tonality, setTonality] = useState('major')

  const handleTonicChange = useCallback((v) => {
    if (v === 'random') {
      const randomTonic = TONICS[Math.floor(Math.random() * TONICS.length)]
      setTonic('random')
      setEffectiveTonic(randomTonic)
    } else {
      setTonic(v)
      setEffectiveTonic(v)
    }
  }, [])

  const handleTonalityChange = useCallback((v) => {
    setTonality(v)
  }, [])

  // Modal state
  const [activeModal, setActiveModal] = useState(null) // null | 'keyboard-range' | 'auto-advance-delay' | 'volume'

  // Keyboard range
  const [range, setRange] = useState(DEFAULT_RANGE)

  // Auto-advance delay (ms)
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(300)

  // Hold-on-correct: wait for all notes to be released before advancing
  const [holdOnCorrect, setHoldOnCorrect] = useState(true)

  // Revealed notes (for keyboard visualization when answer is shown)
  const [revealedNotes, setRevealedNotes] = useState(new Set())

  // Volumes (dB)
  const [pianoVolume, setPianoVolume] = useState(0)
  const [droneVolume, setDroneVolume] = useState(0)

  // Progressions catalog (editable via settings)
  const [progressions, setProgressions] = useState(() => cloneProgressions(DEFAULT_PROGRESSIONS))

  // MIDI
  const { supported: midiSupported, devices, activeNotes, connectionStatus, ensureAudioContext, simulateNoteOn, simulateNoteOff, playNote, clearAllNotes, setPianoVolume: setMidiPianoVolume } = useMidi({ pianoVolume })

  const handleModeChange = useCallback((mode) => {
    setTrainingMode(mode)
    clearAllNotes()
  }, [clearAllNotes])

  const handleSettingsSelect = useCallback((value) => {
    if (value === 'keyboard-range') setActiveModal('keyboard-range')
    if (value === 'auto-advance-delay') setActiveModal('auto-advance-delay')
    if (value === 'volume') setActiveModal('volume')
  }, [])

  const handleTheoryOverview = useCallback(() => {
    setTrainingMode('theory-overview')
    clearAllNotes()
  }, [clearAllNotes])

  const handleProgressionsCatalog = useCallback(() => {
    setTrainingMode('progressions-catalog')
    clearAllNotes()
  }, [clearAllNotes])

  return (
    <div className="flex flex-col h-screen bg-bg-900 overflow-hidden">
      {/* Top menu bar */}
      <MenuBar
        currentMode={trainingMode}
        onModeChange={handleModeChange}
        onSettingsSelect={handleSettingsSelect}
        onTheoryOverview={handleTheoryOverview}
        onProgressionsCatalog={handleProgressionsCatalog}
        midiConnectionStatus={connectionStatus}
        midiDevices={devices}
      />

      {/* Main practice space */}
      <main className="flex-1 overflow-y-auto bg-bg-900">
        {trainingMode === 'scale-degrees' && (
          <ScaleDegreesPractice
            activeNotes={activeNotes}
            midiSupported={midiSupported}
            ensureAudioContext={ensureAudioContext}
            autoAdvanceDelay={autoAdvanceDelay}
            holdOnCorrect={holdOnCorrect}
            onClearAllNotes={clearAllNotes}
            droneVolume={droneVolume}
            tonic={tonic}
            effectiveTonic={effectiveTonic}
            tonality={tonality}
            onTonicChange={handleTonicChange}
            onTonalityChange={handleTonalityChange}
            playNote={playNote}
            setRevealedNotes={setRevealedNotes}
          />
        )}
        {trainingMode === 'chords' && (
          <ChordsPractice
            activeNotes={activeNotes}
            midiSupported={midiSupported}
            ensureAudioContext={ensureAudioContext}
            autoAdvanceDelay={autoAdvanceDelay}
            holdOnCorrect={holdOnCorrect}
            onClearAllNotes={clearAllNotes}
            droneVolume={droneVolume}
            tonic={tonic}
            effectiveTonic={effectiveTonic}
            tonality={tonality}
            onTonicChange={handleTonicChange}
            onTonalityChange={handleTonalityChange}
            playNote={playNote}
            setRevealedNotes={setRevealedNotes}
          />
        )}
        {trainingMode === 'chord-progressions' && (
          <ChordProgressionsPractice
            activeNotes={activeNotes}
            midiSupported={midiSupported}
            ensureAudioContext={ensureAudioContext}
            autoAdvanceDelay={autoAdvanceDelay}
            holdOnCorrect={holdOnCorrect}
            onClearAllNotes={clearAllNotes}
            droneVolume={droneVolume}
            progressions={progressions}
            tonic={tonic}
            effectiveTonic={effectiveTonic}
            tonality={tonality}
            onTonicChange={handleTonicChange}
            onTonalityChange={handleTonalityChange}
            playNote={playNote}
            setRevealedNotes={setRevealedNotes}
          />
        )}
        {trainingMode === 'progressions-catalog' && (
          <ProgressionsCatalog
            progressions={progressions}
            onProgressionsChange={setProgressions}
          />
        )}
        {trainingMode === 'theory-overview' && (
          <TheoryOverview
            range={range}
            activeNotes={activeNotes}
            ensureAudioContext={ensureAudioContext}
            droneVolume={droneVolume}
            tonic={effectiveTonic}
            onTonicChange={handleTonicChange}
          />
        )}
        {trainingMode !== 'scale-degrees' && trainingMode !== 'chords' && trainingMode !== 'chord-progressions' && trainingMode !== 'theory-overview' && trainingMode !== 'progressions-catalog' && (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p className="text-lg">This mode is not yet implemented.</p>
          </div>
        )}
      </main>

      {/* Piano roll at bottom (hidden in theory-overview and progressions-catalog) */}
      {trainingMode !== 'theory-overview' && trainingMode !== 'progressions-catalog' && (
        <div className="h-[180px] sm:h-[200px] flex-shrink-0 bg-bg-900 border-t border-bg-700">
          <PianoRoll range={range} activeNotes={activeNotes} revealedNotes={revealedNotes} onNoteOn={simulateNoteOn} onNoteOff={simulateNoteOff} onClearAll={clearAllNotes} chordMode={trainingMode === 'chords' || trainingMode === 'chord-progressions'} />
        </div>
      )}

      {/* Modals */}
      {activeModal === 'keyboard-range' && (
        <Modal title="Keyboard Range" onClose={() => setActiveModal(null)}>
          <KeyboardRangeModal
            range={range}
            onRangeChange={setRange}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'auto-advance-delay' && (
        <Modal title="Pace" onClose={() => setActiveModal(null)}>
          <AutoAdvanceDelayModal
            delay={autoAdvanceDelay}
            onDelayChange={setAutoAdvanceDelay}
            holdOnCorrect={holdOnCorrect}
            onHoldOnCorrectChange={setHoldOnCorrect}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'volume' && (
        <Modal title="Volume" onClose={() => setActiveModal(null)}>
          <VolumeModal
            pianoVolume={pianoVolume}
            droneVolume={droneVolume}
            onPianoVolumeChange={setPianoVolume}
            onDroneVolumeChange={setDroneVolume}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

    </div>
  )
}
