"use client";

import React, { createContext, useContext, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

type MapContextValue = {
  map: LeafletMap | null;
  setMap: (m: LeafletMap | null) => void;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  return (
    <MapContext.Provider value={{ map, setMap }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
