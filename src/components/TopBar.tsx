"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { useMapContext, MapLayer } from "./MapContext";
import { useMapItems } from "@/hooks/useMapItems";

const LAYER_CONFIG: Record<MapLayer, { placeholder: string; bannerText: string; bannerBg: string; bannerDot: string; bannerText2: string; statLabel: string }> = {
  biriyani: {
    placeholder: "Search area (e.g. Uttara, Mirpur)",
    bannerText: "Tap anywhere on the map to drop a biriyani spot",
    bannerBg: "bg-amber-50/90 border-amber-200/50",
    bannerDot: "bg-amber-400",
    bannerText2: "text-amber-800",
    statLabel: "Spots",
  },
  toilet: {
    placeholder: "Search area for toilets...",
    bannerText: "Tap anywhere on the map to add a toilet",
    bannerBg: "bg-blue-50/90 border-blue-200/50",
    bannerDot: "bg-blue-400",
    bannerText2: "text-blue-800",
    statLabel: "Toilets",
  },
  goods: {
    placeholder: "Search area for prices...",
    bannerText: "Tap anywhere on the map to add a price report",
    bannerBg: "bg-emerald-50/90 border-emerald-200/50",
    bannerDot: "bg-emerald-400",
    bannerText2: "text-emerald-800",
    statLabel: "Prices",
  },
  violence: {
    placeholder: "Search area for reports...",
    bannerText: "Tap anywhere on the map to report an incident",
    bannerBg: "bg-red-50/90 border-red-200/50",
    bannerDot: "bg-red-400",
    bannerText2: "text-red-800",
    statLabel: "Reports",
  },
};

const LAYER_ACCENT: Record<MapLayer, string> = {
  biriyani: "text-amber-500",
  toilet: "text-blue-500",
  goods: "text-emerald-500",
  violence: "text-red-500",
};

const LAYER_DOT: Record<MapLayer, string> = {
  biriyani: "bg-amber-400",
  toilet: "bg-blue-400",
  goods: "bg-emerald-400",
  violence: "bg-red-400",
};

export default function TopBar() {
  const [q, setQ] = useState("");
  const { map, mode, setMode, activeLayer } = useMapContext();
  const config = LAYER_CONFIG[activeLayer];

  // Live counts
  const allItemsQuery = useMapItems(activeLayer, undefined);
  const items = allItemsQuery.data ?? [];
  const totalCount = items.length;
  const highScoreCount = items.filter((s) => s.score >= 10).length;
  const midScoreCount = items.filter((s) => s.score >= 5 && s.score < 10).length;

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!q || !map) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "UniversalMaps/1.0" } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15, { animate: true });
      }
    } catch (err) {
      console.error("Geocode error:", err);
    }
  }

  function handleLocate() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true }),
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none"
      style={{ left: "calc(16px + 56px + 16px)" }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="topbar-card pointer-events-auto flex items-center px-4 py-2.5 gap-3 w-full max-w-xl rounded-xl"
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder={config.placeholder}
            className="bg-transparent outline-none text-slate-700 text-sm font-medium w-full placeholder:text-slate-400"
          />
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />
          <button type="button" onClick={handleLocate} aria-label="Locate me" className="shrink-0">
            <MapPin size={16} className={`${LAYER_ACCENT[activeLayer]} cursor-pointer hover:scale-110 transition`} />
          </button>
        </form>

        {/* Live status badge */}
        <div className="ml-auto hidden md:flex pointer-events-auto">
          <div className="topbar-card bg-slate-900/95 text-white px-4 py-2 rounded-xl flex items-center gap-4">
            <div className="flex flex-col leading-none">
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{config.statLabel}</span>
              <span className="text-sm font-bold">{allItemsQuery.isLoading ? "…" : totalCount}</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${LAYER_DOT[activeLayer]} opacity-70`} />
              <span className="text-sm font-bold">{midScoreCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${LAYER_DOT[activeLayer]} animate-pulse`} />
              <span className="text-sm font-bold">{highScoreCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Mode Banner */}
      {mode === "addSpot" && (
        <div className={`topbar-card pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl ${config.bannerBg} animate-fade-up`}>
          <div className={`w-2 h-2 rounded-full ${config.bannerDot} animate-pulse shrink-0`} />
          <p className={`text-sm font-medium ${config.bannerText2} flex-1`}>
            {config.bannerText}
          </p>
          <button
            onClick={() => setMode("browse")}
            className="p-1 hover:bg-white/50 rounded-lg transition shrink-0"
            aria-label="Cancel"
          >
            <X size={16} className={config.bannerText2} />
          </button>
        </div>
      )}
    </div>
  );
}