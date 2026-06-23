/**
 * Logo — TheoryMasterPro brand mark.
 * A stylized keyboard + treble clef combination in accent purple.
 * Used both in the header and as the PWA icon basis.
 */
export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TheoryMasterPro logo"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9d86ff" />
          <stop offset="1" stopColor="#7c5cfc" />
        </linearGradient>
        <linearGradient id="whiteKeyGrad" x1="0" y1="16" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e8f0" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logoGrad)" />
      {/* White keys: C D E F G A B C (8 keys) */}
      <rect x="8" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      <rect x="15" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      <rect x="22" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      <rect x="29" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      <rect x="36" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      <rect x="43" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      <rect x="50" y="16" width="6" height="32" rx="1" fill="url(#whiteKeyGrad)" />
      {/* Black keys: C# D# F# G# A# (5 keys) */}
      <rect x="12" y="16" width="5" height="20" rx="1" fill="#1a1a24" />
      <rect x="19" y="16" width="5" height="20" rx="1" fill="#1a1a24" />
      <rect x="33" y="16" width="5" height="20" rx="1" fill="#1a1a24" />
      <rect x="40" y="16" width="5" height="20" rx="1" fill="#1a1a24" />
      <rect x="47" y="16" width="5" height="20" rx="1" fill="#1a1a24" />
    </svg>
  )
}
