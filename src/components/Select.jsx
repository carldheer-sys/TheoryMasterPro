import { useEffect } from 'react'
import useDropdownPosition from '../hooks/useDropdownPosition'

/**
 * Select — a custom dropdown for single selection, matching the app's
 * TonalitySelect style with radio-style indicators.
 * Props:
 *   - value: current selected value
 *   - onChange: callback(newValue)
 *   - options: [{ value, label, disabled?, favorite? }]
 *   - label: optional label above the select
 */
export default function Select({ value, onChange, options, label }) {
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

  const selectedLabel = options.find(o => o.value === value)?.label || value

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
            {options.map(opt => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-left
                    cursor-pointer transition-colors whitespace-nowrap
                    ${opt.disabled
                      ? 'text-gray-600 cursor-not-allowed opacity-50'
                      : isSelected
                        ? 'text-accent bg-accent/10'
                        : 'text-white hover:bg-bg-600'
                    }`}
                >
                  <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center -ml-1">
                    {opt.favorite && (
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    )}
                  </span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'bg-accent border-accent' : 'border-bg-400'}`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
