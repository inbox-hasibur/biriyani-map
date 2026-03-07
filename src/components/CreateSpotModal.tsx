"use client";

import { useState } from "react";
import { X, AlertCircle, MapPin } from "lucide-react";
import { LAYER_META, type MapLayer } from "./MapContext";

/* ── Form data types per layer ── */
export type BiriyaniFormData = { title: string; description?: string; foodType: string; time?: string };
export type ToiletFormData = { name: string; isPaid: boolean; hasWater: boolean; notes?: string };
export type GoodsFormData = { productName: string; price: number; unit: string; shopName: string };
export type ViolenceFormData = { title: string; description?: string; incidentType: string };
export type LayerFormData = BiriyaniFormData | ToiletFormData | GoodsFormData | ViolenceFormData;

export default function CreateSpotModal({
  isOpen, onClose, onSubmit, lat, lng, error, activeLayer,
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
  const meta = LAYER_META[activeLayer];

  // Biriyani
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState("Biriyani");
  const [time, setTime] = useState("");
  // Toilet
  const [toiletName, setToiletName] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [hasWater, setHasWater] = useState(true);
  const [toiletNotes, setToiletNotes] = useState("");
  // Goods
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [shopName, setShopName] = useState("");
  // Violence
  const [violenceTitle, setViolenceTitle] = useState("");
  const [violenceDesc, setViolenceDesc] = useState("");
  const [incidentType, setIncidentType] = useState("Theft");

  if (!isOpen) return null;

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
        case "biriyani": data = { title, description, foodType, time }; break;
        case "toilet": data = { name: toiletName, isPaid, hasWater, notes: toiletNotes }; break;
        case "goods": data = { productName, price: parseFloat(price) || 0, unit, shopName }; break;
        case "violence": data = { title: violenceTitle, description: violenceDesc, incidentType }; break;
      }
      await onSubmit(data, lat, lng);
      resetAll();
    } catch (err) {
      console.error(err);
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="modal-card relative w-full md:w-[420px] md:rounded-2xl rounded-t-2xl md:max-h-[85vh] max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className={`px-6 pt-5 pb-4 border-b border-slate-100`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close"
          >
            <X size={18} className="text-slate-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${meta.accentBg} flex items-center justify-center text-xl shadow-sm`}>
              {meta.emoji}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{meta.addLabel}</h2>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                <MapPin size={10} />
                <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {activeLayer === "biriyani" && (
            <>
              <Field label="Title" required>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Biriyani Distribution at Park" className={fieldCls(meta.accentRing)} required />
              </Field>
              <Field label="Description">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." className={`${fieldCls(meta.accentRing)} resize-none h-20`} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Food Type" required>
                  <select value={foodType} onChange={(e) => setFoodType(e.target.value)} className={fieldCls(meta.accentRing)}>
                    <option>Biriyani</option><option>Tehari</option><option>Water</option><option>Iftar Pack</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Event Time">
                  <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} className={fieldCls(meta.accentRing)} />
                </Field>
              </div>
            </>
          )}

          {activeLayer === "toilet" && (
            <>
              <Field label="Toilet Name" required>
                <input type="text" value={toiletName} onChange={(e) => setToiletName(e.target.value)} placeholder="e.g., City Center Public Toilet" className={fieldCls(meta.accentRing)} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <ToggleField label="Cost" checked={isPaid} onChange={setIsPaid} activeLabel="💰 Paid" inactiveLabel="✅ Free" />
                <ToggleField label="Water" checked={hasWater} onChange={setHasWater} activeLabel="💧 Available" inactiveLabel="🚫 None" />
              </div>
              <Field label="Notes">
                <textarea value={toiletNotes} onChange={(e) => setToiletNotes(e.target.value)} placeholder="e.g., Ground floor, fairly clean..." className={`${fieldCls(meta.accentRing)} resize-none h-16`} />
              </Field>
            </>
          )}

          {activeLayer === "goods" && (
            <>
              <Field label="Product Name" required>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Tomatoes, Onions" className={fieldCls(meta.accentRing)} required />
              </Field>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3">
                  <Field label="Price (৳)" required>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="80" className={fieldCls(meta.accentRing)} required min="0" step="0.5" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Unit" required>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className={fieldCls(meta.accentRing)}>
                      <option value="kg">per kg</option><option value="piece">per piece</option><option value="dozen">per dozen</option><option value="liter">per liter</option><option value="bundle">per bundle</option>
                    </select>
                  </Field>
                </div>
              </div>
              <Field label="Shop / Market Name" required>
                <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g., Kawran Bazar" className={fieldCls(meta.accentRing)} required />
              </Field>
            </>
          )}

          {activeLayer === "violence" && (
            <>
              <Field label="Incident Title" required>
                <input type="text" value={violenceTitle} onChange={(e) => setViolenceTitle(e.target.value)} placeholder="e.g., Theft near ATM" className={fieldCls(meta.accentRing)} required />
              </Field>
              <Field label="Description">
                <textarea value={violenceDesc} onChange={(e) => setViolenceDesc(e.target.value)} placeholder="What happened? Give details..." className={`${fieldCls(meta.accentRing)} resize-none h-20`} />
              </Field>
              <Field label="Incident Type" required>
                <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)} className={fieldCls(meta.accentRing)}>
                  <option>Theft</option><option>Assault</option><option>Harassment</option><option>Vandalism</option><option>Robbery</option><option>Eve Teasing</option><option>Other</option>
                </select>
              </Field>
            </>
          )}

          <button
            type="submit"
            disabled={loading || !isValid()}
            className={`w-full ${meta.ctaClass} py-3.5 rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]`}
          >
            {loading ? "Saving..." : `${meta.addLabel} ${meta.emoji}`}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Reusable Components ── */

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange, activeLabel, inactiveLabel }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; activeLabel: string; inactiveLabel: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${checked
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
      >
        {checked ? activeLabel : inactiveLabel}
      </button>
    </div>
  );
}

function fieldCls(ring: string) {
  return `w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${ring} text-sm bg-slate-50/50 placeholder:text-slate-400 transition`;
}
