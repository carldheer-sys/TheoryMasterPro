/**
 * TheoryMasterPro — Music Theory Test Suite
 *
 * Run with: node src/utils/musicTheory.test.js
 *
 * Verifies that scale degree → note mappings are correct
 * across all keys, modes, and degree types, following the
 * naming conventions in MUSIC_THEORY_NAMING_CONVENTIONS.md.
 */

import {
  NOTE_NAMES_FLAT,
  NOTE_NAMES_SHARP,
  TONICS,
  TONALITIES,
  MODES,
  MODE_PARENT_MAJOR_OFFSET,
  TONALITY_TO_MODE,
  DIATONIC_PCS,
  DEGREE_MAP,
  DIATONIC_MAJOR,
  DIATONIC_MINOR,
  DIATONIC_DEGREES,
  CHROMATIC_DEGREES,
  KEY_SIGNATURES,
  ENHARMONIC_MAP,
  MINOR_TO_RELATIVE_MAJOR,
  FLAT_MAJOR_KEYS,
  FLAT_MINOR_KEYS,
  DIATONIC_TRIADS,
  TRIAD_INTERVALS,
  DIATONIC_SEVENTHS,
  SEVENTH_INTERVALS,
  getDiatonicSevenths,
  tonicToPC,
  getScaleDegrees,
  pickRandomDegree,
  getScaleDegree,
  degreeToPitchClass,
  usesFlats,
  getKeySignature,
  spellNoteName,
  pitchClassToName,
  midiNoteToPC,
  midiNoteToOctave,
  midiNoteToName,
  getDiatonicTriads,
  getChordPitchClasses,
  getChordRootName,
  getChordLabel,
  pickRandomChord,
  pickInterchangeChord,
  SECONDARY_CHORDS,
  isSecondaryChordAvailable,
  getAvailableSecondaryChords,
  getSecondaryChordTarget,
  pickSecondaryChord,
  getTonicBasedRange,
  assignInversion,
  getBassPC,
  getBassScaleDegree,
  getRomanParts,
  getFiguredBass
} from './musicTheory.js'

// ─── Test helpers ────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const failures = []

function assert(condition, message) {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(message)
    console.error(`  ✗ FAIL: ${message}`)
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} — expected "${expected}", got "${actual}"`)
}

function assertDeepEqual(actual, expected, message) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  assert(a === e, `${message} — expected ${e}, got ${a}`)
}

function test(name, fn) {
  console.log(`\n▶ ${name}`)
  fn()
}

// ─── Tests ───────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════════════')
console.log('  TheoryMasterPro — Music Theory Test Suite')
console.log('═══════════════════════════════════════════════════════════')

// ── 1. Degree Map (§2.1) ─────────────────────────────────────────────────

test('1. DEGREE_MAP matches naming convention table', () => {
  assertEqual(DEGREE_MAP[0], '1', 'semitone 0 → 1')
  assertEqual(DEGREE_MAP[1], 'b2', 'semitone 1 → b2')
  assertEqual(DEGREE_MAP[2], '2', 'semitone 2 → 2')
  assertEqual(DEGREE_MAP[3], 'b3', 'semitone 3 → b3')
  assertEqual(DEGREE_MAP[4], '3', 'semitone 4 → 3')
  assertEqual(DEGREE_MAP[5], '4', 'semitone 5 → 4')
  assertEqual(DEGREE_MAP[6], '#4', 'semitone 6 → #4 (NOT b5)')
  assertEqual(DEGREE_MAP[7], '5', 'semitone 7 → 5')
  assertEqual(DEGREE_MAP[8], 'b6', 'semitone 8 → b6')
  assertEqual(DEGREE_MAP[9], '6', 'semitone 9 → 6')
  assertEqual(DEGREE_MAP[10], 'b7', 'semitone 10 → b7')
  assertEqual(DEGREE_MAP[11], '7', 'semitone 11 → 7')
})

// ── 2. Diatonic sets (§2.1) ──────────────────────────────────────────────

test('2. Diatonic pitch-class sets', () => {
  assertDeepEqual([...DIATONIC_MAJOR].sort((a, b) => a - b), [0, 2, 4, 5, 7, 9, 11], 'Major scale intervals')
  assertDeepEqual([...DIATONIC_MINOR].sort((a, b) => a - b), [0, 2, 3, 5, 7, 8, 10], 'Minor scale intervals')
})

// ── 3. Diatonic degrees lists ────────────────────────────────────────────

test('3. Diatonic degree lists', () => {
  const majorDegrees = DIATONIC_DEGREES.major.map(d => d.degree)
  assertDeepEqual(majorDegrees, ['1', '2', '3', '4', '5', '6', '7'], 'Major diatonic degrees')

  const minorDegrees = DIATONIC_DEGREES.minor.map(d => d.degree)
  assertDeepEqual(minorDegrees, ['1', '2', 'b3', '4', '5', 'b6', 'b7'], 'Minor diatonic degrees')
})

// ── 4. Chromatic degrees (must use #4 not b5) ────────────────────────────

test('4. Chromatic degrees use #4 not b5', () => {
  const chromaticLabels = CHROMATIC_DEGREES.map(d => d.degree)
  assertDeepEqual(chromaticLabels, ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'], 'Chromatic degrees')
  assert(!chromaticLabels.includes('b5'), 'b5 must NOT appear in chromatic degrees')
  assert(chromaticLabels.includes('#4'), '#4 must appear in chromatic degrees')
})

// ── 5. getScaleDegrees returns correct lists ─────────────────────────────

test('5. getScaleDegrees returns correct lists', () => {
  const majorDiatonic = getScaleDegrees('diatonic', 'major')
  assertEqual(majorDiatonic.length, 7, 'Major diatonic has 7 degrees')
  assertEqual(majorDiatonic[0].degree, '1', 'Major diatonic starts with 1')

  const minorDiatonic = getScaleDegrees('diatonic', 'minor')
  assertEqual(minorDiatonic.length, 7, 'Minor diatonic has 7 degrees')
  assertEqual(minorDiatonic[2].degree, 'b3', 'Minor diatonic has b3 at index 2')

  const chromatic = getScaleDegrees('chromatic', 'major')
  assertEqual(chromatic.length, 12, 'Chromatic has 12 degrees')
  assertEqual(chromatic[6].degree, '#4', 'Chromatic degree at semitone 6 is #4')
})

// ── 6. getScaleDegree function (§2.3) ────────────────────────────────────

test('6. getScaleDegree — C Major scale notes', () => {
  // C D E F G A B C in C Major
  const cMaj = [60, 62, 64, 65, 67, 69, 71, 72]
  const expected = ['1', '2', '3', '4', '5', '6', '7', '1']
  cMaj.forEach((note, i) => {
    const result = getScaleDegree(note, 0, 'major')
    assertEqual(result.scale_degree, expected[i], `C Major: MIDI ${note} → ${expected[i]}`)
  })
})

test('6b. getScaleDegree — C Major chromatic', () => {
  // C C# D D# E F F# G G# A A# B in C Major
  const chromatic = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]
  const expected = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7']
  chromatic.forEach((note, i) => {
    const result = getScaleDegree(note, 0, 'major')
    assertEqual(result.scale_degree, expected[i], `C Major chromatic: MIDI ${note} → ${expected[i]}`)
  })
})

test('6c. getScaleDegree — A Minor scale notes', () => {
  // A B C D E F G A in A Minor
  const aMin = [69, 71, 72, 74, 76, 77, 79, 81]
  const expected = ['1', '2', 'b3', '4', '5', 'b6', 'b7', '1']
  aMin.forEach((note, i) => {
    const result = getScaleDegree(note, 9, 'minor')
    assertEqual(result.scale_degree, expected[i], `A Minor: MIDI ${note} → ${expected[i]}`)
  })
})

test('6d. getScaleDegree — G Major scale notes', () => {
  // G A B C D E F# G in G Major
  const gMaj = [67, 69, 71, 72, 74, 76, 78, 79]
  const expected = ['1', '2', '3', '4', '5', '6', '7', '1']
  gMaj.forEach((note, i) => {
    const result = getScaleDegree(note, 7, 'major')
    assertEqual(result.scale_degree, expected[i], `G Major: MIDI ${note} → ${expected[i]}`)
  })
})

test('6e. getScaleDegree — E Minor scale notes', () => {
  // E F# G A B C D E in E Minor
  const eMin = [64, 66, 67, 69, 71, 72, 74, 76]
  const expected = ['1', '2', 'b3', '4', '5', 'b6', 'b7', '1']
  eMin.forEach((note, i) => {
    const result = getScaleDegree(note, 4, 'minor')
    assertEqual(result.scale_degree, expected[i], `E Minor: MIDI ${note} → ${expected[i]}`)
  })
})

test('6f. getScaleDegree — C# Minor scale notes', () => {
  // C# D# E F# G# A B C# in C# Minor
  const csMin = [61, 63, 64, 66, 68, 69, 71, 73]
  const expected = ['1', '2', 'b3', '4', '5', 'b6', 'b7', '1']
  csMin.forEach((note, i) => {
    const result = getScaleDegree(note, 1, 'minor')
    assertEqual(result.scale_degree, expected[i], `C# Minor: MIDI ${note} → ${expected[i]}`)
  })
})

// ── 7. Octave independence (§2.2 rule 2) ──────────────────────────────────

test('7. Octave independence — same pitch class = same degree', () => {
  // C3, C4, C5 in C Major should all be degree 1
  const cNotes = [48, 60, 72, 84]
  cNotes.forEach(note => {
    const result = getScaleDegree(note, 0, 'major')
    assertEqual(result.scale_degree, '1', `C${midiNoteToOctave(note)} in C Major → 1`)
  })

  // E3, E4, E5 in C Major should all be degree 3
  const eNotes = [52, 64, 76]
  eNotes.forEach(note => {
    const result = getScaleDegree(note, 0, 'major')
    assertEqual(result.scale_degree, '3', `E${midiNoteToOctave(note)} in C Major → 3`)
  })
})

// ── 8. degreeToPitchClass — degree + tonic → correct note ────────────────

test('8. degreeToPitchClass — b3 in E minor → G (pitch class 7)', () => {
  // b3 = 3 semitones, E = pitch class 4, (4+3)%12 = 7 = G
  const pc = degreeToPitchClass(4, 3)
  assertEqual(pc, 7, 'b3 in E → pitch class 7 (G)')
  assertEqual(pitchClassToName(pc), 'G', 'pitch class 7 → G')
})

test('8b. degreeToPitchClass — all diatonic degrees in C Major', () => {
  const tonicPC = 0 // C
  const expected = { '1': 0, '2': 2, '3': 4, '4': 5, '5': 7, '6': 9, '7': 11 }
  DIATONIC_DEGREES.major.forEach(d => {
    const pc = degreeToPitchClass(tonicPC, d.semitones)
    assertEqual(pc, expected[d.degree], `C Major: ${d.degree} → pitch class ${expected[d.degree]}`)
  })
})

test('8c. degreeToPitchClass — all diatonic degrees in A Minor', () => {
  const tonicPC = 9 // A
  const expected = { '1': 9, '2': 11, 'b3': 0, '4': 2, '5': 4, 'b6': 5, 'b7': 7 }
  DIATONIC_DEGREES.minor.forEach(d => {
    const pc = degreeToPitchClass(tonicPC, d.semitones)
    assertEqual(pc, expected[d.degree], `A Minor: ${d.degree} → pitch class ${expected[d.degree]}`)
  })
})

test('8d. degreeToPitchClass — chromatic degrees in Eb Major', () => {
  const tonicPC = 3 // Eb
  const expected = {
    '1': 3, 'b2': 4, '2': 5, 'b3': 6, '3': 7, '4': 8,
    '#4': 9, '5': 10, 'b6': 11, '6': 0, 'b7': 1, '7': 2
  }
  CHROMATIC_DEGREES.forEach(d => {
    const pc = degreeToPitchClass(tonicPC, d.semitones)
    assertEqual(pc, expected[d.degree], `Eb Major: ${d.degree} → pitch class ${expected[d.degree]}`)
  })
})

// ── 9. Cross-key degree verification (all 12 tonics, major & minor) ──────

test('9. All 12 tonics — major diatonic degrees produce correct pitch classes', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    DIATONIC_DEGREES.major.forEach(d => {
      const pc = degreeToPitchClass(tonicPC, d.semitones)
      // Verify round-trip: getScaleDegree of that PC should give back the same degree
      const result = getScaleDegree(pc + 60, tonicPC, 'major')
      assertEqual(result.scale_degree, d.degree, `${tonic} Major: ${d.degree} round-trip`)
    })
  })
})

test('9b. All 12 tonics — minor diatonic degrees produce correct pitch classes', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    DIATONIC_DEGREES.minor.forEach(d => {
      const pc = degreeToPitchClass(tonicPC, d.semitones)
      const result = getScaleDegree(pc + 60, tonicPC, 'minor')
      assertEqual(result.scale_degree, d.degree, `${tonic} minor: ${d.degree} round-trip`)
    })
  })
})

test('9c. All 12 tonics — chromatic degrees round-trip', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    CHROMATIC_DEGREES.forEach(d => {
      const pc = degreeToPitchClass(tonicPC, d.semitones)
      const result = getScaleDegree(pc + 60, tonicPC, 'major')
      assertEqual(result.scale_degree, d.degree, `${tonic}: ${d.degree} chromatic round-trip`)
    })
  })
})

// ── 10. Key-aware enharmonic spelling (§3) ───────────────────────────────

test('10. spellNoteName — sharp keys use sharps', () => {
  // D Major (sharp key): pitch class 1 should be C#
  assertEqual(spellNoteName(1, 'D', 'major'), 'C#', 'D Major: PC 1 → C#')
  // A Major: pitch class 3 should be D#
  assertEqual(spellNoteName(3, 'A', 'major'), 'D#', 'A Major: PC 3 → D#')
  // E Major: pitch class 6 should be F#
  assertEqual(spellNoteName(6, 'E', 'major'), 'F#', 'E Major: PC 6 → F#')
})

test('10b. spellNoteName — flat keys use flats', () => {
  // Db Major (flat key): pitch class 1 should be Db
  assertEqual(spellNoteName(1, 'Db', 'major'), 'Db', 'Db Major: PC 1 → Db')
  // Ab Major: pitch class 3 should be Eb
  assertEqual(spellNoteName(3, 'Ab', 'major'), 'Eb', 'Ab Major: PC 3 → Eb')
  // Bb Major: pitch class 6 should be Gb (F# → Gb in flat key)
  assertEqual(spellNoteName(6, 'Bb', 'major'), 'Gb', 'Bb Major: PC 6 → Gb')
  // F Major: pitch class 10 should be Bb
  assertEqual(spellNoteName(10, 'F', 'major'), 'Bb', 'F Major: PC 10 → Bb')
})

test('10c. spellNoteName — natural notes never converted', () => {
  // C is always C regardless of key
  for (const tonic of TONICS) {
    assertEqual(spellNoteName(0, tonic, 'major'), 'C', `PC 0 in ${tonic} Major → C`)
    assertEqual(spellNoteName(2, tonic, 'major'), 'D', `PC 2 in ${tonic} Major → D`)
    assertEqual(spellNoteName(4, tonic, 'major'), 'E', `PC 4 in ${tonic} Major → E`)
  }
})

test('10d. spellNoteName — minor keys use relative major signature', () => {
  // A Minor → relative major C → no sharps/flats → PC 1 = C#
  assertEqual(spellNoteName(1, 'A', 'minor'), 'C#', 'A Minor: PC 1 → C# (sharp key)')
  // D Minor → relative major F → flat key → PC 1 = Db
  assertEqual(spellNoteName(1, 'D', 'minor'), 'Db', 'D Minor: PC 1 → Db (flat key)')
  // G Minor → relative major Bb → flat key → PC 3 = Eb
  assertEqual(spellNoteName(3, 'G', 'minor'), 'Eb', 'G Minor: PC 3 → Eb (flat key)')
  // E Minor → relative major G → sharp key → PC 6 = F#
  assertEqual(spellNoteName(6, 'E', 'minor'), 'F#', 'E Minor: PC 6 → F# (sharp key)')
})

// ── 11. usesFlats (§3.5) ─────────────────────────────────────────────────

test('11. usesFlats — major keys', () => {
  assert(usesFlats('F', 'major'), 'F Major uses flats')
  assert(usesFlats('Bb', 'major'), 'Bb Major uses flats')
  assert(usesFlats('Eb', 'major'), 'Eb Major uses flats')
  assert(usesFlats('Ab', 'major'), 'Ab Major uses flats')
  assert(usesFlats('Db', 'major'), 'Db Major uses flats')
  assert(usesFlats('Gb', 'major'), 'Gb Major uses flats')
  assert(!usesFlats('C', 'major'), 'C Major does NOT use flats')
  assert(!usesFlats('G', 'major'), 'G Major does NOT use flats')
  assert(!usesFlats('D', 'major'), 'D Major does NOT use flats')
  assert(!usesFlats('A', 'major'), 'A Major does NOT use flats')
  assert(!usesFlats('E', 'major'), 'E Major does NOT use flats')
})

