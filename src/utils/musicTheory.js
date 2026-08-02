// ─── Note names & constants ──────────────────────────────────────────────

// Base note names by accidental preference
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Tonic options for the dropdown (using flats as per original spec)
export const TONICS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Tonalities — values are lowercase for internal use, labels for display
export const TONALITIES = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' }
]

// Modes — all 7 diatonic modes, ordered Ionian → Locrian
export const MODES = [
  { value: 'ionian',     label: 'Ionian' },
  { value: 'dorian',     label: 'Dorian' },
  { value: 'phrygian',   label: 'Phrygian' },
  { value: 'lydian',     label: 'Lydian' },
  { value: 'mixolydian', label: 'Mixolydian' },
  { value: 'aeolian',    label: 'Aeolian' },
  { value: 'locrian',    label: 'Locrian' },
]

// Offset (in semitones) from mode tonic to parent major tonic
// Ionian = 0 (same), Dorian = -2, Phrygian = -4, Lydian = -5,
// Mixolydian = -7, Aeolian = +3 (relative major), Locrian = +1
export const MODE_PARENT_MAJOR_OFFSET = {
  ionian: 0,
  dorian: -2,
  phrygian: -4,
  lydian: -5,
  mixolydian: -7,
  aeolian: 3,
  locrian: 1,
}

// Map old tonality names to mode names for backward compatibility
export const TONALITY_TO_MODE = {
  major: 'ionian',
  minor: 'aeolian',
}

// ─── Key signature tables (from naming conventions §3.2) ────────────────

export const KEY_SIGNATURES = {
  'C':  { sharps: [], flats: [] },
  'G':  { sharps: ['F'], flats: [] },
  'D':  { sharps: ['F', 'C'], flats: [] },
  'A':  { sharps: ['F', 'C', 'G'], flats: [] },
  'E':  { sharps: ['F', 'C', 'G', 'D'], flats: [] },
  'B':  { sharps: ['F', 'C', 'G', 'D', 'A'], flats: [] },
  'F#': { sharps: ['F', 'C', 'G', 'D', 'A', 'E'], flats: [] },
  'C#': { sharps: ['F', 'C', 'G', 'D', 'A', 'E', 'B'], flats: [] },
  'F':  { sharps: [], flats: ['B'] },
  'Bb': { sharps: [], flats: ['B', 'E'] },
  'Eb': { sharps: [], flats: ['B', 'E', 'A'] },
  'Ab': { sharps: [], flats: ['B', 'E', 'A', 'D'] },
  'Db': { sharps: [], flats: ['B', 'E', 'A', 'D', 'G'] },
  'Gb': { sharps: [], flats: ['B', 'E', 'A', 'D', 'G', 'C'] },
  'Cb': { sharps: [], flats: ['B', 'E', 'A', 'D', 'G', 'C', 'F'] },
}

export const ENHARMONIC_MAP = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
}

export const MINOR_TO_RELATIVE_MAJOR = {
  'A': 'C', 'E': 'G', 'B': 'D', 'F#': 'A', 'C#': 'E', 'G#': 'B', 'D#': 'F#', 'A#': 'C#',
  'D': 'F', 'G': 'Bb', 'C': 'Eb', 'F': 'Ab', 'Bb': 'Db', 'Eb': 'Gb', 'Ab': 'Cb'
}

export const FLAT_MAJOR_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'])
export const FLAT_MINOR_KEYS = new Set(['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'])

// ─── Scale degree definitions (from naming conventions §2.1) ───────────

// Fixed degree map: semitones from tonic → degree label
export const DEGREE_MAP = {
  0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
  6: '#4', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
}

// Diatonic pitch-class sets (intervals from tonic)
export const DIATONIC_MAJOR = new Set([0, 2, 4, 5, 7, 9, 11])
export const DIATONIC_MINOR = new Set([0, 2, 3, 5, 7, 8, 10])

// Diatonic pitch-class sets for all 7 modes (semitones from tonic)
export const DIATONIC_PCS = {
  ionian:     new Set([0, 2, 4, 5, 7, 9, 11]),
  dorian:     new Set([0, 2, 3, 5, 7, 9, 10]),
  phrygian:   new Set([0, 1, 3, 5, 7, 8, 10]),
  lydian:     new Set([0, 2, 4, 6, 7, 9, 11]),
  mixolydian: new Set([0, 2, 4, 5, 7, 9, 10]),
  aeolian:    new Set([0, 2, 3, 5, 7, 8, 10]),
  locrian:    new Set([0, 1, 3, 5, 6, 8, 10]),
  // Backward compatibility
  major: new Set([0, 2, 4, 5, 7, 9, 11]),
  minor: new Set([0, 2, 3, 5, 7, 8, 10]),
  'harmonic-minor': new Set([0, 2, 3, 5, 7, 8, 11]),
}

// Diatonic scale degrees for major and minor
export const DIATONIC_DEGREES = {
  major: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: '3', semitones: 4 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: '6', semitones: 9 },
    { degree: '7', semitones: 11 }
  ],
  minor: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: 'b3', semitones: 3 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: 'b6', semitones: 8 },
    { degree: 'b7', semitones: 10 }
  ],
  ionian: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: '3', semitones: 4 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: '6', semitones: 9 },
    { degree: '7', semitones: 11 }
  ],
  dorian: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: 'b3', semitones: 3 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: '6', semitones: 9 },
    { degree: 'b7', semitones: 10 }
  ],
  phrygian: [
    { degree: '1', semitones: 0 },
    { degree: 'b2', semitones: 1 },
    { degree: 'b3', semitones: 3 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: 'b6', semitones: 8 },
    { degree: 'b7', semitones: 10 }
  ],
  lydian: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: '3', semitones: 4 },
    { degree: '#4', semitones: 6 },
    { degree: '5', semitones: 7 },
    { degree: '6', semitones: 9 },
    { degree: '7', semitones: 11 }
  ],
  mixolydian: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: '3', semitones: 4 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: '6', semitones: 9 },
    { degree: 'b7', semitones: 10 }
  ],
  aeolian: [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: 'b3', semitones: 3 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: 'b6', semitones: 8 },
    { degree: 'b7', semitones: 10 }
  ],
  locrian: [
    { degree: '1', semitones: 0 },
    { degree: 'b2', semitones: 1 },
    { degree: 'b3', semitones: 3 },
    { degree: '4', semitones: 5 },
    { degree: 'b5', semitones: 6 },
    { degree: 'b6', semitones: 8 },
    { degree: 'b7', semitones: 10 }
  ],
  'harmonic-minor': [
    { degree: '1', semitones: 0 },
    { degree: '2', semitones: 2 },
    { degree: 'b3', semitones: 3 },
    { degree: '4', semitones: 5 },
    { degree: '5', semitones: 7 },
    { degree: 'b6', semitones: 8 },
    { degree: '7', semitones: 11 }
  ]
}

