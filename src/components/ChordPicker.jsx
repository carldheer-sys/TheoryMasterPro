import { useState, useEffect, useMemo, useRef } from 'react'
import {
  getRomanParts,
  getDiatonicTriads,
  getDiatonicSevenths,
  getDiatonicTriadsWithHarmMinor,
  getDiatonicSeventhsWithHarmMinor,
  getAvailableSecondaryChords,
  getChordSourceType,
} from '../utils/musicTheory'

// ─── Data builders ───────────────────────────────────────────────────────

// Build root options for a given tonality (diatonic or modal-interchange).
// Returns array of: { root, triadRoman, seventhRoman, triadExtension, seventhExtension }
function buildRootOptions(tonality) {
  const triads = getDiatonicTriadsWithHarmMinor(tonality, true)
  const sevenths = getDiatonicSeventhsWithHarmMinor(tonality, true)
  const rootMap = {}

  for (const triad of triads) {
    const parts = getRomanParts(triad.roman)
    const root = parts.base
    if (!rootMap[root]) {
      rootMap[root] = { root, triadRoman: triad.roman, seventhRoman: null, triadExtension: parts.superscript, seventhExtension: null }
    }
  }
  for (const seventh of sevenths) {
    const parts = getRomanParts(seventh.roman)
    const root = parts.base
    if (rootMap[root]) {
      rootMap[root].seventhRoman = seventh.roman
      rootMap[root].seventhExtension = parts.superscript
    } else {
      rootMap[root] = { root, triadRoman: null, seventhRoman: seventh.roman, triadExtension: null, seventhExtension: parts.superscript }
    }
  }
  return Object.values(rootMap)
}

// Build secondary chord options for a given tonality and type.
// Returns array of: { target, label, equivalent, triadRoman, seventhRoman }
function buildSecondaryOptions(tonality, type) {
  const available = getAvailableSecondaryChords(tonality).filter(sc => sc.type === type)
  return available.map(sc => {
    const isDominant = type === 'dominant'
    const triadRoman = isDominant ? `V/${sc.targetRoman}` : `viio/${sc.targetRoman}`
    const seventhRoman = sc.id // e.g. "V7/vi" or "viio7/vi"
    const equivalent = sc.equivalentRoman.replace(/7$/, '')
    return {
      target: sc.targetRoman,
      label: `${triadRoman} (${equivalent})`,
      equivalent,
      triadRoman,
      seventhRoman,
    }
  })
}

// All possible roots for free choice
const FREE_CHOICE_MAJOR_ROOTS = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII']
const FREE_CHOICE_MINOR_ROOTS = ['i', 'bii', 'ii', 'biii', 'iii', 'iv', 'bv', 'v', 'bvi', 'vi', 'bvii', 'vii']

// Free choice extension options — root-case-aware (uppercase = major, lowercase = minor)
const FREE_CHOICE_TRIAD_EXTS_UPPER = [
  { value: '', label: 'Major' },
  { value: '+', label: 'Augmented (+)' },
]
const FREE_CHOICE_SEVENTH_EXTS_UPPER = [
  { value: '7', label: 'Dominant 7th (7)' },
  { value: 'maj7', label: 'Major 7th (maj7)' },
]
const FREE_CHOICE_TRIAD_EXTS_LOWER = [
  { value: '', label: 'Minor' },
  { value: 'o', label: 'Diminished (o)' },
]
const FREE_CHOICE_SEVENTH_EXTS_LOWER = [
  { value: '7', label: 'Minor 7th (7)' },
  { value: 'maj7', label: 'Minor-Major 7th (maj7)' },
  { value: 'm7b5', label: 'Half-Diminished (m7b5)' },
  { value: 'o7', label: 'Diminished 7th (o7)' },
]

// All valid seventh extension values (for parseRoman detection)
const ALL_SEVENTH_EXTS = ['7', 'maj7', 'm7b5', 'o7']

