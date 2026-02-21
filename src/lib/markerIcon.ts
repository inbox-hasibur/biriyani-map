"use client";

import L from "leaflet";

// Score-to-color logic:
//   score >= 5  → green  (Verified)
//   score <= -5 → hidden (caller filters these out)
//   else        → amber  (Pending)
function getMarkerColor(verified: boolean, score: number): { fill: string; glow: string } {
  if (verified || score >= 5) return { fill: "#22c55e", glow: "rgba(34,197,94,0.35)" };
  if (score < 0) return { fill: "#f59e0b", glow: "rgba(245,158,11,0.30)" };
  return { fill: "#f59e0b", glow: "rgba(245,158,11,0.30)" };
}

export function createCustomMarker(verified: boolean = false, score: number = 0): L.DivIcon {
  const { fill, glow } = getMarkerColor(verified, score);
  const label = verified ? "✓" : String(score > 0 ? `+${score}` : score);

  // Google Maps-style teardrop pin rendered in SVG — clean and sharp at any zoom
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${glow}" />
        </filter>
      </defs>
      <!-- Teardrop body -->
      <path
        d="M16 2C9.373 2 4 7.373 4 14c0 9.333 12 26 12 26S28 23.333 28 14C28 7.373 22.627 2 16 2z"
        fill="${fill}"
        stroke="white"
        stroke-width="2"
        filter="url(#shadow)"
      />
      <!-- Inner white circle -->
      <circle cx="16" cy="14" r="6" fill="white" opacity="0.9" />
      <!-- Score / checkmark label -->
      <text
        x="16" y="18"
        text-anchor="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="${label.length > 2 ? '6' : '8'}"
        font-weight="700"
        fill="${fill}"
      >${label}</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
    className: "", // clear leaflet default bg/border
  });
}
