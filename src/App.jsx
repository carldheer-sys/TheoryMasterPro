import { useState, useCallback, useRef } from 'react'
import MenuBar from './components/MenuBar'
import PianoRoll from './components/PianoRoll'
import ScaleDegreesPractice from './components/ScaleDegreesPractice'
import ChordsPractice from './components/ChordsPractice'
import TheoryOverview from './components/TheoryOverview'
import Modal from './components/Modal'
import KeyboardRangeModal from './components/KeyboardRangeModal'
import AutoAdvanceDelayModal from './components/AutoAdvanceDelayModal'
import { useMidi } from './hooks/useMidi'
import { DEFAULT_RANGE } from './utils/musicTheory'

export default function App() {
  // Training mode
  const [trainingMode, setTrainingMode] = useState('scale-degrees')
  const lastPracticeModeRef = useRef('scale-degrees')

  // Modal state
  const [activeModal, setActiveModal] = useState(null) // null | 'keyboard-range' | 'edit-catalog' | 'theory-overview'

  // Keyboard range
  const [range, setRange] = useState(DEFAULT_RANGE)

  // Auto-advance delay (ms)
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(600)

  // MIDI
  const { supported: midiSupported, devices, activeNotes, connectionStatus, ensureAudioContext, simulateNoteOn, simulateNoteOff, clearAllNotes } = useMidi()

  const handleModeChange = useCallback((mode) => {
    setTrainingMode(mode)
    lastPracticeModeRef.current = mode
    clearAllNotes()
  }, [clearAllNotes])

  const handleSettingsSelect = useCallback((value) => {
    if (value === 'keyboard-range') setActiveModal('keyboard-range')
    if (value === 'auto-advance-delay') setActiveModal('auto-advance-delay')
    if (value === 'edit-catalog') setActiveModal('edit-catalog')
  }, [])

  const handleTheoryOverview = useCallback(() => {
    setTrainingMode(prev => {
      if (prev === 'theory-overview') {
        clearAllNotes()
        return lastPracticeModeRef.current
      }
      if (prev !== 'theory-overview') {
        lastPracticeModeRef.current = prev
      }
      clearAllNotes()
      return 'theory-overview'
    })
  }, [clearAllNotes])

  return (
    <div className="flex flex-col h-screen bg-bg-900 overflow-hidden">
      {/* Top menu bar */}
      <MenuBar
        currentMode={trainingMode}
        onModeChange={handleModeChange}
        onSettingsSelect={handleSettingsSelect}
        onTheoryOverview={handleTheoryOverview}
      />

      {/* MIDI status indicator */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1.5 bg-bg-800/50 border-b border-bg-700/50 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'no-devices' ? 'bg-yellow-400' :
              connectionStatus === 'unsupported' || connectionStatus === 'denied' ? 'bg-gray-600' :
              'bg-gray-500 animate-pulse'
            }`}
          />
          <span className="text-gray-500">
            {connectionStatus === 'connected' && (devices.length > 0 ? `MIDI: ${devices[0].name}` : 'MIDI Connected')}
            {connectionStatus === 'no-devices' && 'MIDI: No devices found'}
            {connectionStatus === 'unsupported' && 'MIDI: Not supported on this device'}
            {connectionStatus === 'denied' && 'MIDI: Access denied'}
            {connectionStatus === 'checking' && 'MIDI: Checking...'}
          </span>
        </div>
        {devices.length > 1 && (
          <span className="text-gray-600">{devices.length} devices</span>
        )}
      </div>

      {/* Main practice space */}
      <main className="flex-1 overflow-y-auto bg-bg-900">
        {trainingMode === 'scale-degrees' && (
          <ScaleDegreesPractice
            activeNotes={activeNotes}
            midiSupported={midiSupported}
            ensureAudioContext={ensureAudioContext}
            autoAdvanceDelay={autoAdvanceDelay}
          />
        )}
        {trainingMode === 'chords' && (
          <ChordsPractice
            activeNotes={activeNotes}
            midiSupported={midiSupported}
            ensureAudioContext={ensureAudioContext}
            autoAdvanceDelay={autoAdvanceDelay}
            onClearAllNotes={clearAllNotes}
          />
        )}
        {trainingMode === 'theory-overview' && (
          <TheoryOverview
            activeNotes={activeNotes}
          />
        )}
        {trainingMode !== 'scale-degrees' && trainingMode !== 'chords' && trainingMode !== 'theory-overview' && (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p className="text-lg">This mode is not yet implemented.</p>
          </div>
        )}
      </main>

      {/* Piano roll at bottom (hidden in theory-overview mode which has its own keyboard) */}
      {trainingMode !== 'theory-overview' && (
        <div className="h-[180px] sm:h-[200px] flex-shrink-0 bg-bg-900 border-t border-bg-700">
          <PianoRoll range={range} activeNotes={activeNotes} onNoteOn={simulateNoteOn} onNoteOff={simulateNoteOff} onClearAll={clearAllNotes} chordMode={trainingMode === 'chords'} />
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
        <Modal title="Auto-Advance Delay" onClose={() => setActiveModal(null)}>
          <AutoAdvanceDelayModal
            delay={autoAdvanceDelay}
            onDelayChange={setAutoAdvanceDelay}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'edit-catalog' && (
        <Modal title="Edit Catalog" onClose={() => setActiveModal(null)}>
          <div className="text-gray-400 text-sm py-8 text-center">
            Catalog editing will be available in a future update.
          </div>
        </Modal>
      )}

    </div>
  )
}