// Chromatic scale degrees (all 12) — uses #4 per naming convention §2.1
export const CHROMATIC_DEGREES = [
  { degree: '1', semitones: 0 },
  { degree: 'b2', semitones: 1 },
  { degree: '2', semitones: 2 },
  { degree: 'b3', semitones: 3 },
  { degree: '3', semitones: 4 },
  { degree: '4', semitones: 5 },
  { degree: '#4', semitones: 6 },
  { degree: '5', semitones: 7 },
  { degree: 'b6', semitones: 8 },
  { degree: '6', semitones: 9 },
  { degree: 'b7', semitones: 10 },
  { degree: '7', semitones: 11 }
]

// ─── Helper functions ────────────────────────────────────────────────────

// Convert tonic name to pitch class (0-11). Handles both flat and sharp spellings.
export function tonicToPC(tonic) {
  let idx = NOTE_NAMES_FLAT.indexOf(tonic)
  if (idx >= 0) return idx
  idx = NOTE_NAMES_SHARP.indexOf(tonic)
  return idx >= 0 ? idx : 0
}

// Get the list of scale degrees based on mode (diatonic/chromatic) and tonality
export function getScaleDegrees(mode, tonality) {
  if (mode === 'chromatic') return CHROMATIC_DEGREES
  return DIATONIC_DEGREES[tonality] || DIATONIC_DEGREES[TONALITY_TO_MODE[tonality]] || DIATONIC_DEGREES.ionian
}

// ─── Random picking (robust, no direct repeats) ─────────────────────────

// Generate a cryptographically secure random integer in [0, max).
// Falls back to Math.random if crypto is unavailable.
// Uses rejection sampling to avoid modular bias.
function secureRandomInt(max) {
  if (max <= 0) return 0
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    const range = Math.floor(0xFFFFFFFF / max) * max
    const arr = new Uint32Array(1)
    let val
    do {
      globalThis.crypto.getRandomValues(arr)
      val = arr[0]
    } while (val >= range)
    return val % max
  }
  return Math.floor(Math.random() * max)
}

// Pick a random scale degree, guaranteeing no direct repeat.
// Filters out the last degree, then picks uniformly from the remaining candidates.
export function pickRandomDegree(degrees, lastDegree = null) {
  if (degrees.length <= 1) return degrees[0]

  const candidates = lastDegree
    ? degrees.filter(d => d.degree !== lastDegree.degree)
    : [...degrees]

  if (candidates.length === 0) return degrees[secureRandomInt(degrees.length)]

  return candidates[secureRandomInt(candidates.length)]
}

// ─── Scale degree calculation (from naming conventions §2.3) ────────────

// Calculate the scale degree for a MIDI note given a tonic and mode.
// Returns { scale_degree, chromatic_distance, is_diatonic }
export function getScaleDegree(midiNote, tonicPitchClass, mode) {
  const pc = midiNote % 12
  const chromaticDistance = (pc - tonicPitchClass + 12) % 12
  const diatonicSet = DIATONIC_PCS[mode] || DIATONIC_PCS[TONALITY_TO_MODE[mode]] || DIATONIC_PCS.ionian
  const isDiatonic = diatonicSet.has(chromaticDistance)
  // For diatonic notes, use the mode-specific degree label (e.g. Locrian b5 vs #4)
  let degreeLabel = DEGREE_MAP[chromaticDistance]
  if (isDiatonic) {
    const modeKey = DIATONIC_DEGREES[mode] ? mode : (TONALITY_TO_MODE[mode] || 'ionian')
    const degrees = DIATONIC_DEGREES[modeKey]
    if (degrees) {
      const match = degrees.find(d => d.semitones === chromaticDistance)
      if (match) degreeLabel = match.degree
    }
  }
  return {
    scale_degree: degreeLabel,
    chromatic_distance: chromaticDistance,
    is_diatonic: isDiatonic
  }
}

// Calculate the target pitch class for a scale degree given a tonic
export function degreeToPitchClass(tonicPC, semitones) {
  return (tonicPC + semitones) % 12
}

// ─── Key-aware enharmonic spelling (from naming conventions §3) ─────────

// Compute the parent major tonic name for a given tonic + mode
function getParentMajorTonic(tonic, mode) {
  if (mode === 'major' || mode === 'ionian') return tonic
  if (mode === 'minor' || mode === 'aeolian' || mode === 'harmonic-minor') return MINOR_TO_RELATIVE_MAJOR[tonic] || 'C'
  const offset = MODE_PARENT_MAJOR_OFFSET[mode]
  if (offset == null) return tonic
  const tonicPC = tonicToPC(tonic)
  const parentPC = (tonicPC + offset + 12) % 12
  return NOTE_NAMES_FLAT[parentPC]
}

// Determine if a key (with mode) uses flats or sharps
export function usesFlats(tonic, mode) {
  const parentMajor = getParentMajorTonic(tonic, mode)
  return FLAT_MAJOR_KEYS.has(parentMajor)
}

// Get the key signature for a tonic + mode (looking up parent major for non-ionian modes)
export function getKeySignature(tonic, mode) {
  const parentMajor = getParentMajorTonic(tonic, mode)
  return KEY_SIGNATURES[parentMajor] || KEY_SIGNATURES['C']
}

// Spell a pitch class as a note name, respecting the key's sharp/flat preference.
export function spellNoteName(pc, tonic, mode) {
  const baseName = NOTE_NAMES_SHARP[pc % 12]
  const useFlats = usesFlats(tonic, mode)

  if (baseName.includes('#') && useFlats) {
    return ENHARMONIC_MAP[baseName] || baseName
  }
  if (baseName.includes('b') && !useFlats) {
    return ENHARMONIC_MAP[baseName] || baseName
  }
  return baseName
}

