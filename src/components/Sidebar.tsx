"use client";

import React from "react";
import { UtensilsCrossed, PlusCircle, User, Locate, ShoppingBasket, AlertTriangle } from "lucide-react";
import { useMapContext, MapLayer } from "./MapContext";

type LayerConfig = {
  id: MapLayer;
  icon: React.ReactNode;
  label: string;
  color: string;
  activeColor: string;
  emoji: string;
};

const LAYERS: LayerConfig[] = [
  { id: "biriyani", icon: <UtensilsCrossed size={16} />, label: "Biriyani", color: "text-amber-500", activeColor: "bg-amber-500", emoji: "🍛" },
  { id: "toilet", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18H4Z" /><path d="M12 6v4" /><path d="M9 14h6" /></svg>, label: "Toilet", color: "text-blue-500", activeColor: "bg-blue-500", emoji: "🚻" },
  { id: "goods", icon: <ShoppingBasket size={16} />, label: "Goods", color: "text-emerald-500", activeColor: "bg-emerald-500", emoji: "🥬" },
  { id: "violence", icon: <AlertTriangle size={16} />, label: "Violence", color: "text-red-500", activeColor: "bg-red-500", emoji: "⚠️" },
];

export default function Sidebar() {
  const { mode, setMode, activeLayer, setActiveLayer, map } = useMapContext();

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
    <>
      {/* ── Desktop Dock ── */}
      <div className="hidden md:fixed md:left-4 md:top-4 md:bottom-4 md:w-14 md:flex md:flex-col md:items-center z-[1000] pointer-events-none">
        <div className="sidebar-card pointer-events-auto flex flex-col items-center py-4 gap-2 h-full max-h-[90vh] px-2">
          {/* Brand */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-black shadow-md mb-2">
            U
          </div>

          {/* Layer Tabs */}
          <div className="flex flex-col gap-1 w-full items-center">
            {LAYERS.map((layer) => (
              <LayerTab
                key={layer.id}
                layer={layer}
                isActive={activeLayer === layer.id}
                onClick={() => setActiveLayer(layer.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="w-6 h-px bg-slate-200 my-1" />

          {/* Add Button */}
          <div className="group relative flex items-center justify-center w-full">
            <button
              onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full flex items-center justify-center ${mode === "addSpot"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              aria-label="Add"
            >
              <PlusCircle size={18} />
            </button>
            <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              Add {LAYERS.find((l) => l.id === activeLayer)?.label}
            </span>
          </div>

          {/* Bottom — Locate + Profile */}
          <div className="mt-auto mb-1 w-full flex flex-col items-center gap-2">
            <button
              onClick={handleLocate}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              aria-label="Track Near Me"
            >
              <Locate size={18} />
            </button>
            <div className="group relative flex items-center justify-center w-full">
              <button
                className="p-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white"
                aria-label="Profile"
              >
                <User size={16} />
              </button>
              <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                Profile
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="pointer-events-auto">
          {/* Layer Switcher Pills */}
          <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shadow-md ${activeLayer === layer.id
                    ? `${layer.activeColor} text-white shadow-lg scale-105`
                    : "bg-white/95 text-slate-600 backdrop-blur-sm"
                  }`}
              >
                <span>{layer.emoji}</span>
                <span>{layer.label}</span>
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-2 pb-4 pt-1 px-4">
            <button
              onClick={handleLocate}
              className="p-3 sidebar-card flex items-center justify-center rounded-xl shadow-lg"
              aria-label="Track Near Me"
            >
              <Locate size={18} />
            </button>

            <button
              onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`p-3 rounded-full shadow-lg flex items-center justify-center w-12 h-12 transition-all duration-200 ${mode === "addSpot"
                  ? "bg-slate-900 text-white"
                  : `${LAYERS.find((l) => l.id === activeLayer)?.activeColor || "bg-amber-500"} text-white`
                }`}
            >
              <PlusCircle size={18} />
            </button>

            <button className="p-3 sidebar-card flex items-center justify-center rounded-xl shadow-lg">
              <User size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Layer Tab Component ── */
function LayerTab({
  layer,
  isActive,
  onClick,
}: {
  layer: LayerConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="group relative flex items-center justify-center w-full">
      <button
        onClick={onClick}
        className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full flex items-center justify-center ${isActive
            ? `${layer.activeColor} text-white shadow-md`
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          }`}
        aria-label={layer.label}
      >
        {layer.icon}
      </button>
      <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
        {layer.label}
      </span>
    </div>
  );
}
