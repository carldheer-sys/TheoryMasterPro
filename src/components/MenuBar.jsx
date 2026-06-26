import Dropdown from './Dropdown'
import Logo from './Logo'

const PRACTICE_MODES = [
  { label: 'Scale Degrees', value: 'scale-degrees', locked: false },
  { label: 'Chords', value: 'chords', locked: false },
  { label: 'Chord Progressions', value: 'chord-progressions', locked: false },
  { label: 'Constrained Improvisation', value: 'constrained-improvisation', locked: true }
]

const SETTINGS_ITEMS = [
  { label: 'Keyboard Range', value: 'keyboard-range', locked: false },
  { label: 'Auto-Advance Delay', value: 'auto-advance-delay', locked: false },
  { label: 'Volume', value: 'volume', locked: false },
]

const PRACTICE_MODE_VALUES = new Set(PRACTICE_MODES.map(m => m.value))

export default function MenuBar({ currentMode, onModeChange, onSettingsSelect, onTheoryOverview, onProgressionsCatalog, midiConnectionStatus, midiDevices }) {
  const isPracticeMode = PRACTICE_MODE_VALUES.has(currentMode)
  const currentModeLabel = PRACTICE_MODES.find(m => m.value === currentMode)?.label || 'Practice Modes'
  const isCatalog = currentMode === 'progressions-catalog'

  return (
    <header className="flex items-center justify-between px-2 sm:px-6 py-2 sm:py-3 bg-bg-800 border-b border-bg-600 z-40 relative">
      {/* Logo + App name + MIDI status */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
        <Logo size={32} />
        <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white hidden sm:block">
          Theory<span className="text-accent">Master</span>Pro
        </h1>
        {midiConnectionStatus && (
          <div className="hidden md:flex items-center gap-1.5 ml-2 text-xs text-gray-500">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                midiConnectionStatus === 'connected' ? 'bg-green-400' :
                midiConnectionStatus === 'no-devices' ? 'bg-yellow-400' :
                midiConnectionStatus === 'unsupported' || midiConnectionStatus === 'denied' ? 'bg-gray-600' :
                'bg-gray-500 animate-pulse'
              }`}
            />
            <span>
              {midiConnectionStatus === 'connected' && (midiDevices?.length > 0 ? midiDevices[0].name : 'MIDI Connected')}
              {midiConnectionStatus === 'no-devices' && 'No MIDI devices'}
              {midiConnectionStatus === 'unsupported' && 'MIDI not supported'}
              {midiConnectionStatus === 'denied' && 'MIDI denied'}
              {midiConnectionStatus === 'checking' && 'MIDI checking...'}
            </span>
          </div>
        )}
      </div>

      {/* Menu buttons */}
      <nav className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <Dropdown
          label={isPracticeMode ? currentModeLabel : 'Modes'}
          items={PRACTICE_MODES}
          onSelect={(value) => onModeChange(value)}
        />
        <button
          onClick={onProgressionsCatalog}
          className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors min-h-[40px] sm:min-h-[44px] whitespace-nowrap
            ${isCatalog
              ? 'bg-accent text-white'
              : 'bg-bg-700 text-gray-300 hover:bg-bg-600 hover:text-white'
            }`}
        >
          <span className="hidden sm:inline">Progressions Catalog</span>
          <span className="sm:hidden">Catalog</span>
        </button>
        <button
          onClick={onTheoryOverview}
          className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors min-h-[40px] sm:min-h-[44px] whitespace-nowrap
            ${currentMode === 'theory-overview'
              ? 'bg-accent text-white'
              : 'bg-bg-700 text-gray-300 hover:bg-bg-600 hover:text-white'
            }`}
        >
          <span className="hidden sm:inline">Theory Overview</span>
          <span className="sm:hidden">Theory</span>
        </button>
        <Dropdown
          label={(
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          )}
          items={SETTINGS_ITEMS}
          onSelect={(value) => onSettingsSelect(value)}
          align="right"
          showChevron={false}
        />
      </nav>
    </header>
  )
}
