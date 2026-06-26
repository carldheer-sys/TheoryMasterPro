import { useState, useRef, useEffect } from 'react'

/**
 * Dropdown — a reusable dropdown menu component.
 * Props:
 *   - label: button text or node
 *   - items: [{ label, value, locked?, onClick? }]
 *   - onSelect: callback(value, item)
 *   - showChevron: show dropdown chevron (default true)
 */
export default function Dropdown({ label, items, onSelect, align = 'left', showChevron = true }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleSelect = (item) => {
    if (item.locked) return
    if (onSelect) onSelect(item.value, item)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold
          transition-colors duration-150 min-h-[40px] sm:min-h-[44px]
          ${open
            ? 'bg-bg-500 text-accent-light'
            : 'bg-bg-700 text-gray-300 hover:bg-bg-600 hover:text-white'
          }`}
      >
        {label}
        {showChevron && (
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        )}
      </button>

      {open && (
        <div
          className={`dropdown-enter absolute top-full mt-2 z-50 min-w-[220px]
            bg-bg-700 border border-bg-500 rounded-xl shadow-2xl shadow-black/50 overflow-hidden
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item)}
              disabled={item.locked}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors
                flex items-center justify-between gap-3 min-h-[44px]
                ${item.locked
                  ? 'text-gray-600 cursor-not-allowed bg-bg-800/50'
                  : 'text-gray-300 hover:bg-bg-600 hover:text-white'
                }
                ${idx > 0 ? 'border-t border-bg-600/50' : ''}`}
            >
              <span>{item.label}</span>
              {item.locked && (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
