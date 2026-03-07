"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { useMapContext, LAYER_META } from "./MapContext";
import { useMapItems } from "@/hooks/useMapItems";

export default function TopBar() {
  const [q, setQ] = useState("");
  const { map, mode, setMode, activeLayer } = useMapContext();
  const meta = LAYER_META[activeLayer];

  const allItemsQuery = useMapItems(activeLayer, undefined);
  const items = allItemsQuery.data ?? [];
  const totalCount = items.length;
  const highCount = items.filter((s) => s.score >= 10).length;
  const midCount = items.filter((s) => s.score >= 5 && s.score < 10).length;

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!q || !map) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "UniMap/1.0" } });
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
    <>
      {/* ── Desktop TopBar ── */}
      <div className="hidden md:flex absolute top-4 right-4 z-[1000] flex-col gap-2 pointer-events-none"
        style={{ left: "204px" }}
      >
        <div className="flex items-center gap-3">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="topbar-card pointer-events-auto flex items-center px-4 py-2.5 gap-3 w-full max-w-xl rounded-2xl"
          >
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder={meta.searchHint}
              className="bg-transparent outline-none text-slate-700 text-sm font-medium w-full placeholder:text-slate-400"
            />
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <button type="button" onClick={handleLocate} aria-label="Locate me" className="shrink-0">
              <MapPin size={16} className={`${meta.accent} cursor-pointer hover:scale-110 transition`} />
            </button>
          </form>

          {/* Stats Badge */}
          <div className="ml-auto pointer-events-auto">
            <div className="topbar-card bg-slate-900/95 text-white px-4 py-2 rounded-2xl flex items-center gap-4">
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{meta.statLabel}</span>
                <span className="text-sm font-bold">{allItemsQuery.isLoading ? "…" : totalCount}</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-1.5" title="Medium (score 5-9)">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-sm font-bold">{midCount}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Confirmed (score 10+)">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold">{highCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Banner */}
        {mode === "addSpot" && (
          <div className={`topbar-card pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl ${meta.accentLight} animate-fade-up`}>
            <div className={`w-2 h-2 rounded-full ${meta.accentBg} animate-pulse shrink-0`} />
            <p className="text-sm font-medium flex-1">{meta.addBanner}</p>
            <button onClick={() => setMode("browse")} className="p-1 hover:bg-white/50 rounded-lg transition shrink-0" aria-label="Cancel">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile TopBar ── */}
      <div className="md:hidden absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            className="topbar-card pointer-events-auto flex items-center px-3.5 py-2.5 gap-2.5 flex-1 rounded-2xl"
          >
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder={meta.searchHint}
              className="bg-transparent outline-none text-slate-700 text-sm font-medium w-full placeholder:text-slate-400 min-w-0"
            />
            <button type="button" onClick={handleLocate} aria-label="Locate me" className="shrink-0">
              <MapPin size={16} className={`${meta.accent}`} />
            </button>
          </form>

          {/* Compact Stats */}
          <div className="topbar-card pointer-events-auto bg-slate-900/95 text-white px-3 py-2.5 rounded-2xl flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold">{allItemsQuery.isLoading ? "…" : totalCount}</span>
            <span className="text-[9px] text-slate-400 font-semibold">{meta.emoji}</span>
          </div>
        </div>

        {/* Mobile Add Banner */}
        {mode === "addSpot" && (
          <div className={`topbar-card pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mt-2 ${meta.accentLight} animate-fade-up`}>
            <div className={`w-2 h-2 rounded-full ${meta.accentBg} animate-pulse shrink-0`} />
            <p className="text-xs font-medium flex-1">{meta.addBanner}</p>
            <button onClick={() => setMode("browse")} className="p-0.5 rounded-lg transition shrink-0" aria-label="Cancel">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}