// Map a roman numeral string to a descriptive quality label (e.g. "Major", "Minor 7th (7)")
function qualityLabel(roman) {
  const parts = getRomanParts(roman)
  const ext = parts.superscript
  const isUpper = parts.base[0] === parts.base[0].toUpperCase()

  if (!ext) return isUpper ? 'Major' : 'Minor'
  if (ext === 'o') return 'Diminished (o)'
  if (ext === '+') return 'Augmented (+)'
  if (ext === '7') return isUpper ? 'Dominant 7th (7)' : 'Minor 7th (7)'
  if (ext === 'maj7') return isUpper ? 'Major 7th (maj7)' : 'Minor-Major 7th (maj7)'
  if (ext === 'm7b5') return 'Half-Diminished (m7b5)'
  if (ext === 'o7') return 'Diminished 7th (o7)'
  if (ext === '+maj7') return 'Augmented Major 7th (+maj7)'
  return isUpper ? 'Major' : 'Minor'
}

// Source type options for non-diatonic mode
const SOURCE_TYPE_OPTIONS = [
  { value: 'diatonic', label: 'Diatonic' },
  { value: 'modal-interchange', label: 'Modal Interchange' },
  { value: 'secondary-dominants', label: 'Secondary Dominants' },
  { value: 'secondary-leading-tone', label: 'Secondary Leading-Tone' },
  { value: 'free-choice', label: 'Free Choice' },
]

// ─── Parsing ─────────────────────────────────────────────────────────────

// Parse a roman string into { sourceType, root, extensionType, freeExtension, target }
function parseRoman(roman, tonality, chromaticism) {
  if (!roman) {
    const defaultSource = chromaticism === 'non-diatonic' ? 'diatonic' : 'diatonic'
    return { sourceType: defaultSource, root: '', extensionType: 'triad', freeExtension: '', target: '' }
  }

  if (chromaticism === 'diatonic') {
    const parts = getRomanParts(roman)
    const opts = buildRootOptions(tonality)
    const match = opts.find(o => o.triadRoman === roman || o.seventhRoman === roman)
    const extensionType = match && match.seventhRoman === roman ? 'seventh' : 'triad'
    return { sourceType: 'diatonic', root: parts.base, extensionType, freeExtension: '', target: '' }
  }

  // Non-diatonic
  const sourceType = getChordSourceType(roman, tonality)

  if (sourceType === 'secondary-dominants' || sourceType === 'secondary-leading-tone') {
    const parts = getRomanParts(roman)
    const isSeventh = parts.superscript.includes('7')
    const target = parts.secondary.slice(1)
    return { sourceType, root: '', extensionType: isSeventh ? 'seventh' : 'triad', freeExtension: '', target }
  }

  if (sourceType === 'modal-interchange') {
    const parallel = tonality === 'major' ? 'minor' : 'major'
    const parts = getRomanParts(roman)
    const opts = buildRootOptions(parallel)
    const match = opts.find(o => o.triadRoman === roman || o.seventhRoman === roman)
    const extensionType = match && match.seventhRoman === roman ? 'seventh' : 'triad'
    return { sourceType: 'modal-interchange', root: parts.base, extensionType, freeExtension: '', target: '' }
  }

  // Free choice
  const parts = getRomanParts(roman)
  const ext = parts.superscript
  const isSeventh = ALL_SEVENTH_EXTS.includes(ext)
  return { sourceType: 'free-choice', root: parts.base, extensionType: isSeventh ? 'seventh' : 'triad', freeExtension: ext, target: '' }
}