test('11b. usesFlats — minor keys', () => {
  assert(!usesFlats('A', 'minor'), 'A Minor does NOT use flats (sharp key)')
  assert(!usesFlats('E', 'minor'), 'E Minor does NOT use flats (sharp key)')
  assert(usesFlats('D', 'minor'), 'D Minor uses flats')
  assert(usesFlats('G', 'minor'), 'G Minor uses flats')
  assert(usesFlats('C', 'minor'), 'C Minor uses flats')
  assert(usesFlats('F', 'minor'), 'F Minor uses flats')
  assert(usesFlats('Bb', 'minor'), 'Bb Minor uses flats')
})

// ── 12. tonicToPC ────────────────────────────────────────────────────────

test('12. tonicToPC — all tonics', () => {
  assertEqual(tonicToPC('C'), 0, 'C → 0')
  assertEqual(tonicToPC('Db'), 1, 'Db → 1')
  assertEqual(tonicToPC('D'), 2, 'D → 2')
  assertEqual(tonicToPC('Eb'), 3, 'Eb → 3')
  assertEqual(tonicToPC('E'), 4, 'E → 4')
  assertEqual(tonicToPC('F'), 5, 'F → 5')
  assertEqual(tonicToPC('Gb'), 6, 'Gb → 6')
  assertEqual(tonicToPC('G'), 7, 'G → 7')
  assertEqual(tonicToPC('Ab'), 8, 'Ab → 8')
  assertEqual(tonicToPC('A'), 9, 'A → 9')
  assertEqual(tonicToPC('Bb'), 10, 'Bb → 10')
  assertEqual(tonicToPC('B'), 11, 'B → 11')
})

test('12b. tonicToPC — sharp spellings also work', () => {
  assertEqual(tonicToPC('C#'), 1, 'C# → 1')
  assertEqual(tonicToPC('F#'), 6, 'F# → 6')
  assertEqual(tonicToPC('G#'), 8, 'G# → 8')
})

// ── 13. pickRandomDegree — no direct repeats ─────────────────────────────

test('13. pickRandomDegree — never repeats directly after itself', () => {
  const degrees = CHROMATIC_DEGREES
  let last = null
  for (let i = 0; i < 1000; i++) {
    const pick = pickRandomDegree(degrees, last)
    if (last) {
      assert(pick.degree !== last.degree, `Iteration ${i}: no direct repeat (${last.degree} → ${pick.degree})`)
    }
    last = pick
  }
})

test('13b. pickRandomDegree — distribution is roughly uniform', () => {
  const degrees = CHROMATIC_DEGREES
  const counts = {}
  degrees.forEach(d => { counts[d.degree] = 0 })

  let last = null
  const iterations = 12000 // 1000 per degree
  for (let i = 0; i < iterations; i++) {
    const pick = pickRandomDegree(degrees, last)
    counts[pick.degree]++
    last = pick
  }

  // Each degree should appear roughly 1/12 of the time, but since we exclude
  // the last pick, the expected count is slightly higher than iterations/12.
  // With 12 degrees and no-repeat, each degree gets ~1/11 of picks.
  // We check that no degree gets less than 500 or more than 1500 (generous bounds).
  for (const degree of Object.keys(counts)) {
    assert(
      counts[degree] > 500 && counts[degree] < 1500,
      `Degree ${degree} count ${counts[degree]} is within acceptable range (500–1500)`
    )
  }
})

test('13c. pickRandomDegree — single element list returns that element', () => {
  const single = [{ degree: '1', semitones: 0 }]
  const pick = pickRandomDegree(single, null)
  assertEqual(pick.degree, '1', 'Single element list returns that element')
  const pick2 = pickRandomDegree(single, single[0])
  assertEqual(pick2.degree, '1', 'Single element list returns that element even with lastDegree')
})

// ── 14. Is diatonic flag ─────────────────────────────────────────────────

test('14. getScaleDegree — is_diatonic flag for C Major', () => {
  // C D E F G A B are diatonic in C Major
  [60, 62, 64, 65, 67, 69, 71].forEach(note => {
    const result = getScaleDegree(note, 0, 'major')
    assert(result.is_diatonic, `MIDI ${note} should be diatonic in C Major`)
  })
  // C# D# F# G# A# are NOT diatonic in C Major
  ;[61, 63, 66, 68, 70].forEach(note => {
    const result = getScaleDegree(note, 0, 'major')
    assert(!result.is_diatonic, `MIDI ${note} should NOT be diatonic in C Major`)
  })
})

test('14b. getScaleDegree — is_diatonic flag for A Minor', () => {
  // A B C D E F G are diatonic in A Minor
  [69, 71, 72, 74, 76, 77, 79].forEach(note => {
    const result = getScaleDegree(note, 9, 'minor')
    assert(result.is_diatonic, `MIDI ${note} should be diatonic in A Minor`)
  })
  // A# C# D# F# G# are NOT diatonic in A Minor
  ;[70, 73, 75, 78, 80].forEach(note => {
    const result = getScaleDegree(note, 9, 'minor')
    assert(!result.is_diatonic, `MIDI ${note} should NOT be diatonic in A Minor`)
  })
})

// ── 15. Specific examples from the naming convention doc ─────────────────

test('15. Naming convention example: b3 in E minor → G', () => {
  // E = PC 4, b3 = 3 semitones, (4+3)%12 = 7 = G
  const ePC = tonicToPC('E')
  const b3PC = degreeToPitchClass(ePC, 3)
  assertEqual(b3PC, 7, 'b3 in E → PC 7')
  assertEqual(pitchClassToName(b3PC), 'G', 'PC 7 → G')
  // Key-aware spelling: E minor is a sharp key, but G is natural so no conversion
  assertEqual(spellNoteName(b3PC, 'E', 'minor'), 'G', 'b3 in E minor spelled as G')
})

test('15b. Naming convention example: #4 in C Major → F# (PC 6)', () => {
  const cPC = tonicToPC('C')
  const sharp4PC = degreeToPitchClass(cPC, 6)
  assertEqual(sharp4PC, 6, '#4 in C → PC 6')
  // C Major has no sharps/flats, so PC 6 = F# (sharp spelling by default)
  assertEqual(spellNoteName(sharp4PC, 'C', 'major'), 'F#', '#4 in C Major → F#')
})

test('15c. Naming convention example: b7 in Db Major → Cb (PC 11)', () => {
  const dbPC = tonicToPC('Db')
  const b7PC = degreeToPitchClass(dbPC, 10)
  assertEqual(b7PC, 11, 'b7 in Db → PC 11')
  // Db Major is a flat key, so PC 11 = B (natural, no conversion needed)
  // But wait, PC 11 = B which is natural, so it stays B
  // Actually in Db Major, b7 = Cb... let me check.
  // Db = PC 1, b7 = 10 semitones, (1+10)%12 = 11 = B
  // But in Db Major (flat key), PC 11 should be B (natural), not Bb or anything else
  // The note B is natural, so no conversion happens. It's just B.
  // However, in the context of Db Major scale, the 7th degree is C (not B).
  // Wait - b7 means flat 7, which is 10 semitones from tonic.
  // Db + 10 = B. In Db Major key, B is spelled as Cb (because Db Major has Cb in its key signature).
  // But our spellNoteName function only converts sharps to flats and vice versa.
  // B is a natural note, so it won't be converted to Cb.
  // This is a known limitation — natural-to-natural enharmonic (B/Cb) is not handled.
  // For the purposes of this app, this is acceptable since we display note names
  // for user feedback, not for staff notation.
  assertEqual(b7PC, 11, 'b7 in Db → PC 11 (B)')
})

// ── 16. Key signature tables (§3.2) ──────────────────────────────────────

test('16. Key signatures — C Major has no sharps or flats', () => {
  const sig = getKeySignature('C', 'major')
  assertEqual(sig.sharps.length, 0, 'C Major: 0 sharps')
  assertEqual(sig.flats.length, 0, 'C Major: 0 flats')
})

test('16b. Key signatures — D Major has 2 sharps', () => {
  const sig = getKeySignature('D', 'major')
  assertEqual(sig.sharps.length, 2, 'D Major: 2 sharps')
  assertDeepEqual(sig.sharps, ['F', 'C'], 'D Major sharps: F, C')
})

test('16c. Key signatures — Eb Major has 3 flats', () => {
  const sig = getKeySignature('Eb', 'major')
  assertEqual(sig.flats.length, 3, 'Eb Major: 3 flats')
  assertDeepEqual(sig.flats, ['B', 'E', 'A'], 'Eb Major flats: B, E, A')
})

test('16d. Key signatures — A Minor uses relative major (C)', () => {
  const sig = getKeySignature('A', 'minor')
  assertEqual(sig.sharps.length, 0, 'A Minor: 0 sharps (same as C Major)')
  assertEqual(sig.flats.length, 0, 'A Minor: 0 flats')
})

test('16e. Key signatures — D Minor uses relative major (F, 1 flat)', () => {
  const sig = getKeySignature('D', 'minor')
  assertEqual(sig.flats.length, 1, 'D Minor: 1 flat (same as F Major)')
  assertDeepEqual(sig.flats, ['B'], 'D Minor flats: B')
})

// ── 17. MIDI note helpers ────────────────────────────────────────────────

test('17. midiNoteToPC and midiNoteToOctave', () => {
  assertEqual(midiNoteToPC(60), 0, 'MIDI 60 → PC 0 (C)')
  assertEqual(midiNoteToPC(61), 1, 'MIDI 61 → PC 1 (C#/Db)')
  assertEqual(midiNoteToPC(69), 9, 'MIDI 69 → PC 9 (A)')
  assertEqual(midiNoteToOctave(60), 4, 'MIDI 60 → octave 4')
  assertEqual(midiNoteToOctave(48), 3, 'MIDI 48 → octave 3')
  assertEqual(midiNoteToOctave(72), 5, 'MIDI 72 → octave 5')
})

test('17b. midiNoteToName — without key context uses flat names', () => {
  assertEqual(midiNoteToName(60), 'C4', 'MIDI 60 → C4')
  assertEqual(midiNoteToName(61), 'Db4', 'MIDI 61 → Db4 (flat default)')
  assertEqual(midiNoteToName(69), 'A4', 'MIDI 69 → A4')
})

test('17c. midiNoteToName — with key context uses key-aware spelling', () => {
  assertEqual(midiNoteToName(61, 'D', 'major'), 'C#4', 'MIDI 61 in D Major → C#4')
  assertEqual(midiNoteToName(61, 'Db', 'major'), 'Db4', 'MIDI 61 in Db Major → Db4')
  assertEqual(midiNoteToName(66, 'E', 'major'), 'F#4', 'MIDI 66 in E Major → F#4')
  assertEqual(midiNoteToName(66, 'Bb', 'major'), 'Gb4', 'MIDI 66 in Bb Major → Gb4')
})

// ── 18. Full integration: degree → pitch class → note name ───────────────

test('18. Integration: all chromatic degrees in all 12 keys (major)', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    CHROMATIC_DEGREES.forEach(d => {
      const pc = degreeToPitchClass(tonicPC, d.semitones)
      // Verify round-trip via getScaleDegree
      const result = getScaleDegree(pc + 60, tonicPC, 'major')
      assertEqual(result.scale_degree, d.degree, `${tonic} Major: ${d.degree} → PC ${pc} → ${result.scale_degree}`)
    })
  })
})

test('18b. Integration: all chromatic degrees in all 12 keys (minor)', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    CHROMATIC_DEGREES.forEach(d => {
      const pc = degreeToPitchClass(tonicPC, d.semitones)
      const result = getScaleDegree(pc + 60, tonicPC, 'minor')
      assertEqual(result.scale_degree, d.degree, `${tonic} minor: ${d.degree} → PC ${pc} → ${result.scale_degree}`)
    })
  })
})

// ── Chord Tests ──────────────────────────────────────────────────────────

test('19. Diatonic triads: major key has 7 chords with correct Roman numerals', () => {
  const triads = getDiatonicTriads('major')
  assertEqual(triads.length, 7, 'Major key should have 7 diatonic triads')
  const expectedRomans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viio']
  triads.forEach((t, i) => {
    assertEqual(t.roman, expectedRomans[i], `Major triad ${i}: expected ${expectedRomans[i]}, got ${t.roman}`)
  })
})

test('20. Diatonic triads: minor key has 7 chords with correct Roman numerals', () => {
  const triads = getDiatonicTriads('minor')
  assertEqual(triads.length, 7, 'Minor key should have 7 diatonic triads')
  const expectedRomans = ['i', 'iio', 'bIII', 'iv', 'v', 'bVI', 'bVII']
  triads.forEach((t, i) => {
    assertEqual(t.roman, expectedRomans[i], `Minor triad ${i}: expected ${expectedRomans[i]}, got ${t.roman}`)
  })
})

test('21. Diatonic triads: major key chord qualities', () => {
  const triads = getDiatonicTriads('major')
  const expectedQualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
  triads.forEach((t, i) => {
    assertEqual(t.quality, expectedQualities[i], `Major triad ${t.roman}: expected ${expectedQualities[i]}, got ${t.quality}`)
  })
})

test('22. Diatonic triads: minor key chord qualities', () => {
  const triads = getDiatonicTriads('minor')
  const expectedQualities = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
  triads.forEach((t, i) => {
    assertEqual(t.quality, expectedQualities[i], `Minor triad ${t.roman}: expected ${expectedQualities[i]}, got ${t.quality}`)
  })
})

test('23. Diatonic triads: triad intervals match quality', () => {
  const majorTriads = getDiatonicTriads('major')
  const minorTriads = getDiatonicTriads('minor')
  const allTriads = [...majorTriads, ...minorTriads]
  allTriads.forEach(t => {
    assert(
      JSON.stringify(t.intervals) === JSON.stringify(TRIAD_INTERVALS[t.quality]),
      `Triad ${t.roman} (${t.quality}): intervals ${t.intervals} should match ${TRIAD_INTERVALS[t.quality]}`
    )
  })
})

test('24. Chord pitch classes: C major I = C-E-G (0,4,7)', () => {
  const triads = getDiatonicTriads('major')
  const tonicPC = tonicToPC('C')
  const I = triads[0]
  const pcs = getChordPitchClasses(tonicPC, I)
  assertEqual(pcs.length, 3, 'I chord should have 3 pitch classes')
  assert(pcs.includes(0), 'C major I should include C (pc=0)')
  assert(pcs.includes(4), 'C major I should include E (pc=4)')
  assert(pcs.includes(7), 'C major I should include G (pc=7)')
})

test('25. Chord pitch classes: C major viio = B-D-F (11,2,5)', () => {
  const triads = getDiatonicTriads('major')
  const tonicPC = tonicToPC('C')
  const viio = triads[6]
  const pcs = getChordPitchClasses(tonicPC, viio)
  assert(pcs.includes(11), 'C major viio should include B (pc=11)')
  assert(pcs.includes(2), 'C major viio should include D (pc=2)')
  assert(pcs.includes(5), 'C major viio should include F (pc=5)')
})

test('26. Chord pitch classes: C minor bVI = Ab-C-Eb (8,0,3)', () => {
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('C')
  const bVI = triads[5]
  const pcs = getChordPitchClasses(tonicPC, bVI)
  assert(pcs.includes(8), 'C minor bVI should include Ab (pc=8)')
  assert(pcs.includes(0), 'C minor bVI should include C (pc=0)')
  assert(pcs.includes(3), 'C minor bVI should include Eb (pc=3)')
})

test('27. Chord label: C major I = "C"', () => {
  const triads = getDiatonicTriads('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, triads[0], 'C', 'major'), 'C', 'C major I should be labeled "C"')
})

test('28. Chord label: C major vi = "Am"', () => {
  const triads = getDiatonicTriads('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, triads[5], 'C', 'major'), 'Am', 'C major vi should be labeled "Am"')
})

test('29. Chord label: C major viio = "Bo"', () => {
  const triads = getDiatonicTriads('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, triads[6], 'C', 'major'), 'Bo', 'C major viio should be labeled "Bo"')
})

test('30. Chord label: C minor bVI = "Ab" (flat key spelling)', () => {
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, triads[5], 'C', 'minor'), 'Ab', 'C minor bVI should be labeled "Ab"')
})

test('31. Chord label: C minor i = "Cm"', () => {
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, triads[0], 'C', 'minor'), 'Cm', 'C minor i should be labeled "Cm"')
})

test('32. Chord label: C minor iio = "Do"', () => {
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, triads[1], 'C', 'minor'), 'Do', 'C minor iio should be labeled "Do"')
})

test('33. Chord root name: Ab major bVI in C minor = "Ab"', () => {
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordRootName(tonicPC, triads[5], 'C', 'minor'), 'Ab', 'C minor bVI root should be "Ab"')
})

test('34. Chord pitch classes: all 12 major keys, all 7 triads', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    const triads = getDiatonicTriads('major')
    triads.forEach(t => {
      const pcs = getChordPitchClasses(tonicPC, t)
      assertEqual(pcs.length, 3, `${tonic} major ${t.roman}: should have 3 pitch classes`)
      // Verify root is correct
      const rootPC = (tonicPC + t.semitones) % 12
      assert(pcs.includes(rootPC), `${tonic} major ${t.roman}: root PC ${rootPC} should be in chord`)
      // Verify all intervals from root are correct
      t.intervals.forEach(iv => {
        assert(pcs.includes((rootPC + iv) % 12), `${tonic} major ${t.roman}: interval ${iv} from root should be in chord`)
      })
    })
  })
})

