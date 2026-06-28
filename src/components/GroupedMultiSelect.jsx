import { useState, useRef, useEffect } from 'react'

/**
 * GroupedMultiSelect — a styled dropdown with checkboxes for multiple selection,
 * with options grouped into sections. Clicking a section header toggles all
 * options within that section.
 *
 * Props:
 *   - values: array of currently selected values
 *   - onChange: callback(newValuesArray)
 *   - groups: [{ label, options: [{ value, label }] }]
 *   - label: optional label above the dropdown
 *   - placeholder: text when nothing is selected
 */
export default function GroupedMultiSelect({ values = [], onChange, groups = [], label, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allOptions = groups.flatMap(g => g.options)
  const selectedLabels = allOptions
    .filter(o => values.includes(o.value))
    .map(o => o.label)

  const displayText = selectedLabels.length === 0
    ? placeholder
    : selectedLabels.length === allOptions.length
      ? 'All'
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.length} selected`

  const toggleValue = (val) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  const toggleSection = (group) => {
    const sectionValues = group.options.map(o => o.value)
    const allSelected = sectionValues.every(v => values.includes(v))
    if (allSelected) {
      onChange(values.filter(v => !sectionValues.includes(v)))
    } else {
      const newValues = [...values]
      for (const v of sectionValues) {
        if (!newValues.includes(v)) newValues.push(v)
      }
      onChange(newValues)
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
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
          <div className="absolute top-full left-0 mt-1 w-full bg-bg-700 border border-bg-500
            rounded-xl shadow-xl z-50 overflow-hidden min-w-[340px] max-h-[400px] overflow-y-auto">
            {groups.map(group => {
              const sectionValues = group.options.map(o => o.value)
              const allSelected = sectionValues.every(v => values.includes(v))
              const someSelected = sectionValues.some(v => values.includes(v))
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => toggleSection(group)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider
                      text-gray-400 hover:bg-bg-600 cursor-pointer text-left border-b border-bg-600"
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${allSelected
                        ? 'bg-accent border-accent'
                        : someSelected
                          ? 'bg-accent/40 border-accent'
                          : 'border-bg-400'
                      }`}>
                      {allSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {group.label}
                  </button>
                  {group.options.map(opt => {
                    const isSelected = values.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleValue(opt.value)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 pl-8 text-sm font-semibold text-left
                          text-white hover:bg-bg-600 cursor-pointer transition-colors"
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
                        <span className="music-notation whitespace-nowrap">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
