// Decorative checklist illustration for the auth screens (pure inline SVG).
export default function AuthIllustration() {
  return (
    // No fixed width/height: the CSS (.auth-art) sizes it fluidly so it can
    // never overflow its column on any viewport.
    <svg
      viewBox="0 0 340 230"
      role="img"
      aria-label="Illustration of a completed checklist"
    >
      {/* soft background blobs */}
      <ellipse cx="86" cy="200" rx="120" ry="46" fill="rgba(255,255,255,0.14)" />
      <circle cx="300" cy="38" r="26" fill="rgba(255,255,255,0.1)" />
      <circle cx="318" cy="150" r="10" fill="rgba(255,255,255,0.16)" />

      {/* window card */}
      <rect x="70" y="26" width="220" height="176" rx="14" fill="#FFFFFF" stroke="rgba(255,255,255,0.35)" />
      <rect x="70" y="26" width="220" height="34" rx="14" fill="#EDEBFC" />
      <rect x="70" y="46" width="220" height="14" fill="#EDEBFC" />
      <circle cx="90" cy="43" r="4" fill="#5B4CE2" opacity="0.55" />
      <circle cx="104" cy="43" r="4" fill="#5B4CE2" opacity="0.3" />
      <circle cx="118" cy="43" r="4" fill="#5B4CE2" opacity="0.15" />

      {/* checklist rows */}
      <g>
        <rect x="92" y="76" width="18" height="18" rx="5" fill="#5B4CE2" />
        <path d="m96 85 3.5 3.5L106 82" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="120" y="80" width="128" height="9" rx="4.5" fill="#E5E7EB" />

        <rect x="92" y="108" width="18" height="18" rx="5" fill="#5B4CE2" />
        <path d="m96 117 3.5 3.5L106 114" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="120" y="112" width="104" height="9" rx="4.5" fill="#E5E7EB" />

        <rect x="92" y="140" width="18" height="18" rx="5" fill="#FFFFFF" stroke="#B4ABF0" strokeWidth="2" />
        <rect x="120" y="144" width="118" height="9" rx="4.5" fill="#EEF0F6" />

        <rect x="92" y="172" width="18" height="18" rx="5" fill="#FFFFFF" stroke="#B4ABF0" strokeWidth="2" />
        <rect x="120" y="176" width="88" height="9" rx="4.5" fill="#EEF0F6" />
      </g>

      {/* floating check bubble */}
      <g>
        <circle cx="296" cy="96" r="22" fill="#4C3FD0" />
        <path d="m287 96 6 6 12-12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* leaves */}
      <path d="M40 176c-14-8-20-24-14-38 14 2 24 14 24 30" fill="rgba(255,255,255,0.35)" />
      <path d="M52 186c2-16 14-28 30-28-2 16-14 28-30 28" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}