// Get the note name for a pitch class (simple, flat-based fallback)
export function pitchClassToName(pc) {
  return NOTE_NAMES_FLAT[pc % 12]
}

// Convert MIDI note number to pitch class
export function midiNoteToPC(note) {
  return note % 12
}

// Convert MIDI note number to octave
export function midiNoteToOctave(note) {
  return Math.floor(note / 12) - 1
}

// Get full note name from MIDI note number using key-aware spelling
export function midiNoteToName(note, tonic, mode) {
  if (tonic && mode) {
    return spellNoteName(midiNoteToPC(note), tonic, mode) + midiNoteToOctave(note)
  }
  return pitchClassToName(midiNoteToPC(note)) + midiNoteToOctave(note)
}

// ─── Diatonic chord definitions (from naming conventions §5) ────────────

// Triad intervals from root by quality
export const TRIAD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
}

// Seventh chord intervals from root by quality
export const SEVENTH_INTERVALS = {
  major7:              [0, 4, 7, 11],
  dominant7:           [0, 4, 7, 10],
  minor7:              [0, 3, 7, 10],
  'half-diminished':   [0, 3, 6, 10],
  diminished7:         [0, 3, 6, 9],
  'minor-major7':      [0, 3, 7, 11],
  'augmented-major7':  [0, 4, 8, 11],
}

