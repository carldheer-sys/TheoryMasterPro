// Shared progressions catalog data
// Keyed by `${tonality}:${chordType}` (e.g. 'major:triads')
// Each entry is an array of { label, romans } where romans are Roman numeral strings

export const DEFAULT_PROGRESSIONS = {
  'major:triads': [
    { label: 'vi – IV – I – V', romans: ['vi', 'IV', 'I', 'V'] },
    { label: 'vi – ii – V – I', romans: ['vi', 'ii', 'V', 'I'] },
  ],
  'minor:triads': [
    { label: 'bVI – iv – i – v', romans: ['bVI', 'iv', 'i', 'v'] },
    { label: 'bVI – bIII – bVII – bIII', romans: ['bVI', 'bIII', 'bVII', 'bIII'] },
  ],
  'major:sevenths': [
    { label: 'vi7 – IVmaj7 – Imaj7 – V7', romans: ['vi7', 'IVmaj7', 'Imaj7', 'V7'] },
    { label: 'vi7 – ii7 – V7 – Imaj7', romans: ['vi7', 'ii7', 'V7', 'Imaj7'] },
  ],
  'minor:sevenths': [
    { label: 'bVImaj7 – iv7 – i7 – v7', romans: ['bVImaj7', 'iv7', 'i7', 'v7'] },
    { label: 'bVImaj7 – bIIImaj7 – bVII7 – bIIImaj7', romans: ['bVImaj7', 'bIIImaj7', 'bVII7', 'bIIImaj7'] },
  ],
}

// Section metadata for the catalog UI
export const PROGRESSION_SECTIONS = [
  { tonality: 'major', chordType: 'triads', chromaticism: 'diatonic' },
  { tonality: 'minor', chordType: 'triads', chromaticism: 'diatonic' },
  { tonality: 'major', chordType: 'sevenths', chromaticism: 'diatonic' },
  { tonality: 'minor', chordType: 'sevenths', chromaticism: 'diatonic' },
]

export function sectionKey(section) {
  return `${section.tonality}:${section.chordType}`
}

export function sectionLabel(section) {
  const tonalityLabel = section.tonality === 'major' ? 'Major' : 'Minor'
  const chordTypeLabel = section.chordType === 'triads' ? 'Triads' : 'Sevenths'
  const chromaLabel = section.chromaticism === 'diatonic' ? 'Diatonic' : 'Chromatic'
  return `${tonalityLabel} · ${chordTypeLabel} · ${chromaLabel}`
}

// Deep clone the default progressions so edits don't mutate the original
export function cloneProgressions(progs) {
  const result = {}
  for (const key of Object.keys(progs)) {
    result[key] = progs[key].map(p => ({
      label: p.label,
      romans: [...p.romans],
    }))
  }
  return result
}

// Generate a label from a romans array (e.g. ['vi', 'IV', 'I', 'V'] → 'vi – IV – I – V')
export function romansToLabel(romans) {
  return romans.join(' – ')
}
