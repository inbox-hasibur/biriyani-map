"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import type { MapLayer } from "./MapContext";

/* ── Form data types per layer ── */
export type BiriyaniFormData = { title: string; description?: string; foodType: string; time?: string };
export type ToiletFormData = { name: string; isPaid: boolean; hasWater: boolean; notes?: string };
export type GoodsFormData = { productName: string; price: number; unit: string; shopName: string };
export type ViolenceFormData = { title: string; description?: string; incidentType: string };
export type LayerFormData = BiriyaniFormData | ToiletFormData | GoodsFormData | ViolenceFormData;

const LAYER_THEMES: Record<MapLayer, { title: string; accent: string; ring: string; cta: string; emoji: string }> = {
  biriyani: { title: "Drop a Spot", accent: "text-amber-700", ring: "focus:ring-amber-400", cta: "cta-yellow", emoji: "🍛" },
  toilet: { title: "Add Toilet", accent: "text-blue-700", ring: "focus:ring-blue-400", cta: "cta-blue", emoji: "🚻" },
  goods: { title: "Add Price", accent: "text-emerald-700", ring: "focus:ring-emerald-400", cta: "cta-green", emoji: "💰" },
  violence: { title: "Report Incident", accent: "text-red-700", ring: "focus:ring-red-400", cta: "cta-red", emoji: "⚠️" },
};

