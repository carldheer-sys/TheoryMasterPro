import { getRomanParts } from '../utils/musicTheory'

// Renders a Roman numeral with the chord-quality extension as a CSS superscript.
// Uses vertical-align: super + smaller font-size instead of Unicode superscripts
// so all characters (including 'a', 'j', 'b') render correctly.
//
// Props:
//   roman: string — the roman numeral string (e.g. 'Imaj7', 'viim7b5', 'V7/ii')
//   figuredBass: string (optional) — figured bass symbol to append (e.g. '6', '6/5')
//   bassDegree: string (optional) — slash notation bass degree (e.g. '5', 'b6')
//   className: string (optional) — additional CSS classes for the base text
//   supClassName: string (optional) — additional CSS classes for the superscript
export default function RomanNumeral({ roman, figuredBass, bassDegree, className = '', supClassName = '' }) {
  if (!roman) return null
  const { base, superscript, secondary } = getRomanParts(roman)

  return (
    <span className={className}>
      {base}
      {superscript && (
        <span
          className={supClassName}
          style={{ verticalAlign: 'super', fontSize: '0.65em', lineHeight: 0 }}
        >
          {superscript}
        </span>
      )}
      {secondary && <span>{secondary}</span>}
      {figuredBass && (
        <span
          className={supClassName}
          style={{ verticalAlign: 'super', fontSize: '0.65em', lineHeight: 0 }}
        >
          {figuredBass}
        </span>
      )}
      {bassDegree && <span>/{bassDegree}</span>}
    </span>
  )
}
