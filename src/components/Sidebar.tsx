"use client";

import React, { useState } from "react";
import { UtensilsCrossed, PlusCircle, User, Locate, ShoppingBasket, AlertTriangle, Droplets, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Navigation, Star, X } from "lucide-react";
import { useMapContext, LAYER_META, LAYER_ORDER, MapLayer } from "./MapContext";
import { useMapItems, MapItem } from "@/hooks/useMapItems";

export default function Sidebar() {
  const { mode, setMode, activeLayer, setActiveLayer, map, selectItem } = useMapContext();
  const [collapsed, setCollapsed] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const meta = LAYER_META[activeLayer];

  // Fetch all items for the nearby list
  const itemsQuery = useMapItems(activeLayer, undefined);
  const items = itemsQuery.data ?? [];

  function handleLocate() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 16, { animate: true }),
      (err) => {
        console.warn("Geolocation error:", err);
        alert("Could not get your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const layerIcons: Record<MapLayer, React.ReactNode> = {
    biriyani: <UtensilsCrossed size={18} />,
    toilet: <Droplets size={18} />,
    goods: <ShoppingBasket size={18} />,
    violence: <AlertTriangle size={18} />,
  };

  function handleItemClick(item: MapItem) {
    selectItem(item);
    setListOpen(false);
    if (map && item.lat && item.lng) {
      map.setView([item.lat, item.lng], 17, { animate: true });
    }
  }

  return (
    <>
      {/* ── Desktop Dock ── */}
      <div className={`hidden md:fixed md:left-4 md:top-4 md:bottom-4 md:flex md:flex-col md:items-center z-[1000] pointer-events-none transition-all duration-300 ${collapsed ? "md:w-14" : "md:w-[180px]"}`}>
        <div className="sidebar-card pointer-events-auto flex flex-col py-4 h-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`flex items-center gap-2.5 px-3 mb-4 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0">U</div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-up">
                <div className="text-sm font-bold text-slate-800 leading-tight">UniMap</div>
                <div className="text-[10px] text-slate-400 font-medium">Universal Map</div>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded-md hover:bg-slate-100 text-slate-400 transition hidden md:flex shrink-0">
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {!collapsed && <div className="px-3 mb-2"><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Layers</span></div>}

          <div className="flex flex-col gap-1 px-2">
            {LAYER_ORDER.map((layerId) => {
              const lm = LAYER_META[layerId];
              const isActive = activeLayer === layerId;
              return (
                <button key={layerId} onClick={() => setActiveLayer(layerId)}
                  className={`group relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"} ${isActive ? `${lm.accentBg} text-white shadow-md` : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                  aria-label={lm.label}>
                  <span className="shrink-0">{layerIcons[layerId]}</span>
                  {!collapsed && <span className="text-sm font-medium truncate">{lm.label}</span>}
                  {collapsed && <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">{lm.label}</span>}
                </button>
              );
            })}
          </div>

          <div className={`${collapsed ? "mx-2" : "mx-3"} h-px bg-slate-200/60 my-3`} />

          <div className="px-2">
            <button onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`group relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"} ${mode === "addSpot" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
              aria-label={meta.addLabel}>
              <PlusCircle size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{meta.addLabel}</span>}
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex flex-col gap-1 px-2 mt-2">
            <button onClick={handleLocate}
              className={`group relative flex items-center gap-2.5 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"}`}
              aria-label="My Location">
              <Locate size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">My Location</span>}
            </button>
            <button className={`group relative flex items-center gap-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"}`}
              aria-label="Profile">
              <User size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Profile</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* ── Mobile Bottom Nav (redesigned) ── */}
      {/* ═══════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] pointer-events-none">

        {/* ── Nearby List Panel (swipe-up) ── */}
        {listOpen && (
          <div className="pointer-events-auto animate-slide-up">
            <div className="nearby-panel mx-2 mb-1 rounded-2xl overflow-hidden max-h-[55vh] flex flex-col">
              {/* List Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.emoji}</span>
                  <span className="text-sm font-bold text-slate-800">Nearby {meta.statLabel}</span>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{items.length}</span>
                </div>
                <button onClick={() => setListOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              {/* List Items */}
              <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                {items.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-400 font-medium">No {meta.statLabel.toLowerCase()} found nearby</p>
                    <p className="text-xs text-slate-300 mt-1">Be the first to add one!</p>
                  </div>
                ) : items.map((item) => (
                  <NearbyListItem key={item.id} item={item} layer={activeLayer} onClick={() => handleItemClick(item)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Action Row (Add + Locate) ── */}
        <div className="pointer-events-auto bg-gradient-to-t from-white via-white/90 to-transparent pt-3">
          <div className="flex items-center justify-center gap-2.5 px-4 mb-2">
            <button onClick={handleLocate}
              className="px-4 py-2.5 bg-white rounded-2xl shadow-md border border-slate-100 text-slate-600 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold">
              <Locate size={16} className="text-blue-500" />
              <span>Near Me</span>
            </button>

            <button onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`px-5 py-2.5 rounded-2xl shadow-lg font-bold text-sm flex items-center gap-2 active:scale-95 transition-all ${mode === "addSpot" ? "bg-slate-900 text-white" : meta.ctaClass}`}>
              <PlusCircle size={16} />
              <span>{mode === "addSpot" ? "Cancel" : meta.addLabel}</span>
            </button>

            <button onClick={() => setListOpen(!listOpen)}
              className={`px-4 py-2.5 rounded-2xl shadow-md border border-slate-100 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold ${listOpen ? `${meta.accentBg} text-white border-transparent` : "bg-white text-slate-600"}`}>
              {listOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              <span>List</span>
            </button>
          </div>

          {/* ── Layer Tabs (at very bottom) ── */}
          <div className="flex items-center justify-around bg-white/98 border-t border-slate-100 px-2 pb-safe">
            {LAYER_ORDER.map((layerId) => {
              const lm = LAYER_META[layerId];
              const isActive = activeLayer === layerId;
              return (
                <button key={layerId} onClick={() => { setActiveLayer(layerId); setListOpen(false); }}
                  className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${isActive ? `${lm.accent}` : "text-slate-400"}`}>
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? `bg-current/10` : ""}`}>
                    {layerIcons[layerId]}
                  </div>
                  <span className={`text-[10px] font-bold ${isActive ? "" : "text-slate-400"}`}>{lm.label}</span>
                  {isActive && <div className={`w-4 h-0.5 rounded-full ${lm.accentBg} mt-0.5`} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Nearby List Item — modeled after ToiletMap BD style ── */
function NearbyListItem({ item, layer, onClick }: { item: MapItem; layer: MapLayer; onClick: () => void }) {
  const meta = LAYER_META[layer];

  const getTitle = () => {
    if ("title" in item && item.title) return item.title;
    if ("name" in item && item.name) return item.name;
    if ("product_name" in item && item.product_name) return item.product_name;
    return "Unknown";
  };

  const getSubtitle = () => {
    switch (layer) {
      case "biriyani": return ("food_type" in item ? item.food_type : "") || "Food spot";
      case "toilet": return ("notes" in item ? item.notes : "") || "Public toilet";
      case "goods": return ("shop_name" in item ? `${item.shop_name}` : "Shop");
      case "violence": return ("incident_type" in item ? item.incident_type : "") || "Incident";
    }
  };

  const getBadges = (): React.ReactNode[] => {
    const badges: React.ReactNode[] = [];
    if (layer === "toilet") {
      const t = item as { is_paid?: boolean; has_water?: boolean };
      badges.push(
        <span key="paid" className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md ${t.is_paid ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {t.is_paid ? "Paid" : "Free"}
        </span>
      );
      if (t.has_water) badges.push(
        <span key="water" className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">💧 Water</span>
      );
    }
    if (layer === "goods") {
      const g = item as { price?: number; unit?: string };
      if (g.price) badges.push(
        <span key="price" className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">৳{g.price}/{g.unit}</span>
      );
    }
    return badges;
  };

  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl ${meta.accentBg}/10 flex items-center justify-center text-sm shrink-0`}>
        {meta.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{getTitle()}</p>
        <p className="text-[11px] text-slate-400 truncate">{getSubtitle()}</p>
        {getBadges().length > 0 && (
          <div className="flex items-center gap-1 mt-1">{getBadges()}</div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-xs font-bold ${item.score >= 5 ? "text-green-600" : item.score >= 0 ? "text-slate-500" : "text-red-500"}`}>
          {item.score > 0 ? `+${item.score}` : item.score}
        </span>
        <Navigation size={14} className="text-slate-300" />
      </div>
    </button>
  );
}
