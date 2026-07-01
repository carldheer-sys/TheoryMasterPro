import { useEffect } from 'react'
import useDropdownPosition from '../hooks/useDropdownPosition'

/**
 * MultiSelect — a styled dropdown with checkboxes for multiple selection.
 * Props:
 *   - values: array of currently selected values
 *   - onChange: callback(newValuesArray)
 *   - options: [{ value, label, disabled? }]
 *   - label: optional label above the dropdown
 *   - placeholder: text when nothing is selected
 */
export default function MultiSelect({ values = [], onChange, options = [], label, placeholder = 'Select…' }) {
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

  const toggleValue = (val) => {
    if (values.includes(val)) {
      // Don't allow deselecting the last option
      if (values.length <= 1) return
      onChange(values.filter(v => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  const selectedLabels = options
    .filter(o => values.includes(o.value))
    .map(o => o.label)

  const nonDisabledOptions = options.filter(o => !o.disabled)
  const allNonDisabledSelected = nonDisabledOptions.length > 0 && nonDisabledOptions.every(o => values.includes(o.value))
  const noNonDisabledSelected = nonDisabledOptions.length > 0 && !nonDisabledOptions.some(o => values.includes(o.value))

  const displayText = selectedLabels.length === 0
    ? placeholder
    : allNonDisabledSelected
      ? 'All'
      : noNonDisabledSelected
        ? `${selectedLabels.join(', ')} Only`
        : selectedLabels.join(', ')

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
          <span className={selectedLabels.length === 0 ? 'text-gray-500' : ''}>
            {displayText}
          </span>
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
              const isSelected = values.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => !opt.disabled && toggleValue(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left
                    transition-colors
                    ${opt.disabled
                      ? isSelected
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 cursor-not-allowed opacity-50'
                      : 'text-white hover:bg-bg-600 cursor-pointer'
                    }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected
                      ? 'bg-accent border-accent'
                      : 'border-bg-400'
                    }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
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
