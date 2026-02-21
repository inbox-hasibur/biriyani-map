"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { Spot } from "@/hooks/useSpots";

export type AppMode = "browse" | "addSpot";

type MapContextValue = {
  map: LeafletMap | null;
  setMap: (m: LeafletMap | null) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  selectedSpot: Spot | null;
  selectSpot: (s: Spot | null) => void;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [mode, setModeRaw] = useState<AppMode>("browse");
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const setMode = useCallback((m: AppMode) => {
    setModeRaw(m);
    // Clear selected spot when switching modes
    if (m === "addSpot") setSelectedSpot(null);
  }, []);

  const selectSpot = useCallback((s: Spot | null) => {
    setSelectedSpot(s);
    // Switch to browse if we're selecting a spot detail
    if (s) setModeRaw("browse");
  }, []);

  return (
    <MapContext.Provider value={{ map, setMap, mode, setMode, selectedSpot, selectSpot }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
