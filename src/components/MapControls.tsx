"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";
import {
    Plus,
    Minus,
    Locate,
    Maximize2,
    Minimize2,
    Layers,
    Compass,
    X,
} from "lucide-react";
import { useMapContext, type TileStyle } from "./MapContext";

const TILE_STYLES: { id: TileStyle; label: string; emoji: string }[] = [
    { id: "default", label: "Standard", emoji: "🗺️" },
    { id: "satellite", label: "Satellite", emoji: "🛰️" },
    { id: "dark", label: "Dark", emoji: "🌙" },
    { id: "terrain", label: "Terrain", emoji: "⛰️" },
    { id: "watercolor", label: "Watercolor", emoji: "🎨" },
    { id: "transport", label: "Transport", emoji: "🚌" },
    { id: "humanitarian", label: "Humanitarian", emoji: "🏥" },
    { id: "cycle", label: "Cycle", emoji: "🚴" },
];

export default function MapControls() {
    const map = useMap();
    const { tileStyle, setTileStyle } = useMapContext();
    const [layerPanelOpen, setLayerPanelOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [locating, setLocating] = useState(false);

    function handleZoomIn() { map.zoomIn(1, { animate: true }); }
    function handleZoomOut() { map.zoomOut(1, { animate: true }); }

    function handleLocate() {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map.setView([pos.coords.latitude, pos.coords.longitude], 16, { animate: true });
                setTimeout(() => setLocating(false), 1000);
            },
            () => { setLocating(false); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    function handleFullscreen() {
        const el = document.documentElement;
        if (!isFullscreen) { el.requestFullscreen?.(); }
        else { document.exitFullscreen?.(); }
        setIsFullscreen(!isFullscreen);
    }

    function handleResetNorth() {
        map.setView(map.getCenter(), map.getZoom(), { animate: true });
    }

    // Responsive sizes
    const btnBase = "flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 hover:scale-105 w-7 h-7 md:w-9 md:h-9";
    const btnLight = "bg-white/95 backdrop-blur-md shadow-md border border-slate-100/50 text-slate-600 hover:bg-white hover:shadow-lg";

    return (
        <>
            {/* ── Right side controls ── */}
            <div className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1 md:gap-2 pointer-events-auto">
                {/* Zoom */}
                <div className="flex flex-col rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-slate-100/50 bg-white/95 backdrop-blur-md">
                    <button onClick={handleZoomIn} className={`${btnBase} border-b border-slate-100 rounded-none text-slate-700 hover:bg-slate-50`} aria-label="Zoom in">
                        <Plus size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                    </button>
                    <button onClick={handleZoomOut} className={`${btnBase} rounded-none text-slate-700 hover:bg-slate-50`} aria-label="Zoom out">
                        <Minus size={14} strokeWidth={2.5} className="md:w-4 md:h-4" />
                    </button>
                </div>

                {/* Locate */}
                <button onClick={handleLocate} className={`${btnBase} ${btnLight} ${locating ? "animate-pulse ring-2 ring-blue-400 ring-offset-1" : ""}`} aria-label="My location">
                    <Locate size={13} className={`transition-colors md:w-[15px] md:h-[15px] ${locating ? "text-blue-500" : ""}`} />
                </button>

                {/* Layers */}
                <button onClick={() => setLayerPanelOpen(!layerPanelOpen)} className={`${btnBase} ${layerPanelOpen ? "bg-slate-900 text-white shadow-xl" : btnLight}`} aria-label="Map layers">
                    <Layers size={13} className="md:w-[15px] md:h-[15px]" />
                </button>

                {/* Compass */}
                <button onClick={handleResetNorth} className={`${btnBase} ${btnLight}`} aria-label="Reset north">
                    <Compass size={13} className="md:w-[15px] md:h-[15px]" />
                </button>

                {/* Fullscreen */}
                <button onClick={handleFullscreen} className={`${btnBase} ${btnLight}`} aria-label="Fullscreen">
                    {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
            </div>

            {/* ── Layer Selection Panel (scrollable 8-tile grid) ── */}
            {layerPanelOpen && (
                <div className="absolute right-12 md:right-16 top-1/2 -translate-y-1/2 z-[1001] pointer-events-auto animate-scale-in">
                    <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/50 p-2.5 w-[200px] md:w-[220px]">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Map Style</span>
                            <button onClick={() => setLayerPanelOpen(false)} className="p-0.5 hover:bg-slate-100 rounded-lg transition">
                                <X size={11} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 max-h-[280px] overflow-y-auto scrollbar-hide">
                            {TILE_STYLES.map((style) => {
                                const isActive = tileStyle === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => { setTileStyle(style.id); setLayerPanelOpen(false); }}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-95 ${isActive
                                            ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg ring-2 ring-blue-400/30"
                                            : "bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:shadow-sm"
                                            }`}
                                    >
                                        <span className="text-lg leading-none">{style.emoji}</span>
                                        <span className="text-[9px] font-bold leading-tight">{style.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