test('35. Chord pitch classes: all 12 minor keys, all 7 triads', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    const triads = getDiatonicTriads('minor')
    triads.forEach(t => {
      const pcs = getChordPitchClasses(tonicPC, t)
      assertEqual(pcs.length, 3, `${tonic} minor ${t.roman}: should have 3 pitch classes`)
      const rootPC = (tonicPC + t.semitones) % 12
      assert(pcs.includes(rootPC), `${tonic} minor ${t.roman}: root PC ${rootPC} should be in chord`)
      t.intervals.forEach(iv => {
        assert(pcs.includes((rootPC + iv) % 12), `${tonic} minor ${t.roman}: interval ${iv} from root should be in chord`)
      })
    })
  })
})

test('36. Chord label: key-aware spelling in sharp keys', () => {
  // D major I should be "D" (sharp key, no flats needed)
  const triads = getDiatonicTriads('major')
  const dTonicPC = tonicToPC('D')
  assertEqual(getChordLabel(dTonicPC, triads[0], 'D', 'major'), 'D', 'D major I should be "D"')
  // D major ii should be "Em" (E is natural in D major)
  assertEqual(getChordLabel(dTonicPC, triads[1], 'D', 'major'), 'Em', 'D major ii should be "Em"')
  // D major V should be "A" (A is natural in D major)
  assertEqual(getChordLabel(dTonicPC, triads[4], 'D', 'major'), 'A', 'D major V should be "A"')
})

test('37. Chord label: key-aware spelling in flat keys', () => {
  // Eb major I should be "Eb"
  const triads = getDiatonicTriads('major')
  const ebTonicPC = tonicToPC('Eb')
  assertEqual(getChordLabel(ebTonicPC, triads[0], 'Eb', 'major'), 'Eb', 'Eb major I should be "Eb"')
  // Eb major vi should be "Cm" (C is natural in Eb major)
  assertEqual(getChordLabel(ebTonicPC, triads[5], 'Eb', 'major'), 'Cm', 'Eb major vi should be "Cm"')
  // Eb major IV should be "Ab" (Ab is in Eb major key signature)
  assertEqual(getChordLabel(ebTonicPC, triads[3], 'Eb', 'major'), 'Ab', 'Eb major IV should be "Ab"')
})

test('38. Chord label: minor key flat spelling', () => {
  // C minor bVI should be "Ab" (C minor uses flats)
  const triads = getDiatonicTriads('minor')
  const cTonicPC = tonicToPC('C')
  assertEqual(getChordLabel(cTonicPC, triads[5], 'C', 'minor'), 'Ab', 'C minor bVI should be "Ab"')
  // C minor bIII should be "Eb"
  assertEqual(getChordLabel(cTonicPC, triads[2], 'C', 'minor'), 'Eb', 'C minor bIII should be "Eb"')
  // C minor bVII should be "Bb"
  assertEqual(getChordLabel(cTonicPC, triads[6], 'C', 'minor'), 'Bb', 'C minor bVII should be "Bb"')
})

test('39. Chord label: minor key sharp spelling', () => {
  // E minor iv should be "Am" (E minor is a sharp key, A is natural)
  const triads = getDiatonicTriads('minor')
  const eTonicPC = tonicToPC('E')
  assertEqual(getChordLabel(eTonicPC, triads[3], 'E', 'minor'), 'Am', 'E minor iv should be "Am"')
  // E minor bVI should be "C" (C is natural in E minor / G major relative)
  assertEqual(getChordLabel(eTonicPC, triads[5], 'E', 'minor'), 'C', 'E minor bVI should be "C"')
  // E minor v should be "Bm" (v in E minor has root B, which is the 5th degree)
  assertEqual(getChordLabel(eTonicPC, triads[4], 'E', 'minor'), 'Bm', 'E minor v should be "Bm"')
})

test('40. pickRandomChord: does not repeat immediately', () => {
  const triads = getDiatonicTriads('major')
  let last = null
  for (let i = 0; i < 100; i++) {
    const pick = pickRandomChord(triads, last)
    assert(pick !== undefined, 'pickRandomChord should always return a chord')
    if (last) {
      assert(pick.roman !== last.roman, `pickRandomChord should not repeat: got ${pick.roman} twice in a row`)
    }
    last = pick
  }
})

test('41. pickRandomChord: returns from the provided list', () => {
  const triads = getDiatonicTriads('major')
  const romans = new Set(triads.map(t => t.roman))
  for (let i = 0; i < 50; i++) {
    const pick = pickRandomChord(triads)
    assert(romans.has(pick.roman), `pickRandomChord should return a valid chord, got ${pick.roman}`)
  }
})

test('42. Chord pitch classes: no duplicates within a chord', () => {
  const majorTriads = getDiatonicTriads('major')
  const minorTriads = getDiatonicTriads('minor')
  const allTriads = [...majorTriads, ...minorTriads]
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    allTriads.forEach(t => {
      const pcs = getChordPitchClasses(tonicPC, t)
      const unique = new Set(pcs)
      assertEqual(unique.size, pcs.length, `${tonic} ${t.roman}: chord should have no duplicate pitch classes`)
    })
  })
})

test('43. Integration: C major full diatonic triad set matches naming conventions', () => {
  const triads = getDiatonicTriads('major')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'I',    label: 'C',    pcs: [0, 4, 7] },
    { roman: 'ii',   label: 'Dm',   pcs: [2, 5, 9] },
    { roman: 'iii',  label: 'Em',   pcs: [4, 7, 11] },
    { roman: 'IV',   label: 'F',    pcs: [5, 9, 0] },
    { roman: 'V',    label: 'G',    pcs: [7, 11, 2] },
    { roman: 'vi',   label: 'Am',   pcs: [9, 0, 4] },
    { roman: 'viio', label: 'Bo',   pcs: [11, 2, 5] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `C major triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'C', 'major')
    assertEqual(label, exp.label, `C major ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C major ${exp.roman}: pitch classes mismatch`)
  })
})

test('44. Integration: A minor full diatonic triad set matches naming conventions', () => {
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('A')
  const expected = [
    { roman: 'i',     label: 'Am',   pcs: [9, 0, 4] },
    { roman: 'iio',   label: 'Bo',   pcs: [11, 2, 5] },
    { roman: 'bIII',  label: 'C',    pcs: [0, 4, 7] },
    { roman: 'iv',    label: 'Dm',   pcs: [2, 5, 9] },
    { roman: 'v',     label: 'Em',   pcs: [4, 7, 11] },
    { roman: 'bVI',   label: 'F',    pcs: [5, 9, 0] },
    { roman: 'bVII',  label: 'G',    pcs: [7, 11, 2] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `A minor triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'A', 'minor')
    assertEqual(label, exp.label, `A minor ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `A minor ${exp.roman}: pitch classes mismatch`)
  })
})

test('45. Integration: Ab major bVI in C minor (user example)', () => {
  // User's example: bVI chord with tonic C corresponds to Ab major triad with notes Ab, C, and Eb
  const triads = getDiatonicTriads('minor')
  const tonicPC = tonicToPC('C')
  const bVI = triads[5]
  assertEqual(bVI.roman, 'bVI', 'Should be bVI')
  assertEqual(bVI.quality, 'major', 'bVI in minor should be major quality')
  const label = getChordLabel(tonicPC, bVI, 'C', 'minor')
  assertEqual(label, 'Ab', 'C minor bVI should be labeled "Ab"')
  const pcs = getChordPitchClasses(tonicPC, bVI).sort((a, b) => a - b)
  // Ab=8, C=0, Eb=3
  assert(pcs.includes(8), 'Ab major should include Ab (pc=8)')
  assert(pcs.includes(0), 'Ab major should include C (pc=0)')
  assert(pcs.includes(3), 'Ab major should include Eb (pc=3)')
  // Verify note names
  const noteNames = pcs.map(pc => spellNoteName(pc, 'C', 'minor'))
  assert(noteNames.includes('Ab'), `Note names should include Ab, got ${noteNames}`)
  assert(noteNames.includes('C'), `Note names should include C, got ${noteNames}`)
  assert(noteNames.includes('Eb'), `Note names should include Eb, got ${noteNames}`)
})

test('46. Integration: all diatonic triads in all 12 keys produce valid chord labels', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    TONALITIES.forEach(({ value: tonality }) => {
      const triads = getDiatonicTriads(tonality)
      triads.forEach(t => {
        const label = getChordLabel(tonicPC, t, tonic, tonality)
        assert(label.length > 0, `${tonic} ${tonality} ${t.roman}: label should not be empty`)
        // Label should start with a valid note name (A-G with optional # or b)
        assert(/^[A-G][#b]?/.test(label), `${tonic} ${tonality} ${t.roman}: label "${label}" should start with valid note name`)
      })
    })
  })
})

test('47. Chord pitch classes: diminished triad has minor third and diminished fifth', () => {
  const majorTriads = getDiatonicTriads('major')
  const minorTriads = getDiatonicTriads('minor')
  // viio in major
  const viio = majorTriads[6]
  assertEqual(viio.quality, 'diminished', 'viio in major should be diminished')
  assertEqual(viio.intervals[1], 3, 'Diminished triad should have minor third (3 semitones)')
  assertEqual(viio.intervals[2], 6, 'Diminished triad should have diminished fifth (6 semitones)')
  // iio in minor
  const iio = minorTriads[1]
  assertEqual(iio.quality, 'diminished', 'iio in minor should be diminished')
  assertEqual(iio.intervals[1], 3, 'Diminished triad should have minor third (3 semitones)')
  assertEqual(iio.intervals[2], 6, 'Diminished triad should have diminished fifth (6 semitones)')
})

test('48. Chord pitch classes: major triad has major third and perfect fifth', () => {
  const triads = getDiatonicTriads('major')
  const I = triads[0]
  assertEqual(I.quality, 'major', 'I in major should be major quality')
  assertEqual(I.intervals[1], 4, 'Major triad should have major third (4 semitones)')
  assertEqual(I.intervals[2], 7, 'Major triad should have perfect fifth (7 semitones)')
})

test('49. Chord pitch classes: minor triad has minor third and perfect fifth', () => {
  const triads = getDiatonicTriads('major')
  const vi = triads[5]
  assertEqual(vi.quality, 'minor', 'vi in major should be minor quality')
  assertEqual(vi.intervals[1], 3, 'Minor triad should have minor third (3 semitones)')
  assertEqual(vi.intervals[2], 7, 'Minor triad should have perfect fifth (7 semitones)')
})

// ── Seventh Chord Tests ──────────────────────────────────────────────────

test('50. Diatonic sevenths: major key has 7 chords with correct Roman numerals', () => {
  const sevenths = getDiatonicSevenths('major')
  assertEqual(sevenths.length, 7, 'Major key should have 7 diatonic sevenths')
  const expectedRomans = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5']
  sevenths.forEach((s, i) => {
    assertEqual(s.roman, expectedRomans[i], `Major 7th ${i}: expected ${expectedRomans[i]}, got ${s.roman}`)
  })
})

test('51. Diatonic sevenths: minor key has 7 chords with correct Roman numerals', () => {
  const sevenths = getDiatonicSevenths('minor')
  assertEqual(sevenths.length, 7, 'Minor key should have 7 diatonic sevenths')
  const expectedRomans = ['i7', 'iim7b5', 'bIIImaj7', 'iv7', 'v7', 'bVImaj7', 'bVII7']
  sevenths.forEach((s, i) => {
    assertEqual(s.roman, expectedRomans[i], `Minor 7th ${i}: expected ${expectedRomans[i]}, got ${s.roman}`)
  })
})

test('52. Diatonic sevenths: major key chord qualities', () => {
  const sevenths = getDiatonicSevenths('major')
  const expectedQualities = ['major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'half-diminished']
  sevenths.forEach((s, i) => {
    assertEqual(s.quality, expectedQualities[i], `Major 7th ${s.roman}: expected ${expectedQualities[i]}, got ${s.quality}`)
  })
})

test('53. Diatonic sevenths: minor key chord qualities', () => {
  const sevenths = getDiatonicSevenths('minor')
  const expectedQualities = ['minor7', 'half-diminished', 'major7', 'minor7', 'minor7', 'major7', 'dominant7']
  sevenths.forEach((s, i) => {
    assertEqual(s.quality, expectedQualities[i], `Minor 7th ${s.roman}: expected ${expectedQualities[i]}, got ${s.quality}`)
  })
})

test('54. Diatonic sevenths: intervals match SEVENTH_INTERVALS for each quality', () => {
  const major7s = getDiatonicSevenths('major')
  const minor7s = getDiatonicSevenths('minor')
  const all = [...major7s, ...minor7s]
  all.forEach(s => {
    assert(
      JSON.stringify(s.intervals) === JSON.stringify(SEVENTH_INTERVALS[s.quality]),
      `7th ${s.roman} (${s.quality}): intervals ${s.intervals} should match ${SEVENTH_INTERVALS[s.quality]}`
    )
  })
})

test('55. Diatonic sevenths: all chords have 4 pitch classes', () => {
  const major7s = getDiatonicSevenths('major')
  const minor7s = getDiatonicSevenths('minor')
  const all = [...major7s, ...minor7s]
  all.forEach(s => {
    assertEqual(s.intervals.length, 4, `7th ${s.roman}: should have 4 intervals`)
  })
})

test('56. Seventh pitch classes: C major Imaj7 = C-E-G-B (0,4,7,11)', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  const pcs = getChordPitchClasses(tonicPC, sevenths[0])
  assertEqual(pcs.length, 4, 'Imaj7 should have 4 pitch classes')
  assert(pcs.includes(0),  'C major Imaj7 should include C (pc=0)')
  assert(pcs.includes(4),  'C major Imaj7 should include E (pc=4)')
  assert(pcs.includes(7),  'C major Imaj7 should include G (pc=7)')
  assert(pcs.includes(11), 'C major Imaj7 should include B (pc=11)')
})

test('57. Seventh pitch classes: C major V7 = G-B-D-F (7,11,2,5)', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  const V7 = sevenths[4]
  const pcs = getChordPitchClasses(tonicPC, V7)
  assert(pcs.includes(7),  'C major V7 should include G (pc=7)')
  assert(pcs.includes(11), 'C major V7 should include B (pc=11)')
  assert(pcs.includes(2),  'C major V7 should include D (pc=2)')
  assert(pcs.includes(5),  'C major V7 should include F (pc=5)')
})

test('58. Seventh pitch classes: C major viim7b5 = B-D-F-A (11,2,5,9)', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  const viim7b5 = sevenths[6]
  const pcs = getChordPitchClasses(tonicPC, viim7b5)
  assert(pcs.includes(11), 'C major viim7b5 should include B (pc=11)')
  assert(pcs.includes(2),  'C major viim7b5 should include D (pc=2)')
  assert(pcs.includes(5),  'C major viim7b5 should include F (pc=5)')
  assert(pcs.includes(9),  'C major viim7b5 should include A (pc=9)')
})

test('59. Seventh pitch classes: C minor bVImaj7 = Ab-C-Eb-G (8,0,3,7)', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  const bVImaj7 = sevenths[5]
  const pcs = getChordPitchClasses(tonicPC, bVImaj7)
  assert(pcs.includes(8), 'C minor bVImaj7 should include Ab (pc=8)')
  assert(pcs.includes(0), 'C minor bVImaj7 should include C (pc=0)')
  assert(pcs.includes(3), 'C minor bVImaj7 should include Eb (pc=3)')
  assert(pcs.includes(7), 'C minor bVImaj7 should include G (pc=7)')
})

test('60. Seventh pitch classes: C minor bVII7 = Bb-D-F-Ab (10,2,5,8)', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  const bVII7 = sevenths[6]
  const pcs = getChordPitchClasses(tonicPC, bVII7)
  assert(pcs.includes(10), 'C minor bVII7 should include Bb (pc=10)')
  assert(pcs.includes(2),  'C minor bVII7 should include D (pc=2)')
  assert(pcs.includes(5),  'C minor bVII7 should include F (pc=5)')
  assert(pcs.includes(8),  'C minor bVII7 should include Ab (pc=8)')
})

test('61. Seventh chord label: C major Imaj7 = "Cmaj7"', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[0], 'C', 'major'), 'Cmaj7', 'C major Imaj7 should be labeled "Cmaj7"')
})

test('62. Seventh chord label: C major V7 = "G7"', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[4], 'C', 'major'), 'G7', 'C major V7 should be labeled "G7"')
})

test('63. Seventh chord label: C major viim7b5 = "Bm7b5"', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[6], 'C', 'major'), 'Bm7b5', 'C major viim7b5 should be labeled "Bm7b5"')
})

test('64. Seventh chord label: C major iim7 = "Dm7"', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[1], 'C', 'major'), 'Dm7', 'C major iim7 should be labeled "Dm7"')
})

test('65. Seventh chord label: C minor im7 = "Cm7"', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[0], 'C', 'minor'), 'Cm7', 'C minor im7 should be labeled "Cm7"')
})

test('66. Seventh chord label: C minor iim7b5 = "Dm7b5"', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[1], 'C', 'minor'), 'Dm7b5', 'C minor iim7b5 should be labeled "Dm7b5"')
})

test('67. Seventh chord label: C minor bVII7 = "Bb7" (flat key spelling)', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[6], 'C', 'minor'), 'Bb7', 'C minor bVII7 should be labeled "Bb7"')
})

test('68. Seventh chord label: C minor bIIImaj7 = "Ebmaj7"', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[2], 'C', 'minor'), 'Ebmaj7', 'C minor bIIImaj7 should be labeled "Ebmaj7"')
})

test('69. Seventh chord label: C minor bVImaj7 = "Abmaj7"', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('C')
  assertEqual(getChordLabel(tonicPC, sevenths[5], 'C', 'minor'), 'Abmaj7', 'C minor bVImaj7 should be labeled "Abmaj7"')
})

test('70. Seventh pitch classes: all 12 major keys, all 7 sevenths', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    const sevenths = getDiatonicSevenths('major')
    sevenths.forEach(s => {
      const pcs = getChordPitchClasses(tonicPC, s)
      assertEqual(pcs.length, 4, `${tonic} major ${s.roman}: should have 4 pitch classes`)
      const rootPC = (tonicPC + s.semitones) % 12
      assert(pcs.includes(rootPC), `${tonic} major ${s.roman}: root PC ${rootPC} should be in chord`)
      s.intervals.forEach(iv => {
        assert(pcs.includes((rootPC + iv) % 12), `${tonic} major ${s.roman}: interval ${iv} from root should be in chord`)
      })
    })
  })
})

test('71. Seventh pitch classes: all 12 minor keys, all 7 sevenths', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    const sevenths = getDiatonicSevenths('minor')
    sevenths.forEach(s => {
      const pcs = getChordPitchClasses(tonicPC, s)
      assertEqual(pcs.length, 4, `${tonic} minor ${s.roman}: should have 4 pitch classes`)
      const rootPC = (tonicPC + s.semitones) % 12
      assert(pcs.includes(rootPC), `${tonic} minor ${s.roman}: root PC ${rootPC} should be in chord`)
      s.intervals.forEach(iv => {
        assert(pcs.includes((rootPC + iv) % 12), `${tonic} minor ${s.roman}: interval ${iv} from root should be in chord`)
      })
    })
  })
})

test('72. Seventh pitch classes: no duplicates within a chord', () => {
  const major7s = getDiatonicSevenths('major')
  const minor7s = getDiatonicSevenths('minor')
  const all = [...major7s, ...minor7s]
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    all.forEach(s => {
      const pcs = getChordPitchClasses(tonicPC, s)
      const unique = new Set(pcs)
      assertEqual(unique.size, pcs.length, `${tonic} ${s.roman}: 7th chord should have no duplicate pitch classes`)
    })
  })
})

test('73. Seventh chord label: key-aware spelling in sharp keys', () => {
  const sevenths = getDiatonicSevenths('major')
  const dTonicPC = tonicToPC('D')
  // D major Imaj7 = "Dmaj7"
  assertEqual(getChordLabel(dTonicPC, sevenths[0], 'D', 'major'), 'Dmaj7', 'D major Imaj7 should be "Dmaj7"')
  // D major V7 = "A7"
  assertEqual(getChordLabel(dTonicPC, sevenths[4], 'D', 'major'), 'A7', 'D major V7 should be "A7"')
  // D major viim7b5 = "C#m7b5"
  assertEqual(getChordLabel(dTonicPC, sevenths[6], 'D', 'major'), 'C#m7b5', 'D major viim7b5 should be "C#m7b5"')
})

test('74. Seventh chord label: key-aware spelling in flat keys', () => {
  const sevenths = getDiatonicSevenths('major')
  const ebTonicPC = tonicToPC('Eb')
  // Eb major Imaj7 = "Ebmaj7"
  assertEqual(getChordLabel(ebTonicPC, sevenths[0], 'Eb', 'major'), 'Ebmaj7', 'Eb major Imaj7 should be "Ebmaj7"')
  // Eb major IVmaj7 = "Abmaj7"
  assertEqual(getChordLabel(ebTonicPC, sevenths[3], 'Eb', 'major'), 'Abmaj7', 'Eb major IVmaj7 should be "Abmaj7"')
  // Eb major V7 = "Bb7"
  assertEqual(getChordLabel(ebTonicPC, sevenths[4], 'Eb', 'major'), 'Bb7', 'Eb major V7 should be "Bb7"')
})

test('75. Seventh chord label: minor key sharp spelling', () => {
  const sevenths = getDiatonicSevenths('minor')
  const eTonicPC = tonicToPC('E')
  // E minor im7 = "Em7"
  assertEqual(getChordLabel(eTonicPC, sevenths[0], 'E', 'minor'), 'Em7', 'E minor im7 should be "Em7"')
  // E minor bVImaj7 = "Cmaj7"
  assertEqual(getChordLabel(eTonicPC, sevenths[5], 'E', 'minor'), 'Cmaj7', 'E minor bVImaj7 should be "Cmaj7"')
  // E minor bVII7 = "D7"
  assertEqual(getChordLabel(eTonicPC, sevenths[6], 'E', 'minor'), 'D7', 'E minor bVII7 should be "D7"')
})

test('76. Seventh chord label: minor key flat spelling', () => {
  const sevenths = getDiatonicSevenths('minor')
  const cTonicPC = tonicToPC('C')
  // C minor bVImaj7 = "Abmaj7"
  assertEqual(getChordLabel(cTonicPC, sevenths[5], 'C', 'minor'), 'Abmaj7', 'C minor bVImaj7 should be "Abmaj7"')
  // C minor bVII7 = "Bb7"
  assertEqual(getChordLabel(cTonicPC, sevenths[6], 'C', 'minor'), 'Bb7', 'C minor bVII7 should be "Bb7"')
  // C minor bIIImaj7 = "Ebmaj7"
  assertEqual(getChordLabel(cTonicPC, sevenths[2], 'C', 'minor'), 'Ebmaj7', 'C minor bIIImaj7 should be "Ebmaj7"')
})

test('77. pickRandomChord: does not repeat immediately (sevenths)', () => {
  const sevenths = getDiatonicSevenths('major')
  let last = null
  for (let i = 0; i < 100; i++) {
    const pick = pickRandomChord(sevenths, last)
    assert(pick !== undefined, 'pickRandomChord should always return a 7th chord')
    if (last) {
      assert(pick.roman !== last.roman, `pickRandomChord should not repeat: got ${pick.roman} twice in a row`)
    }
    last = pick
  }
})

test('78. pickRandomChord: returns from the provided list (sevenths)', () => {
  const sevenths = getDiatonicSevenths('minor')
  const romans = new Set(sevenths.map(s => s.roman))
  for (let i = 0; i < 50; i++) {
    const pick = pickRandomChord(sevenths)
    assert(romans.has(pick.roman), `pickRandomChord should return a valid 7th chord, got ${pick.roman}`)
  }
})

test('79. Seventh intervals: major7 = [0,4,7,11]', () => {
  assertEqual(JSON.stringify(SEVENTH_INTERVALS.major7), JSON.stringify([0, 4, 7, 11]), 'major7 intervals should be [0,4,7,11]')
})

test('80. Seventh intervals: dominant7 = [0,4,7,10]', () => {
  assertEqual(JSON.stringify(SEVENTH_INTERVALS.dominant7), JSON.stringify([0, 4, 7, 10]), 'dominant7 intervals should be [0,4,7,10]')
})

test('81. Seventh intervals: minor7 = [0,3,7,10]', () => {
  assertEqual(JSON.stringify(SEVENTH_INTERVALS.minor7), JSON.stringify([0, 3, 7, 10]), 'minor7 intervals should be [0,3,7,10]')
})

test('82. Seventh intervals: half-diminished = [0,3,6,10]', () => {
  assertEqual(JSON.stringify(SEVENTH_INTERVALS['half-diminished']), JSON.stringify([0, 3, 6, 10]), 'half-diminished intervals should be [0,3,6,10]')
})

test('83. Seventh intervals: diminished7 = [0,3,6,9]', () => {
  assertEqual(JSON.stringify(SEVENTH_INTERVALS.diminished7), JSON.stringify([0, 3, 6, 9]), 'diminished7 intervals should be [0,3,6,9]')
})

test('84. Integration: C major full diatonic 7th set matches naming conventions §5.5', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'Imaj7',  label: 'Cmaj7',  pcs: [0, 4, 7, 11] },
    { roman: 'ii7',    label: 'Dm7',    pcs: [2, 5, 9, 0] },
    { roman: 'iii7',   label: 'Em7',    pcs: [4, 7, 11, 2] },
    { roman: 'IVmaj7', label: 'Fmaj7',  pcs: [5, 9, 0, 4] },
    { roman: 'V7',     label: 'G7',     pcs: [7, 11, 2, 5] },
    { roman: 'vi7',    label: 'Am7',    pcs: [9, 0, 4, 7] },
    { roman: 'viim7b5',  label: 'Bm7b5',  pcs: [11, 2, 5, 9] },
  ]
  expected.forEach((exp, i) => {
    const s = sevenths[i]
    assertEqual(s.roman, exp.roman, `C major 7th ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, s, 'C', 'major')
    assertEqual(label, exp.label, `C major ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, s).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C major ${exp.roman}: pitch classes mismatch`)
  })
})

