import { useEffect } from 'react'
import useDropdownPosition from '../hooks/useDropdownPosition'

/**
 * GroupedSelect — a custom dropdown for single selection with grouped options.
 * Each group has a non-selectable header and a list of items.
 *
 * Props:
 *   - value: current selected value
 *   - onChange: callback(newValue)
 *   - groups: [{ header: string, items: [{ value, label, disabled? }] }]
 *   - label: optional label above the dropdown
 */
export default function GroupedSelect({ value, onChange, groups = [], label }) {
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

  const allItems = groups.flatMap(g => g.items)
  const selectedLabel = allItems.find(o => o.value === value)?.label || value

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
            {groups.map((group, gi) => (
              <div key={gi}>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-bg-800/50">
                  {group.header}
                </div>
                {group.items.map(opt => {
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left
                        cursor-pointer transition-colors
                        ${opt.disabled
                          ? 'text-gray-600 cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'text-accent bg-accent/10'
                            : 'text-white hover:bg-bg-600'
                        }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-accent border-accent' : 'border-bg-400'}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
