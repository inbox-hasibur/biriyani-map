"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";
import { useMapContext } from "./MapContext";
import { useSpots } from "@/hooks/useSpots";
import { createCustomMarker } from "@/lib/markerIcon";
import CreateSpotModal from "./CreateSpotModal";
import type { SpotFormData } from "./CreateSpotModal";
import VotingUI from "./VotingUI";
import { supabase } from "@/lib/supabaseClient";

// Fix for default Leaflet marker icons in Next.js builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Inner component to capture the map instance via hook (required in react-leaflet v4+)
function MapInstanceCapture({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function Map() {
  const { setMap, verifiedOnly } = useMapContext();
  const [bbox, setBbox] = useState<[number, number, number, number] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const spotsQuery = useSpots(bbox, verifiedOnly);

  async function handleCreateSpot(data: SpotFormData, lat: number, lng: number) {
    setSubmitError(null);

    if (!supabase) {
      // Dev mode — just close (mock)
      console.log("[dev mock] Create spot:", { ...data, lat, lng });
      setModalOpen(false);
      return;
    }

    const { error } = await supabase.from("spots").insert({
      title: data.title,
      description: data.description ?? null,
      lat,
      lng,
      food_type: data.foodType,
      // Convert empty string to null for timestamp column
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
    // Refetch spots to show the new pin immediately
    spotsQuery.refetch();
  }

  return (
    <MapContainer
      center={[23.8103, 90.4125]} // Centre of Dhaka
      zoom={13}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full outline-none"
    >
      {/* 
        Google Maps-like tiles — Esri World Street Map.
        Free to use, no API key required, very close visual match to Google Maps.
      */}
      <TileLayer
        attribution='Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, TomTom, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
      />

      {/* Capture map instance using the hook-based pattern (react-leaflet v4+) */}
      <MapInstanceCapture
        onMap={(m) => {
          setMap(m);
          const b = m.getBounds();
          setBbox([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
        }}
      />

      <MapEvents setBbox={setBbox} setModalOpen={setModalOpen} setSelectedPos={setSelectedPos} />

      {/* Render spots as markers */}
      {spotsQuery.data?.map((s) =>
        s?.lat && s?.lng ? (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={createCustomMarker(s.verified, s.score ?? 0)}>
            <Popup>
              <div className="text-center w-52">
                <h3 className="font-bold text-sm">{s.title}</h3>
                {s.description && <p className="text-xs text-slate-600 mt-1">{s.description}</p>}
                <p className="text-xs text-slate-500 mt-2">
                  Score: {s.score ?? 0} &bull; {s.verified ? "✓ Verified" : "Pending"}
                </p>
                <VotingUI spotId={s.id} initialScore={s.score ?? 0} />
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

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
  setBbox,
  setModalOpen,
  setSelectedPos,
}: {
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
      setSelectedPos([e.latlng.lat, e.latlng.lng]);
      setModalOpen(true);
    },
  });
  return null;
}