// Build a roman string from the picker state
function buildRoman(state, tonality) {
  const { sourceType, root, extensionType, freeExtension, target } = state
  if (!root && !target) return ''

  if (sourceType === 'secondary-dominants') {
    return extensionType === 'seventh' ? `V7/${target}` : `V/${target}`
  }
  if (sourceType === 'secondary-leading-tone') {
    return extensionType === 'seventh' ? `viio7/${target}` : `viio/${target}`
  }
  if (sourceType === 'free-choice') {
    if (extensionType === 'seventh') {
      return root + (freeExtension || '7')
    }
    return root + (freeExtension || '')
  }

  // Diatonic or modal interchange
  const effectiveTonality = sourceType === 'modal-interchange'
    ? (tonality === 'major' ? 'minor' : 'major')
    : tonality
  const opts = buildRootOptions(effectiveTonality)
  const opt = opts.find(o => o.root === root)
  if (!opt) return root
  return extensionType === 'seventh' ? (opt.seventhRoman || opt.triadRoman) : opt.triadRoman
}

// ─── Styled mini-select ──────────────────────────────────────────────────

function MiniSelect({ value, onChange, children, width = '70px', colorClass = 'text-white' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-bg-700 ${colorClass} text-xs font-semibold
          px-2 py-1.5 pr-6 rounded-lg border border-bg-500
          hover:border-accent/50 focus:border-accent focus:outline-none
          transition-colors cursor-pointer music-notation`}
        style={{ width }}
      >
        {children}
      </select>
      <svg
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

// ─── ChordPicker component ───────────────────────────────────────────────

/**
 * ChordPicker — multi-dropdown chord selector for progression editing.
 *
 * Props:
 *   - tonality: 'major' | 'minor'
 *   - chromaticism: 'diatonic' | 'non-diatonic'
 *   - value: current roman string
 *   - onChange: callback(newRoman)
 *   - onRemove: callback to remove this chord
 */
export default function ChordPicker({ tonality, chromaticism, value, onChange, onRemove }) {
  const parsed = useMemo(() => parseRoman(value, tonality, chromaticism), [value, tonality, chromaticism])

  const [state, setState] = useState(parsed)
  const isInternalChange = useRef(false)

  // Sync internal state when value changes externally.
  // When the change originated from within this component (e.g. root change in free-choice),
  // preserve the sourceType so it doesn't get reclassified by parseRoman.
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      setState(prev => ({ ...prev, root: parsed.root, extensionType: parsed.extensionType, freeExtension: parsed.freeExtension, target: parsed.target }))
    } else {
      setState(parsed)
    }
  }, [parsed])

  const update = (partial) => {
    const next = { ...state, ...partial }
    setState(next)
    const roman = buildRoman(next, tonality)
    if (roman !== value) {
      isInternalChange.current = true
      onChange(roman)
    }
  }

  // Determine color class based on source type
  const colorClass = useMemo(() => {
    const st = chromaticism === 'non-diatonic' ? state.sourceType : 'diatonic'
    switch (st) {
      case 'modal-interchange': return 'text-blue-400'
      case 'secondary-dominants':
      case 'secondary-leading-tone': return 'text-keyred'
      case 'free-choice': return 'text-purple-400'
      default: return 'text-white'
    }
  }, [chromaticism, state.sourceType])

  // Build options based on current state
  const rootOptions = useMemo(() => {
    if (state.sourceType === 'modal-interchange') {
      return buildRootOptions(tonality === 'major' ? 'minor' : 'major')
    }
    if (state.sourceType === 'free-choice') return null // handled separately
    return buildRootOptions(tonality)
  }, [tonality, state.sourceType])

  const secondaryOptions = useMemo(() => {
    if (state.sourceType === 'secondary-dominants') {
      return buildSecondaryOptions(tonality, 'dominant')
    }
    if (state.sourceType === 'secondary-leading-tone') {
      return buildSecondaryOptions(tonality, 'leading-tone')
    }
    return null
  }, [tonality, state.sourceType])

  // When sourceType changes, reset root/target to first available option
  const handleSourceTypeChange = (newSourceType) => {
    if (newSourceType === 'secondary-dominants' || newSourceType === 'secondary-leading-tone') {
      const opts = newSourceType === 'secondary-dominants'
        ? buildSecondaryOptions(tonality, 'dominant')
        : buildSecondaryOptions(tonality, 'leading-tone')
      update({ sourceType: newSourceType, target: opts[0]?.target || '', root: '', extensionType: 'triad', freeExtension: '' })
    } else if (newSourceType === 'free-choice') {
      update({ sourceType: newSourceType, root: 'I', extensionType: 'triad', freeExtension: '', target: '' })
    } else if (newSourceType === 'modal-interchange') {
      const opts = buildRootOptions(tonality === 'major' ? 'minor' : 'major')
      update({ sourceType: newSourceType, root: opts[0]?.root || '', extensionType: 'triad', freeExtension: '', target: '' })
    } else {
      // diatonic
      const opts = buildRootOptions(tonality)
      update({ sourceType: newSourceType, root: opts[0]?.root || '', extensionType: 'triad', freeExtension: '', target: '' })
    }
  }

  // When root changes in diatonic/modal, keep extensionType if valid, else default to triad
  const handleRootChange = (newRoot) => {
    update({ root: newRoot })
  }

  // When root changes in free-choice, validate extension is still viable for new root case
  const handleFreeRootChange = (newRoot) => {
    const isUpper = newRoot[0] === newRoot[0].toUpperCase()
    const validExts = isUpper
      ? [...FREE_CHOICE_TRIAD_EXTS_UPPER, ...FREE_CHOICE_SEVENTH_EXTS_UPPER]
      : [...FREE_CHOICE_TRIAD_EXTS_LOWER, ...FREE_CHOICE_SEVENTH_EXTS_LOWER]
    const currentExt = state.extensionType === 'seventh'
      ? (state.freeExtension || '7')
      : (state.freeExtension || '')
    if (!validExts.some(e => e.value === currentExt)) {
      update({ root: newRoot, freeExtension: '', extensionType: 'triad' })
    } else {
      update({ root: newRoot })
    }
  }

  // Render extension dropdown for diatonic/modal-interchange
  const renderExtensionDropdown = () => {
    const opts = state.sourceType === 'modal-interchange'
      ? buildRootOptions(tonality === 'major' ? 'minor' : 'major')
      : rootOptions
    const opt = opts?.find(o => o.root === state.root)
    if (!opt) return null

    const triadLabel = opt.triadRoman ? qualityLabel(opt.triadRoman) : '—'
    const seventhLabel = opt.seventhRoman ? qualityLabel(opt.seventhRoman) : '—'
    const hasSeventh = !!opt.seventhRoman

    return (
      <MiniSelect
        value={state.extensionType}
        onChange={(v) => update({ extensionType: v })}
        width="160px"
        colorClass={colorClass}
      >
        <optgroup label="Triad">
          <option value="triad" className="bg-bg-700 text-white">{triadLabel}</option>
        </optgroup>
        {hasSeventh && (
          <optgroup label="Seventh">
            <option value="seventh" className="bg-bg-700 text-white">{seventhLabel}</option>
          </optgroup>
        )}
      </MiniSelect>
    )
  }

  // Render extension dropdown for secondary chords
  const renderSecondaryExtensionDropdown = () => {
    const opts = secondaryOptions
    const opt = opts?.find(o => o.target === state.target)
    if (!opt) return null

    return (
      <MiniSelect
        value={state.extensionType}
        onChange={(v) => update({ extensionType: v })}
        width="160px"
        colorClass={colorClass}
      >
        <optgroup label="Triad">
          <option value="triad" className="bg-bg-700 text-white">{qualityLabel(opt.triadRoman)}</option>
        </optgroup>
        <optgroup label="Seventh">
          <option value="seventh" className="bg-bg-700 text-white">{qualityLabel(opt.seventhRoman)}</option>
        </optgroup>
      </MiniSelect>
    )
  }

  // Render extension dropdown for free choice — root-case-aware options
  const renderFreeExtensionDropdown = () => {
    const isUpper = state.root[0] === state.root[0].toUpperCase()
    const triadExts = isUpper ? FREE_CHOICE_TRIAD_EXTS_UPPER : FREE_CHOICE_TRIAD_EXTS_LOWER
    const seventhExts = isUpper ? FREE_CHOICE_SEVENTH_EXTS_UPPER : FREE_CHOICE_SEVENTH_EXTS_LOWER

    const extValue = state.extensionType === 'seventh'
      ? (state.freeExtension || '7')
      : (state.freeExtension || '')

    return (
      <MiniSelect
        value={extValue}
        onChange={(v) => {
          const isSeventh = ALL_SEVENTH_EXTS.includes(v)
          update({ freeExtension: v, extensionType: isSeventh ? 'seventh' : 'triad' })
        }}
        width="160px"
        colorClass={colorClass}
      >
        <optgroup label="Triad">
          {triadExts.map(e => (
            <option key={e.value} value={e.value} className="bg-bg-700 text-white">{e.label}</option>
          ))}
        </optgroup>
        <optgroup label="Seventh">
          {seventhExts.map(e => (
            <option key={e.value} value={e.value} className="bg-bg-700 text-white">{e.label}</option>
          ))}
        </optgroup>
      </MiniSelect>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {/* Source type dropdown — always shown; diatonic mode only has "Diatonic" */}
      <MiniSelect
        value={state.sourceType}
        onChange={handleSourceTypeChange}
        width={chromaticism === 'non-diatonic' ? '150px' : '100px'}
      >
        {chromaticism === 'non-diatonic'
          ? SOURCE_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-bg-700 text-white">{opt.label}</option>
            ))
          : <option value="diatonic" className="bg-bg-700 text-white">Diatonic</option>
        }
      </MiniSelect>

      {/* Root dropdown for diatonic / modal-interchange */}
      {(state.sourceType === 'diatonic' || state.sourceType === 'modal-interchange') && rootOptions && (
        <MiniSelect
          value={state.root}
          onChange={handleRootChange}
          width="140px"
          colorClass={colorClass}
        >
          {!state.root && <option value="" className="bg-bg-700 text-white">—</option>}
          {rootOptions.map(opt => (
            <option key={opt.root} value={opt.root} className="bg-bg-700 text-white">{opt.root}</option>
          ))}
        </MiniSelect>
      )}

      {/* Extension dropdown for diatonic / modal-interchange */}
      {(state.sourceType === 'diatonic' || state.sourceType === 'modal-interchange') && renderExtensionDropdown()}

      {/* Target dropdown for secondary dominants / leading-tone */}
      {(state.sourceType === 'secondary-dominants' || state.sourceType === 'secondary-leading-tone') && secondaryOptions && (
        <>
          <MiniSelect
            value={state.target}
            onChange={(v) => update({ target: v })}
            width="140px"
            colorClass={colorClass}
          >
            {secondaryOptions.map(opt => (
              <option key={opt.target} value={opt.target} className="bg-bg-700 text-white">{opt.label}</option>
            ))}
          </MiniSelect>
          {renderSecondaryExtensionDropdown()}
        </>
      )}

      {/* Root + extension dropdowns for free choice */}
      {state.sourceType === 'free-choice' && (
        <>
          <MiniSelect
            value={state.root}
            onChange={handleFreeRootChange}
            width="140px"
            colorClass={colorClass}
          >
            <optgroup label="Major">
              {FREE_CHOICE_MAJOR_ROOTS.map(r => (
                <option key={r} value={r} className="bg-bg-700 text-white">{r}</option>
              ))}
            </optgroup>
            <optgroup label="Minor">
              {FREE_CHOICE_MINOR_ROOTS.map(r => (
                <option key={r} value={r} className="bg-bg-700 text-white">{r}</option>
              ))}
            </optgroup>
          </MiniSelect>
          {renderFreeExtensionDropdown()}
        </>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-600 hover:text-keyred flex-shrink-0 ml-0.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
