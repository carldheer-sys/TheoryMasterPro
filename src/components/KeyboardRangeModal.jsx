import Select from './Select'
import { midiNoteToName } from '../utils/musicTheory'
import { DEFAULT_RANGE } from '../utils/musicTheory'

const RANGE_PRESETS = [
  { value: 'small', label: '2 octaves (C3–B4)', start: 48, end: 71 },
  { value: 'default', label: '3 octaves (C3–C6)', start: 48, end: 84 },
  { value: 'wide', label: '4 octaves (C2–C6)', start: 36, end: 84 },
  { value: 'full', label: '5 octaves (C2–C7)', start: 36, end: 96 }
]

/**
 * KeyboardRangeModal — settings panel for selecting the piano keyboard range.
 */
export default function KeyboardRangeModal({ range, onRangeChange, onClose }) {
  const currentPreset = RANGE_PRESETS.find(p => p.start === range.start && p.end === range.end)
  const presetValue = currentPreset?.value || 'custom'

  return (
    <div className="space-y-5">
      <p className="text-gray-400 text-sm">
        Choose the range of keys displayed on the piano roll.
      </p>

      <Select
        label="Range Preset"
        value={presetValue}
        onChange={(v) => {
          const preset = RANGE_PRESETS.find(p => p.value === v)
          if (preset) onRangeChange({ start: preset.start, end: preset.end })
        }}
        options={RANGE_PRESETS.map(p => ({ value: p.value, label: p.label }))}
      />

      <div className="flex items-center justify-between p-4 bg-bg-800 rounded-xl">
        <div className="text-sm text-gray-400">Current range:</div>
        <div className="text-sm font-bold text-accent-light">
          {midiNoteToName(range.start)} – {midiNoteToName(range.end)}
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
