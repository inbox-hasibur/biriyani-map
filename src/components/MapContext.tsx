"use client";

import React, { createContext, useContext, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

const MapContext = createContext<{ 
  map: LeafletMap | null
  setMap: (m: LeafletMap | null) => void
  verifiedOnly: boolean
  setVerifiedOnly: (v: boolean) => void
} | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  return <MapContext.Provider value={{ map, setMap, verifiedOnly, setVerifiedOnly }}>{children}</MapContext.Provider>;
}

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapContext must be used within MapProvider");
  return ctx;
}
