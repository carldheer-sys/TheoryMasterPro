import Select from './Select'

const DELAY_PRESETS = [
  { value: 0, label: '0s (Instant)' },
  { value: 300, label: '0.3s (Fast)' },
  { value: 600, label: '0.6s' },
  { value: 1000, label: '1.0s' },
  { value: 1200, label: '1.2s' },
  { value: 2000, label: '2.0s' },
  { value: 3000, label: '3.0s (Slow)' }
]

export default function AutoAdvanceDelayModal({ delay, onDelayChange, holdOnCorrect, onHoldOnCorrectChange, onClose }) {
  const currentPreset = DELAY_PRESETS.find(p => p.value === delay)
  const presetValue = currentPreset?.value || delay

  return (
    <div className="space-y-5">
      <p className="text-gray-400 text-sm">
        Choose how long the correct answer is displayed before automatically advancing to the next question.
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

      <div className="flex items-center justify-between p-4 bg-bg-800 rounded-xl">
        <div>
          <div className="text-sm text-white font-semibold">Hold on Correct</div>
          <div className="text-xs text-gray-500 mt-0.5">Wait for all keys to be released before showing the next question</div>
        </div>
        <button
          onClick={() => onHoldOnCorrectChange(!holdOnCorrect)}
          className={`relative w-12 h-6 rounded-full transition-colors ${holdOnCorrect ? 'bg-accent' : 'bg-bg-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${holdOnCorrect ? 'translate-x-6' : ''}`} />
        </button>
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