export default function CreateSpotModal({
  isOpen,
  onClose,
  onSubmit,
  lat,
  lng,
  error,
  activeLayer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LayerFormData, lat: number, lng: number) => Promise<void>;
  lat: number;
  lng: number;
  error?: string | null;
  activeLayer: MapLayer;
}) {
  const [loading, setLoading] = useState(false);

  // Biriyani fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState("Biriyani");
  const [time, setTime] = useState("");

  // Toilet fields
  const [toiletName, setToiletName] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [hasWater, setHasWater] = useState(true);
  const [toiletNotes, setToiletNotes] = useState("");

  // Goods fields
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [shopName, setShopName] = useState("");

  // Violence fields
  const [violenceTitle, setViolenceTitle] = useState("");
  const [violenceDesc, setViolenceDesc] = useState("");
  const [incidentType, setIncidentType] = useState("Theft");

  if (!isOpen) return null;

  const theme = LAYER_THEMES[activeLayer];

  function resetAll() {
    setTitle(""); setDescription(""); setFoodType("Biriyani"); setTime("");
    setToiletName(""); setIsPaid(false); setHasWater(true); setToiletNotes("");
    setProductName(""); setPrice(""); setUnit("kg"); setShopName("");
    setViolenceTitle(""); setViolenceDesc(""); setIncidentType("Theft");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let data: LayerFormData;
      switch (activeLayer) {
        case "biriyani":
          data = { title, description, foodType, time } as BiriyaniFormData;
          break;
        case "toilet":
          data = { name: toiletName, isPaid, hasWater, notes: toiletNotes } as ToiletFormData;
          break;
        case "goods":
          data = { productName, price: parseFloat(price) || 0, unit, shopName } as GoodsFormData;
          break;
        case "violence":
          data = { title: violenceTitle, description: violenceDesc, incidentType } as ViolenceFormData;
          break;
      }
      await onSubmit(data, lat, lng);
      resetAll();
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  }

  function isValid(): boolean {
    switch (activeLayer) {
      case "biriyani": return !!title;
      case "toilet": return !!toiletName;
      case "goods": return !!productName && !!price && !!shopName;
      case "violence": return !!violenceTitle;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="ui-card rounded-t-2xl md:rounded-2xl w-full md:w-96 p-6 relative shadow-2xl max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-1">{theme.title} {theme.emoji}</h2>
        <p className="text-xs text-slate-500 mb-4">
          Location: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4 text-xs">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeLayer === "biriyani" && <BiriyaniFields title={title} setTitle={setTitle} description={description} setDescription={setDescription} foodType={foodType} setFoodType={setFoodType} time={time} setTime={setTime} ring={theme.ring} />}
          {activeLayer === "toilet" && <ToiletFields name={toiletName} setName={setToiletName} isPaid={isPaid} setIsPaid={setIsPaid} hasWater={hasWater} setHasWater={setHasWater} notes={toiletNotes} setNotes={setToiletNotes} ring={theme.ring} />}
          {activeLayer === "goods" && <GoodsFields productName={productName} setProductName={setProductName} price={price} setPrice={setPrice} unit={unit} setUnit={setUnit} shopName={shopName} setShopName={setShopName} ring={theme.ring} />}
          {activeLayer === "violence" && <ViolenceFields title={violenceTitle} setTitle={setViolenceTitle} description={violenceDesc} setDescription={setViolenceDesc} incidentType={incidentType} setIncidentType={setIncidentType} ring={theme.ring} />}

          <button
            type="submit"
            disabled={loading || !isValid()}
            className={`w-full ${theme.cta} py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Saving..." : `${theme.title} ${theme.emoji}`}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Layer-Specific Form Fields ── */

const inputCls = (ring: string) => `w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${ring} text-sm`;

function BiriyaniFields({ title, setTitle, description, setDescription, foodType, setFoodType, time, setTime, ring }: { title: string; setTitle: (v: string) => void; description: string; setDescription: (v: string) => void; foodType: string; setFoodType: (v: string) => void; time: string; setTime: (v: string) => void; ring: string }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Biriyani Distribution at Park" className={inputCls(ring)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." className={`${inputCls(ring)} resize-none h-20`} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Food Type *</label>
        <select value={foodType} onChange={(e) => setFoodType(e.target.value)} className={inputCls(ring)}>
          <option>Biriyani</option>
          <option>Tehari</option>
          <option>Water</option>
          <option>Iftar Pack</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Event Time</label>
        <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls(ring)} />
      </div>
    </>
  );
}

function ToiletFields({ name, setName, isPaid, setIsPaid, hasWater, setHasWater, notes, setNotes, ring }: { name: string; setName: (v: string) => void; isPaid: boolean; setIsPaid: (v: boolean) => void; hasWater: boolean; setHasWater: (v: boolean) => void; notes: string; setNotes: (v: string) => void; ring: string }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., City Center Public Toilet" className={inputCls(ring)} required />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={`relative w-11 h-6 rounded-full transition-colors ${isPaid ? "bg-blue-500" : "bg-slate-300"}`} onClick={() => setIsPaid(!isPaid)}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPaid ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium">{isPaid ? "Paid 💰" : "Free ✅"}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={`relative w-11 h-6 rounded-full transition-colors ${hasWater ? "bg-blue-500" : "bg-slate-300"}`} onClick={() => setHasWater(!hasWater)}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasWater ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium">{hasWater ? "Water 💧" : "No Water"}</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Ground floor, clean..." className={`${inputCls(ring)} resize-none h-20`} />
      </div>
    </>
  );
}

function GoodsFields({ productName, setProductName, price, setPrice, unit, setUnit, shopName, setShopName, ring }: { productName: string; setProductName: (v: string) => void; price: string; setPrice: (v: string) => void; unit: string; setUnit: (v: string) => void; shopName: string; setShopName: (v: string) => void; ring: string }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Product Name *</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Tomatoes, Onions" className={inputCls(ring)} required />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Price (৳) *</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="80" className={inputCls(ring)} required min="0" step="0.01" />
        </div>
        <div className="w-28">
          <label className="block text-sm font-medium mb-1">Unit *</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls(ring)}>
            <option value="kg">per kg</option>
            <option value="piece">per piece</option>
            <option value="dozen">per dozen</option>
            <option value="liter">per liter</option>
            <option value="bundle">per bundle</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Shop Name *</label>
        <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g., Kawran Bazar" className={inputCls(ring)} required />
      </div>
    </>
  );
}

function ViolenceFields({ title, setTitle, description, setDescription, incidentType, setIncidentType, ring }: { title: string; setTitle: (v: string) => void; description: string; setDescription: (v: string) => void; incidentType: string; setIncidentType: (v: string) => void; ring: string }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Incident Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Theft near ATM" className={inputCls(ring)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened?" className={`${inputCls(ring)} resize-none h-20`} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Incident Type *</label>
        <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)} className={inputCls(ring)}>
          <option>Theft</option>
          <option>Assault</option>
          <option>Harassment</option>
          <option>Vandalism</option>
          <option>Robbery</option>
          <option>Other</option>
        </select>
      </div>
    </>
  );
}
