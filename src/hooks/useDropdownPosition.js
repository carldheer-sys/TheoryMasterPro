import { useState, useLayoutEffect, useRef, useCallback } from 'react'

/**
 * useDropdownPosition — manages open/close state and computes fixed
 * positioning for a dropdown panel so it escapes overflow-clipped
 * containers (e.g. <main overflow-y-auto>).
 *
 * Usage:
 *   const { open, setOpen, toggle, panelStyle, triggerRef } = useDropdownPosition()
 *   <button ref={triggerRef} onClick={toggle}>...</button>
 *   {open && <div style={panelStyle}>...</div>}
 */
export default function useDropdownPosition() {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState({})
  const triggerRef = useRef(null)

  const toggle = useCallback(() => setOpen(o => !o), [])

  const compute = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportH = window.innerHeight
    const spaceBelow = viewportH - rect.bottom
    const spaceAbove = rect.top
    const gap = 4
    const estHeight = 400
    let top, maxHeight

    if (spaceBelow >= Math.min(estHeight, 250) || spaceBelow >= spaceAbove) {
      top = rect.bottom + gap
      maxHeight = Math.min(spaceBelow - gap - 8, estHeight)
    } else {
      const actualHeight = Math.min(spaceAbove - gap - 8, estHeight)
      top = rect.top - gap - actualHeight
      maxHeight = actualHeight
    }

    setPanelStyle({
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(rect.left)}px`,
      minWidth: `${Math.round(rect.width)}px`,
      maxHeight: `${Math.round(maxHeight)}px`,
      overflowY: 'auto',
      zIndex: 9999,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    compute()
    const handler = () => compute()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [open, compute])

  return { open, setOpen, toggle, panelStyle, triggerRef }
}