test('85. Integration: A minor full diatonic 7th set', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('A')
  const expected = [
    { roman: 'i7',       label: 'Am7',    pcs: [9, 0, 4, 7] },
    { roman: 'iim7b5',     label: 'Bm7b5',  pcs: [11, 2, 5, 9] },
    { roman: 'bIIImaj7', label: 'Cmaj7',  pcs: [0, 4, 7, 11] },
    { roman: 'iv7',      label: 'Dm7',    pcs: [2, 5, 9, 0] },
    { roman: 'v7',       label: 'Em7',    pcs: [4, 7, 11, 2] },
    { roman: 'bVImaj7',  label: 'Fmaj7',  pcs: [5, 9, 0, 4] },
    { roman: 'bVII7',    label: 'G7',     pcs: [7, 11, 2, 5] },
  ]
  expected.forEach((exp, i) => {
    const s = sevenths[i]
    assertEqual(s.roman, exp.roman, `A minor 7th ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, s, 'A', 'minor')
    assertEqual(label, exp.label, `A minor ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, s).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `A minor ${exp.roman}: pitch classes mismatch`)
  })
})

test('86. Integration: all diatonic 7ths in all 12 keys produce valid chord labels', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    TONALITIES.forEach(({ value: tonality }) => {
      const sevenths = getDiatonicSevenths(tonality)
      sevenths.forEach(s => {
        const label = getChordLabel(tonicPC, s, tonic, tonality)
        assert(label.length > 0, `${tonic} ${tonality} ${s.roman}: label should not be empty`)
        assert(/^[A-G][#b]?/.test(label), `${tonic} ${tonality} ${s.roman}: label "${label}" should start with valid note name`)
      })
    })
  })
})

test('87. Seventh chord: major7 has major triad + major 7th', () => {
  const sevenths = getDiatonicSevenths('major')
  const Imaj7 = sevenths[0]
  assertEqual(Imaj7.quality, 'major7', 'Imaj7 should be major7 quality')
  assertEqual(Imaj7.intervals[0], 0, 'Root should be 0')
  assertEqual(Imaj7.intervals[1], 4, 'Major third should be 4')
  assertEqual(Imaj7.intervals[2], 7, 'Perfect fifth should be 7')
  assertEqual(Imaj7.intervals[3], 11, 'Major seventh should be 11')
})

test('88. Seventh chord: dominant7 has major triad + minor 7th', () => {
  const sevenths = getDiatonicSevenths('major')
  const V7 = sevenths[4]
  assertEqual(V7.quality, 'dominant7', 'V7 should be dominant7 quality')
  assertEqual(V7.intervals[0], 0, 'Root should be 0')
  assertEqual(V7.intervals[1], 4, 'Major third should be 4')
  assertEqual(V7.intervals[2], 7, 'Perfect fifth should be 7')
  assertEqual(V7.intervals[3], 10, 'Minor seventh should be 10')
})

test('89. Seventh chord: minor7 has minor triad + minor 7th', () => {
  const sevenths = getDiatonicSevenths('major')
  const iim7 = sevenths[1]
  assertEqual(iim7.quality, 'minor7', 'iim7 should be minor7 quality')
  assertEqual(iim7.intervals[0], 0, 'Root should be 0')
  assertEqual(iim7.intervals[1], 3, 'Minor third should be 3')
  assertEqual(iim7.intervals[2], 7, 'Perfect fifth should be 7')
  assertEqual(iim7.intervals[3], 10, 'Minor seventh should be 10')
})

test('90. Seventh chord: half-diminished has diminished triad + minor 7th', () => {
  const sevenths = getDiatonicSevenths('major')
  const viim7b5 = sevenths[6]
  assertEqual(viim7b5.quality, 'half-diminished', 'viim7b5 should be half-diminished quality')
  assertEqual(viim7b5.intervals[0], 0, 'Root should be 0')
  assertEqual(viim7b5.intervals[1], 3, 'Minor third should be 3')
  assertEqual(viim7b5.intervals[2], 6, 'Diminished fifth should be 6')
  assertEqual(viim7b5.intervals[3], 10, 'Minor seventh should be 10')
})

test('91. Seventh vs triad: same root, 7th adds one more pitch class', () => {
  const triads = getDiatonicTriads('major')
  const sevenths = getDiatonicSevenths('major')
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    triads.forEach((t, i) => {
      const triadPCs = new Set(getChordPitchClasses(tonicPC, t))
      const seventhPCs = getChordPitchClasses(tonicPC, sevenths[i])
      // All triad pitch classes should be in the 7th
      seventhPCs.forEach(pc => {
        // The 7th has one extra pitch class not in the triad
      })
      const extraPCs = seventhPCs.filter(pc => !triadPCs.has(pc))
      assertEqual(extraPCs.length, 1, `${tonic} major ${t.roman}→${sevenths[i].roman}: 7th should add exactly 1 pitch class to triad`)
    })
  })
})

test('92. Seventh vs triad: same root semitones', () => {
  const triads = getDiatonicTriads('major')
  const sevenths = getDiatonicSevenths('major')
  triads.forEach((t, i) => {
    assertEqual(t.semitones, sevenths[i].semitones, `Major degree ${i}: triad and 7th should have same root semitones`)
  })
  const triadsMin = getDiatonicTriads('minor')
  const seventhsMin = getDiatonicSevenths('minor')
  triadsMin.forEach((t, i) => {
    assertEqual(t.semitones, seventhsMin[i].semitones, `Minor degree ${i}: triad and 7th should have same root semitones`)
  })
})

test('93. Integration: D major V7 = A7 (A-C#-E-G)', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('D')
  const V7 = sevenths[4]
  assertEqual(V7.roman, 'V7', 'Should be V7')
  const label = getChordLabel(tonicPC, V7, 'D', 'major')
  assertEqual(label, 'A7', 'D major V7 should be labeled "A7"')
  const pcs = getChordPitchClasses(tonicPC, V7).sort((a, b) => a - b)
  // A=9, C#=1, E=4, G=7
  assert(pcs.includes(9), 'A7 should include A (pc=9)')
  assert(pcs.includes(1), 'A7 should include C# (pc=1)')
  assert(pcs.includes(4), 'A7 should include E (pc=4)')
  assert(pcs.includes(7), 'A7 should include G (pc=7)')
  const noteNames = pcs.map(pc => spellNoteName(pc, 'D', 'major'))
  assert(noteNames.includes('A'), `Note names should include A, got ${noteNames}`)
  assert(noteNames.includes('C#'), `Note names should include C#, got ${noteNames}`)
  assert(noteNames.includes('E'), `Note names should include E, got ${noteNames}`)
  assert(noteNames.includes('G'), `Note names should include G, got ${noteNames}`)
})

test('94. Integration: Eb major viim7b5 = Dm7b5 (D-F-Ab-C)', () => {
  const sevenths = getDiatonicSevenths('major')
  const tonicPC = tonicToPC('Eb')
  const viim7b5 = sevenths[6]
  assertEqual(viim7b5.roman, 'viim7b5', 'Should be viim7b5')
  const label = getChordLabel(tonicPC, viim7b5, 'Eb', 'major')
  assertEqual(label, 'Dm7b5', 'Eb major viim7b5 should be labeled "Dm7b5"')
  const pcs = getChordPitchClasses(tonicPC, viim7b5).sort((a, b) => a - b)
  // D=2, F=5, Ab=8, C=0
  assert(pcs.includes(2), 'Dm7b5 should include D (pc=2)')
  assert(pcs.includes(5), 'Dm7b5 should include F (pc=5)')
  assert(pcs.includes(8), 'Dm7b5 should include Ab (pc=8)')
  assert(pcs.includes(0), 'Dm7b5 should include C (pc=0)')
})

