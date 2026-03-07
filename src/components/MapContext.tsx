"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { BiriyaniSpot, ToiletSpot, GoodsPrice, ViolenceReport } from "@/hooks/useMapItems";

export type MapLayer = "biriyani" | "toilet" | "goods" | "violence";
export type AppMode = "browse" | "addSpot";

export type MapItem = BiriyaniSpot | ToiletSpot | GoodsPrice | ViolenceReport;

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
    <MapContext.Provider
      value={{
        map, setMap,
        mode, setMode,
        activeLayer, setActiveLayer,
        selectedItem, selectItem,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
