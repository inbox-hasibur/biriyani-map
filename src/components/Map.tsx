"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useMapContext } from "./MapContext";
import { useMapItems, MapItem } from "@/hooks/useMapItems";
import { createLayerMarker } from "@/lib/markerIcon";
import CreateSpotModal from "./CreateSpotModal";
import type { LayerFormData, BiriyaniFormData, ToiletFormData, GoodsFormData, ViolenceFormData } from "./CreateSpotModal";
import { supabase } from "@/lib/supabaseClient";

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapInstanceCapture({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function Map() {
  const { setMap, mode, setMode, activeLayer, selectItem } = useMapContext();
  const [bbox, setBbox] = useState<[number, number, number, number] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const itemsQuery = useMapItems(activeLayer, bbox);

  async function handleCreateItem(data: LayerFormData, lat: number, lng: number) {
    setSubmitError(null);

    if (!supabase) {
      console.log(`[dev mock] Create ${activeLayer}:`, { ...data, lat, lng });
      setModalOpen(false);
      setMode("browse");
      return;
    }

    let insertError: string | null = null;

    switch (activeLayer) {
      case "biriyani": {
        const d = data as BiriyaniFormData;
        const { error } = await supabase.from("spots").insert({
          title: d.title,
          description: d.description ?? null,
          lat, lng,
          food_type: d.foodType,
          time: d.time ? new Date(d.time).toISOString() : null,
          score: 0, verified: false, is_visible: true,
        });
        if (error) insertError = error.message;
        break;
      }
      case "toilet": {
        const d = data as ToiletFormData;
        const { error } = await supabase.from("toilets").insert({
          name: d.name,
          lat, lng,
          is_paid: d.isPaid,
          has_water: d.hasWater,
          notes: d.notes ?? null,
          rating_avg: 0, rating_count: 0, score: 0, is_visible: true,
        });
        if (error) insertError = error.message;
        break;
      }
      case "goods": {
        const d = data as GoodsFormData;
        const { error } = await supabase.from("goods_prices").insert({
          product_name: d.productName,
          price: d.price,
          unit: d.unit,
          shop_name: d.shopName,
          lat, lng,
          score: 0, is_visible: true,
        });
        if (error) insertError = error.message;
        break;
      }
      case "violence": {
        const d = data as ViolenceFormData;
        const { error } = await supabase.from("violence_reports").insert({
          title: d.title,
          description: d.description ?? null,
          incident_type: d.incidentType,
          lat, lng,
          upvotes: 0, downvotes: 0, score: 0, is_visible: true,
        });
        if (error) insertError = error.message;
        break;
      }
    }

    if (insertError) {
      console.error("Insert error:", insertError);
      setSubmitError(insertError);
      return;
    }

    setModalOpen(false);
    setSelectedPos(null);
    setMode("browse");
    itemsQuery.refetch();
  }

  function handleMarkerClick(item: MapItem) {
    selectItem(item);
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

      <MapEvents
        mode={mode}
        setBbox={setBbox}
        setModalOpen={setModalOpen}
        setSelectedPos={setSelectedPos}
      />

      {/* Render items for active layer */}
      {itemsQuery.data?.map((item) =>
        item?.lat && item?.lng ? (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createLayerMarker(activeLayer, item.score)}
            eventHandlers={{
              click: () => handleMarkerClick(item),
            }}
          />
        ) : null
      )}

      {/* Create modal */}
      {selectedPos && (
        <CreateSpotModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPos(null);
          }}
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
      if (mode === "addSpot") {
        setSelectedPos([e.latlng.lat, e.latlng.lng]);
        setModalOpen(true);
      }
    },
  });
  return null;
}