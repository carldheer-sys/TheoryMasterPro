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
  return DIATONIC_DEGREES[tonality] || DIATONIC_DEGREES.major
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
  const isDiatonic = mode === 'major'
    ? DIATONIC_MAJOR.has(chromaticDistance)
    : DIATONIC_MINOR.has(chromaticDistance)
  return {
    scale_degree: DEGREE_MAP[chromaticDistance],
    chromatic_distance: chromaticDistance,
    is_diatonic: isDiatonic
  }
}

// Calculate the target pitch class for a scale degree given a tonic
export function degreeToPitchClass(tonicPC, semitones) {
  return (tonicPC + semitones) % 12
}

// ─── Key-aware enharmonic spelling (from naming conventions §3) ─────────

// Determine if a key (with mode) uses flats or sharps
export function usesFlats(tonic, mode) {
  if (mode === 'minor') return FLAT_MINOR_KEYS.has(tonic)
  return FLAT_MAJOR_KEYS.has(tonic)
}

// Get the key signature for a tonic + mode (looking up relative major for minor)
export function getKeySignature(tonic, mode) {
  if (mode === 'minor') {
    const relativeMajor = MINOR_TO_RELATIVE_MAJOR[tonic]
    return KEY_SIGNATURES[relativeMajor] || KEY_SIGNATURES['C']
  }
  return KEY_SIGNATURES[tonic] || KEY_SIGNATURES['C']
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
  major7:          [0, 4, 7, 11],
  dominant7:       [0, 4, 7, 10],
  minor7:          [0, 3, 7, 10],
  'half-diminished': [0, 3, 6, 10],
  diminished7:     [0, 3, 6, 9],
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
    { roman: 'viiø7',  semitones: 11, quality: 'half-diminished', intervals: [0, 3, 6, 10] },
  ],
  minor: [
    { roman: 'i7',       semitones: 0,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'iiø7',     semitones: 2,  quality: 'half-diminished', intervals: [0, 3, 6, 10] },
    { roman: 'bIIImaj7', semitones: 3,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'iv7',      semitones: 5,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'v7',       semitones: 7,  quality: 'minor7',          intervals: [0, 3, 7, 10] },
    { roman: 'bVImaj7',  semitones: 8,  quality: 'major7',          intervals: [0, 4, 7, 11] },
    { roman: 'bVII7',    semitones: 10, quality: 'dominant7',       intervals: [0, 4, 7, 10] },
  ],
}

// Chord label suffixes by quality (jazz/pop notation from §4.1)
const CHORD_LABEL_SUFFIXES = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  major7: 'maj7',
  dominant7: '7',
  minor7: 'm7',
  'half-diminished': 'm7b5',
  diminished7: 'o7',
}

// Get diatonic triads for a tonality
export function getDiatonicTriads(tonality) {
  return DIATONIC_TRIADS[tonality] || DIATONIC_TRIADS.major
}

// Get diatonic sevenths for a tonality
export function getDiatonicSevenths(tonality) {
  return DIATONIC_SEVENTHS[tonality] || DIATONIC_SEVENTHS.major
}

// Get the pitch classes for a chord given the tonic pitch class
export function getChordPitchClasses(tonicPC, chord) {
  const rootPC = (tonicPC + chord.semitones) % 12
  return chord.intervals.map(iv => (rootPC + iv) % 12)
}

// Get the root note name for a chord (key-aware spelling)
export function getChordRootName(tonicPC, chord, tonic, tonality) {
  const rootPC = (tonicPC + chord.semitones) % 12
  return spellNoteName(rootPC, tonic, tonality)
}

// Get the chord label (e.g. "Ab", "Cm", "Bdim", "G7", "Cmaj7", "Bm7b5") with key-aware spelling
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