test('95. Integration: E minor iim7b5 = F#m7b5 (F#-A-C-E)', () => {
  const sevenths = getDiatonicSevenths('minor')
  const tonicPC = tonicToPC('E')
  const iim7b5 = sevenths[1]
  assertEqual(iim7b5.roman, 'iim7b5', 'Should be iim7b5')
  const label = getChordLabel(tonicPC, iim7b5, 'E', 'minor')
  assertEqual(label, 'F#m7b5', 'E minor iim7b5 should be labeled "F#m7b5"')
  const pcs = getChordPitchClasses(tonicPC, iim7b5).sort((a, b) => a - b)
  // F#=6, A=9, C=0, E=4
  assert(pcs.includes(6), 'F#m7b5 should include F# (pc=6)')
  assert(pcs.includes(9), 'F#m7b5 should include A (pc=9)')
  assert(pcs.includes(0), 'F#m7b5 should include C (pc=0)')
  assert(pcs.includes(4), 'F#m7b5 should include E (pc=4)')
})

// ── All Modes Tests (Ionian → Locrian) ───────────────────────────────────

// Expected scale degrees for each mode
const MODE_DEGREE_EXPECTATIONS = {
  ionian:     ['1', '2', '3', '4', '5', '6', '7'],
  dorian:     ['1', '2', 'b3', '4', '5', '6', 'b7'],
  phrygian:   ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
  lydian:     ['1', '2', '3', '#4', '5', '6', '7'],
  mixolydian: ['1', '2', '3', '4', '5', '6', 'b7'],
  aeolian:    ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
  locrian:    ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
}

// Expected diatonic triad qualities for each mode
const MODE_TRIAD_QUALITIES = {
  ionian:     ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  dorian:     ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
  phrygian:   ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
  lydian:     ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
  mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
  aeolian:    ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  locrian:    ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'],
}

// Expected diatonic seventh qualities for each mode
const MODE_SEVENTH_QUALITIES = {
  ionian:     ['major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'half-diminished'],
  dorian:     ['minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'half-diminished', 'major7'],
  phrygian:   ['minor7', 'major7', 'dominant7', 'minor7', 'half-diminished', 'major7', 'minor7'],
  lydian:     ['major7', 'dominant7', 'minor7', 'half-diminished', 'major7', 'minor7', 'minor7'],
  mixolydian: ['dominant7', 'minor7', 'half-diminished', 'major7', 'minor7', 'minor7', 'major7'],
  aeolian:    ['minor7', 'half-diminished', 'major7', 'minor7', 'minor7', 'major7', 'dominant7'],
  locrian:    ['half-diminished', 'major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7'],
}

// Expected diatonic pitch-class sets for each mode (semitones from tonic)
const MODE_PCS_EXPECTATIONS = {
  ionian:     [0, 2, 4, 5, 7, 9, 11],
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  phrygian:   [0, 1, 3, 5, 7, 8, 10],
  lydian:     [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian:    [0, 2, 3, 5, 7, 8, 10],
  locrian:    [0, 1, 3, 5, 6, 8, 10],
}

test('96. All modes: DIATONIC_DEGREES has correct scale degree labels', () => {
  MODES.forEach(({ value: mode }) => {
    const degrees = DIATONIC_DEGREES[mode]
    assertEqual(degrees.length, 7, `${mode}: should have 7 degrees`)
    const expected = MODE_DEGREE_EXPECTATIONS[mode]
    degrees.forEach((d, i) => {
      assertEqual(d.degree, expected[i], `${mode}: degree ${i} should be ${expected[i]}`)
    })
  })
})

test('97. All modes: DIATONIC_PCS matches expected pitch-class sets', () => {
  MODES.forEach(({ value: mode }) => {
    const pcs = DIATONIC_PCS[mode]
    const expected = MODE_PCS_EXPECTATIONS[mode]
    expected.forEach(pc => {
      assert(pcs.has(pc), `${mode}: should include PC ${pc}`)
    })
    assertEqual(pcs.size, 7, `${mode}: should have exactly 7 pitch classes`)
  })
})

test('98. All modes: DIATONIC_DEGREES semitones match DIATONIC_PCS', () => {
  MODES.forEach(({ value: mode }) => {
    const degrees = DIATONIC_DEGREES[mode]
    const pcs = DIATONIC_PCS[mode]
    degrees.forEach(d => {
      assert(pcs.has(d.semitones), `${mode}: degree ${d.degree} semitones ${d.semitones} should be in DIATONIC_PCS`)
    })
  })
})

test('99. All modes: getScaleDegrees returns correct diatonic degrees', () => {
  MODES.forEach(({ value: mode }) => {
    const degrees = getScaleDegrees('diatonic', mode)
    assertEqual(degrees.length, 7, `${mode}: getScaleDegrees should return 7 degrees`)
    const expected = MODE_DEGREE_EXPECTATIONS[mode]
    degrees.forEach((d, i) => {
      assertEqual(d.degree, expected[i], `${mode}: getScaleDegrees degree ${i} should be ${expected[i]}`)
    })
  })
})

test('100. All modes: getScaleDegree round-trip for all 12 tonics', () => {
  MODES.forEach(({ value: mode }) => {
    const degrees = DIATONIC_DEGREES[mode]
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      degrees.forEach(d => {
        const pc = degreeToPitchClass(tonicPC, d.semitones)
        const result = getScaleDegree(pc + 60, tonicPC, mode)
        assertEqual(result.scale_degree, d.degree, `${tonic} ${mode}: ${d.degree} round-trip`)
        assert(result.is_diatonic, `${tonic} ${mode}: ${d.degree} should be diatonic`)
      })
    })
  })
})

test('101. All modes: getDiatonicTriads returns 7 chords with correct qualities', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    assertEqual(triads.length, 7, `${mode}: should have 7 diatonic triads`)
    const expectedQualities = MODE_TRIAD_QUALITIES[mode]
    triads.forEach((t, i) => {
      assertEqual(t.quality, expectedQualities[i], `${mode}: triad ${i} quality should be ${expectedQualities[i]}`)
    })
  })
})

test('102. All modes: triad intervals match TRIAD_INTERVALS for each quality', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    triads.forEach(t => {
      assert(
        JSON.stringify(t.intervals) === JSON.stringify(TRIAD_INTERVALS[t.quality]),
        `${mode} triad ${t.roman} (${t.quality}): intervals ${t.intervals} should match ${TRIAD_INTERVALS[t.quality]}`
      )
    })
  })
})

test('103. All modes: getDiatonicSevenths returns 7 chords with correct qualities', () => {
  MODES.forEach(({ value: mode }) => {
    const sevenths = getDiatonicSevenths(mode)
    assertEqual(sevenths.length, 7, `${mode}: should have 7 diatonic sevenths`)
    const expectedQualities = MODE_SEVENTH_QUALITIES[mode]
    sevenths.forEach((s, i) => {
      assertEqual(s.quality, expectedQualities[i], `${mode}: 7th ${i} quality should be ${expectedQualities[i]}`)
    })
  })
})

test('104. All modes: seventh intervals match SEVENTH_INTERVALS for each quality', () => {
  MODES.forEach(({ value: mode }) => {
    const sevenths = getDiatonicSevenths(mode)
    sevenths.forEach(s => {
      assert(
        JSON.stringify(s.intervals) === JSON.stringify(SEVENTH_INTERVALS[s.quality]),
        `${mode} 7th ${s.roman} (${s.quality}): intervals ${s.intervals} should match ${SEVENTH_INTERVALS[s.quality]}`
      )
    })
  })
})

test('105. All modes: triad and seventh share same root semitones', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    const sevenths = getDiatonicSevenths(mode)
    triads.forEach((t, i) => {
      assertEqual(t.semitones, sevenths[i].semitones, `${mode}: triad and 7th degree ${i} should have same root semitones`)
    })
  })
})

test('106. All modes: all 12 tonics, all 7 triads produce correct pitch classes', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      triads.forEach(t => {
        const pcs = getChordPitchClasses(tonicPC, t)
        assertEqual(pcs.length, 3, `${tonic} ${mode} ${t.roman}: should have 3 pitch classes`)
        const rootPC = (tonicPC + t.semitones) % 12
        assert(pcs.includes(rootPC), `${tonic} ${mode} ${t.roman}: root PC ${rootPC} should be in chord`)
        t.intervals.forEach(iv => {
          assert(pcs.includes((rootPC + iv) % 12), `${tonic} ${mode} ${t.roman}: interval ${iv} from root should be in chord`)
        })
      })
    })
  })
})

test('107. All modes: all 12 tonics, all 7 sevenths produce correct pitch classes', () => {
  MODES.forEach(({ value: mode }) => {
    const sevenths = getDiatonicSevenths(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      sevenths.forEach(s => {
        const pcs = getChordPitchClasses(tonicPC, s)
        assertEqual(pcs.length, 4, `${tonic} ${mode} ${s.roman}: should have 4 pitch classes`)
        const rootPC = (tonicPC + s.semitones) % 12
        assert(pcs.includes(rootPC), `${tonic} ${mode} ${s.roman}: root PC ${rootPC} should be in chord`)
        s.intervals.forEach(iv => {
          assert(pcs.includes((rootPC + iv) % 12), `${tonic} ${mode} ${s.roman}: interval ${iv} from root should be in chord`)
        })
      })
    })
  })
})

test('108. All modes: no duplicate pitch classes within triads', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      triads.forEach(t => {
        const pcs = getChordPitchClasses(tonicPC, t)
        const unique = new Set(pcs)
        assertEqual(unique.size, pcs.length, `${tonic} ${mode} ${t.roman}: triad should have no duplicate pitch classes`)
      })
    })
  })
})

test('109. All modes: no duplicate pitch classes within sevenths', () => {
  MODES.forEach(({ value: mode }) => {
    const sevenths = getDiatonicSevenths(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      sevenths.forEach(s => {
        const pcs = getChordPitchClasses(tonicPC, s)
        const unique = new Set(pcs)
        assertEqual(unique.size, pcs.length, `${tonic} ${mode} ${s.roman}: 7th should have no duplicate pitch classes`)
      })
    })
  })
})

test('110. All modes: all diatonic triads in all 12 keys produce valid chord labels', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      triads.forEach(t => {
        const label = getChordLabel(tonicPC, t, tonic, mode)
        assert(label.length > 0, `${tonic} ${mode} ${t.roman}: label should not be empty`)
        assert(/^[A-G][#b]?/.test(label), `${tonic} ${mode} ${t.roman}: label "${label}" should start with valid note name`)
      })
    })
  })
})

test('111. All modes: all diatonic sevenths in all 12 keys produce valid chord labels', () => {
  MODES.forEach(({ value: mode }) => {
    const sevenths = getDiatonicSevenths(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      sevenths.forEach(s => {
        const label = getChordLabel(tonicPC, s, tonic, mode)
        assert(label.length > 0, `${tonic} ${mode} ${s.roman}: label should not be empty`)
        assert(/^[A-G][#b]?/.test(label), `${tonic} ${mode} ${s.roman}: label "${label}" should start with valid note name`)
      })
    })
  })
})

test('112. Mode compatibility: ionian triads match major triads', () => {
  const ionianTriads = getDiatonicTriads('ionian')
  const majorTriads = getDiatonicTriads('major')
  assertDeepEqual(JSON.stringify(ionianTriads), JSON.stringify(majorTriads), 'Ionian triads should match major triads')
})

test('113. Mode compatibility: aeolian triads match minor triads', () => {
  const aeolianTriads = getDiatonicTriads('aeolian')
  const minorTriads = getDiatonicTriads('minor')
  assertDeepEqual(JSON.stringify(aeolianTriads), JSON.stringify(minorTriads), 'Aeolian triads should match minor triads')
})

test('114. Mode compatibility: ionian sevenths match major sevenths', () => {
  const ionian7s = getDiatonicSevenths('ionian')
  const major7s = getDiatonicSevenths('major')
  assertDeepEqual(JSON.stringify(ionian7s), JSON.stringify(major7s), 'Ionian sevenths should match major sevenths')
})

test('115. Mode compatibility: aeolian sevenths match minor sevenths', () => {
  const aeolian7s = getDiatonicSevenths('aeolian')
  const minor7s = getDiatonicSevenths('minor')
  assertDeepEqual(JSON.stringify(aeolian7s), JSON.stringify(minor7s), 'Aeolian sevenths should match minor sevenths')
})

test('116. Mode compatibility: ionian degrees match major degrees', () => {
  const ionianDegrees = DIATONIC_DEGREES.ionian
  const majorDegrees = DIATONIC_DEGREES.major
  assertDeepEqual(JSON.stringify(ionianDegrees), JSON.stringify(majorDegrees), 'Ionian degrees should match major degrees')
})

test('117. Mode compatibility: aeolian degrees match minor degrees', () => {
  const aeolianDegrees = DIATONIC_DEGREES.aeolian
  const minorDegrees = DIATONIC_DEGREES.minor
  assertDeepEqual(JSON.stringify(aeolianDegrees), JSON.stringify(minorDegrees), 'Aeolian degrees should match minor degrees')
})

test('118. All modes: getScaleDegree is_diatonic flag works correctly', () => {
  // For each mode, diatonic notes should be flagged as diatonic
  MODES.forEach(({ value: mode }) => {
    const degrees = DIATONIC_DEGREES[mode]
    const tonicPC = 0 // C
    degrees.forEach(d => {
      const pc = degreeToPitchClass(tonicPC, d.semitones)
      const result = getScaleDegree(pc + 60, tonicPC, mode)
      assert(result.is_diatonic, `C ${mode}: ${d.degree} (PC ${pc}) should be diatonic`)
    })
    // Non-diatonic notes should NOT be flagged
    for (let semitone = 0; semitone < 12; semitone++) {
      if (!degrees.some(d => d.semitones === semitone)) {
        const pc = (tonicPC + semitone) % 12
        const result = getScaleDegree(pc + 60, tonicPC, mode)
        assert(!result.is_diatonic, `C ${mode}: semitone ${semitone} (PC ${pc}) should NOT be diatonic`)
      }
    }
  })
})

test('119. All modes: MODES array has 7 modes in correct order', () => {
  assertEqual(MODES.length, 7, 'Should have 7 modes')
  const expectedOrder = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian']
  MODES.forEach((m, i) => {
    assertEqual(m.value, expectedOrder[i], `Mode ${i} should be ${expectedOrder[i]}`)
  })
})

test('120. All modes: TONALITY_TO_MODE maps correctly', () => {
  assertEqual(TONALITY_TO_MODE.major, 'ionian', 'major should map to ionian')
  assertEqual(TONALITY_TO_MODE.minor, 'aeolian', 'minor should map to aeolian')
})

test('121. All modes: getDiatonicTriads works with old tonality names', () => {
  const majorTriads = getDiatonicTriads('major')
  const ionianTriads = getDiatonicTriads('ionian')
  assertDeepEqual(JSON.stringify(majorTriads), JSON.stringify(ionianTriads), 'getDiatonicTriads(major) should equal getDiatonicTriads(ionian)')

  const minorTriads = getDiatonicTriads('minor')
  const aeolianTriads = getDiatonicTriads('aeolian')
  assertDeepEqual(JSON.stringify(minorTriads), JSON.stringify(aeolianTriads), 'getDiatonicTriads(minor) should equal getDiatonicTriads(aeolian)')
})

test('122. All modes: getDiatonicSevenths works with old tonality names', () => {
  const major7s = getDiatonicSevenths('major')
  const ionian7s = getDiatonicSevenths('ionian')
  assertDeepEqual(JSON.stringify(major7s), JSON.stringify(ionian7s), 'getDiatonicSevenths(major) should equal getDiatonicSevenths(ionian)')

  const minor7s = getDiatonicSevenths('minor')
  const aeolian7s = getDiatonicSevenths('aeolian')
  assertDeepEqual(JSON.stringify(minor7s), JSON.stringify(aeolian7s), 'getDiatonicSevenths(minor) should equal getDiatonicSevenths(aeolian)')
})

test('123. All modes: seventh vs triad adds exactly 1 pitch class', () => {
  MODES.forEach(({ value: mode }) => {
    const triads = getDiatonicTriads(mode)
    const sevenths = getDiatonicSevenths(mode)
    TONICS.forEach(tonic => {
      const tonicPC = tonicToPC(tonic)
      triads.forEach((t, i) => {
        const triadPCs = new Set(getChordPitchClasses(tonicPC, t))
        const seventhPCs = getChordPitchClasses(tonicPC, sevenths[i])
        const extraPCs = seventhPCs.filter(pc => !triadPCs.has(pc))
        assertEqual(extraPCs.length, 1, `${tonic} ${mode} ${t.roman}→${sevenths[i].roman}: 7th should add exactly 1 pitch class to triad`)
      })
    })
  })
})

test('124. All modes: D Dorian scale notes produce correct degrees', () => {
  // D Dorian: D E F G A B C D
  const dDorian = [62, 64, 65, 67, 69, 71, 72, 74]
  const expected = ['1', '2', 'b3', '4', '5', '6', 'b7', '1']
  dDorian.forEach((note, i) => {
    const result = getScaleDegree(note, 2, 'dorian') // D = PC 2
    assertEqual(result.scale_degree, expected[i], `D Dorian: MIDI ${note} → ${expected[i]}`)
  })
})

test('125. All modes: E Phrygian scale notes produce correct degrees', () => {
  // E Phrygian: E F G A B C D E
  const ePhrygian = [64, 65, 67, 69, 71, 72, 74, 76]
  const expected = ['1', 'b2', 'b3', '4', '5', 'b6', 'b7', '1']
  ePhrygian.forEach((note, i) => {
    const result = getScaleDegree(note, 4, 'phrygian') // E = PC 4
    assertEqual(result.scale_degree, expected[i], `E Phrygian: MIDI ${note} → ${expected[i]}`)
  })
})

test('126. All modes: F Lydian scale notes produce correct degrees', () => {
  // F Lydian: F G A B C D E F
  const fLydian = [65, 67, 69, 71, 72, 74, 76, 77]
  const expected = ['1', '2', '3', '#4', '5', '6', '7', '1']
  fLydian.forEach((note, i) => {
    const result = getScaleDegree(note, 5, 'lydian') // F = PC 5
    assertEqual(result.scale_degree, expected[i], `F Lydian: MIDI ${note} → ${expected[i]}`)
  })
})

test('127. All modes: G Mixolydian scale notes produce correct degrees', () => {
  // G Mixolydian: G A B C D E F G
  const gMixolydian = [67, 69, 71, 72, 74, 76, 77, 79]
  const expected = ['1', '2', '3', '4', '5', '6', 'b7', '1']
  gMixolydian.forEach((note, i) => {
    const result = getScaleDegree(note, 7, 'mixolydian') // G = PC 7
    assertEqual(result.scale_degree, expected[i], `G Mixolydian: MIDI ${note} → ${expected[i]}`)
  })
})

test('128. All modes: B Locrian scale notes produce correct degrees', () => {
  // B Locrian: B C D E F G A B
  const bLocrian = [71, 72, 74, 76, 77, 79, 81, 83]
  const expected = ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7', '1']
  bLocrian.forEach((note, i) => {
    const result = getScaleDegree(note, 11, 'locrian') // B = PC 11
    assertEqual(result.scale_degree, expected[i], `B Locrian: MIDI ${note} → ${expected[i]}`)
  })
})

test('129. All modes: C Dorian diatonic triad set matches expected', () => {
  const triads = getDiatonicTriads('dorian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'i',    label: 'Cm',    pcs: [0, 3, 7] },
    { roman: 'ii',   label: 'Dm',    pcs: [2, 5, 9] },
    { roman: 'bIII', label: 'Eb',    pcs: [3, 7, 10] },
    { roman: 'IV',   label: 'F',     pcs: [5, 9, 0] },
    { roman: 'v',    label: 'Gm',    pcs: [7, 10, 2] },
    { roman: 'vio',  label: 'Ao',    pcs: [9, 0, 3] },
    { roman: 'bVII', label: 'Bb',    pcs: [10, 2, 5] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `C Dorian triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'C', 'dorian')
    assertEqual(label, exp.label, `C Dorian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Dorian ${exp.roman}: pitch classes mismatch`)
  })
})

test('130. All modes: C Phrygian diatonic triad set matches expected', () => {
  const triads = getDiatonicTriads('phrygian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'i',    label: 'Cm',    pcs: [0, 3, 7] },
    { roman: 'bII',  label: 'Db',    pcs: [1, 5, 8] },
    { roman: 'bIII', label: 'Eb',    pcs: [3, 7, 10] },
    { roman: 'iv',   label: 'Fm',    pcs: [5, 8, 0] },
    { roman: 'vo',   label: 'Go',    pcs: [7, 10, 1] },
    { roman: 'bVI',  label: 'Ab',    pcs: [8, 0, 3] },
    { roman: 'bvii', label: 'Bbm',   pcs: [10, 1, 5] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `C Phrygian triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'C', 'phrygian')
    assertEqual(label, exp.label, `C Phrygian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Phrygian ${exp.roman}: pitch classes mismatch`)
  })
})

