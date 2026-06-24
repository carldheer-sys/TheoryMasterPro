import Dropdown from './Dropdown'
import Logo from './Logo'

const PRACTICE_MODES = [
  { label: 'Mental Practice', value: 'mental-practice', locked: true },
  { label: 'Scale Degrees', value: 'scale-degrees', locked: false },
  { label: 'Chords', value: 'chords', locked: false },
  { label: 'Chord Progressions', value: 'chord-progressions', locked: true },
  { label: 'Constrained Improvisation', value: 'constrained-improvisation', locked: true }
]

const SETTINGS_ITEMS = [
  { label: 'Keyboard Range', value: 'keyboard-range', locked: false },
  { label: 'Auto-Advance Delay', value: 'auto-advance-delay', locked: false },
  { label: 'Volume', value: 'volume', locked: false },
  { label: 'Edit Catalog', value: 'edit-catalog', locked: false }
]

const PRACTICE_MODE_VALUES = new Set(PRACTICE_MODES.map(m => m.value))

export default function MenuBar({ currentMode, onModeChange, onSettingsSelect, onTheoryOverview }) {
  const isPracticeMode = PRACTICE_MODE_VALUES.has(currentMode)
  const currentModeLabel = PRACTICE_MODES.find(m => m.value === currentMode)?.label || 'Practice Modes'

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-bg-800 border-b border-bg-600 z-40 relative">
      {/* Logo + App name */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Logo size={36} />
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white hidden xs:block sm:block">
          Theory<span className="text-accent">Master</span>Pro
        </h1>
      </div>

      {/* Menu buttons */}
      <nav className="flex items-center gap-2 sm:gap-3">
        <Dropdown
          label={isPracticeMode ? currentModeLabel : 'Practice Modes'}
          items={PRACTICE_MODES}
          onSelect={(value) => onModeChange(value)}
        />
        <button
          onClick={onTheoryOverview}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]
            ${!isPracticeMode
              ? 'bg-accent text-white'
              : 'bg-bg-700 text-gray-300 hover:bg-bg-600 hover:text-white'
            }`}
        >
          Theory Overview
        </button>
        <Dropdown
          label="Settings"
          items={SETTINGS_ITEMS}
          onSelect={(value) => onSettingsSelect(value)}
          align="right"
        />
      </nav>
    </header>
  )
}
