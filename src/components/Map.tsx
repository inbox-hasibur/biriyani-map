"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useMapContext } from "./MapContext";
import { useSpots, Spot } from "@/hooks/useSpots";
import { createCustomMarker } from "@/lib/markerIcon";
import { getTrustMeta } from "@/lib/trustLevel";
import CreateSpotModal from "./CreateSpotModal";
import type { SpotFormData } from "./CreateSpotModal";
import { supabase } from "@/lib/supabaseClient";

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Capture map instance via hook (react-leaflet v4+)
function MapInstanceCapture({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function Map() {
  const { setMap, mode, setMode, selectSpot } = useMapContext();
  const [bbox, setBbox] = useState<[number, number, number, number] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const spotsQuery = useSpots(bbox);

  async function handleCreateSpot(data: SpotFormData, lat: number, lng: number) {
    setSubmitError(null);

    if (!supabase) {
      console.log("[dev mock] Create spot:", { ...data, lat, lng });
      setModalOpen(false);
      setMode("browse");
      return;
    }

    const { error } = await supabase.from("spots").insert({
      title: data.title,
      description: data.description ?? null,
      lat,
      lng,
      food_type: data.foodType,
      time: data.time ? new Date(data.time).toISOString() : null,
      score: 0,
      verified: false,
      is_visible: true,
    });

    if (error) {
      console.error("Insert spot error:", error.message);
      setSubmitError(error.message);
      return;
    }

    setModalOpen(false);
    setSelectedPos(null);
    setMode("browse");
    spotsQuery.refetch();
  }

  function handleMarkerClick(spot: Spot) {
    // In browse mode, open the bottom detail sheet
    selectSpot(spot);
  }

  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={13}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full outline-none"
    >
      {/* Google Maps-like tiles */}
      <TileLayer
        attribution='Tiles &copy; <a href="https://www.esri.com">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
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
        setBbox={setBbox}
        setModalOpen={setModalOpen}
        setSelectedPos={setSelectedPos}
      />

      {/* Render spot markers */}
      {spotsQuery.data?.map((s) =>
        s?.lat && s?.lng ? (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={createCustomMarker(s.score)}
            eventHandlers={{
              click: () => handleMarkerClick(s),
            }}
          />
        ) : null
      )}

      {/* Create spot modal — only visible in addSpot mode */}
      {selectedPos && (
        <CreateSpotModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPos(null);
          }}
          onSubmit={handleCreateSpot}
          lat={selectedPos[0]}
          lng={selectedPos[1]}
          error={submitError}
        />
      )}
    </MapContainer>
  );
}

function MapEvents({
  mode,
  setBbox,
  setModalOpen,
  setSelectedPos,
}: {
  mode: string;
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
      // Only open the create-spot modal when in "addSpot" mode
      if (mode === "addSpot") {
        setSelectedPos([e.latlng.lat, e.latlng.lng]);
        setModalOpen(true);
      }
      // In "browse" mode, clicking the map does nothing (normal navigation)
    },
  });
  return null;
}