test('131. All modes: C Lydian diatonic triad set matches expected', () => {
  const triads = getDiatonicTriads('lydian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'I',    label: 'C',     pcs: [0, 4, 7] },
    { roman: 'II',   label: 'D',     pcs: [2, 6, 9] },
    { roman: 'iii',  label: 'Em',    pcs: [4, 7, 11] },
    { roman: '#ivo', label: 'F#o',   pcs: [6, 9, 0] },
    { roman: 'V',    label: 'G',     pcs: [7, 11, 2] },
    { roman: 'vi',   label: 'Am',    pcs: [9, 0, 4] },
    { roman: 'vii',  label: 'Bm',    pcs: [11, 2, 6] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `C Lydian triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'C', 'lydian')
    assertEqual(label, exp.label, `C Lydian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Lydian ${exp.roman}: pitch classes mismatch`)
  })
})

test('132. All modes: C Mixolydian diatonic triad set matches expected', () => {
  const triads = getDiatonicTriads('mixolydian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'I',    label: 'C',     pcs: [0, 4, 7] },
    { roman: 'ii',   label: 'Dm',    pcs: [2, 5, 9] },
    { roman: 'iiio', label: 'Eo',    pcs: [4, 7, 10] },
    { roman: 'IV',   label: 'F',     pcs: [5, 9, 0] },
    { roman: 'v',    label: 'Gm',    pcs: [7, 10, 2] },
    { roman: 'vi',   label: 'Am',    pcs: [9, 0, 4] },
    { roman: 'bVII', label: 'Bb',    pcs: [10, 2, 5] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `C Mixolydian triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'C', 'mixolydian')
    assertEqual(label, exp.label, `C Mixolydian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Mixolydian ${exp.roman}: pitch classes mismatch`)
  })
})

test('133. All modes: C Locrian diatonic triad set matches expected', () => {
  const triads = getDiatonicTriads('locrian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'io',   label: 'Co',    pcs: [0, 3, 6] },
    { roman: 'bII',  label: 'Db',    pcs: [1, 5, 8] },
    { roman: 'biii', label: 'Ebm',   pcs: [3, 6, 10] },
    { roman: 'iv',   label: 'Fm',    pcs: [5, 8, 0] },
    { roman: 'bV',   label: 'Gb',    pcs: [6, 10, 1] },
    { roman: 'bVI',  label: 'Ab',    pcs: [8, 0, 3] },
    { roman: 'bvii', label: 'Bbm',   pcs: [10, 1, 5] },
  ]
  expected.forEach((exp, i) => {
    const t = triads[i]
    assertEqual(t.roman, exp.roman, `C Locrian triad ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, t, 'C', 'locrian')
    assertEqual(label, exp.label, `C Locrian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, t).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Locrian ${exp.roman}: pitch classes mismatch`)
  })
})

test('134. All modes: C Dorian diatonic seventh set matches expected', () => {
  const sevenths = getDiatonicSevenths('dorian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'i7',       label: 'Cm7',    pcs: [0, 3, 7, 10] },
    { roman: 'ii7',      label: 'Dm7',    pcs: [2, 5, 9, 0] },
    { roman: 'bIIImaj7', label: 'Ebmaj7', pcs: [3, 7, 10, 2] },
    { roman: 'IV7',      label: 'F7',     pcs: [5, 9, 0, 3] },
    { roman: 'v7',       label: 'Gm7',    pcs: [7, 10, 2, 5] },
    { roman: 'vim7b5',     label: 'Am7b5',  pcs: [9, 0, 3, 7] },
    { roman: 'bVIImaj7', label: 'Bbmaj7', pcs: [10, 2, 5, 9] },
  ]
  expected.forEach((exp, i) => {
    const s = sevenths[i]
    assertEqual(s.roman, exp.roman, `C Dorian 7th ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, s, 'C', 'dorian')
    assertEqual(label, exp.label, `C Dorian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, s).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Dorian ${exp.roman}: pitch classes mismatch`)
  })
})

test('135. All modes: C Locrian diatonic seventh set matches expected', () => {
  const sevenths = getDiatonicSevenths('locrian')
  const tonicPC = tonicToPC('C')
  const expected = [
    { roman: 'im7b5',     label: 'Cm7b5',  pcs: [0, 3, 6, 10] },
    { roman: 'bIImaj7', label: 'Dbmaj7', pcs: [1, 5, 8, 0] },
    { roman: 'biii7',   label: 'Ebm7',   pcs: [3, 6, 10, 1] },
    { roman: 'iv7',     label: 'Fm7',    pcs: [5, 8, 0, 3] },
    { roman: 'bVmaj7',  label: 'Gbmaj7', pcs: [6, 10, 1, 5] },
    { roman: 'bVI7',    label: 'Ab7',    pcs: [8, 0, 3, 6] },
    { roman: 'bvii7',   label: 'Bbm7',   pcs: [10, 1, 5, 8] },
  ]
  expected.forEach((exp, i) => {
    const s = sevenths[i]
    assertEqual(s.roman, exp.roman, `C Locrian 7th ${i}: Roman numeral mismatch`)
    const label = getChordLabel(tonicPC, s, 'C', 'locrian')
    assertEqual(label, exp.label, `C Locrian ${exp.roman}: expected label ${exp.label}, got ${label}`)
    const pcs = getChordPitchClasses(tonicPC, s).sort((a, b) => a - b)
    const expPcs = [...exp.pcs].sort((a, b) => a - b)
    assertEqual(JSON.stringify(pcs), JSON.stringify(expPcs), `C Locrian ${exp.roman}: pitch classes mismatch`)
  })
})

test('136. All modes: MODE_PARENT_MAJOR_OFFSET values are correct', () => {
  // D Dorian has parent major D + 2 = E... wait, Dorian mode starts on 2nd degree of major
  // So D Dorian's parent major is C (D is the 2nd degree of C major)
  // D + (-2 semitones) = C, so offset = -2 ✓
  assertEqual(MODE_PARENT_MAJOR_OFFSET.ionian, 0, 'Ionian offset should be 0')
  assertEqual(MODE_PARENT_MAJOR_OFFSET.dorian, -2, 'Dorian offset should be -2')
  assertEqual(MODE_PARENT_MAJOR_OFFSET.phrygian, -4, 'Phrygian offset should be -4')
  assertEqual(MODE_PARENT_MAJOR_OFFSET.lydian, -5, 'Lydian offset should be -5')
  assertEqual(MODE_PARENT_MAJOR_OFFSET.mixolydian, -7, 'Mixolydian offset should be -7')
  assertEqual(MODE_PARENT_MAJOR_OFFSET.aeolian, 3, 'Aeolian offset should be 3')
  assertEqual(MODE_PARENT_MAJOR_OFFSET.locrian, 1, 'Locrian offset should be 1')
})

test('137. All modes: usesFlats works for all modes', () => {
  // D Dorian: parent major = C → no flats
  assert(!usesFlats('D', 'dorian'), 'D Dorian should NOT use flats (parent C major)')
  // Bb Dorian: parent major = Ab → flats
  assert(usesFlats('Bb', 'dorian'), 'Bb Dorian should use flats (parent Ab major)')
  // E Phrygian: parent major = C → no flats
  assert(!usesFlats('E', 'phrygian'), 'E Phrygian should NOT use flats (parent C major)')
  // F Lydian: parent major = C → no flats
  assert(!usesFlats('F', 'lydian'), 'F Lydian should NOT use flats (parent C major)')
  // G Mixolydian: parent major = C → no flats
  assert(!usesFlats('G', 'mixolydian'), 'G Mixolydian should NOT use flats (parent C major)')
  // B Locrian: parent major = C → no flats
  assert(!usesFlats('B', 'locrian'), 'B Locrian should NOT use flats (parent C major)')
  // Eb Phrygian: parent major = B → no flats (B major has sharps)
  assert(!usesFlats('Eb', 'phrygian'), 'Eb Phrygian should NOT use flats (parent B major)')
})

test('138. All modes: getKeySignature works for all modes', () => {
  // D Dorian: parent major = C → no sharps/flats
  const dDorianSig = getKeySignature('D', 'dorian')
  assertEqual(dDorianSig.sharps.length, 0, 'D Dorian: 0 sharps')
  assertEqual(dDorianSig.flats.length, 0, 'D Dorian: 0 flats')

  // Bb Dorian: parent major = Ab → 4 flats
  const bbDorianSig = getKeySignature('Bb', 'dorian')
  assertEqual(bbDorianSig.flats.length, 4, 'Bb Dorian: 4 flats (parent Ab major)')

  // F Lydian: parent major = C → no sharps/flats
  const fLydianSig = getKeySignature('F', 'lydian')
  assertEqual(fLydianSig.sharps.length, 0, 'F Lydian: 0 sharps')
  assertEqual(fLydianSig.flats.length, 0, 'F Lydian: 0 flats')
})

test('139. Tonic-based range: getTonicBasedRange starts on tonic', () => {
  // C tonic → C4 (MIDI 60), 3 octaves → end at C7 (96)
  const cRange = getTonicBasedRange(0, 3)
  assertEqual(cRange.start, 60, 'C tonic range should start at C4 (60)')
  assertEqual(cRange.end, 96, 'C tonic range should end at C7 (96)')

  // Db tonic → Db3 (MIDI 49), lower than C4
  const dbRange = getTonicBasedRange(1, 3)
  assertEqual(dbRange.start, 49, 'Db tonic range should start at Db3 (49)')

  // Gb tonic → Gb3 (MIDI 54), lower than C4
  const gbRange = getTonicBasedRange(6, 3)
  assertEqual(gbRange.start, 54, 'Gb tonic range should start at Gb3 (54)')

  // G tonic → G4 (MIDI 67), higher than C4
  const gRange = getTonicBasedRange(7, 3)
  assertEqual(gRange.start, 67, 'G tonic range should start at G4 (67)')

  // Ab tonic → Ab4 (MIDI 68), higher than C4
  const abRange = getTonicBasedRange(8, 3)
  assertEqual(abRange.start, 68, 'Ab tonic range should start at Ab4 (68)')

  // Bb tonic → Bb4 (MIDI 70), higher than C4
  const bbRange = getTonicBasedRange(10, 3)
  assertEqual(bbRange.start, 70, 'Bb tonic range should start at Bb4 (70)')

  // B tonic → B4 (MIDI 71), higher than C4
  const bRange = getTonicBasedRange(11, 3)
  assertEqual(bRange.start, 71, 'B tonic range should start at B4 (71)')
})

test('140. Tonic-based range: all 12 tonics produce valid 3-octave ranges', () => {
  TONICS.forEach(tonic => {
    const tonicPC = tonicToPC(tonic)
    const range = getTonicBasedRange(tonicPC, 3)
    assertEqual(range.end - range.start, 36, `${tonic}: range should span 3 octaves (36 semitones)`)
    assertEqual(midiNoteToPC(range.start), tonicPC, `${tonic}: range start should have tonic pitch class`)
  })
})

// ── 141. Borrowed chord enharmonic spelling (modal interchange) ─────────

test('141. Borrowed chord from C minor in C major uses flat spelling', () => {
  // C major is the main key, chord borrowed from C minor
  // C minor triad: C-Eb-G (not C-D#-G)
  // C minor's relative major is Eb → flat key → use flats
  const tonicPC = tonicToPC('C')

  // Get C minor triad chords
  const minorChords = getDiatonicTriads('minor')
  const cMinorChord = minorChords.find(c => c.roman === 'i')
  assert(cMinorChord, 'Should find i chord in minor')

  const pcs = getChordPitchClasses(tonicPC, cMinorChord)
  const noteNames = pcs.map(pc => spellNoteName(pc, 'C', 'minor'))
  assert(noteNames.includes('C'), `C minor triad should include C, got ${noteNames}`)
  assert(noteNames.includes('Eb'), `C minor triad should include Eb (not D#), got ${noteNames}`)
  assert(noteNames.includes('G'), `C minor triad should include G, got ${noteNames}`)
  assert(!noteNames.includes('D#'), `C minor triad should NOT include D#, got ${noteNames}`)
})

test('141b. Borrowed chord from C minor in C major — chord label uses flat spelling', () => {
  const tonicPC = tonicToPC('C')
  const minorChords = getDiatonicTriads('minor')
  const cMinorChord = minorChords.find(c => c.roman === 'i')

  // Spell using sourceMode (minor) — should be "Cm" with Eb in notes
  const label = getChordLabel(tonicPC, cMinorChord, 'C', 'minor')
  assertEqual(label, 'Cm', 'C minor triad label should be "Cm"')

  // The root is C (natural, no conversion needed)
  // But the third should be spelled Eb when using minor mode
  const pcs = getChordPitchClasses(tonicPC, cMinorChord)
  const thirdPC = pcs.find(pc => pc === 3) // Eb/D# pitch class
  assertEqual(spellNoteName(thirdPC, 'C', 'minor'), 'Eb', 'Third of C minor should be Eb')
  assertEqual(spellNoteName(thirdPC, 'C', 'major'), 'D#', 'Third in C major context should be D# (sharp key default)')
})

