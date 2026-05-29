export default function WareTrackLogo({ className = "w-full h-full" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 185"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* LEFT WAREHOUSE */}
      <polyline
        points="15,92 55,52 95,92"
        stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
      />
      <rect x="15" y="92" width="80" height="48" stroke="white" strokeWidth="5" strokeLinejoin="round"/>
      {/* 2×2 window */}
      <rect x="31" y="66" width="9" height="8" fill="white" rx="1"/>
      <rect x="43" y="66" width="9" height="8" fill="white" rx="1"/>
      <rect x="31" y="77" width="9" height="8" fill="white" rx="1"/>
      <rect x="43" y="77" width="9" height="8" fill="white" rx="1"/>
      {/* boxes */}
      <rect x="22" y="108" width="16" height="16" fill="white" rx="1"/>
      <rect x="41" y="108" width="16" height="16" fill="white" rx="1"/>

      {/* CENTER WAREHOUSE (hexagonal outline) */}
      <path
        d="M140,10 L178,36 L182,92 L182,148 L98,148 L98,92 L102,36 Z"
        stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* 2×2 window */}
      <rect x="122" y="44" width="11" height="10" fill="white" rx="1"/>
      <rect x="137" y="44" width="11" height="10" fill="white" rx="1"/>
      <rect x="122" y="57" width="11" height="10" fill="white" rx="1"/>
      <rect x="137" y="57" width="11" height="10" fill="white" rx="1"/>
      {/* Door arch */}
      <path
        d="M113,148 L113,110 Q140,88 167,110 L167,148"
        stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"
      />
      {/* Isometric package */}
      <path
        d="M140,76 L158,87 L158,107 L140,118 L122,107 L122,87 Z"
        stroke="white" strokeWidth="4" strokeLinejoin="round"
      />
      <line x1="140" y1="76" x2="140" y2="118" stroke="white" strokeWidth="4"/>
      <line x1="122" y1="87" x2="158" y2="87" stroke="white" strokeWidth="4"/>

      {/* RIGHT WAREHOUSE */}
      <polyline
        points="185,92 225,52 265,92"
        stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
      />
      <rect x="185" y="92" width="80" height="48" stroke="white" strokeWidth="5" strokeLinejoin="round"/>
      {/* 2×2 window */}
      <rect x="201" y="66" width="9" height="8" fill="white" rx="1"/>
      <rect x="213" y="66" width="9" height="8" fill="white" rx="1"/>
      <rect x="201" y="77" width="9" height="8" fill="white" rx="1"/>
      <rect x="213" y="77" width="9" height="8" fill="white" rx="1"/>
      {/* boxes */}
      <rect x="192" y="108" width="16" height="16" fill="white" rx="1"/>
      <rect x="211" y="108" width="16" height="16" fill="white" rx="1"/>

      {/* NETWORK NODES */}
      <circle cx="55"  cy="148" r="9" stroke="white" strokeWidth="5" fill="none"/>
      <circle cx="140" cy="163" r="9" stroke="white" strokeWidth="5" fill="none"/>
      <circle cx="225" cy="148" r="9" stroke="white" strokeWidth="5" fill="none"/>
      <path d="M55,148 C85,172 115,168 140,163"  stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M225,148 C195,172 165,168 140,163" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}