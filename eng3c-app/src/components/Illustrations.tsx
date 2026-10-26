/** Flat classroom illustrations drawn with theme tokens so they work on the whiteboard and the chalkboard. */

export function DeskScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 170" className={className} role="img" aria-label="A notebook, a pencil, a stack of books with an apple, and a gold star">
      <rect x="6" y="152" width="248" height="7" rx="3.5" className="fill-line" />
      {/* notebook */}
      <g transform="rotate(-6 85 105)">
        <rect x="22" y="60" width="128" height="88" rx="9" className="fill-surface stroke-line" strokeWidth="2.5" />
        {[82, 94, 106, 118, 130, 142].map((y) => (
          <line key={y} x1="36" x2="142" y1={y} y2={y} className="stroke-hlThesis" strokeOpacity="0.45" strokeWidth="1.2" />
        ))}
        <line x1="46" x2="46" y1="64" y2="146" className="stroke-pen" strokeOpacity="0.55" strokeWidth="1.4" />
        {[70, 82, 94, 106, 118, 130, 142].map((y) => (
          <circle key={y} cx="22" cy={y} r="3.2" className="fill-bg stroke-muted" strokeWidth="1.5" />
        ))}
        <path d="M52 79 q4 -5 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" className="stroke-ink" strokeOpacity="0.5" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M52 91 q4 -5 8 0 t8 0 t8 0 t8 0" className="stroke-ink" strokeOpacity="0.5" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <rect x="50" y="98" width="40" height="9" rx="2" className="fill-hlOpinion" fillOpacity="0.75" />
        <path d="M52 103 q4 -5 8 0 t8 0 t8 0 t8 0" className="stroke-ink" strokeOpacity="0.55" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M96 103 q4 -5 8 0 t8 0 t8 0" className="stroke-ink" strokeOpacity="0.5" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M118 124 l6 7 l12 -15" className="stroke-good" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* pencil */}
      <g transform="translate(30 150) rotate(-14)">
        <polygon points="0,0 -16,5.5 0,11" className="fill-note stroke-line" strokeWidth="1" />
        <polygon points="-10.5,3.6 -16,5.5 -10.5,7.4" className="fill-ink" />
        <rect x="0" y="0" width="90" height="11" rx="1.5" className="fill-sun" />
        <line x1="2" x2="88" y1="3.7" y2="3.7" className="stroke-ink" strokeOpacity="0.12" />
        <line x1="2" x2="88" y1="7.3" y2="7.3" className="stroke-ink" strokeOpacity="0.12" />
        <rect x="90" y="0" width="9" height="11" className="fill-line" />
        <rect x="99" y="0" width="11" height="11" rx="3" className="fill-mod2" />
      </g>
      {/* books */}
      <rect x="160" y="133" width="86" height="19" rx="3" className="fill-strandB" />
      <rect x="236" y="136" width="7" height="13" rx="1" className="fill-surface" />
      <rect x="170" y="140" width="28" height="4" rx="2" className="fill-surface" fillOpacity="0.6" />
      <rect x="167" y="115" width="76" height="18" rx="3" className="fill-strandC" />
      <rect x="233" y="118" width="7" height="12" rx="1" className="fill-surface" />
      <rect x="176" y="122" width="22" height="4" rx="2" className="fill-surface" fillOpacity="0.6" />
      <rect x="157" y="97" width="80" height="18" rx="3" className="fill-strandA" />
      <rect x="227" y="100" width="7" height="12" rx="1" className="fill-surface" />
      <rect x="166" y="104" width="30" height="4" rx="2" className="fill-surface" fillOpacity="0.6" />
      {/* apple */}
      <path d="M204 80 c-6 -5 -17 -2 -17 8 c0 9 7 16 13 14 c2 -0.8 4 -0.8 6 0 c6 2 13 -5 13 -14 c0 -10 -10 -13 -15 -8 z" className="fill-mod2" />
      <path d="M204 81 q1 -6 4 -9" className="stroke-ink" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M207 74 q8 -7 13 0 q-7 5 -13 0 z" className="fill-good" />
      <ellipse cx="196" cy="86" rx="2.5" ry="4" className="fill-surface" fillOpacity="0.45" transform="rotate(20 196 86)" />
      {/* gold star and sparkles */}
      <path transform="translate(228 36) rotate(12)" d="M0 -15 L4.4 -5 L15 -4.6 L6.8 2.4 L9.3 13 L0 7.2 L-9.3 13 L-6.8 2.4 L-15 -4.6 L-4.4 -5 Z" className="fill-sun stroke-surface" strokeWidth="2" strokeLinejoin="round" />
      <path transform="translate(176 30)" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" className="fill-sun" />
      <path transform="translate(26 36) scale(0.8)" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" className="fill-primary" />
      <path transform="translate(150 52) scale(0.6)" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" className="fill-strandD" />
    </svg>
  );
}
