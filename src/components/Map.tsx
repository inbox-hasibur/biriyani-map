"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useCallback } from "react";
import { useMapContext, LAYER_META, type TileStyle } from "./MapContext";
import { useMapItems, MapItem } from "@/hooks/useMapItems";
import { createLayerMarker } from "@/lib/markerIcon";
import CreateSpotModal from "./CreateSpotModal";
import type { LayerFormData, BiriyaniFormData, ToiletFormData, GoodsFormData, ViolenceFormData } from "./CreateSpotModal";
import { supabase } from "@/lib/supabaseClient";
import MapControls from "./MapControls";

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom user location marker (blue pulsing dot)
const userLocationIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(59,130,246,0.5),0 0 20px rgba(59,130,246,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: "",
});

// Drop pin marker for add mode
const dropPinIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="54" viewBox="0 0 40 54">
    <path d="M20 2C11.16 2 4 9.16 4 18c0 12 16 33 16 33s16-21 16-33c0-8.84-7.16-16-16-16z" fill="#1e293b" stroke="white" stroke-width="2.5"/>
    <circle cx="20" cy="18" r="6" fill="white" opacity="0.95"/>
    <text x="20" y="22" text-anchor="middle" font-size="10" font-weight="800" fill="#1e293b">+</text>
  </svg>`,
  iconSize: [40, 54],
  iconAnchor: [20, 54],
  className: "drop-pin-bounce",
});

/* ── Tile layer configurations (8 styles) ── */
const TILE_CONFIGS: Record<TileStyle, { url: string; attribution: string; maxZoom: number }> = {
  default: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 18,
  },
  dark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>',
    maxZoom: 20,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  watercolor: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://stamen.com/">Stamen</a>',
    maxZoom: 16,
  },
  transport: {
    url: "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
    attribution: '&copy; <a href="https://thunderforest.com/">Thunderforest</a>',
    maxZoom: 19,
  },
  humanitarian: {
    url: "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> Humanitarian',
    maxZoom: 19,
  },
  cycle: {
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.cyclosm.org/">CyclOSM</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 20,
  },
};

function MapInstanceCapture({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function Map() {
  const { setMap, mode, setMode, activeLayer, selectItem, selectedItem, tileStyle, refetchTrigger, filterLayer } = useMapContext();
  const [bbox, setBbox] = useState<[number, number, number, number] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const itemsQuery = useMapItems(activeLayer, bbox, refetchTrigger);

  // Fetch route geometry when user location + selected item
  useEffect(() => {
    if (!userLocation || !selectedItem) {
      setRouteCoords([]);
      return;
    }
    const controller = new AbortController();
    const [uLat, uLng] = userLocation;
    const sLat = selectedItem.lat;
    const sLng = selectedItem.lng;

    fetch(`https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${sLng},${sLat}?overview=full&geometries=geojson`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRouteCoords(coords);
        }
      })
      .catch(() => { /* ignore abort or network errors */ });

    return () => controller.abort();
  }, [userLocation, selectedItem]);

  async function handleCreateItem(data: LayerFormData, lat: number, lng: number) {
    setSubmitError(null);

    if (!supabase) {
      // Dev mock — simulate success with delay
      console.log(`[dev mock] Create ${activeLayer}:`, { ...data, lat, lng });
      await new Promise((r) => setTimeout(r, 300));
      setModalOpen(false);
      setSelectedPos(null);
      setMode("browse");
      itemsQuery.refetch();
      return;
    }

    let insertError: string | null = null;

    try {
      // Get current user (optional — allow anonymous submissions)
      let userId: string | undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch { /* anonymous user */ }

      switch (activeLayer) {
        case "biriyani": {
          const d = data as BiriyaniFormData;
          const { error } = await supabase.from("spots").insert({
            title: d.title, description: d.description ?? null, lat, lng,
            food_type: d.foodType, time: d.time ? new Date(d.time).toISOString() : null,
            score: 0, verified: false, is_visible: true, created_by: userId ?? null,
          });
          if (error) insertError = error.message;
          break;
        }
        case "toilet": {
          const d = data as ToiletFormData;
          const { error } = await supabase.from("toilets").insert({
            name: d.name, lat, lng, is_paid: d.isPaid, has_water: d.hasWater,
            notes: d.notes ?? null, rating_avg: 0, rating_count: 0, score: 0, is_visible: true, created_by: userId ?? null,
          });
          if (error) insertError = error.message;
          break;
        }
        case "goods": {
          const d = data as GoodsFormData;
          const { error } = await supabase.from("goods_prices").insert({
            product_name: d.productName, price: d.price, unit: d.unit, shop_name: d.shopName,
            lat, lng, score: 0, is_visible: true, created_by: userId ?? null,
          });
          if (error) insertError = error.message;
          break;
        }
        case "violence": {
          const d = data as ViolenceFormData;
          const { error } = await supabase.from("violence_reports").insert({
            title: d.title, description: d.description ?? null, incident_type: d.incidentType,
            lat, lng, upvotes: 0, downvotes: 0, score: 0, is_visible: true, created_by: userId ?? null,
          });
          if (error) insertError = error.message;
          break;
        }
      }
    } catch (err) {
      if (err instanceof TypeError && (err.message === "Failed to fetch" || err.message.includes("fetch"))) {
        insertError = "Network error: Could not connect to the server. Please check your internet connection and try again.";
      } else {
        insertError = err instanceof Error ? err.message : "Failed to save. Check your connection.";
      }
    }

    if (insertError) {
      setSubmitError(insertError);
      throw new Error(insertError);
    }

    setModalOpen(false);
    setSelectedPos(null);
    setMode("browse");
    itemsQuery.refetch();
  }

  const items = itemsQuery.data ?? [];
  // Apply filter: when filterLayer is set and matches activeLayer, no filtering needed
  // When filterLayer doesn't match activeLayer, items from activeLayer won't show
  // (the TopBar handles switching the activeLayer when filter changes)
  const filteredItems = filterLayer
    ? items.filter((item) => item._layer === filterLayer)
    : items;
  const tileConfig = TILE_CONFIGS[tileStyle];

  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={13}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full outline-none"
    >
      {/* ── Dynamic tile layer ── */}
      <TileLayer
        key={tileStyle}
        attribution={tileConfig.attribution}
        url={tileConfig.url}
        maxZoom={tileConfig.maxZoom}
      />

      <MapInstanceCapture
        onMap={(m) => {
          setMap(m);
          const b = m.getBounds();
          setBbox([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
        }}
      />

      <MapEvents
        mode={mode}
        modalOpen={modalOpen}
        setBbox={setBbox}
        setModalOpen={setModalOpen}
        setSelectedPos={setSelectedPos}
      />

      <UserLocationTracker
        onLocationUpdate={setUserLocation}
      />

      {/* Map Controls — zoom, layers, locate, etc */}
      <MapControls />

      {/* User location blue dot */}
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={50}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
          <Marker position={userLocation} icon={userLocationIcon} />
        </>
      )}

      {/* Route geometry line */}
      {routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#3b82f6",
            weight: 4,
            opacity: 0.7,
            dashArray: "8, 12",
            lineCap: "round",
          }}
        />
      )}

      {/* Show drop pin in add mode */}
      {selectedPos && mode === "addSpot" && (
        <Marker position={selectedPos} icon={dropPinIcon} />
      )}

      {/* Render markers for active layer (respects filter) */}
      {filteredItems.map((item) =>
        item?.lat != null && item?.lng != null ? (
          <Marker
            key={`${activeLayer}-${item.id}`}
            position={[item.lat, item.lng]}
            icon={createLayerMarker(activeLayer, item.score)}
            eventHandlers={{ click: () => selectItem(item) }}
          />
        ) : null
      )}

      {/* Create bottom sheet — NOT a full-screen popup */}
      {selectedPos && (
        <CreateSpotModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedPos(null); }}
          onSubmit={handleCreateItem}
          lat={selectedPos[0]}
          lng={selectedPos[1]}
          error={submitError}
          activeLayer={activeLayer}
        />
      )}
    </MapContainer>
  );
}

/* ── Track user location continuously ── */
function UserLocationTracker({ onLocationUpdate }: { onLocationUpdate: (pos: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        onLocationUpdate(loc);
      },
      (err) => { console.warn("[UniMap] Geolocation error:", err.message); },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch for changes
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onLocationUpdate([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => { console.warn("[UniMap] Watch position error:", err.message); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function MapEvents({ mode, modalOpen, setBbox, setModalOpen, setSelectedPos }: {
  mode: string;
  modalOpen: boolean;
  setBbox: (b: [number, number, number, number]) => void;
  setModalOpen: (open: boolean) => void;
  setSelectedPos: (pos: [number, number] | null) => void;
}) {
  useMapEvents({
    moveend(e) {
      const b = e.target.getBounds();
      setBbox([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
    },
    zoomend(e) {
      const b = e.target.getBounds();
      setBbox([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
    },
    click(e) {
      // Don't handle map clicks when the create form modal is already open
      if (modalOpen) return;
      if (mode === "addSpot") {
        setSelectedPos([e.latlng.lat, e.latlng.lng]);
        setModalOpen(true);
      }
    },
  });
  return null;
}