"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Clock, ChevronDown, ChevronUp, Navigation, Filter } from "lucide-react";
import { useMapContext, LAYER_META, LAYER_ORDER, MapLayer } from "./MapContext";
import { useMapItems, MapItem } from "@/hooks/useMapItems";
import { formatDistanceToNow } from "date-fns";

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
  const { map, mode, setMode, activeLayer, setActiveLayer, selectItem, desktopListOpen, setDesktopListOpen, filterLayer, setFilterLayer } = useMapContext();
  const meta = LAYER_META[activeLayer];
  const now = useLiveClock();

  const allItemsQuery = useMapItems(activeLayer, undefined);
  const items = allItemsQuery.data ?? [];
  const totalCount = items.length;
  const highCount = items.filter((s) => s.score >= 10).length;
  const midCount = items.filter((s) => s.score >= 5 && s.score < 10).length;

  // Fetch items for filter layer if different from activeLayer
  const filterItemsQuery = useMapItems(filterLayer && filterLayer !== activeLayer ? filterLayer : activeLayer, undefined);
  const displayItems = filterLayer
    ? (filterLayer === activeLayer ? items : (filterItemsQuery.data ?? []))
    : items;

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

  function handleItemClick(item: MapItem) {
    selectItem(item);
    setDesktopListOpen(false);
    if (map && item.lat && item.lng) {
      map.setView([item.lat, item.lng], 17, { animate: true });
    }
  }

  function handleFilterClick(layer: MapLayer) {
    if (filterLayer === layer) {
      setFilterLayer(null); // Clear filter
    } else {
      setFilterLayer(layer);
      setActiveLayer(layer);
    }
  }

  function getItemTitle(item: MapItem): string {
    if ("title" in item && item.title) return item.title;
    if ("name" in item && item.name) return item.name;
    if ("product_name" in item && item.product_name) return item.product_name;
    return "Unknown";
  }

  function getItemSubtitle(item: MapItem): string {
    const layer = item._layer;
    switch (layer) {
      case "biriyani": return ("food_type" in item ? item.food_type : "") || "Food spot";
      case "toilet": return ("notes" in item ? item.notes : "") || "Public toilet";
      case "goods": return ("shop_name" in item ? `${item.shop_name}` : "Shop");
      case "violence": return ("incident_type" in item ? item.incident_type : "") || "Incident";
    }
  }

  function getItemTime(item: MapItem): string {
    if ("created_at" in item && item.created_at) {
      try { return formatDistanceToNow(new Date(item.created_at as string), { addSuffix: true }); }
      catch { return ""; }
    }
    return "";
  }

  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setDesktopListOpen(false);
      }
    }
    if (desktopListOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [desktopListOpen, setDesktopListOpen]);

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

          {/* Stats Badge — INTERACTIVE */}
          <div className="pointer-events-auto shrink-0 animate-slide-in-right relative" ref={panelRef}>
            <button
              onClick={() => setDesktopListOpen(!desktopListOpen)}
              className={`topbar-card bg-slate-900/95 text-white px-3 py-2 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-800/95 transition-all duration-200 ${desktopListOpen ? "ring-2 ring-blue-400/40" : ""}`}
            >
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
              <div className="w-px h-5 bg-slate-700" />
              {desktopListOpen ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </button>

            {/* ── Desktop List Panel Dropdown ── */}
            {desktopListOpen && (
              <div className="desktop-list-panel absolute top-full right-0 mt-2 w-[380px] rounded-2xl overflow-hidden animate-fade-up z-[1001]">
                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                  <Filter size={12} className="text-slate-400 shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter</span>
                  {LAYER_ORDER.map((layerId) => {
                    const lm = LAYER_META[layerId];
                    const isActive = filterLayer === layerId;
                    return (
                      <button
                        key={layerId}
                        onClick={() => handleFilterClick(layerId)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1 ${isActive
                          ? `${lm.accentBg} text-white shadow-sm`
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                          }`}
                      >
                        <span className="text-xs">{lm.emoji}</span>
                        {lm.label}
                      </button>
                    );
                  })}
                </div>

                {/* Items List Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50 bg-white/90">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{filterLayer ? LAYER_META[filterLayer].emoji : meta.emoji}</span>
                    <span className="text-xs font-bold text-slate-800">
                      {filterLayer ? LAYER_META[filterLayer].statLabel : meta.statLabel}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {displayItems.length}
                    </span>
                  </div>
                  <button onClick={() => setDesktopListOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>

                {/* Scrollable Items */}
                <div className="overflow-y-auto max-h-[50vh] divide-y divide-slate-50 bg-white/98">
                  {displayItems.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-slate-400 font-medium">No items found</p>
                      <p className="text-[10px] text-slate-300 mt-1">Be the first to add one!</p>
                    </div>
                  ) : displayItems.map((item) => {
                    const itemMeta = LAYER_META[item._layer];
                    const timeStr = getItemTime(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="stagger-item w-full text-left px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2.5"
                      >
                        <div className={`w-7 h-7 rounded-lg ${itemMeta.accentBg}/10 flex items-center justify-center text-sm shrink-0`}>
                          {itemMeta.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-slate-800 truncate">{getItemTitle(item)}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 truncate">{getItemSubtitle(item)}</span>
                            {timeStr && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-400 timestamp">
                                <Clock size={8} />{timeStr}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`text-[10px] font-bold ${item.score >= 5 ? "text-green-600" : item.score >= 0 ? "text-slate-500" : "text-red-500"}`}>
                            {item.score > 0 ? `+${item.score}` : item.score}
                          </span>
                          <Navigation size={10} className="text-slate-300" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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