// Shared progressions catalog data
// Flat array of progression objects with metadata:
//   { label, romans, tonality, chromaticism, chordType, source?, favorite? }
//
// To edit progressions, modify progressions.json in the project root and rebuild.

import progressionsData from '../../progressions.json'

export const DEFAULT_PROGRESSIONS = progressionsData

// Filter option constants
export const TONALITY_OPTIONS = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
]

export const CHROMATICISM_OPTIONS = [
  { value: 'diatonic', label: 'Diatonic' },
  { value: 'non-diatonic', label: 'Non-Diatonic' },
]

export const CHORD_TYPE_OPTIONS = [
  { value: 'triads', label: 'Triads' },
  { value: 'sevenths', label: 'Seventh Chords' },
]

export const NON_DIATONIC_SOURCES = [
  { value: 'secondary-dominants', label: 'Secondary Dominants' },
  { value: 'secondary-leading-tone', label: 'Secondary Leading-Tone Chords' },
  { value: 'modal-interchange', label: 'Modal Interchange' },
  { value: 'free-choice', label: 'Free Choice' },
]

// Deep clone the progressions array so edits don't mutate the original
export function cloneProgressions(progs) {
  return progs.map(p => ({
    label: p.label,
    romans: [...p.romans],
    tonality: p.tonality,
    chromaticism: p.chromaticism,
    chordType: p.chordType,
    ...(p.source ? { source: p.source } : {}),
    ...(p.favorite ? { favorite: true } : {}),
  }))
}

// Filter progressions by criteria
// criteria: { tonality, chromaticism, chordTypes: [], sources: [] }
export function filterProgressions(progs, { tonality, chromaticism, chordTypes, sources }) {
  return progs.filter(p => {
    if (p.tonality !== tonality) return false
    if (p.chromaticism !== chromaticism) return false
    if (chordTypes && chordTypes.length > 0 && !chordTypes.includes(p.chordType)) return false
    if (chromaticism === 'non-diatonic' && sources && sources.length > 0) {
      if (!p.source || !sources.includes(p.source)) return false
    }
    return true
  })
}

// Generate a label from a romans array (e.g. ['vi', 'IV', 'I', 'V'] → 'vi – IV – I – V')
export function romansToLabel(romans) {
  return romans.join(' – ')
}
