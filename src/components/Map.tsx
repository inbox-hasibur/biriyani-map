"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useMapContext } from "./MapContext";
import { useSpots } from "@/hooks/useSpots";
import { createCustomMarker, getTrustMeta } from "@/lib/markerIcon";
import CreateSpotModal from "./CreateSpotModal";
import type { SpotFormData } from "./CreateSpotModal";
import VotingUI from "./VotingUI";
import { supabase } from "@/lib/supabaseClient";

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Hook-based map instance capture (react-leaflet v4+)
function MapInstanceCapture({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function Map() {
  const { setMap } = useMapContext();
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
    spotsQuery.refetch();
  }

  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={13}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full outline-none"
    >
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

      <MapEvents setBbox={setBbox} setModalOpen={setModalOpen} setSelectedPos={setSelectedPos} />

      {/* Render spots */}
      {spotsQuery.data?.map((s) =>
        s?.lat && s?.lng ? (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={createCustomMarker(s.score)}>
            <Popup>
              <div className="popup-content">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="trust-badge"
                    style={{ background: getTrustMeta(s.score).fill }}
                  >
                    {getTrustMeta(s.score).label}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-800">{s.title}</h3>
                {s.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.description}</p>
                )}
                {s.food_type && (
                  <span className="inline-block mt-2 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    🍛 {s.food_type}
                  </span>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Score: <span className="font-bold text-slate-600">{s.score}</span>
                </p>
                <VotingUI spotId={s.id} initialScore={s.score} />
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