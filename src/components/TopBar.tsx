"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Clock } from "lucide-react";
import { useMapContext, LAYER_META } from "./MapContext";
import { useMapItems } from "@/hooks/useMapItems";

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/* ── Animated Counter ── */
function AnimatedCount({ value, loading }: { value: number; loading: boolean }) {
  const [display, setDisplay] = useState(value);
  const [changed, setChanged] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setChanged(true);
      const start = prevRef.current;
      const diff = value - start;
      const steps = Math.min(Math.abs(diff), 10);
      const stepTime = 300 / Math.max(steps, 1);
      let current = 0;

      const interval = setInterval(() => {
        current++;
        const progress = current / steps;
        setDisplay(Math.round(start + diff * progress));
        if (current >= steps) {
          clearInterval(interval);
          setDisplay(value);
          setTimeout(() => setChanged(false), 200);
        }
      }, stepTime);

      prevRef.current = value;
      return () => clearInterval(interval);
    }
  }, [value]);

  if (loading) return <span className="stat-number">…</span>;
  return <span className={`stat-number ${changed ? "changed" : ""}`}>{display}</span>;
}

export default function TopBar() {
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { map, mode, setMode, activeLayer } = useMapContext();
  const meta = LAYER_META[activeLayer];
  const now = useLiveClock();

  const allItemsQuery = useMapItems(activeLayer, undefined);
  const items = allItemsQuery.data ?? [];
  const totalCount = items.length;
  const highCount = items.filter((s) => s.score >= 10).length;
  const midCount = items.filter((s) => s.score >= 5 && s.score < 10).length;

  const dateStr = now.toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" });

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!q || !map) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "UniMap/1.0" } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15, { animate: true });
        setQ("");
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
      <div className="hidden md:flex absolute top-3 right-3 z-[1000] flex-col gap-1.5 pointer-events-none"
        style={{ left: "190px" }}
      >
        <div className="flex items-center gap-2">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className={`topbar-card search-focus-glow pointer-events-auto flex items-center px-3 py-2 gap-2 w-full max-w-lg rounded-xl transition-all duration-300 ${searchFocused ? "ring-2 ring-blue-400/30 shadow-lg" : ""
              }`}
          >
            <Search size={14} className={`shrink-0 transition-colors duration-300 ${searchFocused ? "text-blue-500" : "text-slate-400"}`} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              type="text"
              placeholder={meta.searchHint}
              className="bg-transparent outline-none text-slate-700 text-xs font-medium w-full placeholder:text-slate-400"
            />
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button type="button" onClick={handleLocate} aria-label="Locate me" className="shrink-0">
              <MapPin size={14} className={`${meta.accent} cursor-pointer hover:scale-110 transition`} />
            </button>
          </form>

          {/* Live Clock */}
          <div className="pointer-events-auto topbar-card px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 animate-slide-in-right">
            <Clock size={12} className="text-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 timestamp">{timeStr}</span>
            <span className="text-[9px] text-slate-400">{dateStr}</span>
          </div>

          {/* Stats Badge */}
          <div className="pointer-events-auto shrink-0 animate-slide-in-right">
            <div className="topbar-card bg-slate-900/95 text-white px-3 py-2 rounded-xl flex items-center gap-3">
              <div className="flex flex-col leading-none">
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">{meta.statLabel}</span>
                <span className="text-xs font-bold"><AnimatedCount value={totalCount} loading={allItemsQuery.isLoading} /></span>
              </div>
              <div className="w-px h-5 bg-slate-700" />
              <div className="flex items-center gap-1" title="Medium (score 5-9)">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-xs font-bold"><AnimatedCount value={midCount} loading={allItemsQuery.isLoading} /></span>
              </div>
              <div className="flex items-center gap-1" title="Confirmed (score 10+)">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold"><AnimatedCount value={highCount} loading={allItemsQuery.isLoading} /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Banner */}
        {mode === "addSpot" && (
          <div className={`topbar-card pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl ${meta.accentLight} animate-fade-up`}>
            <div className={`w-1.5 h-1.5 rounded-full ${meta.accentBg} animate-pulse shrink-0`} />
            <p className="text-xs font-medium flex-1">{meta.addBanner}</p>
            <button onClick={() => setMode("browse")} className="p-0.5 hover:bg-white/50 rounded-lg transition shrink-0" aria-label="Cancel">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile TopBar (BIGGER for mobile) ── */}
      <div className="md:hidden absolute top-2 left-2 right-2 z-[1000] pointer-events-none">
        <div className="flex items-center gap-1.5">
          <form
            onSubmit={handleSearch}
            className={`topbar-card search-focus-glow pointer-events-auto flex items-center px-3 py-2.5 gap-2 flex-1 rounded-xl transition-all duration-300 ${searchFocused ? "ring-2 ring-blue-400/20 shadow-md animate-glow-pulse" : ""
              }`}
          >
            <Search size={14} className={`shrink-0 transition-colors duration-300 ${searchFocused ? "text-blue-500" : "text-slate-400"}`} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              type="text"
              placeholder={meta.searchHint}
              className="bg-transparent outline-none text-slate-700 text-sm font-medium w-full placeholder:text-slate-400 min-w-0"
            />
            <button type="button" onClick={handleLocate} aria-label="Locate me" className="shrink-0">
              <MapPin size={16} className={meta.accent} />
            </button>
          </form>

          {/* Compact Stats + Time — BIGGER */}
          <div className="topbar-card pointer-events-auto bg-slate-900/95 text-white px-2.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold"><AnimatedCount value={totalCount} loading={allItemsQuery.isLoading} /></span>
            <span className="text-xs text-slate-400">{meta.emoji}</span>
            <div className="w-px h-3 bg-slate-700" />
            <span className="text-[10px] text-slate-400 font-medium timestamp">{timeStr}</span>
          </div>
        </div>

        {/* Mobile Add Banner — BIGGER */}
        {mode === "addSpot" && (
          <div className={`topbar-card pointer-events-auto flex items-center gap-2 px-3 py-2.5 rounded-xl mt-1.5 ${meta.accentLight} animate-fade-up`}>
            <div className={`w-2 h-2 rounded-full ${meta.accentBg} animate-pulse shrink-0`} />
            <p className="text-xs font-medium flex-1">{meta.addBanner}</p>
            <button onClick={() => setMode("browse")} className="p-1 rounded-lg transition shrink-0" aria-label="Cancel">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}