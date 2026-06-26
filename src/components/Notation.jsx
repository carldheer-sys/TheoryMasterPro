/**
 * Notation — renders a string with ♭ wrapped in a span so the spacing
 * around the flat symbol can be tuned independently via CSS (.flat-adjust).
 * Pass the already-displayNotation-processed string as `text`.
 */
export default function Notation({ text }) {
  if (text == null) return text
  const str = String(text)
  if (!str.includes('♭')) return str
  const parts = str.split('♭')
  return (
    <>
      {parts.map((part, i) => (
        i < parts.length - 1
          ? <span key={i}>{part}<span className="flat-adjust">♭</span></span>
          : <span key={i}>{part}</span>
      ))}
    </>
  )
}