// Diatonic triads for major and minor keys
// Each entry: { roman, semitones (from tonic), quality, intervals (from root) }
export const DIATONIC_TRIADS = {
  major: [
    { roman: 'I',    semitones: 0,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'ii',   semitones: 2,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iii',  semitones: 4,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'IV',   semitones: 5,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'V',    semitones: 7,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'vi',   semitones: 9,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'viio', semitones: 11, quality: 'diminished', intervals: [0, 3, 6] },
  ],
  minor: [
    { roman: 'i',     semitones: 0,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iio',   semitones: 2,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'bIII',  semitones: 3,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'iv',    semitones: 5,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'v',     semitones: 7,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'bVI',   semitones: 8,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bVII',  semitones: 10, quality: 'major',      intervals: [0, 4, 7] },
  ],
  ionian: [
    { roman: 'I',    semitones: 0,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'ii',   semitones: 2,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iii',  semitones: 4,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'IV',   semitones: 5,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'V',    semitones: 7,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'vi',   semitones: 9,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'viio', semitones: 11, quality: 'diminished', intervals: [0, 3, 6] },
  ],
  dorian: [
    { roman: 'i',    semitones: 0,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'ii',   semitones: 2,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'bIII', semitones: 3,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'IV',   semitones: 5,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'v',    semitones: 7,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'vio',  semitones: 9,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'bVII', semitones: 10, quality: 'major',      intervals: [0, 4, 7] },
  ],
  phrygian: [
    { roman: 'i',    semitones: 0,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'bII',  semitones: 1,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bIII', semitones: 3,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'iv',   semitones: 5,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'vo',   semitones: 7,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'bVI',  semitones: 8,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bvii', semitones: 10, quality: 'minor',      intervals: [0, 3, 7] },
  ],
  lydian: [
    { roman: 'I',    semitones: 0,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'II',   semitones: 2,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'iii',  semitones: 4,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: '#ivo', semitones: 6,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'V',    semitones: 7,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'vi',   semitones: 9,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'vii',  semitones: 11, quality: 'minor',      intervals: [0, 3, 7] },
  ],
  mixolydian: [
    { roman: 'I',    semitones: 0,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'ii',   semitones: 2,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iiio', semitones: 4,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'IV',   semitones: 5,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'v',    semitones: 7,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'vi',   semitones: 9,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'bVII', semitones: 10, quality: 'major',      intervals: [0, 4, 7] },
  ],
  aeolian: [
    { roman: 'i',     semitones: 0,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iio',   semitones: 2,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'bIII',  semitones: 3,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'iv',    semitones: 5,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'v',     semitones: 7,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'bVI',   semitones: 8,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bVII',  semitones: 10, quality: 'major',      intervals: [0, 4, 7] },
  ],
  locrian: [
    { roman: 'io',   semitones: 0,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'bII',  semitones: 1,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'biii', semitones: 3,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iv',   semitones: 5,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'bV',   semitones: 6,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bVI',  semitones: 8,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bvii', semitones: 10, quality: 'minor',      intervals: [0, 3, 7] },
  ],
  'harmonic-minor': [
    { roman: 'i',      semitones: 0,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'iio',    semitones: 2,  quality: 'diminished', intervals: [0, 3, 6] },
    { roman: 'bIII+',  semitones: 3,  quality: 'augmented',  intervals: [0, 4, 8] },
    { roman: 'iv',     semitones: 5,  quality: 'minor',      intervals: [0, 3, 7] },
    { roman: 'V',      semitones: 7,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'bVI',    semitones: 8,  quality: 'major',      intervals: [0, 4, 7] },
    { roman: 'viio',   semitones: 11, quality: 'diminished', intervals: [0, 3, 6] },
  ],
}

// Diatonic seventh chords for major and minor keys (from naming conventions §5.5)
export const DIATONIC_SEVENTHS = {
  major: [
    { roman: 'Imaj7',  semitones: 0,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'ii7',    semitones: 2,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iii7',   semitones: 4,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'IVmaj7', semitones: 5,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'V7',     semitones: 7,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'vi7',    semitones: 9,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'viim7b5',  semitones: 11, quality: 'half-diminished', intervals: [0, 3, 6, 10] },
  ],
  minor: [
    { roman: 'i7',       semitones: 0,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iim7b5',     semitones: 2,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'bIIImaj7', semitones: 3,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'iv7',      semitones: 5,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'v7',       semitones: 7,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bVImaj7',  semitones: 8,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'bVII7',    semitones: 10, quality: 'dominant7',       intervals: [0, 4, 7, 10] },
  ],
  ionian: [
    { roman: 'Imaj7',  semitones: 0,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'ii7',    semitones: 2,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iii7',   semitones: 4,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'IVmaj7', semitones: 5,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'V7',     semitones: 7,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'vi7',    semitones: 9,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'viim7b5',  semitones: 11, quality: 'half-diminished', intervals: [0, 3, 6, 10] },
  ],
  dorian: [
    { roman: 'i7',       semitones: 0,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'ii7',      semitones: 2,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bIIImaj7', semitones: 3,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'IV7',      semitones: 5,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'v7',       semitones: 7,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'vim7b5',     semitones: 9,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'bVIImaj7', semitones: 10, quality: 'major7',          intervals: [0, 4, 7, 11] },
  ],
  phrygian: [
    { roman: 'i7',       semitones: 0,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bIImaj7',  semitones: 1,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'bIII7',    semitones: 3,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'iv7',      semitones: 5,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'vm7b5',      semitones: 7,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'bVImaj7',  semitones: 8,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'bvii7',    semitones: 10, quality: 'minor7',          intervals: [0, 3, 7, 10] },
  ],
  lydian: [
    { roman: 'Imaj7',  semitones: 0,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'II7',    semitones: 2,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'iii7',   semitones: 4,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: '#ivm7b5',  semitones: 6,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'Vmaj7',  semitones: 7,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'vi7',    semitones: 9,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'vii7',   semitones: 11, quality: 'minor7',          intervals: [0, 3, 7, 10] },
  ],
  mixolydian: [
    { roman: 'I7',       semitones: 0,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'ii7',      semitones: 2,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iiim7b5',    semitones: 4,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'IVmaj7',   semitones: 5,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'v7',       semitones: 7,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'vi7',      semitones: 9,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bVIImaj7', semitones: 10, quality: 'major7',          intervals: [0, 4, 7, 11] },
  ],
  aeolian: [
    { roman: 'i7',       semitones: 0,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iim7b5',     semitones: 2,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'bIIImaj7', semitones: 3,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'iv7',      semitones: 5,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'v7',       semitones: 7,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bVImaj7',  semitones: 8,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'bVII7',    semitones: 10, quality: 'dominant7',       intervals: [0, 4, 7, 10] },
  ],
  locrian: [
    { roman: 'im7b5',     semitones: 0,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'bIImaj7', semitones: 1,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'biii7',   semitones: 3,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iv7',     semitones: 5,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bVmaj7',  semitones: 6,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'bVI7',    semitones: 8,  quality: 'dominant7',       intervals: [0, 4, 7, 10] },
    { roman: 'bvii7',   semitones: 10, quality: 'minor7',          intervals: [0, 3, 7, 10] },
  ],
  'harmonic-minor': [
    { roman: 'imaj7',       semitones: 0,  quality: 'minor-major7',     intervals: [0, 3, 7, 11] },
    { roman: 'iim7b5',      semitones: 2,  quality: 'half-diminished',  intervals: [0, 3, 6, 10] },
    { roman: 'bIII+maj7',  semitones: 3,  quality: 'augmented-major7', intervals: [0, 4, 8, 11] },
    { roman: 'iv7',        semitones: 5,  quality: 'minor7',           intervals: [0, 3, 7, 10] },
    { roman: 'V7',          semitones: 7,  quality: 'dominant7',        intervals: [0, 4, 7, 10] },
    { roman: 'bVImaj7',    semitones: 8,  quality: 'major7',           intervals: [0, 4, 7, 11] },
    { roman: 'viio7',       semitones: 11, quality: 'diminished7',      intervals: [0, 3, 6, 9] },
  ],
}

// Chord label suffixes by quality (jazz/pop notation from §4.1)
const CHORD_LABEL_SUFFIXES = {
  major: '',
  minor: 'm',
  diminished: 'o',
  augmented: '+',
  major7: 'maj7',
  dominant7: '7',
  minor7: 'm7',
  'half-diminished': 'm7b5',
  diminished7: 'o7',
  'minor-major7': 'm(maj7)',
  'augmented-major7': '+maj7',
}

// Get diatonic triads for a tonality or mode
export function getDiatonicTriads(tonality) {
  return DIATONIC_TRIADS[tonality] || DIATONIC_TRIADS[TONALITY_TO_MODE[tonality]] || DIATONIC_TRIADS.ionian
}

// Get diatonic sevenths for a tonality or mode
export function getDiatonicSevenths(tonality) {
  return DIATONIC_SEVENTHS[tonality] || DIATONIC_SEVENTHS[TONALITY_TO_MODE[tonality]] || DIATONIC_SEVENTHS.ionian
}

// Harmonic minor V triad (for inclusion in minor key chord practice)
export const HARMONIC_MINOR_V_TRIAD = {
  roman: 'V', semitones: 7, quality: 'major', intervals: [0, 4, 7], isHarmonicMinor: true,
}

// Harmonic minor V7 seventh chord (for inclusion in minor key chord practice)
export const HARMONIC_MINOR_V7_SEVENTH = {
  roman: 'V7', semitones: 7, quality: 'dominant7', intervals: [0, 4, 7, 10], isHarmonicMinor: true,
}

// Get diatonic triads, optionally including the V from harmonic minor for minor keys
export function getDiatonicTriadsWithHarmMinor(tonality, includeHarmMinor) {
  const base = getDiatonicTriads(tonality)
  if (tonality === 'minor' && includeHarmMinor) {
    return [...base, HARMONIC_MINOR_V_TRIAD]
  }
  return base
}

// Get diatonic sevenths, optionally including the V7 from harmonic minor for minor keys
export function getDiatonicSeventhsWithHarmMinor(tonality, includeHarmMinor) {
  const base = getDiatonicSevenths(tonality)
  if (tonality === 'minor' && includeHarmMinor) {
    return [...base, HARMONIC_MINOR_V7_SEVENTH]
  }
  return base
}

// Get the pitch classes for a chord given the tonic pitch class
export function getChordPitchClasses(tonicPC, chord) {
  const rootPC = (tonicPC + chord.semitones) % 12
  return chord.intervals.map(iv => (rootPC + iv) % 12)
}

// ─── Inversion support (from naming conventions §6) ──────────────────────

// Assign a random inversion to a chord (0 = root position, 1 = 1st inversion, etc.)
// Returns an inversion number from 0 to intervals.length - 1
export function assignInversion(chord) {
  const numPositions = chord.intervals.length
  return secureRandomInt(numPositions)
}

// Get the bass note pitch class for a chord in a given inversion
export function getBassPC(tonicPC, chord, inversion) {
  const rootPC = (tonicPC + chord.semitones) % 12
  return (rootPC + chord.intervals[inversion]) % 12
}

// Get the scale degree label for the bass note (relative to home key)
export function getBassScaleDegree(tonicPC, chord, inversion) {
  const bassPC = getBassPC(tonicPC, chord, inversion)
  const chromaticDistance = (bassPC - tonicPC + 12) % 12
  return DEGREE_MAP[chromaticDistance]
}

// Parse a roman numeral string into { base, superscript } for CSS superscript rendering.
// The superscript is the chord-quality extension that follows the roman numeral letters.
// Examples: 'Imaj7' → { base: 'I', superscript: 'maj7' }
//           'viim7b5' → { base: 'vii', superscript: 'm7b5' }
//           'V7/ii' → { base: 'V', superscript: '7', secondary: '/ii' }
//           'viio7/V' → { base: 'vii', superscript: 'o7', secondary: '/V' }
//           'i' → { base: 'i', superscript: '' }
//           'bIII+' → { base: 'bIII', superscript: '+' }
export function getRomanParts(roman) {
  if (!roman) return { base: '', superscript: '', secondary: '' }
  // Split off secondary chord target (everything after first '/')
  const slashIdx = roman.indexOf('/')
  const main = slashIdx >= 0 ? roman.slice(0, slashIdx) : roman
  const secondary = slashIdx >= 0 ? roman.slice(slashIdx) : ''
  // The base is the roman numeral letters: optional b/# prefix + roman numerals (i, ii, iii, iv, v, vi, vii, I..VII)
  // The superscript is whatever follows after the roman numeral letters
  const match = main.match(/^([b#]*[IViv]+)(.*)$/)
  if (!match) return { base: main, superscript: '', secondary }
  return { base: match[1], superscript: match[2], secondary }
}

// Figured bass symbols for chord inversions
// Triads: root = '' (no figure), 1st = '6', 2nd = '6/4'
// Sevenths: root = '7', 1st = '6/5', 2nd = '4/3', 3rd = '4/2'
const FIGURED_BASS_TRIAD = ['', '6', '6/4']
const FIGURED_BASS_SEVENTH = ['7', '6/5', '4/3', '4/2']

// Get the figured bass symbol for a chord in a given inversion
export function getFiguredBass(chord, inversion) {
  if (inversion == null || inversion === 0) {
    // Root position: triads have no figure, sevenths get '7'
    return chord.intervals.length === 4 ? '7' : ''
  }
  const table = chord.intervals.length === 4 ? FIGURED_BASS_SEVENTH : FIGURED_BASS_TRIAD
  return table[inversion] || ''
}

// Get the root note name for a chord (key-aware spelling)
export function getChordRootName(tonicPC, chord, tonic, tonality) {
  const rootPC = (tonicPC + chord.semitones) % 12
  return spellNoteName(rootPC, tonic, tonality)
}

// Spell chord tones using proper third-stacking letter names.
// Chords are built by stacking thirds, so each tone skips one letter name
// from the previous (root → 3rd → 5th → 7th).
// This ensures correct enharmonic spelling (e.g. Fdim = F Ab Cb, not F Ab B).
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]

export function spellChordTones(tonicPC, chord, tonic, tonality) {
  const rootPC = (tonicPC + chord.semitones) % 12
  const rootName = spellNoteName(rootPC, tonic, tonality)
  const rootLetterIdx = LETTERS.indexOf(rootName[0])

  return chord.intervals.map((interval, i) => {
    const letterIdx = (rootLetterIdx + 2 * i) % 7
    const letter = LETTERS[letterIdx]
    const targetPC = (rootPC + interval) % 12
    const naturalPC = LETTER_NATURAL_PC[letterIdx]
    const offset = (targetPC - naturalPC + 12) % 12
    let accidental = ''
    if (offset === 1) accidental = '#'
    else if (offset === 11) accidental = 'b'
    else if (offset === 2) accidental = '##'
    else if (offset === 10) accidental = 'bb'
    return letter + accidental
  })
}

// Get the chord label (e.g. "Ab", "Cm", "Bo", "G7", "Cmaj7", "Bm7b5") with key-aware spelling
export function getChordLabel(tonicPC, chord, tonic, tonality) {
  const rootName = getChordRootName(tonicPC, chord, tonic, tonality)
  const suffix = CHORD_LABEL_SUFFIXES[chord.quality] ?? ''
  return rootName + suffix
}

// Pick a random chord, guaranteeing no direct repeat
export function pickRandomChord(chords, lastChord = null) {
  if (chords.length <= 1) return chords[0]
  const candidates = lastChord
    ? chords.filter(c => c.roman !== lastChord.roman)
    : [...chords]
  if (candidates.length === 0) return chords[secureRandomInt(chords.length)]
  return candidates[secureRandomInt(candidates.length)]
}

// Check if a chord's pitch classes match any chord in the main mode's chord list
export function isChordDiatonic(tonicPC, chord, mainChords) {
  const chordPCs = getChordPitchClasses(tonicPC, chord)
  const chordPCSet = new Set(chordPCs)
  return mainChords.some(mainChord => {
    const mainPCs = getChordPitchClasses(tonicPC, mainChord)
    if (mainPCs.length !== chordPCs.length) return false
    return mainPCs.every(pc => chordPCSet.has(pc))
  })
}

// Pick a chord for modal interchange mode.
// options: { tonicPC, tonality, selectedChordTypes, borrowedModes, probability, lastChord }
// probability: 0 = only borrowed, 1 = only main (diatonic)
// Returns a chord object with extra fields: sourceMode, isBorrowed
export function pickInterchangeChord({ tonicPC, tonality, selectedChordTypes, borrowedModes, probability, lastChord = null, includeHarmMinor = false }) {
  // Build main chord list
  const mainChords = selectedChordTypes.flatMap(type =>
    type === 'sevenths' ? getDiatonicSeventhsWithHarmMinor(tonality, includeHarmMinor) : getDiatonicTriadsWithHarmMinor(tonality, includeHarmMinor)
  )

  // Build borrowed chord lists (excluding main mode)
  const borrowedLists = borrowedModes
    .filter(mode => mode !== tonality)
    .map(mode => ({
      mode,
      chords: selectedChordTypes.flatMap(type =>
        type === 'sevenths' ? getDiatonicSevenths(mode) : getDiatonicTriads(mode)
      ),
    }))
    .filter(entry => entry.chords.length > 0)

  // If no borrowed modes available or probability >= 1, pick from main only
  if (borrowedLists.length === 0 || probability >= 1) {
    const pick = pickRandomChord(mainChords, lastChord)
    return { ...pick, sourceMode: tonality, isBorrowed: false }
  }

  // If probability <= 0, pick from borrowed only
  if (probability <= 0) {
    const modeEntry = borrowedLists[secureRandomInt(borrowedLists.length)]
    const pick = pickRandomChord(modeEntry.chords, lastChord)
    const diatonic = isChordDiatonic(tonicPC, pick, mainChords)
    return { ...pick, sourceMode: modeEntry.mode, isBorrowed: !diatonic }
  }

  // Use probability to choose main vs borrowed
  const roll = Math.random()
  if (roll < probability) {
    const pick = pickRandomChord(mainChords, lastChord)
    return { ...pick, sourceMode: tonality, isBorrowed: false }
  } else {
    const modeEntry = borrowedLists[secureRandomInt(borrowedLists.length)]
    const pick = pickRandomChord(modeEntry.chords, lastChord)
    const diatonic = isChordDiatonic(tonicPC, pick, mainChords)
    return { ...pick, sourceMode: modeEntry.mode, isBorrowed: !diatonic }
  }
}

// ─── Secondary chords (secondary dominants & secondary leading-tone chords) ──

// Each secondary chord has:
//   id, label, type ('dominant' | 'leading-tone'),
//   targetRoman, targetSemitones (semitones of the target chord root from tonic),
//   semitones (semitones of the secondary chord root from tonic),
//   intervals, quality,
//   equivalentRoman (the alternative spelling based on an equivalent root),
//   applicableTonality ('major' | 'minor')
//
// Secondary dominants V7/X: root = (target + 7) % 12, intervals = [0,4,7,10], quality = dominant7
// Secondary leading-tone chords viio7/X: root = (target - 1 + 12) % 12, intervals = [0,3,6,9], quality = diminished7
//
// Equivalent spelling rules (see MUSIC_THEORY_NAMING_CONVENTIONS.md §9):
//   - For secondary dominants, the equivalent root is on a diatonic degree (perfect 5th above a diatonic degree is also diatonic).
//     The equivalent uses uppercase Roman + '7' (dominant 7th quality).
//   - For secondary leading-tone chords, the equivalent root is 1 semitone below the target.
//     If the root is on a chromatic degree, prefer # of the nearest lower diatonic degree (not b of the upper).
//     The equivalent uses lowercase Roman + 'o7' (diminished 7th quality).
//   - In minor, if the root is 1 semitone above b3, the equivalent uses natural III (removing the flat).

export const SECONDARY_CHORDS = [
  // ── Major Key — Secondary Dominants ──
  { id: 'V7/V',    label: 'V7/V',    type: 'dominant',      targetRoman: 'V',  targetSemitones: 7,  semitones: 2,  intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'II7',   applicableTonality: 'major' },
  { id: 'V7/ii',   label: 'V7/ii',   type: 'dominant',      targetRoman: 'ii', targetSemitones: 2,  semitones: 9,  intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'VI7',   applicableTonality: 'major' },
  { id: 'V7/iii',  label: 'V7/iii',  type: 'dominant',      targetRoman: 'iii',targetSemitones: 4,  semitones: 11, intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'VII7',  applicableTonality: 'major' },
  { id: 'V7/vi',   label: 'V7/vi',   type: 'dominant',      targetRoman: 'vi', targetSemitones: 9,  semitones: 4,  intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'III7',  applicableTonality: 'major' },
  { id: 'V7/IV',   label: 'V7/IV',   type: 'dominant',      targetRoman: 'IV', targetSemitones: 5,  semitones: 0,  intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'I7',    applicableTonality: 'major' },
  // ── Major Key — Secondary Leading-Tone Chords ──
  { id: 'viio7/V',  label: 'viio7/V',  type: 'leading-tone', targetRoman: 'V',  targetSemitones: 7,  semitones: 6, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: '#ivo7', applicableTonality: 'major' },
  { id: 'viio7/ii',  label: 'viio7/ii',  type: 'leading-tone', targetRoman: 'ii', targetSemitones: 2,  semitones: 1, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: '#io7',  applicableTonality: 'major' },
  { id: 'viio7/iii', label: 'viio7/iii', type: 'leading-tone', targetRoman: 'iii',targetSemitones: 4,  semitones: 3, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: '#iio7', applicableTonality: 'major' },
  { id: 'viio7/vi',  label: 'viio7/vi',  type: 'leading-tone', targetRoman: 'vi', targetSemitones: 9,  semitones: 8, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: '#vo7',  applicableTonality: 'major' },
  // ── Minor Key — Secondary Dominants ──
  { id: 'V7/bIII', label: 'V7/bIII', type: 'dominant',      targetRoman: 'bIII', targetSemitones: 3,  semitones: 10, intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'bVII7', applicableTonality: 'minor' },
  { id: 'V7/bVI',  label: 'V7/bVI',  type: 'dominant',      targetRoman: 'bVI',  targetSemitones: 8,  semitones: 3,  intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'bIII7', applicableTonality: 'minor' },
  { id: 'V7/iv',   label: 'V7/iv',   type: 'dominant',      targetRoman: 'iv',   targetSemitones: 5,  semitones: 0,  intervals: [0, 4, 7, 10], quality: 'dominant7',   equivalentRoman: 'I7',    applicableTonality: 'minor' },
  // ── Minor Key — Secondary Leading-Tone Chords ──
  { id: 'viio7/bIII', label: 'viio7/bIII', type: 'leading-tone', targetRoman: 'bIII', targetSemitones: 3, semitones: 2, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: 'iio7',  applicableTonality: 'minor' },
  { id: 'viio7/bVI',  label: 'viio7/bVI',  type: 'leading-tone', targetRoman: 'bVI',  targetSemitones: 8, semitones: 7, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: 'vo7',   applicableTonality: 'minor' },
  { id: 'viio7/iv',   label: 'viio7/iv',   type: 'leading-tone', targetRoman: 'iv',   targetSemitones: 5, semitones: 4, intervals: [0, 3, 6, 9],  quality: 'diminished7', equivalentRoman: 'iiio7', applicableTonality: 'minor' },
]

// Check if a secondary chord's target is diatonic to the given tonality
export function isSecondaryChordAvailable(chord, tonality) {
  if (chord.applicableTonality !== tonality) return false
  const diatonicSet = tonality === 'minor' ? DIATONIC_MINOR : DIATONIC_MAJOR
  return diatonicSet.has(chord.targetSemitones)
}

// Get the available secondary chords for a given tonality
export function getAvailableSecondaryChords(tonality) {
  return SECONDARY_CHORDS.filter(sc => isSecondaryChordAvailable(sc, tonality))
}

// Find the diatonic target chord for a secondary chord
export function getSecondaryChordTarget(chord, tonality, selectedChordTypes) {
  const chords = selectedChordTypes.flatMap(type =>
    type === 'sevenths' ? getDiatonicSevenths(tonality) : getDiatonicTriads(tonality)
  )
  const matches = chords.filter(c => c.semitones === chord.targetSemitones)
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]
  return matches[secureRandomInt(matches.length)]
}

// Pick a chord for secondary chords mode.
// options: { tonicPC, tonality, selectedChordTypes, selectedSecondaryChords, probability, lastChord }
// probability: 0 = only secondary, 1 = only diatonic
// Returns a chord object with extra fields: isSecondary, sourceMode, equivalentRoman (if secondary)
export function pickSecondaryChord({ tonicPC, tonality, selectedChordTypes, selectedSecondaryChords, probability, lastChord = null, lastSecondaryId = null, includeHarmMinor = false }) {
  // Build main chord list
  const mainChords = selectedChordTypes.flatMap(type =>
    type === 'sevenths' ? getDiatonicSeventhsWithHarmMinor(tonality, includeHarmMinor) : getDiatonicTriadsWithHarmMinor(tonality, includeHarmMinor)
  )

  // Filter available secondary chords (target must be diatonic)
  let availableSecondary = selectedSecondaryChords.filter(sc => isSecondaryChordAvailable(sc, tonality))

  // Don't pick the same secondary chord as the last one used (the target in between doesn't count)
  if (lastSecondaryId) {
    availableSecondary = availableSecondary.filter(sc => sc.id !== lastSecondaryId)
  }

  // Don't pick a secondary chord whose target is the same as the last chord
  // (prevents e.g. V7/ii ii viio7/ii ii — target repeating after a different secondary)
  if (lastChord) {
    availableSecondary = availableSecondary.filter(sc => {
      const target = getSecondaryChordTarget(sc, tonality, selectedChordTypes)
      return !target || target.roman !== lastChord.roman
    })
  }

  // If no secondary chords available or probability >= 1, pick from main only
  if (availableSecondary.length === 0 || probability >= 1) {
    const pick = pickRandomChord(mainChords, lastChord)
    return { ...pick, sourceMode: tonality, isSecondary: false }
  }

  // If probability <= 0, pick from secondary only
  if (probability <= 0) {
    const sc = availableSecondary[secureRandomInt(availableSecondary.length)]
    return { ...sc, roman: sc.label, sourceMode: tonality, isSecondary: true }
  }

  // Use probability to choose main vs secondary
  const roll = Math.random()
  if (roll < probability) {
    const pick = pickRandomChord(mainChords, lastChord)
    return { ...pick, sourceMode: tonality, isSecondary: false }
  } else {
    const sc = availableSecondary[secureRandomInt(availableSecondary.length)]
    return { ...sc, roman: sc.label, sourceMode: tonality, isSecondary: true }
  }
}

// ─── Build progression from Roman numerals ───────────────────────────────

// Other (non-diatonic) chords not covered by secondary chords or modal interchange
// e.g. Neapolitan chord (bII)
const OTHER_CHORDS = [
  { roman: 'bII',     semitones: 1, intervals: [0, 4, 7],     quality: 'major' },
  { roman: 'bIImaj7', semitones: 1, intervals: [0, 4, 7, 11], quality: 'maj7' },
]

// Helper: try to match a triad secondary chord roman (e.g. "V/vi")
// to a seventh secondary chord (e.g. "V7/vi") and return a triad version
function trySecondaryTriad(roman, secondaryChords) {
  if (!roman.includes('/')) return null

  // Try converting "V/X" → "V7/X" and "viio/X" → "viio7/X"
  const seventhRoman = roman
    .replace(/^V\//, 'V7/')
    .replace(/^viio\//, 'viio7/')

  if (seventhRoman === roman) return null

  const sc = secondaryChords.find(s => s.id === seventhRoman || s.label === seventhRoman)
  if (!sc) return null

  if (sc.type === 'dominant') {
    return {
      ...sc,
      id: roman,
      label: roman,
      roman: roman,
      intervals: [0, 4, 7],
      quality: 'major',
      sourceMode: sc.applicableTonality,
      isSecondary: true,
      isBorrowed: false,
    }
  } else if (sc.type === 'leading-tone') {
    return {
      ...sc,
      id: roman,
      label: roman,
      roman: roman,
      intervals: [0, 3, 6],
      quality: 'diminished',
      sourceMode: sc.applicableTonality,
      isSecondary: true,
      isBorrowed: false,
    }
  }
  return null
}

// Build a progression (array of chord objects) from Roman numerals.
// Supports diatonic chords, secondary chords (triad & seventh), borrowed chords
// (modal interchange), and other non-diatonic chords (e.g. Neapolitan).
export function buildProgressionFromRomans(tonality, chordType, romans, includeHarmMinor = true) {
  const diatonicChords = chordType === 'sevenths'
    ? getDiatonicSeventhsWithHarmMinor(tonality, includeHarmMinor)
    : getDiatonicTriadsWithHarmMinor(tonality, includeHarmMinor)

  const parallelTonality = tonality === 'major' ? 'minor' : 'major'
  const borrowedChords = chordType === 'sevenths'
    ? getDiatonicSevenths(parallelTonality)
    : getDiatonicTriads(parallelTonality)

  const secondaryChords = getAvailableSecondaryChords(tonality)

  return romans.map(roman => {
    if (!roman) return null

    // 1. Try diatonic chords (including harmonic minor)
    const diatonic = diatonicChords.find(c => c.roman === roman)
    if (diatonic) {
      return { ...diatonic, sourceMode: tonality, isBorrowed: false, isSecondary: false }
    }

    // 2. Try secondary chords (exact match first, then triad version)
    const scExact = secondaryChords.find(sc => sc.id === roman || sc.label === roman)
    if (scExact) {
      return { ...scExact, roman: scExact.label, sourceMode: tonality, isSecondary: true, isBorrowed: false }
    }

    const triadMatch = trySecondaryTriad(roman, secondaryChords)
    if (triadMatch) return triadMatch

    // 3. Try borrowed chords (modal interchange from parallel mode)
    const borrowed = borrowedChords.find(c => c.roman === roman)
    if (borrowed) {
      const isDiatonic = diatonicChords.some(c => c.roman === roman)
      return { ...borrowed, sourceMode: parallelTonality, isBorrowed: !isDiatonic, isSecondary: false }
    }

    // 4. Try other chords (Neapolitan, etc.)
    const other = OTHER_CHORDS.find(c => c.roman === roman)
    if (other) {
      return { ...other, sourceMode: tonality, isBorrowed: false, isSecondary: false, isOther: true }
    }

    // 5. Free-choice fallback: build chord from any roman string
    const freeChoice = buildFreeChoiceChord(roman)
    if (freeChoice) {
      return { ...freeChoice, sourceMode: tonality, isBorrowed: false, isSecondary: false }
    }

    return null
  }).filter(Boolean)
}

// ─── Chord source type detection ─────────────────────────────────────────

// Determine the source type of a chord from its roman string and tonality.
// Returns: 'diatonic' | 'modal-interchange' | 'secondary-dominants' | 'secondary-leading-tone' | 'free-choice'
export function getChordSourceType(roman, tonality) {
  if (!roman) return 'diatonic'

  // Secondary chords contain '/'
  if (roman.includes('/')) {
    const parts = getRomanParts(roman)
    if (parts.base === 'V') return 'secondary-dominants'
    if (parts.base === 'vii') return 'secondary-leading-tone'
    return 'secondary-dominants'
  }

  // Check diatonic (including harmonic minor)
  const diatonicAll = [
    ...getDiatonicTriadsWithHarmMinor(tonality, true),
    ...getDiatonicSeventhsWithHarmMinor(tonality, true),
  ]
  if (diatonicAll.some(c => c.roman === roman)) return 'diatonic'

  // Check modal interchange (parallel key)
  const parallel = tonality === 'major' ? 'minor' : 'major'
  const parallelAll = [...getDiatonicTriads(parallel), ...getDiatonicSevenths(parallel)]
  if (parallelAll.some(c => c.roman === roman)) return 'modal-interchange'

  return 'free-choice'
}

// Map a root string (e.g. 'bII', '#iv', 'V') to semitones from tonic
const NUMERAL_SEMITONES_MAP = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 }
function rootToSemitones(root) {
  const match = root.match(/^([b#]*)([IViv]+)$/)
  if (!match) return 0
  let semitones = NUMERAL_SEMITONES_MAP[match[2].toUpperCase()] ?? 0
  for (const acc of match[1]) {
    if (acc === 'b') semitones -= 1
    if (acc === '#') semitones += 1
  }
  return ((semitones % 12) + 12) % 12
}

// Build a chord object from any roman string (free-choice fallback).
// Handles all root + extension combinations.
function buildFreeChoiceChord(roman) {
  const parts = getRomanParts(roman)
  const root = parts.base
  const ext = parts.superscript
  const semitones = rootToSemitones(root)
  const isUpper = root[0] === root[0].toUpperCase()

  let quality, intervals
  if (!ext) {
    quality = isUpper ? 'major' : 'minor'
    intervals = isUpper ? [0, 4, 7] : [0, 3, 7]
  } else if (ext === 'o') {
    quality = 'diminished'; intervals = [0, 3, 6]
  } else if (ext === '+') {
    quality = 'augmented'; intervals = [0, 4, 8]
  } else if (ext === '7') {
    quality = isUpper ? 'dominant7' : 'minor7'
    intervals = isUpper ? [0, 4, 7, 10] : [0, 3, 7, 10]
  } else if (ext === 'maj7') {
    if (isUpper) {
      quality = 'major7'; intervals = [0, 4, 7, 11]
    } else {
      quality = 'minor-major7'; intervals = [0, 3, 7, 11]
    }
  } else if (ext === '+maj7') {
    quality = 'augmented-major7'; intervals = [0, 4, 8, 11]
  } else if (ext === 'm7b5') {
    quality = 'half-diminished'; intervals = [0, 3, 6, 10]
  } else if (ext === 'o7') {
    quality = 'diminished7'; intervals = [0, 3, 6, 9]
  } else {
    quality = isUpper ? 'major' : 'minor'
    intervals = isUpper ? [0, 4, 7] : [0, 3, 7]
  }

  return { roman, semitones, quality, intervals, isFreeChoice: true }
}

// ─── Piano keyboard helpers ──────────────────────────────────────────────

// Black key positions within an octave (relative to C)
export const BLACK_KEY_PCS = [1, 3, 6, 8, 10]

export function isBlackKey(pc) {
  return BLACK_KEY_PCS.includes(pc % 12)
}

// Generate a range of MIDI notes from startNote to endNote (inclusive)
export function generateMidiRange(startNote, endNote) {
  const notes = []
  for (let n = startNote; n <= endNote; n++) {
    notes.push(n)
  }
  return notes
}

// Default keyboard range: C3 (48) to C6 (84) — 3 octaves
export const DEFAULT_RANGE = { start: 48, end: 84 }

// ─── Key center display ──────────────────────────────────────────────────

export function getKeyDisplay(tonic, tonality) {
  return `${tonic} ${tonality}`
}

// ─── Tonic-based keyboard range ──────────────────────────────────────────

// Compute a keyboard range that starts on the tonic, displaying 3 octaves.
// Placement rules:
//   C  → C4 (MIDI 60) — middle of keyboard
//   Db–Gb (PC 1–6) → octave 3 (lower than C4)
//   G–B  (PC 7–11) → octave 4 (higher than C4)
// Returns { start, end } covering the specified number of octaves.
export function getTonicBasedRange(tonicPC, octaves = 3) {
  let startMidi
  if (tonicPC === 0) {
    startMidi = 60 // C4
  } else if (tonicPC <= 6) {
    startMidi = 48 + tonicPC // Db3–Gb3
  } else {
    startMidi = 60 + tonicPC // G4–B4
  }
  return { start: startMidi, end: startMidi + octaves * 12 }
}
