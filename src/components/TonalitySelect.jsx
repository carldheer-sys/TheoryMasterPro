import { useEffect } from 'react'
import useDropdownPosition from '../hooks/useDropdownPosition'

/**
 * TonalitySelect — a custom dropdown for selecting Major/Minor tonality,
 * with an inline toggle for including V/V7 from harmonic minor (shown under
 * the Minor option when Minor is selected).
 *
 * Props:
 *   - value: current tonality ('major' | 'minor')
 *   - onChange: callback(newValue)
 *   - includeHarmMinor: boolean
 *   - onHarmMinorChange: callback(newBool)
 *   - label: optional label above the dropdown
 */
const OPTIONS = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
]

export default function TonalitySelect({ value, onChange, includeHarmMinor, onHarmMinorChange, label }) {
  const { open, setOpen, toggle, panelStyle, triggerRef } = useDropdownPosition()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target) &&
          !e.target.closest('[data-dropdown-panel]')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setOpen])

  const selectedLabel = OPTIONS.find(o => o.value === value)?.label || value

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          className="appearance-none w-full bg-bg-700 text-white text-sm font-semibold
            px-4 py-3 pr-10 rounded-xl border border-bg-500
            hover:border-accent/50 focus:border-accent focus:outline-none
            transition-colors min-h-[44px] cursor-pointer text-left flex items-center justify-between"
        >
          <span>{selectedLabel}</span>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div
            data-dropdown-panel
            style={panelStyle}
            className="bg-bg-700 border border-bg-500 rounded-xl shadow-xl overflow-hidden"
          >
            {OPTIONS.map(opt => {
              const isSelected = opt.value === value
              return (
                <div key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      if (opt.value !== 'minor') setOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left
                      cursor-pointer transition-colors
                      ${isSelected ? 'text-accent bg-accent/10' : 'text-white hover:bg-bg-600'}`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-accent border-accent' : 'border-bg-400'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {opt.label}
                  </button>
                  {opt.value === 'minor' && isSelected && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onHarmMinorChange(!includeHarmMinor) }}
                      className="w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-[11px] text-gray-400
                        hover:text-gray-300 cursor-pointer transition-colors text-left whitespace-nowrap"
                    >
                      <span className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0
                        ${includeHarmMinor
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-bg-400'
                        }`}>
                        {includeHarmMinor && (
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      incl. V(7) from harm. minor
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