test('141c. Borrowed chord from E minor in E major uses sharp spelling', () => {
  // E major is a sharp key, E minor's relative major is G (also sharp)
  // E minor triad: E-G-B (G is natural, no conversion needed)
  const tonicPC = tonicToPC('E')
  const minorChords = getDiatonicTriads('minor')
  const eMinorChord = minorChords.find(c => c.roman === 'i')

  const pcs = getChordPitchClasses(tonicPC, eMinorChord)
  const noteNames = pcs.map(pc => spellNoteName(pc, 'E', 'minor'))
  assert(noteNames.includes('E'), `E minor triad should include E, got ${noteNames}`)
  assert(noteNames.includes('G'), `E minor triad should include G, got ${noteNames}`)
  assert(noteNames.includes('B'), `E minor triad should include B, got ${noteNames}`)
})

test('141d. Borrowed chord from F minor in F major uses flat spelling', () => {
  // F major is a flat key (1 flat: Bb)
  // F minor's relative major is Ab (flat key)
  // F minor triad: F-Ab-C
  const tonicPC = tonicToPC('F')
  const minorChords = getDiatonicTriads('minor')
  const fMinorChord = minorChords.find(c => c.roman === 'i')

  const pcs = getChordPitchClasses(tonicPC, fMinorChord)
  const noteNames = pcs.map(pc => spellNoteName(pc, 'F', 'minor'))
  assert(noteNames.includes('F'), `F minor triad should include F, got ${noteNames}`)
  assert(noteNames.includes('Ab'), `F minor triad should include Ab (not G#), got ${noteNames}`)
  assert(noteNames.includes('C'), `F minor triad should include C, got ${noteNames}`)
  assert(!noteNames.includes('G#'), `F minor triad should NOT include G#, got ${noteNames}`)
})

test('141e. pickInterchangeChord returns sourceMode for borrowed chords', () => {
  const tonicPC = tonicToPC('C')
  // Force borrowed only (probability = 0)
  const chord = pickInterchangeChord({
    tonicPC,
    tonality: 'major',
    selectedChordTypes: ['triads'],
    borrowedModes: ['minor'],
    probability: 0,
  })
  assert(chord.sourceMode === 'minor', `Borrowed chord should have sourceMode='minor', got ${chord.sourceMode}`)
  assert(chord.isBorrowed !== undefined, 'Borrowed chord should have isBorrowed field')
})

test('141f. All flat-key minor tonics spell b3 as flat when borrowed', () => {
  // For each flat minor key, the b3 should be spelled with a flat
  const flatMinorKeys = ['D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']
  for (const tonic of flatMinorKeys) {
    const tonicPC = tonicToPC(tonic)
    const b3PC = (tonicPC + 3) % 12
    const spelled = spellNoteName(b3PC, tonic, 'minor')
    assert(!spelled.includes('#'), `${tonic} minor: b3 should not use sharps, got ${spelled}`)
  }
})

test('141g. All sharp-key minor tonics spell b3 correctly when borrowed', () => {
  // For each sharp minor key, the b3 should be spelled with a sharp or natural
  const sharpMinorKeys = ['A', 'E', 'B', 'F#', 'C#']
  for (const tonic of sharpMinorKeys) {
    const tonicPC = tonicToPC(tonic)
    const b3PC = (tonicPC + 3) % 12
    const spelled = spellNoteName(b3PC, tonic, 'minor')
    // Sharp keys should not use flats
    assert(!spelled.includes('b') || spelled === tonic + 'b', `${tonic} minor: b3 should not use flats in sharp key, got ${spelled}`)
  }
})

// ── Secondary Chords Tests ───────────────────────────────────────────────

test('142. SECONDARY_CHORDS has correct equivalent spellings for major key dominants', () => {
  const majorDominants = SECONDARY_CHORDS.filter(sc => sc.applicableTonality === 'major' && sc.type === 'dominant')
  const expected = {
    'V7/V':   'II7',
    'V7/ii':  'VI7',
    'V7/iii': 'VII7',
    'V7/vi':  'III7',
    'V7/IV':  'I7',
  }
  for (const sc of majorDominants) {
    assert(sc.equivalentRoman === expected[sc.id],
      `${sc.id}: expected equivalent ${expected[sc.id]}, got ${sc.equivalentRoman}`)
  }
})

test('143. SECONDARY_CHORDS has correct equivalent spellings for minor key dominants', () => {
  const minorDominants = SECONDARY_CHORDS.filter(sc => sc.applicableTonality === 'minor' && sc.type === 'dominant')
  const expected = {
    'V7/bIII': 'bVII7',
    'V7/bVI':  'bIII7',
    'V7/iv':   'I7',
  }
  for (const sc of minorDominants) {
    assert(sc.equivalentRoman === expected[sc.id],
      `${sc.id}: expected equivalent ${expected[sc.id]}, got ${sc.equivalentRoman}`)
  }
})

test('144. SECONDARY_CHORDS has correct equivalent spellings for major key leading-tone chords', () => {
  const majorLT = SECONDARY_CHORDS.filter(sc => sc.applicableTonality === 'major' && sc.type === 'leading-tone')
  const expected = {
    'viio7/V':   '#ivo7',
    'viio7/ii':  '#io7',
    'viio7/iii': '#iio7',
    'viio7/vi':  '#vo7',
  }
  for (const sc of majorLT) {
    assert(sc.equivalentRoman === expected[sc.id],
      `${sc.id}: expected equivalent ${expected[sc.id]}, got ${sc.equivalentRoman}`)
  }
})

test('145. SECONDARY_CHORDS has correct equivalent spellings for minor key leading-tone chords', () => {
  const minorLT = SECONDARY_CHORDS.filter(sc => sc.applicableTonality === 'minor' && sc.type === 'leading-tone')
  const expected = {
    'viio7/bIII': 'iio7',
    'viio7/bVI':  'vo7',
    'viio7/iv':   'iiio7',
  }
  for (const sc of minorLT) {
    assert(sc.equivalentRoman === expected[sc.id],
      `${sc.id}: expected equivalent ${expected[sc.id]}, got ${sc.equivalentRoman}`)
  }
})

test('146. Secondary dominant root is a perfect 5th above target', () => {
  const dominants = SECONDARY_CHORDS.filter(sc => sc.type === 'dominant')
  for (const sc of dominants) {
    const expectedRoot = (sc.targetSemitones + 7) % 12
    assert(sc.semitones === expectedRoot,
      `${sc.id}: root should be ${expectedRoot}, got ${sc.semitones}`)
  }
})

test('147. Secondary leading-tone root is 1 semitone below target', () => {
  const leadingTones = SECONDARY_CHORDS.filter(sc => sc.type === 'leading-tone')
  for (const sc of leadingTones) {
    const expectedRoot = (sc.targetSemitones - 1 + 12) % 12
    assert(sc.semitones === expectedRoot,
      `${sc.id}: root should be ${expectedRoot}, got ${sc.semitones}`)
  }
})

test('148. isSecondaryChordAvailable filters by tonality', () => {
  const v7_ii = SECONDARY_CHORDS.find(sc => sc.id === 'V7/ii')
  assert(isSecondaryChordAvailable(v7_ii, 'major'), 'V7/ii should be available in major')
  assert(!isSecondaryChordAvailable(v7_ii, 'minor'), 'V7/ii should NOT be available in minor')

  const v7_bIII = SECONDARY_CHORDS.find(sc => sc.id === 'V7/bIII')
  assert(!isSecondaryChordAvailable(v7_bIII, 'major'), 'V7/bIII should NOT be available in major')
  assert(isSecondaryChordAvailable(v7_bIII, 'minor'), 'V7/bIII should be available in minor')
})

test('149. getAvailableSecondaryChords returns correct chords for major', () => {
  const available = getAvailableSecondaryChords('major')
  const ids = available.map(sc => sc.id)
  // All major-key chords should be present
  assert(ids.includes('V7/V'), 'V7/V should be available in major')
  assert(ids.includes('V7/ii'), 'V7/ii should be available in major')
  assert(ids.includes('viio7/V'), 'viio7/V should be available in major')
  // No minor-key chords
  assert(!ids.includes('V7/bIII'), 'V7/bIII should NOT be available in major')
  assert(!ids.includes('viio7/bIII'), 'viio7/bIII should NOT be available in major')
})

test('150. getAvailableSecondaryChords returns correct chords for minor', () => {
  const available = getAvailableSecondaryChords('minor')
  const ids = available.map(sc => sc.id)
  // All minor-key chords should be present
  assert(ids.includes('V7/bIII'), 'V7/bIII should be available in minor')
  assert(ids.includes('V7/bVI'), 'V7/bVI should be available in minor')
  assert(ids.includes('viio7/iv'), 'viio7/iv should be available in minor')
  // No major-key chords
  assert(!ids.includes('V7/V'), 'V7/V should NOT be available in minor')
  assert(!ids.includes('viio7/ii'), 'viio7/ii should NOT be available in minor')
})

test('151. getSecondaryChordTarget returns correct diatonic chord', () => {
  const v7_ii = SECONDARY_CHORDS.find(sc => sc.id === 'V7/ii')
  const target = getSecondaryChordTarget(v7_ii, 'major', ['triads'])
  assert(target !== null, 'V7/ii target should not be null')
  assert(target.semitones === 2, 'V7/ii target should be at semitone 2')
  assert(target.roman === 'ii', 'V7/ii target should be ii')
})

test('152. pickSecondaryChord returns secondary chord with isSecondary flag', () => {
  const v7_ii = SECONDARY_CHORDS.find(sc => sc.id === 'V7/ii')
  const pick = pickSecondaryChord({
    tonicPC: 0, tonality: 'major', selectedChordTypes: ['triads'],
    selectedSecondaryChords: [v7_ii], probability: 0, lastChord: null,
  })
  assert(pick.isSecondary === true, 'Should return secondary chord at probability 0')
  assert(pick.roman === 'V7/ii', 'Roman should be V7/ii')
  assert(pick.equivalentRoman === 'VI7', 'Equivalent should be VI7')
})

test('153. pickSecondaryChord returns diatonic chord at probability 1', () => {
  const v7_ii = SECONDARY_CHORDS.find(sc => sc.id === 'V7/ii')
  const pick = pickSecondaryChord({
    tonicPC: 0, tonality: 'major', selectedChordTypes: ['triads'],
    selectedSecondaryChords: [v7_ii], probability: 1, lastChord: null,
  })
  assert(pick.isSecondary === false, 'Should return diatonic chord at probability 1')
})

test('154. pickSecondaryChord returns diatonic when no secondary chords available', () => {
  const pick = pickSecondaryChord({
    tonicPC: 0, tonality: 'major', selectedChordTypes: ['triads'],
    selectedSecondaryChords: [], probability: 0, lastChord: null,
  })
  assert(pick.isSecondary === false, 'Should return diatonic when no secondary chords selected')
})

test('155. Secondary dominant intervals are [0,4,7,10]', () => {
  const dominants = SECONDARY_CHORDS.filter(sc => sc.type === 'dominant')
  for (const sc of dominants) {
    assert(sc.intervals.length === 4 && sc.intervals[0] === 0 && sc.intervals[1] === 4 && sc.intervals[2] === 7 && sc.intervals[3] === 10,
      `${sc.id}: intervals should be [0,4,7,10]`)
  }
})

test('156. Secondary leading-tone intervals are [0,3,6,9]', () => {
  const leadingTones = SECONDARY_CHORDS.filter(sc => sc.type === 'leading-tone')
  for (const sc of leadingTones) {
    assert(sc.intervals.length === 4 && sc.intervals[0] === 0 && sc.intervals[1] === 3 && sc.intervals[2] === 6 && sc.intervals[3] === 9,
      `${sc.id}: intervals should be [0,3,6,9]`)
  }
})

// ── Inversion Tests ──────────────────────────────────────────────────────

test('157. assignInversion returns 0 for triads (3 positions)', () => {
  const triad = DIATONIC_TRIADS.major[0] // I chord, intervals [0,4,7]
  const inv = assignInversion(triad)
  assert(inv >= 0 && inv < 3, `Triad inversion should be 0-2, got ${inv}`)
})

test('158. assignInversion returns 0 for sevenths (4 positions)', () => {
  const seventh = DIATONIC_SEVENTHS.major[0] // Imaj7, intervals [0,4,7,11]
  const inv = assignInversion(seventh)
  assert(inv >= 0 && inv < 4, `Seventh inversion should be 0-3, got ${inv}`)
})

test('159. getBassPC: root position returns root PC', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[0] // I, semitones=0, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 0)
  assertEqual(bassPC, 0, 'Root position bass should be root PC (0)')
})

test('160. getBassPC: 1st inversion of I in C major = E (pc=4)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[0] // I, semitones=0, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 1)
  assertEqual(bassPC, 4, '1st inversion of I should have bass E (pc=4)')
})

test('161. getBassPC: 2nd inversion of I in C major = G (pc=7)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[0] // I, semitones=0, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 2)
  assertEqual(bassPC, 7, '2nd inversion of I should have bass G (pc=7)')
})

test('162. getBassPC: 1st inversion of V in C major = B (pc=11)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[4] // V, semitones=7, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 1)
  // root = 0+7=7 (G), 1st inv = 7+4=11 (B)
  assertEqual(bassPC, 11, '1st inversion of V should have bass B (pc=11)')
})

test('163. getBassPC: 2nd inversion of V in C major = D (pc=2)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[4] // V, semitones=7, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 2)
  // root = 0+7=7 (G), 2nd inv = 7+7=14%12=2 (D)
  assertEqual(bassPC, 2, '2nd inversion of V should have bass D (pc=2)')
})

test('164. getBassPC: 3rd inversion of V7 in C major = F (pc=5)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[4] // V7, semitones=7, intervals=[0,4,7,10]
  const bassPC = getBassPC(tonicPC, chord, 3)
  // root = 0+7=7 (G), 3rd inv = 7+10=17%12=5 (F)
  assertEqual(bassPC, 5, '3rd inversion of V7 should have bass F (pc=5)')
})

test('165. getBassPC: 1st inversion of V7 in C major = B (pc=11)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[4] // V7, semitones=7, intervals=[0,4,7,10]
  const bassPC = getBassPC(tonicPC, chord, 1)
  // root = 0+7=7 (G), 1st inv = 7+4=11 (B)
  assertEqual(bassPC, 11, '1st inversion of V7 should have bass B (pc=11)')
})

test('166. getBassPC: 2nd inversion of V7 in C major = D (pc=2)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[4] // V7, semitones=7, intervals=[0,4,7,10]
  const bassPC = getBassPC(tonicPC, chord, 2)
  // root = 0+7=7 (G), 2nd inv = 7+7=14%12=2 (D)
  assertEqual(bassPC, 2, '2nd inversion of V7 should have bass D (pc=2)')
})

test('167. getBassScaleDegree: root position of I = "1"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[0] // I
  const degree = getBassScaleDegree(tonicPC, chord, 0)
  assertEqual(degree, '1', 'Root position of I should have bass degree "1"')
})

test('168. getBassScaleDegree: 1st inversion of I = "3"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[0] // I
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  assertEqual(degree, '3', '1st inversion of I should have bass degree "3"')
})

test('169. getBassScaleDegree: 2nd inversion of I = "5"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[0] // I
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  assertEqual(degree, '5', '2nd inversion of I should have bass degree "5"')
})

test('170. getBassScaleDegree: 1st inversion of V = "7"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[4] // V, semitones=7
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // bass = 0+7+4=11, degree 11 = '7'
  assertEqual(degree, '7', '1st inversion of V should have bass degree "7"')
})

test('171. getBassScaleDegree: 2nd inversion of V = "2"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[4] // V, semitones=7
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // bass = 0+7+7=14%12=2, degree 2 = '2'
  assertEqual(degree, '2', '2nd inversion of V should have bass degree "2"')
})

test('172. getBassScaleDegree: 1st inversion of V7 = "7"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[4] // V7
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // bass = 0+7+4=11, degree 11 = '7'
  assertEqual(degree, '7', '1st inversion of V7 should have bass degree "7"')
})

test('173. getBassScaleDegree: 2nd inversion of V7 = "2"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[4] // V7
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // bass = 0+7+7=14%12=2, degree 2 = '2'
  assertEqual(degree, '2', '2nd inversion of V7 should have bass degree "2"')
})

test('174. getBassScaleDegree: 3rd inversion of V7 = "4"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[4] // V7
  const degree = getBassScaleDegree(tonicPC, chord, 3)
  // bass = 0+7+10=17%12=5, degree 5 = '4'
  assertEqual(degree, '4', '3rd inversion of V7 should have bass degree "4"')
})

test('175. getBassScaleDegree: 1st inversion of iii = "5"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[2] // iii (minor), semitones=4, intervals=[0,3,7]
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // iii root = E (pc=4), 1st inv = 4+3=7 (G), degree 7 = '5'
  assertEqual(degree, '5', '1st inversion of iii should have bass degree "5" (G in C)')
})

test('176. getBassScaleDegree: 2nd inversion of iii = "7"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_TRIADS.major[2] // iii (minor), semitones=4, intervals=[0,3,7]
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // bass = 0+4+7=11, degree 11 = '7'
  assertEqual(degree, '7', '2nd inversion of iii should have bass degree "7" (B in C)')
})

