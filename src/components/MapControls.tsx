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
    Map as MapIcon,
    Mountain,
    Moon,
    Satellite,
    Compass,
    X,
} from "lucide-react";
import { useMapContext, type TileStyle } from "./MapContext";

const TILE_STYLES: { id: TileStyle; label: string; icon: React.ReactNode; preview: string }[] = [
    { id: "default", label: "Default", icon: <MapIcon size={16} />, preview: "🗺️" },
    { id: "satellite", label: "Satellite", icon: <Satellite size={16} />, preview: "🛰️" },
    { id: "dark", label: "Dark", icon: <Moon size={16} />, preview: "🌙" },
    { id: "terrain", label: "Terrain", icon: <Mountain size={16} />, preview: "⛰️" },
];

export default function MapControls() {
    const map = useMap();
    const { tileStyle, setTileStyle } = useMapContext();
    const [layerPanelOpen, setLayerPanelOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [locating, setLocating] = useState(false);

    function handleZoomIn() {
        map.zoomIn(1, { animate: true });
    }

    function handleZoomOut() {
        map.zoomOut(1, { animate: true });
    }

    function handleLocate() {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map.setView([pos.coords.latitude, pos.coords.longitude], 16, { animate: true });
                setTimeout(() => setLocating(false), 1000);
            },
            () => {
                setLocating(false);
                alert("Could not get your location. Please enable location services.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    function handleFullscreen() {
        const el = document.documentElement;
        if (!isFullscreen) {
            el.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    }

    function handleResetRotation() {
        // Reset map view to north (Leaflet maps don't rotate, so just re-center)
        map.setView(map.getCenter(), map.getZoom(), { animate: true });
    }

    const btnBase =
        "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 hover:scale-105";
    const btnLight =
        "bg-white/95 backdrop-blur-md shadow-lg border border-slate-100/50 text-slate-600 hover:bg-white hover:shadow-xl";

    return (
        <>
            {/* ── Right side controls ── */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2 pointer-events-auto">
                {/* Zoom Controls */}
                <div className="flex flex-col rounded-2xl overflow-hidden shadow-lg border border-slate-100/50 bg-white/95 backdrop-blur-md">
                    <button onClick={handleZoomIn} className={`${btnBase} border-b border-slate-100 rounded-none text-slate-700 hover:bg-slate-50`} aria-label="Zoom in">
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                    <button onClick={handleZoomOut} className={`${btnBase} rounded-none text-slate-700 hover:bg-slate-50`} aria-label="Zoom out">
                        <Minus size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* My Location */}
                <button
                    onClick={handleLocate}
                    className={`${btnBase} ${btnLight} ${locating ? "animate-pulse ring-2 ring-blue-400 ring-offset-1" : ""}`}
                    aria-label="My location"
                >
                    <Locate size={18} className={`transition-colors ${locating ? "text-blue-500" : ""}`} />
                </button>

                {/* Layer Switcher Toggle */}
                <button
                    onClick={() => setLayerPanelOpen(!layerPanelOpen)}
                    className={`${btnBase} ${layerPanelOpen ? "bg-slate-900 text-white shadow-xl" : btnLight}`}
                    aria-label="Map layers"
                >
                    <Layers size={18} />
                </button>

                {/* Compass */}
                <button onClick={handleResetRotation} className={`${btnBase} ${btnLight}`} aria-label="Reset north">
                    <Compass size={18} />
                </button>

                {/* Fullscreen */}
                <button onClick={handleFullscreen} className={`${btnBase} ${btnLight}`} aria-label="Fullscreen">
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>

            {/* ── Layer Selection Panel ── */}
            {layerPanelOpen && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2 z-[1001] pointer-events-auto animate-scale-in">
                    <div className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/50 p-3 min-w-[180px]">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Map Style</span>
                            <button onClick={() => setLayerPanelOpen(false)} className="p-0.5 hover:bg-slate-100 rounded-lg transition">
                                <X size={12} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {TILE_STYLES.map((style) => {
                                const isActive = tileStyle === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => { setTileStyle(style.id); setLayerPanelOpen(false); }}
                                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 active:scale-95 ${isActive
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:shadow-sm"
                                            }`}
                                    >
                                        <span className="text-xl">{style.preview}</span>
                                        <span className="text-[10px] font-bold">{style.label}</span>
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
