"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useMapContext } from "./MapContext";
import { useSpots } from "@/hooks/useSpots";

export default function TopBar() {
  const [q, setQ] = useState("");
  const { map, verifiedOnly, setVerifiedOnly } = useMapContext();

  // Fetch all spots (no bbox) to compute live totals for the header badge
  const allSpotsQuery = useSpots(undefined, false);
  const totalSpots = allSpotsQuery.data?.length ?? 0;
  const verifiedSpots = allSpotsQuery.data?.filter((s) => s.verified).length ?? 0;

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!q || !map) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "IftarMaps/1.0" } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 15, { animate: true });
      }
    } catch (err) {
      console.error("Geocode error:", err);
    }
  }

  function handleLocate() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3 pointer-events-none">
      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="ui-card pointer-events-auto flex items-center px-3 sm:px-4 py-2 gap-3 w-full max-w-xl md:max-w-2xl rounded-lg border border-slate-100"
      >
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="text"
          placeholder="Search area (e.g. Uttara, Mirpur)"
          className="bg-transparent outline-none text-slate-700 text-sm font-medium w-full placeholder:text-slate-400"
        />
        <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
        <button type="button" onClick={handleLocate} aria-label="Locate me">
          <MapPin size={18} className="text-orange-500 cursor-pointer hover:scale-110 transition shrink-0" />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-3 pointer-events-auto">
        {/* Live stats badge */}
        <div className="hidden md:flex ui-card bg-slate-900 text-white shadow px-4 py-2 rounded-lg items-center gap-3">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spots / Verified</span>
            <span className="text-sm font-bold">
              {allSpotsQuery.isLoading ? "…" : `${totalSpots} / ${verifiedSpots}`}
            </span>
          </div>
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        {/* Verified-only toggle */}
        <div className="ui-card px-3 py-2 rounded-lg flex items-center gap-2">
          <label className="text-sm text-slate-600 select-none cursor-pointer">Verified only</label>
          <button
            onClick={() => setVerifiedOnly((s) => !s)}
            className={`w-10 h-6 flex items-center p-1 rounded-full transition ${verifiedOnly ? "bg-green-500" : "bg-slate-200"
              }`}
            aria-pressed={verifiedOnly}
            aria-label="Toggle verified only"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition ${verifiedOnly ? "translate-x-4" : ""
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}