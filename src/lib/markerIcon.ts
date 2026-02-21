"use client";

import L from "leaflet";

export function createCustomMarker(verified: boolean = false, score: number = 0) {
  const bgColor = verified ? "#22c55e" : "#ffb300";
  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(180deg, ${bgColor} 0%, ${bgColor}dd 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 6px 14px rgba(8,18,41,0.16);
      border: 2px solid rgba(255,255,255,0.95);
      color: white;
      font-weight: bold;
      font-size: 10px;
      position: relative;
    ">
      <div style="transform: rotate(45deg); font-size: 12px; font-weight: 700;">
        ${verified ? "✓" : "?"}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
}
