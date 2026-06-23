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
      </defs>
      {/* Rounded square background */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logoGrad)" />
      {/* Mini piano keys */}
      <rect x="14" y="18" width="6" height="28" rx="1.5" fill="#fff" opacity="0.95" />
      <rect x="22" y="18" width="6" height="28" rx="1.5" fill="#fff" opacity="0.95" />
      <rect x="30" y="18" width="6" height="28" rx="1.5" fill="#fff" opacity="0.95" />
      <rect x="38" y="18" width="6" height="28" rx="1.5" fill="#fff" opacity="0.95" />
      <rect x="46" y="18" width="6" height="28" rx="1.5" fill="#fff" opacity="0.95" />
      {/* Black keys */}
      <rect x="18.5" y="18" width="5" height="18" rx="1.5" fill="#1a1a24" />
      <rect x="26.5" y="18" width="5" height="18" rx="1.5" fill="#1a1a24" />
      <rect x="42.5" y="18" width="5" height="18" rx="1.5" fill="#1a1a24" />
      <rect x="50.5" y="18" width="5" height="18" rx="1.5" fill="#1a1a24" />
      {/* Accent dot (the "degree" marker) */}
      <circle cx="33" cy="50" r="3" fill="#ff3b3b" />
    </svg>
  )
}