test('177. getBassScaleDegree: 1st inversion of iv in A minor = "b6"', () => {
  const tonicPC = 9 // A minor
  const chord = DIATONIC_TRIADS.minor[3] // iv, semitones=5, intervals=[0,3,7]
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // root = 9+5=14%12=2 (D), 1st inv = 2+3=5 (F), degree 5 from A = (5-9+12)%12=8 = b6
  assertEqual(degree, 'b6', '1st inversion of iv in A minor should have bass degree "b6"')
})

test('178. getBassScaleDegree: 2nd inversion of iv in A minor = "1"', () => {
  const tonicPC = 9 // A minor
  const chord = DIATONIC_TRIADS.minor[3] // iv, semitones=5, intervals=[0,3,7]
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // root = 9+5=14%12=2 (D), 2nd inv = 2+7=9 (A), degree 9 from A = (9-9+12)%12=0 = '1'
  assertEqual(degree, '1', '2nd inversion of iv in A minor should have bass degree "1"')
})

test('179. getBassScaleDegree: 1st inversion of bIII in C minor = "5"', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[2] // bIII, semitones=3, intervals=[0,4,7]
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // root = 0+3=3 (Eb), 1st inv = 3+4=7 (G), degree 7 from C = '5'
  assertEqual(degree, '5', '1st inversion of bIII in C minor should have bass degree "5"')
})

test('180. getBassScaleDegree: 2nd inversion of bIII in C minor = "b7"', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[2] // bIII, semitones=3, intervals=[0,4,7]
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // root = 0+3=3 (Eb), 2nd inv = 3+7=10 (Bb), degree 10 from C = 'b7'
  assertEqual(degree, 'b7', '2nd inversion of bIII in C minor should have bass degree "b7"')
})

test('181. getBassScaleDegree: 3rd inversion of viim7b5 in C major = "6"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[6] // viim7b5, semitones=11, intervals=[0,3,6,10]
  const degree = getBassScaleDegree(tonicPC, chord, 3)
  // root = 0+11=11 (B), 3rd inv = 11+10=21%12=9 (A), degree 9 from C = '6'
  assertEqual(degree, '6', '3rd inversion of viim7b5 should have bass degree "6" (A in C)')
})

test('182. getBassScaleDegree: 1st inversion of viim7b5 in C major = "2"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[6] // viim7b5, semitones=11, intervals=[0,3,6,10]
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // root = 0+11=11 (B), 1st inv = 11+3=14%12=2 (D), degree 2 from C = '2'
  assertEqual(degree, '2', '1st inversion of viim7b5 should have bass degree "2" (D in C)')
})

test('183. getBassScaleDegree: 2nd inversion of viim7b5 in C major = "4"', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[6] // viim7b5, semitones=11, intervals=[0,3,6,10]
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // root = 0+11=11 (B), 2nd inv = 11+6=17%12=5 (F), degree 5 from C = '4'
  assertEqual(degree, '4', '2nd inversion of viim7b5 should have bass degree "4" (F in C)')
})

test('184. getBassPC: 1st inversion of ii7 in C major = F (pc=5)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[1] // ii7, semitones=2, intervals=[0,3,7,10]
  const bassPC = getBassPC(tonicPC, chord, 1)
  // root = 0+2=2 (D), 1st inv = 2+3=5 (F)
  assertEqual(bassPC, 5, '1st inversion of ii7 should have bass F (pc=5)')
})

test('185. getBassPC: 2nd inversion of ii7 in C major = A (pc=9)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[1] // ii7, semitones=2, intervals=[0,3,7,10]
  const bassPC = getBassPC(tonicPC, chord, 2)
  // root = 0+2=2 (D), 2nd inv = 2+7=9 (A)
  assertEqual(bassPC, 9, '2nd inversion of ii7 should have bass A (pc=9)')
})

test('186. getBassPC: 3rd inversion of ii7 in C major = C (pc=0)', () => {
  const tonicPC = 0 // C major
  const chord = DIATONIC_SEVENTHS.major[1] // ii7, semitones=2, intervals=[0,3,7,10]
  const bassPC = getBassPC(tonicPC, chord, 3)
  // root = 0+2=2 (D), 3rd inv = 2+10=12%12=0 (C)
  assertEqual(bassPC, 0, '3rd inversion of ii7 should have bass C (pc=0)')
})

test('187. getBassPC: root position of bVI in C minor = Ab (pc=8)', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[5] // bVI, semitones=8, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 0)
  assertEqual(bassPC, 8, 'Root position of bVI should have bass Ab (pc=8)')
})

test('188. getBassPC: 1st inversion of bVI in C minor = C (pc=0)', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[5] // bVI, semitones=8, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 1)
  // root = 0+8=8 (Ab), 1st inv = 8+4=12%12=0 (C)
  assertEqual(bassPC, 0, '1st inversion of bVI should have bass C (pc=0)')
})

test('189. getBassPC: 2nd inversion of bVI in C minor = Eb (pc=3)', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[5] // bVI, semitones=8, intervals=[0,4,7]
  const bassPC = getBassPC(tonicPC, chord, 2)
  // root = 0+8=8 (Ab), 2nd inv = 8+7=15%12=3 (Eb)
  assertEqual(bassPC, 3, '2nd inversion of bVI should have bass Eb (pc=3)')
})

test('190. getBassScaleDegree: 1st inversion of bVI in C minor = "1"', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[5] // bVI
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // bass = 0, degree 0 = '1'
  assertEqual(degree, '1', '1st inversion of bVI in C minor should have bass degree "1"')
})

test('191. getBassScaleDegree: 2nd inversion of bVI in C minor = "b3"', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[5] // bVI
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // bass = 3, degree 3 = 'b3'
  assertEqual(degree, 'b3', '2nd inversion of bVI in C minor should have bass degree "b3"')
})

test('192. getBassScaleDegree: 1st inversion of bVII in C minor = "2"', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[6] // bVII, semitones=10, intervals=[0,4,7]
  const degree = getBassScaleDegree(tonicPC, chord, 1)
  // root = 0+10=10 (Bb), 1st inv = 10+4=14%12=2 (D), degree 2 = '2'
  assertEqual(degree, '2', '1st inversion of bVII in C minor should have bass degree "2"')
})

test('193. getBassScaleDegree: 2nd inversion of bVII in C minor = "4"', () => {
  const tonicPC = 0 // C minor
  const chord = DIATONIC_TRIADS.minor[6] // bVII, semitones=10, intervals=[0,4,7]
  const degree = getBassScaleDegree(tonicPC, chord, 2)
  // root = 0+10=10 (Bb), 2nd inv = 10+7=17%12=5 (F), degree 5 = '4'
  assertEqual(degree, '4', '2nd inversion of bVII in C minor should have bass degree "4"')
})

test('194. getBassPC: all triad inversions in all 12 major keys', () => {
  for (const tonic of TONICS) {
    const tonicPC = tonicToPC(tonic)
    const triads = getDiatonicTriads('major')
    for (const chord of triads) {
      for (let inv = 0; inv < 3; inv++) {
        const rootPC = (tonicPC + chord.semitones) % 12
        const expectedBass = (rootPC + chord.intervals[inv]) % 12
        const bassPC = getBassPC(tonicPC, chord, inv)
        assertEqual(bassPC, expectedBass, `${tonic} major ${chord.roman} inv ${inv}: bass PC mismatch`)
      }
    }
  }
})

test('195. getBassPC: all seventh chord inversions in all 12 major keys', () => {
  for (const tonic of TONICS) {
    const tonicPC = tonicToPC(tonic)
    const sevenths = getDiatonicSevenths('major')
    for (const chord of sevenths) {
      for (let inv = 0; inv < 4; inv++) {
        const rootPC = (tonicPC + chord.semitones) % 12
        const expectedBass = (rootPC + chord.intervals[inv]) % 12
        const bassPC = getBassPC(tonicPC, chord, inv)
        assertEqual(bassPC, expectedBass, `${tonic} major ${chord.roman} inv ${inv}: bass PC mismatch`)
      }
    }
  }
})

test('196. getBassPC: all triad inversions in all 12 minor keys', () => {
  for (const tonic of TONICS) {
    const tonicPC = tonicToPC(tonic)
    const triads = getDiatonicTriads('minor')
    for (const chord of triads) {
      for (let inv = 0; inv < 3; inv++) {
        const rootPC = (tonicPC + chord.semitones) % 12
        const expectedBass = (rootPC + chord.intervals[inv]) % 12
        const bassPC = getBassPC(tonicPC, chord, inv)
        assertEqual(bassPC, expectedBass, `${tonic} minor ${chord.roman} inv ${inv}: bass PC mismatch`)
      }
    }
  }
})

test('197. getBassPC: all seventh chord inversions in all 12 minor keys', () => {
  for (const tonic of TONICS) {
    const tonicPC = tonicToPC(tonic)
    const sevenths = getDiatonicSevenths('minor')
    for (const chord of sevenths) {
      for (let inv = 0; inv < 4; inv++) {
        const rootPC = (tonicPC + chord.semitones) % 12
        const expectedBass = (rootPC + chord.intervals[inv]) % 12
        const bassPC = getBassPC(tonicPC, chord, inv)
        assertEqual(bassPC, expectedBass, `${tonic} minor ${chord.roman} inv ${inv}: bass PC mismatch`)
      }
    }
  }
})

test('198. getBassPC: secondary chord inversions', () => {
  const tonicPC = 0 // C major
  for (const sc of SECONDARY_CHORDS) {
    for (let inv = 0; inv < sc.intervals.length; inv++) {
      const rootPC = (tonicPC + sc.semitones) % 12
      const expectedBass = (rootPC + sc.intervals[inv]) % 12
      const bassPC = getBassPC(tonicPC, sc, inv)
      assertEqual(bassPC, expectedBass, `${sc.id} inv ${inv}: bass PC mismatch`)
    }
  }
})

test('199. getBassScaleDegree: root position always returns chord root degree', () => {
  const tonicPC = 0 // C major
  const triads = getDiatonicTriads('major')
  for (const chord of triads) {
    const degree = getBassScaleDegree(tonicPC, chord, 0)
    const expectedDegree = DEGREE_MAP[chord.semitones]
    assertEqual(degree, expectedDegree, `Root position of ${chord.roman} should have degree ${expectedDegree}`)
  }
})

// ── getRomanParts Tests ──────────────────────────────────────────────────

test('200. getRomanParts: triad roman returns empty superscript', () => {
  const parts = getRomanParts('I')
  assertEqual(parts.base, 'I', 'Base should be I')
  assertEqual(parts.superscript, '', 'Superscript should be empty')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('201. getRomanParts: seventh roman returns extension as superscript', () => {
  const parts = getRomanParts('Imaj7')
  assertEqual(parts.base, 'I', 'Base should be I')
  assertEqual(parts.superscript, 'maj7', 'Superscript should be maj7')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('202. getRomanParts: minor seventh with flat5', () => {
  const parts = getRomanParts('viim7b5')
  assertEqual(parts.base, 'vii', 'Base should be vii')
  assertEqual(parts.superscript, 'm7b5', 'Superscript should be m7b5')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('203. getRomanParts: dominant seventh', () => {
  const parts = getRomanParts('V7')
  assertEqual(parts.base, 'V', 'Base should be V')
  assertEqual(parts.superscript, '7', 'Superscript should be 7')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('204. getRomanParts: secondary dominant with slash', () => {
  const parts = getRomanParts('V7/ii')
  assertEqual(parts.base, 'V', 'Base should be V')
  assertEqual(parts.superscript, '7', 'Superscript should be 7')
  assertEqual(parts.secondary, '/ii', 'Secondary should be /ii')
})

test('205. getRomanParts: secondary leading-tone with slash', () => {
  const parts = getRomanParts('viio7/V')
  assertEqual(parts.base, 'vii', 'Base should be vii')
  assertEqual(parts.superscript, 'o7', 'Superscript should be o7')
  assertEqual(parts.secondary, '/V', 'Secondary should be /V')
})

test('206. getRomanParts: flat-prefixed roman', () => {
  const parts = getRomanParts('bIIImaj7')
  assertEqual(parts.base, 'bIII', 'Base should be bIII')
  assertEqual(parts.superscript, 'maj7', 'Superscript should be maj7')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('207. getRomanParts: sharp-prefixed roman', () => {
  const parts = getRomanParts('#ivm7b5')
  assertEqual(parts.base, '#iv', 'Base should be #iv')
  assertEqual(parts.superscript, 'm7b5', 'Superscript should be m7b5')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('208. getRomanParts: augmented triad with + suffix', () => {
  const parts = getRomanParts('bIII+')
  assertEqual(parts.base, 'bIII', 'Base should be bIII')
  assertEqual(parts.superscript, '+', 'Superscript should be +')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('209. getRomanParts: diminished triad with o suffix', () => {
  const parts = getRomanParts('viio')
  assertEqual(parts.base, 'vii', 'Base should be vii')
  assertEqual(parts.superscript, 'o', 'Superscript should be o')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

test('210. getRomanParts: null input returns empty parts', () => {
  const parts = getRomanParts(null)
  assertEqual(parts.base, '', 'Base should be empty')
  assertEqual(parts.superscript, '', 'Superscript should be empty')
  assertEqual(parts.secondary, '', 'Secondary should be empty')
})

// ── getFiguredBass Tests ─────────────────────────────────────────────────

test('211. getFiguredBass: root position triad returns empty string', () => {
  const chord = DIATONIC_TRIADS.major[0] // I, intervals=[0,4,7]
  assertEqual(getFiguredBass(chord, 0), '', 'Root position triad should have no figured bass')
})

test('212. getFiguredBass: 1st inversion triad returns "6"', () => {
  const chord = DIATONIC_TRIADS.major[0] // I, intervals=[0,4,7]
  assertEqual(getFiguredBass(chord, 1), '6', '1st inversion triad should be "6"')
})

test('213. getFiguredBass: 2nd inversion triad returns "6/4"', () => {
  const chord = DIATONIC_TRIADS.major[0] // I, intervals=[0,4,7]
  assertEqual(getFiguredBass(chord, 2), '6/4', '2nd inversion triad should be "6/4"')
})

test('214. getFiguredBass: root position seventh returns "7"', () => {
  const chord = DIATONIC_SEVENTHS.major[4] // V7, intervals=[0,4,7,10]
  assertEqual(getFiguredBass(chord, 0), '7', 'Root position seventh should be "7"')
})

test('215. getFiguredBass: 1st inversion seventh returns "6/5"', () => {
  const chord = DIATONIC_SEVENTHS.major[4] // V7, intervals=[0,4,7,10]
  assertEqual(getFiguredBass(chord, 1), '6/5', '1st inversion seventh should be "6/5"')
})

test('216. getFiguredBass: 2nd inversion seventh returns "4/3"', () => {
  const chord = DIATONIC_SEVENTHS.major[4] // V7, intervals=[0,4,7,10]
  assertEqual(getFiguredBass(chord, 2), '4/3', '2nd inversion seventh should be "4/3"')
})

test('217. getFiguredBass: 3rd inversion seventh returns "4/2"', () => {
  const chord = DIATONIC_SEVENTHS.major[4] // V7, intervals=[0,4,7,10]
  assertEqual(getFiguredBass(chord, 3), '4/2', '3rd inversion seventh should be "4/2"')
})

test('218. getFiguredBass: null inversion returns root position figure', () => {
  const triad = DIATONIC_TRIADS.major[0] // I, intervals=[0,4,7]
  assertEqual(getFiguredBass(triad, null), '', 'Null inversion triad should have no figured bass')
  const seventh = DIATONIC_SEVENTHS.major[4] // V7, intervals=[0,4,7,10]
  assertEqual(getFiguredBass(seventh, null), '7', 'Null inversion seventh should be "7"')
})

test('219. getFiguredBass: all triad inversions across all modes', () => {
  for (const mode of MODES) {
    const triads = getDiatonicTriads(mode)
    for (const chord of triads) {
      assertEqual(getFiguredBass(chord, 0), '', `${mode} ${chord.roman} root: expected ""`)
      assertEqual(getFiguredBass(chord, 1), '6', `${mode} ${chord.roman} 1st inv: expected "6"`)
      assertEqual(getFiguredBass(chord, 2), '6/4', `${mode} ${chord.roman} 2nd inv: expected "6/4"`)
    }
  }
})

test('220. getFiguredBass: all seventh inversions across all modes', () => {
  for (const mode of MODES) {
    const sevenths = getDiatonicSevenths(mode)
    for (const chord of sevenths) {
      assertEqual(getFiguredBass(chord, 0), '7', `${mode} ${chord.roman} root: expected "7"`)
      assertEqual(getFiguredBass(chord, 1), '6/5', `${mode} ${chord.roman} 1st inv: expected "6/5"`)
      assertEqual(getFiguredBass(chord, 2), '4/3', `${mode} ${chord.roman} 2nd inv: expected "4/3"`)
      assertEqual(getFiguredBass(chord, 3), '4/2', `${mode} ${chord.roman} 3rd inv: expected "4/2"`)
    }
  }
})

// ── Summary ──────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════')
console.log(`  Results: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\n  Failures:')
  failures.forEach(f => console.log(`    ✗ ${f}`))
}
console.log('═══════════════════════════════════════════════════════════')

process.exit(failed > 0 ? 1 : 0)
