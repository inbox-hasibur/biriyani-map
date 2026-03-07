"use client";

// Client-only: this file imports Leaflet which requires `window`.
import L from "leaflet";
import type { MapLayer } from "@/components/MapContext";

/* ── Layer color palettes ── */
const LAYER_COLORS: Record<MapLayer, { fill: string; glow: string }> = {
  biriyani: { fill: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
  toilet: { fill: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
  goods: { fill: "#10b981", glow: "rgba(16,185,129,0.35)" },
  violence: { fill: "#ef4444", glow: "rgba(239,68,68,0.35)" },
};

const LAYER_ICONS: Record<MapLayer, string> = {
  biriyani: "🍛",
  toilet: "🚻",
  goods: "💰",
  violence: "⚠",
};

/* ── Score-based trust for biriyani layer ── */
function getBiriyaniColor(score: number): { fill: string; glow: string } {
  if (score >= 10) return { fill: "#16a34a", glow: "rgba(22,163,74,0.35)" };
  if (score >= 5) return { fill: "#eab308", glow: "rgba(234,179,8,0.30)" };
  return { fill: "#94a3b8", glow: "rgba(148,163,184,0.25)" };
}

/* ── Violence intensity (more reports = more red) ── */
function getViolenceColor(score: number): { fill: string; glow: string } {
  if (score >= 10) return { fill: "#991b1b", glow: "rgba(153,27,27,0.45)" };
  if (score >= 5) return { fill: "#dc2626", glow: "rgba(220,38,38,0.40)" };
  return { fill: "#f87171", glow: "rgba(248,113,113,0.30)" };
}

export function createLayerMarker(layer: MapLayer, score: number = 0): L.DivIcon {
  let colors: { fill: string; glow: string };
  let innerContent: string;

  switch (layer) {
    case "biriyani":
      colors = getBiriyaniColor(score);
      innerContent = score >= 10 ? "✓" : String(score);
      break;
    case "violence":
      colors = getViolenceColor(score);
      innerContent = LAYER_ICONS.violence;
      break;
    default:
      colors = LAYER_COLORS[layer];
      innerContent = LAYER_ICONS[layer];
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">
      <defs>
        <filter id="sh-${layer}" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${colors.glow}" />
        </filter>
      </defs>
      <path
        d="M17 2C9.82 2 4 7.82 4 15c0 10 13 28 13 28s13-18 13-28c0-7.18-5.82-13-13-13z"
        fill="${colors.fill}"
        stroke="white"
        stroke-width="2.5"
        filter="url(#sh-${layer})"
      />
      <circle cx="17" cy="15" r="7" fill="white" opacity="0.92" />
      <text
        x="17" y="19"
        text-anchor="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="${innerContent.length > 2 ? '7' : '9'}"
        font-weight="700"
        fill="${colors.fill}"
      >${innerContent}</text>
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

// Keep backward compatibility
export function createCustomMarker(score: number = 0): L.DivIcon {
  return createLayerMarker("biriyani", score);
}
