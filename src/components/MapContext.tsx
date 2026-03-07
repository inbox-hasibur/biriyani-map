"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { BiriyaniSpot, ToiletSpot, GoodsPrice, ViolenceReport } from "@/hooks/useMapItems";

export type MapLayer = "biriyani" | "toilet" | "goods" | "violence";
export type AppMode = "browse" | "addSpot";
export type MapItem = BiriyaniSpot | ToiletSpot | GoodsPrice | ViolenceReport;

/* ── Layer metadata (single source of truth) ── */
export const LAYER_META: Record<MapLayer, {
  label: string;
  emoji: string;
  accent: string;
  accentBg: string;
  accentLight: string;
  accentRing: string;
  ctaClass: string;
  addLabel: string;
  searchHint: string;
  addBanner: string;
  statLabel: string;
}> = {
  biriyani: {
    label: "Biriyani",
    emoji: "🍛",
    accent: "text-amber-500",
    accentBg: "bg-amber-500",
    accentLight: "bg-amber-50 text-amber-700 border-amber-200/50",
    accentRing: "focus:ring-amber-400",
    ctaClass: "cta-yellow",
    addLabel: "Drop Spot",
    searchHint: "Search area (e.g. Uttara, Mirpur)",
    addBanner: "Tap the map to drop a biriyani spot",
    statLabel: "Spots",
  },
  toilet: {
    label: "Toilet",
    emoji: "🚻",
    accent: "text-blue-500",
    accentBg: "bg-blue-500",
    accentLight: "bg-blue-50 text-blue-700 border-blue-200/50",
    accentRing: "focus:ring-blue-400",
    ctaClass: "cta-blue",
    addLabel: "Add Toilet",
    searchHint: "Search area for toilets...",
    addBanner: "Tap the map to add a public toilet",
    statLabel: "Toilets",
  },
  goods: {
    label: "Prices",
    emoji: "🥬",
    accent: "text-emerald-500",
    accentBg: "bg-emerald-500",
    accentLight: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    accentRing: "focus:ring-emerald-400",
    ctaClass: "cta-green",
    addLabel: "Add Price",
    searchHint: "Search area for prices...",
    addBanner: "Tap the map to report a product price",
    statLabel: "Prices",
  },
  violence: {
    label: "Safety",
    emoji: "🛡️",
    accent: "text-red-500",
    accentBg: "bg-red-500",
    accentLight: "bg-red-50 text-red-700 border-red-200/50",
    accentRing: "focus:ring-red-400",
    ctaClass: "cta-red",
    addLabel: "Report",
    searchHint: "Search area for reports...",
    addBanner: "Tap the map to report an incident",
    statLabel: "Reports",
  },
};

export const LAYER_ORDER: MapLayer[] = ["biriyani", "toilet", "goods", "violence"];

type MapContextValue = {
  map: LeafletMap | null;
  setMap: (m: LeafletMap | null) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  activeLayer: MapLayer;
  setActiveLayer: (l: MapLayer) => void;
  selectedItem: MapItem | null;
  selectItem: (s: MapItem | null) => void;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [mode, setModeRaw] = useState<AppMode>("browse");
  const [activeLayer, setActiveLayerRaw] = useState<MapLayer>("biriyani");
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  const setMode = useCallback((m: AppMode) => {
    setModeRaw(m);
    if (m === "addSpot") setSelectedItem(null);
  }, []);

  const setActiveLayer = useCallback((l: MapLayer) => {
    setActiveLayerRaw(l);
    setSelectedItem(null);
    setModeRaw("browse");
  }, []);

  const selectItem = useCallback((s: MapItem | null) => {
    setSelectedItem(s);
    if (s) setModeRaw("browse");
  }, []);

  return (
    <MapContext.Provider value={{ map, setMap, mode, setMode, activeLayer, setActiveLayer, selectedItem, selectItem }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
