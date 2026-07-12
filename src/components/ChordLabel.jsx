// Renders a chord label with the quality suffix as a CSS superscript.
// Uses vertical-align: super + smaller font-size so symbols like o, +, 7, maj7
// render as superscripts, matching the Roman numeral rendering style.
//
// Parsing: root = note letter (A-G) + optional accidental (#/b).
// If the suffix starts with 'm' but NOT 'maj', the 'm' is a minor indicator
// and stays inline with the root (e.g. Dm, Em7, Bm7b5, Am(maj7)).
// Only the remaining suffix becomes the superscript.
// When the suffix starts with 'maj', the 'm' is part of 'maj7' and stays
// in the superscript (e.g. Cmaj7 → C + superscript maj7).
//
// Props:
//   label: string — the chord label (e.g. 'Bo', 'C+', 'Cmaj7', 'Am7', 'Bm7b5')
//   className: string (optional) — additional CSS classes for the base text
//   supClassName: string (optional) — additional CSS classes for the superscript
export default function ChordLabel({ label, className = '', supClassName = '' }) {
  if (!label) return null

  // Root: letter A-G + optional accidental (#/b). Everything else is the suffix.
  const match = label.match(/^([A-G][#b]?)(.*)$/)
  if (!match) {
    return <span className={className}>{label}</span>
  }

  let base = match[1]
  let suffix = match[2]

  // If suffix starts with 'm' but not 'maj', the 'm' is a minor indicator — keep it inline.
  if (suffix.startsWith('m') && !suffix.startsWith('maj')) {
    base += 'm'
    suffix = suffix.slice(1)
  }

  return (
    <span className={className}>
      {base}
      {suffix && (
        <span
          className={supClassName}
          style={{ verticalAlign: 'super', fontSize: '0.65em', lineHeight: 0 }}
        >
          {suffix}
        </span>
      )}
    </span>
  )
}
