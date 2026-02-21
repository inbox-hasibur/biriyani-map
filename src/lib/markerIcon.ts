"use client";

// Client-only: this file imports Leaflet which requires `window`.
// Do NOT import this in server-rendered components.
import L from "leaflet";
import { getTrustMeta } from "./trustLevel";

export function createCustomMarker(score: number = 0): L.DivIcon {
  const { fill, glow } = getTrustMeta(score);
  const level = score >= 10 ? "confirmed" : score >= 5 ? "almost" : "unconfirmed";
  const innerIcon = level === "confirmed" ? "✓" : String(score);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">
      <defs>
        <filter id="sh" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${glow}" />
        </filter>
      </defs>
      <path
        d="M17 2C9.82 2 4 7.82 4 15c0 10 13 28 13 28s13-18 13-28c0-7.18-5.82-13-13-13z"
        fill="${fill}"
        stroke="white"
        stroke-width="2.5"
        filter="url(#sh)"
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
