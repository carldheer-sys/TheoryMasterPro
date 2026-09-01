// Shared progressions catalog data
// Flat array of progression objects with metadata:
//   { label, romans, tonality, chromaticism, chordType: string, source?: string, tag?: string, favorite? }
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

const SECONDARY_MOTION_ITEMS = [
  { value: 'secondary-dominants', triadLabel: 'Secondary Dominants (V/x)', seventhLabel: 'Secondary Dominants (V7/x)' },
  { value: 'secondary-leading-tone', triadLabel: 'Secondary Leading-Tone (viio/x)', seventhLabel: 'Secondary Leading-Tone (viio7/x)' },
  { value: 'tritone-substitution', triadLabel: 'Tritone Substitution (bII/x)', seventhLabel: 'Tritone Substitution (bII7/x)' },
]

export function getSourceGroups(chordType) {
  const isSevenths = chordType === 'sevenths'
  return [
    {
      header: 'Secondary Motion',
      items: SECONDARY_MOTION_ITEMS.map(item => ({
        value: item.value,
        label: isSevenths ? item.seventhLabel : item.triadLabel,
      })),
    },
    {
      header: 'Modal Interchange',
      items: [
        { value: 'modal-interchange', label: 'Borrowed from parallel key' },
      ],
    },
    {
      header: 'Other Chromatic Movements',
      items: [
        { value: 'free-choice', label: 'Free Choice' },
      ],
    },
    {
      header: 'Combo',
      items: [
        { value: 'combo', label: 'Combo', disabled: true },
      ],
    },
  ]
}

// Static fallback (uses triad labels)
export const NON_DIATONIC_SOURCE_GROUPS = getSourceGroups('triads')

// Flat list of all non-diatonic source values (for convenience)
export const NON_DIATONIC_SOURCE_VALUES = NON_DIATONIC_SOURCE_GROUPS.flatMap(g => g.items.map(i => i.value))

// Deep clone the progressions array so edits don't mutate the original
export function cloneProgressions(progs) {
  return progs.map(p => ({
    label: p.label,
    romans: [...p.romans],
    tonality: p.tonality,
    chromaticism: p.chromaticism,
    chordType: p.chordType,
    ...(p.source != null ? { source: p.source } : p.sources ? { source: p.sources[0] } : {}),
    ...(p.tag != null ? { tag: p.tag } : {}),
    ...(p.favorite ? { favorite: true } : {}),
  }))
}

// Filter progressions by criteria
// criteria: { tonality, chromaticism, chordType: string, source: string, tag: string }
export function filterProgressions(progs, { tonality, chromaticism, chordType, source, tag }) {
  return progs.filter(p => {
    if (p.tonality !== tonality) return false
    if (p.chromaticism !== chromaticism) return false
    if (chordType && p.chordType !== chordType) return false
    const pSource = p.source || (p.sources ? p.sources[0] : undefined)
    if (chromaticism === 'non-diatonic' && source && pSource !== source) return false
    if (source === 'free-choice' && tag && tag !== 'all' && p.tag !== tag) return false
    return true
  })
}

// Generate a label from a romans array (e.g. ['vi', 'IV', 'I', 'V'] → 'vi – IV – I – V')
export function romansToLabel(romans) {
  return romans.join(' – ')
}
