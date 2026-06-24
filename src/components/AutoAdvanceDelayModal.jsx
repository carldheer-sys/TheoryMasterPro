import Select from './Select'

const DELAY_PRESETS = [
  { value: 300, label: '0.3s (Fast)' },
  { value: 600, label: '0.6s (Default)' },
  { value: 1000, label: '1.0s' },
  { value: 1200, label: '1.2s' },
  { value: 2000, label: '2.0s' },
  { value: 3000, label: '3.0s (Slow)' }
]

export default function AutoAdvanceDelayModal({ delay, onDelayChange, onClose }) {
  const currentPreset = DELAY_PRESETS.find(p => p.value === delay)
  const presetValue = currentPreset?.value || delay

  return (
    <div className="space-y-5">
      <p className="text-gray-400 text-sm">
        Choose how long the correct answer is displayed before automatically advancing to the next scale degree.
      </p>

      <Select
        label="Delay Duration"
        value={presetValue}
        onChange={(v) => onDelayChange(Number(v))}
        options={DELAY_PRESETS.map(p => ({ value: p.value, label: p.label }))}
      />

      <div className="flex items-center justify-between p-4 bg-bg-800 rounded-xl">
        <div className="text-sm text-gray-400">Current delay:</div>
        <div className="text-sm font-bold text-accent-light">
          {(delay / 1000).toFixed(1)}s
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover transition-colors"
      >
        Done
      </button>
    </div>
  )
}
