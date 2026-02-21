"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useMapContext } from "./MapContext";
import { useSpots } from "@/hooks/useSpots";
import { createCustomMarker } from "@/lib/markerIcon";
import CreateSpotModal from "./CreateSpotModal";
import type { SpotFormData } from "./CreateSpotModal";
import VotingUI from "./VotingUI";

// Fix for default Leaflet marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Map() {
  const { setMap, verifiedOnly } = useMapContext();
  const [bbox, setBbox] = useState<[number, number, number, number] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const spotsQuery = useSpots(bbox, verifiedOnly);

  async function handleCreateSpot(data: SpotFormData, lat: number, lng: number) {
    // TODO: call supabase insert or mock
    console.log("Create spot:", { ...data, lat, lng });
    // For now, just close and refetch
    setModalOpen(false);
  }

  return (
    <MapContainer
      center={[23.8103, 90.4125]} // Center of Dhaka
      zoom={13}
      scrollWheelZoom={true}
      whenCreated={(mapInstance) => {
        setMap(mapInstance);
        // set initial bbox
        const b = mapInstance.getBounds();
        setBbox([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
      }}
      zoomControl={false}
      className="h-full w-full outline-none"
    >
      {/* 
         USING CARTO-DB VOYAGER TILES 
         This gives that clean, "Google Maps" style look from your image 
         instead of the busy OpenStreetMap standard style.
      */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapEvents setBbox={setBbox} setModalOpen={setModalOpen} setSelectedPos={setSelectedPos} />

      {/* Render fetched spots as markers */}
      {spotsQuery.data && spotsQuery.data.map((s) => (
        s && s.lat && s.lng ? (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={createCustomMarker(s.verified, s.score ?? 0)}>
            <Popup>
              <div className="text-center w-48">
                <h3 className="font-bold text-sm">{s.title}</h3>
                <p className="text-xs text-slate-600">{s.description}</p>
                <p className="text-xs text-slate-500 mt-2">Score: {s.score ?? 0} • {s.verified ? '✓ Verified' : 'Unverified'}</p>
                <VotingUI spotId={s.id} initialScore={s.score ?? 0} />
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}

      {selectedPos && (
        <CreateSpotModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateSpot}
          lat={selectedPos[0]}
          lng={selectedPos[1]}
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
      // On map click, open modal to create spot
      setSelectedPos([e.latlng.lat, e.latlng.lng]);
      setModalOpen(true);
    },
  });
  return null;
}