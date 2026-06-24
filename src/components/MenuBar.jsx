import Dropdown from './Dropdown'
import Logo from './Logo'

const TRAINING_MODES = [
  { label: 'Mental Practice', value: 'mental-practice', locked: true },
  { label: 'Scale Degrees', value: 'scale-degrees', locked: false },
  { label: 'Chords', value: 'chords', locked: false },
  { label: 'Chord Progressions', value: 'chord-progressions', locked: true },
  { label: 'Constrained Improvisation', value: 'constrained-improvisation', locked: true }
]

const SETTINGS_ITEMS = [
  { label: 'Keyboard Range', value: 'keyboard-range', locked: false },
  { label: 'Auto-Advance Delay', value: 'auto-advance-delay', locked: false },
  { label: 'Edit Catalog', value: 'edit-catalog', locked: false }
]

export default function MenuBar({ currentMode, onModeChange, onSettingsSelect, onTheoryOverview }) {
  const isTheoryOverview = currentMode === 'theory-overview'
  const currentModeLabel = isTheoryOverview
    ? 'Theory Overview'
    : TRAINING_MODES.find(m => m.value === currentMode)?.label || 'Training Mode'

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
          label={currentModeLabel}
          items={TRAINING_MODES}
          onSelect={(value) => onModeChange(value)}
        />
        <button
          onClick={onTheoryOverview}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-bg-700 text-gray-300
            hover:bg-bg-600 hover:text-white transition-colors min-h-[44px]"
        >
          {isTheoryOverview ? 'Practice Modes' : 'Theory Overview'}
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
