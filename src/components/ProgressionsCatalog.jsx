import { useState, useMemo, useRef } from 'react'
import MultiSelect from './MultiSelect'
import ChordPicker from './ChordPicker'
import RomanNumeral from './RomanNumeral'
import {
  romansToLabel,
  CHORD_TYPE_OPTIONS,
  NON_DIATONIC_SOURCES,
} from '../utils/progressions'
import {
  getChordSourceType,
} from '../utils/musicTheory'

// Color class for a chord based on its source type
function chordColorClass(roman, tonality) {
  const st = getChordSourceType(roman, tonality)
  switch (st) {
    case 'modal-interchange': return 'text-blue-400'
    case 'secondary-dominants':
    case 'secondary-leading-tone': return 'text-keyred'
    case 'free-choice': return 'text-purple-400'
    default: return 'text-gray-200'
  }
}

/**
 * ProgressionsCatalog — full-page view for browsing and editing progressions.
 * Props:
 *   - progressions: flat array of progression objects
 *   - onProgressionsChange: callback(newProgressions)
 */
export default function ProgressionsCatalog({ progressions, onProgressionsChange, onResetToDefaults }) {
  const [editMode, setEditMode] = useState(false)
  const [local, setLocal] = useState(null)

  // Filters
  const [tonality, setTonality] = useState('major')
  const [chromaticism, setChromaticism] = useState('diatonic')
  const [chordTypes, setChordTypes] = useState(['triads', 'sevenths'])
  const [sources, setSources] = useState(NON_DIATONIC_SOURCES.map(s => s.value))

  const [dragState, setDragState] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showFilterInfo, setShowFilterInfo] = useState(false)
  const fileInputRef = useRef(null)

  const enterEditMode = () => {
    setLocal(progressions.map(p => ({
      label: p.label,
      romans: [...p.romans],
      tonality: p.tonality,
      chromaticism: p.chromaticism,
      chordType: Array.isArray(p.chordType) ? [...p.chordType] : p.chordType,
      ...(p.sources ? { sources: [...p.sources] } : {}),
      ...(p.favorite ? { favorite: true } : {}),
    })))
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

  const handleSaveToFile = () => {
    const dataToSave = editMode ? local : progressions
    if (!dataToSave) return
    const json = JSON.stringify(dataToSave, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'progressions.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoadFromFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        if (!Array.isArray(parsed)) throw new Error('File does not contain a progressions array')
        if (editMode) {
          setLocal(parsed)
        } else {
          onProgressionsChange(parsed)
        }
      } catch (err) {
        alert('Failed to load file: ' + err.message)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleResetToDefaults = () => {
    if (!confirm('Reset all progressions to the defaults that ship with the app? This will discard all your changes and clear the browser storage.')) return
    if (onResetToDefaults) onResetToDefaults()
    if (editMode) {
      setEditMode(false)
      setLocal(null)
    }
  }

  const data = editMode ? local : progressions

  // Filtered progressions with their full-array indices
  const filtered = useMemo(() => {
    const result = []
    data.forEach((p, idx) => {
      if (p.tonality !== tonality) return
      if (p.chromaticism !== chromaticism) return
      if (!chordTypes.includes(p.chordType) && !(Array.isArray(p.chordType) && p.chordType.every(t => chordTypes.includes(t)))) return
      if (chromaticism === 'non-diatonic' && sources.length > 0 && (!p.sources || !p.sources.some(s => sources.includes(s)))) return
      result.push({ prog: p, fullIdx: idx })
    })
    return result
  }, [data, tonality, chromaticism, chordTypes, sources])

  // --- Edit operations ---

  const moveProgression = (fromFilteredIdx, toFilteredIdx) => {
    setLocal(prev => {
      const fromFull = filtered[fromFilteredIdx]?.fullIdx
      const toFull = filtered[toFilteredIdx]?.fullIdx
      if (fromFull == null || toFull == null) return prev
      const list = [...prev]
      const [item] = list.splice(fromFull, 1)
      const adj = fromFull < toFull ? toFull - 1 : toFull
      list.splice(adj, 0, item)
      return list
    })
  }

  const deleteProgression = (fullIdx) => {
    setLocal(prev => {
      const list = [...prev]
      list.splice(fullIdx, 1)
      return list
    })
  }

  const addProgression = () => {
    const newProg = {
      label: '',
      romans: [],
      tonality,
      chromaticism,
      chordType: chordTypes.length === 1 ? chordTypes[0] : [...chordTypes],
    }
    if (chromaticism === 'non-diatonic') {
      newProg.sources = [sources[0] || 'secondary-dominants']
    }
    setLocal(prev => [...prev, newProg])
  }

  const toggleFavorite = (fullIdx) => {
    const updateItem = (item) => {
      const copy = { ...item }
      if (copy.favorite) delete copy.favorite
      else copy.favorite = true
      return copy
    }
    if (editMode) {
      setLocal(prev => prev.map((p, i) => i === fullIdx ? updateItem(p) : p))
    } else {
      onProgressionsChange(progressions.map((p, i) => i === fullIdx ? updateItem(p) : p))
    }
  }

  const deleteChord = (fullIdx, chordIdx) => {
    setLocal(prev => prev.map((p, i) => {
      if (i !== fullIdx) return p
      const romans = [...p.romans]
      romans.splice(chordIdx, 1)
      return { ...p, romans, label: romansToLabel(romans) }
    }))
  }

  const addChord = (fullIdx) => {
    setLocal(prev => prev.map((p, i) => {
      if (i !== fullIdx) return p
      const romans = [...p.romans, 'I']
      return { ...p, romans, label: romansToLabel(romans.filter(r => r)) }
    }))
  }

  const changeChord = (fullIdx, chordIdx, newRoman) => {
    setLocal(prev => prev.map((p, i) => {
      if (i !== fullIdx) return p
      const romans = [...p.romans]
      romans[chordIdx] = newRoman
      return { ...p, romans, label: romansToLabel(romans.filter(r => r)) }
    }))
  }

  const StarIcon = ({ filled, className }) => (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )

  // --- Drag and drop ---

  const handleDragStart = (filteredIdx) => {
    setDragState({ index: filteredIdx })
  }

  const handleDragOver = (e, filteredIdx) => {
    e.preventDefault()
    if (!dragState || dragState.index === filteredIdx) return
    moveProgression(dragState.index, filteredIdx)
    setDragState({ index: filteredIdx })
  }

  const handleDragEnd = () => {
    setDragState(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: title + edit/save/cancel */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-8 pt-6 pb-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Progressions Catalog</h2>
          <div className="flex items-center gap-1.5">
            <p className="text-gray-500 text-sm">
              {editMode
                ? 'Edit, reorder, or add chord progressions. Click Save to apply changes.'
                : 'Browse all available chord progressions. Click Edit to modify.'
              }
            </p>
            <button
              onClick={() => setShowFilterInfo(true)}
              className="text-gray-500 hover:text-accent transition-colors"
              title="How filtering works"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden file input for Load from File */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleLoadFromFile}
        />

        {editMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(true)}
              className="text-gray-400 hover:text-accent transition-colors min-h-[44px] flex items-center"
              title="How to save progressions"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={handleSaveToFile}
              className="px-4 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Save to File
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Load from File
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="px-4 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToFile}
              className="px-4 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Save to File
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Load from File
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
            >
              Reset to Defaults
            </button>
            <button
              onClick={enterEditMode}
              className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Filter controls */}
      <div className="px-4 sm:px-8 pb-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Tonality: Major / Minor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tonality</label>
            <div className="flex gap-1 bg-bg-800 rounded-xl border border-bg-500 p-1">
              {['major', 'minor'].map(t => (
                <button
                  key={t}
                  onClick={() => setTonality(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors capitalize
                    ${tonality === t ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-bg-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Chromaticism: Diatonic / Non-Diatonic */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Chromaticism</label>
            <div className="flex gap-1 bg-bg-800 rounded-xl border border-bg-500 p-1">
              {['diatonic', 'non-diatonic'].map(c => (
                <button
                  key={c}
                  onClick={() => setChromaticism(c)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors capitalize
                    ${chromaticism === c ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-bg-600'}`}
                >
                  {c === 'non-diatonic' ? 'Non-Diatonic' : 'Diatonic'}
                </button>
              ))}
            </div>
          </div>

          {/* Chord Types: MultiSelect */}
          <MultiSelect
            label="Chord Types"
            values={chordTypes}
            onChange={setChordTypes}
            options={CHORD_TYPE_OPTIONS}
          />

          {/* Sources: MultiSelect (only when non-diatonic) */}
          {chromaticism === 'non-diatonic' && (
            <MultiSelect
              label="Sources"
              values={sources}
              onChange={setSources}
              options={NON_DIATONIC_SOURCES}
            />
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-6">
        <div className="space-y-2 max-w-3xl mx-auto">
          {filtered.length === 0 && !editMode && (
            <div className="text-center text-gray-600 py-12">
              No progressions match the current filters.
            </div>
          )}

          {filtered.map(({ prog, fullIdx }, filteredIdx) => (
            <div
              key={fullIdx}
              draggable={editMode}
              onDragStart={editMode ? () => handleDragStart(filteredIdx) : undefined}
              onDragOver={editMode ? (e) => handleDragOver(e, filteredIdx) : undefined}
              onDragEnd={editMode ? handleDragEnd : undefined}
              className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors
                ${editMode && dragState?.index === filteredIdx
                  ? 'border-accent bg-accent/10'
                  : 'border-bg-500 bg-bg-800'
                }`}
            >
              <div className="flex items-center gap-2">
                {editMode && (
                  <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                )}

                <button
                  onClick={() => toggleFavorite(fullIdx)}
                  className={`flex-shrink-0 transition-colors ${prog.favorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-600 hover:text-gray-400'}`}
                  title={prog.favorite ? 'Unfavorite' : 'Favorite'}
                >
                  <StarIcon filled={!!prog.favorite} className="w-4 h-4" />
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  {editMode ? (
                    <>
                      {prog.romans.map((roman, chordIdx) => (
                        <ChordPicker
                          key={chordIdx}
                          tonality={tonality}
                          chromaticism={chromaticism}
                          value={roman}
                          onChange={(newRoman) => changeChord(fullIdx, chordIdx, newRoman)}
                          onRemove={() => deleteChord(fullIdx, chordIdx)}
                        />
                      ))}
                      <button
                        onClick={() => addChord(fullIdx)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-bg-500
                          text-gray-500 hover:text-accent hover:border-accent/50 transition-colors text-xs font-semibold w-fit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </>
                  ) : (
                    <span className="text-sm font-semibold">
                      {prog.romans.filter(r => r).length > 0
                        ? <span className="music-notation flex items-center gap-1.5 flex-wrap">
                            {prog.romans.filter(r => r).map((roman, i, arr) => (
                              <span key={i} className="flex items-center gap-1.5">
                                {i > 0 && <span className="text-gray-600">–</span>}
                                <span className={chordColorClass(roman, prog.tonality)}>
                                  <RomanNumeral roman={roman} />
                                </span>
                              </span>
                            ))}
                          </span>
                        : <span className="text-gray-600 italic">Empty progression</span>
                      }
                    </span>
                  )}
                </div>

                {editMode && (
                  <button
                    onClick={() => deleteProgression(fullIdx)}
                    className="text-gray-500 hover:text-keyred flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {editMode && (
            <button
              onClick={addProgression}
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

      {/* Filter info popup */}
      {showFilterInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowFilterInfo(false)}>
          <div
            className="bg-bg-800 border border-bg-600 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filtering & Progression Settings</h3>
              <button
                onClick={() => setShowFilterInfo(false)}
                className="text-gray-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-300 text-sm space-y-4">
              <p className="text-white font-semibold">Each progression is tagged with the following fields:</p>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Tonality</p>
                <p className="text-gray-400">
                  Either <span className="text-accent">Major</span> or <span className="text-accent">Minor</span>. The filter shows only progressions matching the selected tonality. This is an exact match — a major progression will never appear when Minor is selected, and vice versa.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Chromaticism</p>
                <p className="text-gray-400">
                  Either <span className="text-accent">Diatonic</span> (only chords from the scale) or <span className="text-accent">Non-Diatonic</span> (contains chords from outside the scale). This is an exact match.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Chord Types</p>
                <p className="text-gray-400">
                  Multi-select between <span className="text-accent">Triads</span> and <span className="text-accent">Seventh Chords</span>. Most progressions are purely triads or purely sevenths. However, some progressions mix both (e.g. <span className="text-accent">I – IV – V7 – I</span> contains triads I, IV and a seventh V7). These mixed progressions have <code className="text-accent">chordType</code> set to an array like <code className="text-accent">["triads", "sevenths"]</code>.
                </p>
                <p className="text-gray-400 pt-1">
                  The filter uses AND logic: a progression appears only if <span className="text-white font-semibold">all</span> of its chord types are selected. So a mixed progression like I – IV – V7 – I is visible only when both Triads and Seventh Chords are enabled. Selecting only Triads or only Sevenths will hide it.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">Chord Sources <span className="text-gray-500 font-normal">(non-diatonic only)</span></p>
                <p className="text-gray-400">
                  Multi-select between four non-diatonic chord sources:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 ml-2">
                  <li><span className="text-accent">Secondary Dominants</span> — e.g. V/vi, V/V</li>
                  <li><span className="text-accent">Secondary Leading-Tone Chords</span> — e.g. viio/V, viio7/ii</li>
                  <li><span className="text-accent">Modal Interchange</span> — borrowed chords from the parallel mode, e.g. bVI, bVII, iv in major</li>
                  <li><span className="text-accent">Free Choice</span> — any chromatic chord not fitting the above, e.g. bII (Neapolitan)</li>
                </ul>
                <p className="text-gray-400 pt-1">
                  A progression can contain chords from multiple sources. Its <code className="text-accent">sources</code> field lists all sources used. The filter uses OR logic: a progression appears if <span className="text-white font-semibold">any</span> of its sources match <span className="text-white font-semibold">any</span> selected source. For example, a progression with sources <code className="text-accent">["secondary-dominants", "modal-interchange"]</code> will appear when either Secondary Dominants or Modal Interchange (or both) is selected.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-bg-600">
                <p className="text-white font-semibold">Chord Extensions</p>
                <p className="text-gray-400">
                  For triads, chords are plain triads (e.g. I, vi, bVI). For seventh chords, each chord includes its diatonic 7th extension (e.g. Imaj7, V7, vi7, iim7b5). Non-diatonic seventh chords use the appropriate extension based on their chord quality (e.g. V7/vi, viio7/V, bVImaj7, bIImaj7).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info popup */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowInfo(false)}>
          <div
            className="bg-bg-800 border border-bg-600 rounded-2xl p-6 max-w-lg w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Saving Progressions Permanently</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-300 text-sm space-y-4">
              <p className="text-white font-semibold">There are three ways to save your progressions:</p>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">1. Browser Storage (automatic)</p>
                <p className="text-gray-400">
                  When you click <span className="text-accent font-semibold">Save</span> in edit mode, your changes are stored in the browser's local storage. They persist across page refreshes and app restarts, but are lost when you clear browser data, switch browsers, or use a different device.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">2. File Backup (manual)</p>
                <p className="text-gray-400">
                  Click <span className="text-accent font-semibold">Save to File</span> to download your progressions as a JSON file. Click <span className="text-accent font-semibold">Load from File</span> to restore progressions from a previously saved file. Loading a file also updates the browser storage, so the loaded progressions persist across refreshes.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-white font-semibold">3. Source File (permanent)</p>
                <p className="text-gray-400">
                  To make your changes part of the app itself, so they are available to all users on all devices:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400 ml-2">
                  <li>Click <span className="text-accent font-semibold">Export JSON</span> {'→'} <span className="text-accent font-semibold">Copy to clipboard</span></li>
                  <li>Paste the JSON into <code className="text-accent">progressions.json</code> in the project root</li>
                  <li>Run <code className="text-accent">npm run build</code> and deploy (e.g. to Netlify)</li>
                </ol>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-bg-600">
                <p className="text-white font-semibold">Reset to Defaults</p>
                <p className="text-gray-400">
                  Click <span className="text-accent font-semibold">Reset to Defaults</span> to discard all changes and restore the original progressions that ship with the app. This clears the browser storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                value={JSON.stringify(data, null, 2)}
                className="w-full h-full min-h-[300px] bg-bg-900 text-gray-300 text-xs font-mono p-3 rounded-lg border border-bg-600 resize-none focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  const json = JSON.stringify(data, null, 2)
                  const blob = new Blob([json], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'progressions.json'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
                className="px-5 py-2.5 rounded-lg bg-bg-600 text-white text-sm font-bold hover:bg-bg-500 transition-colors min-h-[44px]"
              >
                Download JSON
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(data, null, 2))
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
