"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { useMapContext } from "./MapContext";
import { useSpots } from "@/hooks/useSpots";
import { getTrustLevel } from "@/lib/trustLevel";

export default function TopBar() {
  const [q, setQ] = useState("");
  const { map, mode, setMode } = useMapContext();

  // Live counts
  const allSpotsQuery = useSpots(undefined);
  const spots = allSpotsQuery.data ?? [];
  const totalSpots = spots.length;
  const confirmedCount = spots.filter((s) => getTrustLevel(s.score) === "confirmed").length;
  const almostCount = spots.filter((s) => getTrustLevel(s.score) === "almost").length;

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!q || !map) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "IftarMaps/1.0" } });
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
      {/* Main row — search + stats */}
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
            placeholder="Search area (e.g. Uttara, Mirpur)"
            className="bg-transparent outline-none text-slate-700 text-sm font-medium w-full placeholder:text-slate-400"
          />
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />
          <button type="button" onClick={handleLocate} aria-label="Locate me" className="shrink-0">
            <MapPin size={16} className="text-orange-500 cursor-pointer hover:scale-110 transition" />
          </button>
        </form>

        {/* Live status badge */}
        <div className="ml-auto hidden md:flex pointer-events-auto">
          <div className="topbar-card bg-slate-900/95 text-white px-4 py-2 rounded-xl flex items-center gap-4">
            <div className="flex flex-col leading-none">
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
              <span className="text-sm font-bold">{allSpotsQuery.isLoading ? "…" : totalSpots}</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-bold">{almostCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-bold">{confirmedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Spot Mode Banner */}
      {mode === "addSpot" && (
        <div className="topbar-card pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50/90 border-amber-200/50 animate-fade-up">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <p className="text-sm font-medium text-amber-800 flex-1">
            Tap anywhere on the map to drop a new spot
          </p>
          <button
            onClick={() => setMode("browse")}
            className="p-1 hover:bg-amber-100 rounded-lg transition shrink-0"
            aria-label="Cancel adding spot"
          >
            <X size={16} className="text-amber-600" />
          </button>
        </div>
      )}
    </div>
  );
}