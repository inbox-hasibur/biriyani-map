"use client";

import React, { useState } from "react";
import { UtensilsCrossed, PlusCircle, User, Locate, ShoppingBasket, AlertTriangle, Droplets, ChevronLeft, ChevronRight } from "lucide-react";
import { useMapContext, LAYER_META, LAYER_ORDER, MapLayer } from "./MapContext";

export default function Sidebar() {
  const { mode, setMode, activeLayer, setActiveLayer, map } = useMapContext();
  const [collapsed, setCollapsed] = useState(false);
  const meta = LAYER_META[activeLayer];

  function handleLocate() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true }),
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }

  const layerIcons: Record<MapLayer, React.ReactNode> = {
    biriyani: <UtensilsCrossed size={18} />,
    toilet: <Droplets size={18} />,
    goods: <ShoppingBasket size={18} />,
    violence: <AlertTriangle size={18} />,
  };

  return (
    <>
      {/* ── Desktop Dock ── */}
      <div className={`hidden md:fixed md:left-4 md:top-4 md:bottom-4 md:flex md:flex-col md:items-center z-[1000] pointer-events-none transition-all duration-300 ${collapsed ? "md:w-14" : "md:w-[180px]"}`}>
        <div className="sidebar-card pointer-events-auto flex flex-col py-4 h-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`flex items-center gap-2.5 px-3 mb-4 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0">
              U
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-up">
                <div className="text-sm font-bold text-slate-800 leading-tight">UniMap</div>
                <div className="text-[10px] text-slate-400 font-medium">Universal Map</div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto p-1 rounded-md hover:bg-slate-100 text-slate-400 transition hidden md:flex shrink-0"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Layer label */}
          {!collapsed && (
            <div className="px-3 mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Layers</span>
            </div>
          )}

          {/* Layer Tabs */}
          <div className="flex flex-col gap-1 px-2">
            {LAYER_ORDER.map((layerId) => {
              const lm = LAYER_META[layerId];
              const isActive = activeLayer === layerId;
              return (
                <button
                  key={layerId}
                  onClick={() => setActiveLayer(layerId)}
                  className={`group relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"} ${isActive
                      ? `${lm.accentBg} text-white shadow-md`
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  aria-label={lm.label}
                >
                  <span className="shrink-0">{layerIcons[layerId]}</span>
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{lm.label}</span>
                  )}
                  {/* Tooltip (collapsed only) */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                      {lm.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className={`${collapsed ? "mx-2" : "mx-3"} h-px bg-slate-200/60 my-3`} />

          {/* Add Button */}
          <div className="px-2">
            <button
              onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`group relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"} ${mode === "addSpot"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              aria-label={meta.addLabel}
            >
              <PlusCircle size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{meta.addLabel}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                  {meta.addLabel}
                </span>
              )}
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Actions */}
          <div className="flex flex-col gap-1 px-2 mt-2">
            <button
              onClick={handleLocate}
              className={`group relative flex items-center gap-2.5 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"}`}
              aria-label="My Location"
            >
              <Locate size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">My Location</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                  My Location
                </span>
              )}
            </button>

            <button
              className={`group relative flex items-center gap-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 ${collapsed ? "p-2.5 justify-center" : "px-3 py-2.5"}`}
              aria-label="Profile"
            >
              <User size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Profile</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                  Profile
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] pointer-events-none pb-safe">
        <div className="pointer-events-auto bg-gradient-to-t from-white/95 via-white/80 to-transparent pt-6 pb-2 px-3">
          {/* Layer Pills */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto scrollbar-hide px-1">
            {LAYER_ORDER.map((layerId) => {
              const lm = LAYER_META[layerId];
              const isActive = activeLayer === layerId;
              return (
                <button
                  key={layerId}
                  onClick={() => setActiveLayer(layerId)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${isActive
                      ? `${lm.accentBg} text-white shadow-lg shadow-${layerId === "biriyani" ? "amber" : layerId === "toilet" ? "blue" : layerId === "goods" ? "emerald" : "red"}-500/25 scale-[1.03]`
                      : "bg-white text-slate-500 shadow-sm border border-slate-100"
                    }`}
                >
                  <span className="text-sm">{lm.emoji}</span>
                  <span>{lm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleLocate}
              className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 text-slate-500 active:scale-95 transition-transform"
              aria-label="My Location"
            >
              <Locate size={20} />
            </button>

            <button
              onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`px-6 py-3 rounded-2xl shadow-lg font-bold text-sm flex items-center gap-2 active:scale-95 transition-all duration-200 ${mode === "addSpot"
                  ? "bg-slate-900 text-white"
                  : `${meta.ctaClass}`
                }`}
            >
              <PlusCircle size={18} />
              <span>{mode === "addSpot" ? "Cancel" : meta.addLabel}</span>
            </button>

            <button
              className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 text-slate-500 active:scale-95 transition-transform"
              aria-label="Profile"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
