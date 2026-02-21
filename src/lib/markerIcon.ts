"use client";

import L from "leaflet";

// Score-based marker colours:
//   0–4   → Grey   (Unconfirmed)
//   5–9   → Yellow (Almost Confirmed)
//   10+   → Green  (Confirmed)
//   < 0   → Grey   (Negative score, still visible unless hidden by DB trigger at -5)

export type TrustLevel = "unconfirmed" | "almost" | "confirmed";

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 10) return "confirmed";
  if (score >= 5) return "almost";
  return "unconfirmed";
}

const COLORS: Record<TrustLevel, { fill: string; glow: string; label: string }> = {
  confirmed: { fill: "#16a34a", glow: "rgba(22,163,74,0.35)", label: "Confirmed" },
  almost: { fill: "#eab308", glow: "rgba(234,179,8,0.30)", label: "Almost Confirmed" },
  unconfirmed: { fill: "#94a3b8", glow: "rgba(148,163,184,0.25)", label: "Unconfirmed" },
};

export function getTrustMeta(score: number) {
  return COLORS[getTrustLevel(score)];
}

export function createCustomMarker(score: number = 0): L.DivIcon {
  const { fill, glow } = getTrustMeta(score);
  const level = getTrustLevel(score);
  const innerIcon = level === "confirmed" ? "✓" : String(score);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">
      <defs>
        <filter id="s${score}" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${glow}" />
        </filter>
      </defs>
      <path
        d="M17 2C9.82 2 4 7.82 4 15c0 10 13 28 13 28s13-18 13-28c0-7.18-5.82-13-13-13z"
        fill="${fill}"
        stroke="white"
        stroke-width="2.5"
        filter="url(#s${score})"
      />
      <circle cx="17" cy="15" r="7" fill="white" opacity="0.92" />
      <text
        x="17" y="19"
        text-anchor="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="${innerIcon.length > 2 ? '7' : '9'}"
        font-weight="700"
        fill="${fill}"
      >${innerIcon}</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -48],
    className: "",
  });
}
