import { useState } from 'react'
import {
  PROGRESSION_SECTIONS,
  sectionKey,
  sectionLabel,
  romansToLabel,
} from '../utils/progressions'
import {
  getDiatonicTriads,
  getDiatonicSevenths
} from '../utils/musicTheory'

// Tab labels for each section
const TAB_LABELS = {
  'major:triads': 'Major · Triads',
  'minor:triads': 'Minor · Triads',
  'major:sevenths': 'Major · Sevenths',
  'minor:sevenths': 'Minor · Sevenths',
}

/**
 * ProgressionsCatalog — full-page view for browsing and editing progressions.
 * Props:
 *   - progressions: the current progressions state object
 *   - onProgressionsChange: callback(newProgressions)
 */
export default function ProgressionsCatalog({ progressions, onProgressionsChange }) {
  // View vs edit mode
  const [editMode, setEditMode] = useState(false)

  // Local working copy for editing (only used in edit mode)
  const [local, setLocal] = useState(null)

  // Active tab — default to first section
  const [activeTab, setActiveTab] = useState(() => sectionKey(PROGRESSION_SECTIONS[0]))

  // Track which progression is being dragged for reordering
  const [dragState, setDragState] = useState(null)

  // Export JSON modal state
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)

  const enterEditMode = () => {
    const copy = {}
    for (const key of Object.keys(progressions)) {
      copy[key] = progressions[key].map(p => ({ label: p.label, romans: [...p.romans] }))
    }
    setLocal(copy)
    setEditMode(true)
  }

  const handleSave = () => {
    if (local) onProgressionsChange(local)
    setEditMode(false)
    setLocal(null)
  }

  const handleCancel = () => {
    setEditMode(false)
    setLocal(null)
  }

  // Data source: local copy in edit mode, prop in view mode
  const data = editMode ? local : progressions

  // --- Per-section operations (edit mode only) ---

  const moveProgression = (sKey, fromIdx, toIdx) => {
    setLocal(prev => {
      const list = [...(prev[sKey] || [])]
      if (toIdx < 0 || toIdx >= list.length) return prev
      const [item] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, item)
      return { ...prev, [sKey]: list }
    })
  }

  const deleteProgression = (sKey, idx) => {
    setLocal(prev => {
      const list = [...(prev[sKey] || [])]
      list.splice(idx, 1)
      return { ...prev, [sKey]: list }
    })
  }

  const addProgression = (sKey) => {
    setLocal(prev => {
      const list = [...(prev[sKey] || [])]
      list.push({ label: '', romans: [] })
      return { ...prev, [sKey]: list }
    })
  }

  // --- Per-chord operations ---

  const deleteChord = (sKey, progIdx, chordIdx) => {
    setLocal(prev => {
      const list = [...(prev[sKey] || [])]
      const romans = [...list[progIdx].romans]
      romans.splice(chordIdx, 1)
      list[progIdx] = { ...list[progIdx], romans, label: romansToLabel(romans) }
      return { ...prev, [sKey]: list }
    })
  }

  const addChord = (sKey, progIdx) => {
    setLocal(prev => {
      const list = [...(prev[sKey] || [])]
      const romans = [...list[progIdx].romans, '']
      list[progIdx] = { ...list[progIdx], romans, label: romansToLabel(romans.filter(r => r)) }
      return { ...prev, [sKey]: list }
    })
  }

  const changeChord = (sKey, progIdx, chordIdx, newRoman) => {
    setLocal(prev => {
      const list = [...(prev[sKey] || [])]
      const romans = [...list[progIdx].romans]
      romans[chordIdx] = newRoman
      list[progIdx] = { ...list[progIdx], romans, label: romansToLabel(romans.filter(r => r)) }
      return { ...prev, [sKey]: list }
    })
  }

  // --- Drag and drop ---

  const handleDragStart = (sKey, idx) => {
    setDragState({ sectionKey: sKey, index: idx })
  }

  const handleDragOver = (e, sKey, idx) => {
    e.preventDefault()
    if (!dragState || dragState.sectionKey !== sKey) return
    if (dragState.index === idx) return
    moveProgression(sKey, dragState.index, idx)
    setDragState({ sectionKey: sKey, index: idx })
  }

  const handleDragEnd = () => {
    setDragState(null)
  }

  // Active section data
  const activeSection = PROGRESSION_SECTIONS.find(s => sectionKey(s) === activeTab) || PROGRESSION_SECTIONS[0]
  const sKey = sectionKey(activeSection)
  const progs = data[sKey] || []
  const chords = activeSection.chordType === 'sevenths'
    ? getDiatonicSevenths(activeSection.tonality)
    : getDiatonicTriads(activeSection.tonality)
  const chordOptions = [
    { value: '', label: '— select —' },
    ...chords.map(c => ({ value: c.roman, label: c.roman })),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: title + edit/save/cancel */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-8 pt-6 pb-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Progressions Catalog</h2>
          <p className="text-gray-500 text-sm">
            {editMode
              ? 'Edit, reorder, or add chord progressions. Click Save to apply changes.'
              : 'Browse all available chord progressions. Click Edit to modify.'
            }
          </p>
        </div>

        {editMode ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowExport(true)}
              className="px-5 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Export JSON
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={enterEditMode}
            className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-colors min-h-[44px]"
          >
            Edit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-8 pb-4">
        <div className="flex flex-wrap gap-1 bg-bg-800 rounded-xl border border-bg-500 p-1">
          {PROGRESSION_SECTIONS.map((section) => {
            const key = sectionKey(section)
            const isActive = key === activeTab
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors min-w-fit
                  ${isActive
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-bg-600'
                  }`}
              >
                {TAB_LABELS[key]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-6">
        <div className="space-y-2 max-w-3xl mx-auto">
          {progs.length === 0 && !editMode && (
            <div className="text-center text-gray-600 py-12">
              No progressions in this category.
            </div>
          )}

          {progs.map((prog, progIdx) => (
            <div
              key={progIdx}
              draggable={editMode}
              onDragStart={editMode ? () => handleDragStart(sKey, progIdx) : undefined}
              onDragOver={editMode ? (e) => handleDragOver(e, sKey, progIdx) : undefined}
              onDragEnd={editMode ? handleDragEnd : undefined}
              className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors
                ${editMode && dragState?.sectionKey === sKey && dragState?.index === progIdx
                  ? 'border-accent bg-accent/10'
                  : 'border-bg-500 bg-bg-800'
                }`}
            >
              <div className="flex items-center gap-2">
                {/* Drag handle (edit mode only) */}
                {editMode && (
                  <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                )}

                {/* Progression label */}
                <span className="text-sm font-semibold text-gray-200 flex-1">
                  {prog.romans.filter(r => r).length > 0
                    ? <span className="music-notation">{prog.label}</span>
                    : <span className="text-gray-600 italic">Empty progression</span>
                  }
                </span>

                {/* Delete progression (edit mode only) */}
                {editMode && (
                  <button
                    onClick={() => deleteProgression(sKey, progIdx)}
                    className="text-gray-500 hover:text-keyred flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Chord slots */}
              <div className="flex flex-wrap items-center gap-2 pl-6">
                {prog.romans.map((roman, chordIdx) => (
                  <div key={chordIdx} className="flex items-center gap-1">
                    {chordIdx > 0 && <span className="text-gray-600 text-xs">→</span>}
                    {editMode ? (
                      <>
                        <div className="relative">
                          <select
                            value={roman}
                            onChange={(e) => changeChord(sKey, progIdx, chordIdx, e.target.value)}
                            className="appearance-none bg-bg-700 text-white text-xs font-semibold
                              px-3 py-2 pr-8 rounded-lg border border-bg-500
                              hover:border-accent/50 focus:border-accent focus:outline-none
                              transition-colors cursor-pointer min-w-[80px]"
                          >
                            {chordOptions.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-bg-700 text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <svg
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <button
                          onClick={() => deleteChord(sKey, progIdx, chordIdx)}
                          className="text-gray-600 hover:text-keyred"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <span className="music-notation px-3 py-2 rounded-lg bg-bg-700 text-white text-xs font-semibold min-w-[80px] text-center">
                        {roman ? roman : '—'}
                      </span>
                    )}
                  </div>
                ))}

                {/* Add chord button (edit mode only) */}
                {editMode && (
                  <button
                    onClick={() => addChord(sKey, progIdx)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-bg-500
                      text-gray-500 hover:text-accent hover:border-accent/50 transition-colors text-xs font-semibold"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add chord
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add progression button (edit mode only) */}
          {editMode && (
            <button
              onClick={() => addProgression(sKey)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-bg-500
                text-gray-400 hover:text-accent hover:border-accent/50 transition-colors text-sm font-semibold w-full"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add progression
            </button>
          )}
        </div>
      </div>

      {/* Export JSON modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowExport(false)}>
          <div
            className="bg-bg-800 border border-bg-600 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Export Progressions JSON</h3>
              <button
                onClick={() => setShowExport(false)}
                className="text-gray-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Copy this JSON and paste it into <code className="text-accent">progressions.json</code> in the project root.
              The changes will be included in the next build.
            </p>
            <div className="relative flex-1 overflow-hidden">
              <textarea
                readOnly
                value={JSON.stringify(local, null, 2)}
                className="w-full h-full min-h-[300px] bg-bg-900 text-gray-300 text-xs font-mono p-3 rounded-lg border border-bg-600 resize-none focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(local, null, 2))
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-colors min-h-[44px]"
              >
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
