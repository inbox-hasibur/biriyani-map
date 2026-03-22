"use client";

import { useState, useEffect, useRef } from "react";
import { X, AlertCircle, MapPin, Check, ChevronDown } from "lucide-react";
import { LAYER_META, type MapLayer } from "./MapContext";

/* ── Form data types ── */
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
  lat: number; lng: number;
  error?: string | null;
  activeLayer: MapLayer;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);
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

  // Clear local error when parent error changes
  useEffect(() => { if (error) setLocalError(error); }, [error]);

  // Reverse geocode to get location name
  useEffect(() => {
    if (!isOpen) return;
    setLocationName("");
    const controller = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18`, {
      headers: { "User-Agent": "UniMap/1.0" },
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (data?.display_name) {
          // Take first 2-3 parts for a concise name
          const parts = data.display_name.split(",").map((s: string) => s.trim());
          setLocationName(parts.slice(0, 3).join(", "));
        }
      })
      .catch(() => { /* ignore */ });
    return () => controller.abort();
  }, [lat, lng, isOpen]);

  if (!isOpen) return null;

  function resetAll() {
    setTitle(""); setDescription(""); setFoodType("Biriyani"); setTime("");
    setToiletName(""); setIsPaid(false); setHasWater(true); setToiletNotes("");
    setProductName(""); setPrice(""); setUnit("kg"); setShopName("");
    setViolenceTitle(""); setViolenceDesc(""); setIncidentType("Theft");
    setSuccess(false);
    setLocalError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setLocalError(null);
    try {
      let data: LayerFormData;
      switch (activeLayer) {
        case "biriyani": data = { title, description, foodType, time }; break;
        case "toilet": data = { name: toiletName, isPaid, hasWater, notes: toiletNotes }; break;
        case "goods": data = { productName, price: parseFloat(price) || 0, unit, shopName }; break;
        case "violence": data = { title: violenceTitle, description: violenceDesc, incidentType }; break;
      }
      await onSubmit(data, lat, lng);
      // Only show success if onSubmit didn't throw
      setSuccess(true);
      setTimeout(() => { resetAll(); }, 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save. Please try again.";
      setLocalError(msg);
      setSuccess(false);
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

  const displayError = localError || error;

  return (
    <>
      {/* ── Bottom Sheet — sits above mobile nav ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] md:left-[204px] animate-slide-up pointer-events-auto"
        style={{ bottom: "env(safe-area-inset-bottom, 0px)" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div ref={formRef} className="create-sheet mx-auto max-w-lg md:mb-0 mb-[120px]">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1.5">
            <div className="w-10 h-1 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${meta.accentBg} flex items-center justify-center text-lg md:text-xl shadow-md animate-bounce-in`}>
                {meta.emoji}
              </div>
              <div>
                <span className="text-sm md:text-base font-bold text-slate-800">{meta.addLabel}</span>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <MapPin size={11} />
                  {locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all hover:rotate-90 duration-200" aria-label="Close">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Scrollable form area for mobile */}
          <div className="max-h-[45vh] md:max-h-[50vh] overflow-y-auto scrollbar-hide">
            {/* Error */}
            {displayError && (
              <div className="mx-4 mb-2 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-3 text-sm animate-fade-up">
                <AlertCircle size={16} className="mt-0.5 shrink-0 animate-pulse" />
                <div>
                  <span className="font-semibold">Error: </span>
                  <span>{displayError}</span>
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mx-4 mb-2 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-3 text-sm animate-bounce-in">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                  <Check size={14} className="text-white" />
                </div>
                <span className="font-semibold">Added successfully!</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
              {activeLayer === "biriyani" && (
                <>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className={inpCls(meta.accentRing)} required />
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className={inpCls(meta.accentRing)} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={foodType} onChange={(e) => setFoodType(e.target.value)} className={inpCls(meta.accentRing)}>
                      <option>Biriyani</option><option>Tehari</option><option>Water</option><option>Iftar Pack</option><option>Other</option>
                    </select>
                    <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} className={inpCls(meta.accentRing)} />
                  </div>
                </>
              )}
              {activeLayer === "toilet" && (
                <>
                  <input type="text" value={toiletName} onChange={(e) => setToiletName(e.target.value)} placeholder="Toilet name *" className={inpCls(meta.accentRing)} required />
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setIsPaid(!isPaid)} className={`${pillCls} ${isPaid ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                      {isPaid ? "💰 Paid" : "✅ Free"}
                    </button>
                    <button type="button" onClick={() => setHasWater(!hasWater)} className={`${pillCls} ${hasWater ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                      {hasWater ? "💧 Water" : "🚫 No Water"}
                    </button>
                  </div>
                  <input type="text" value={toiletNotes} onChange={(e) => setToiletNotes(e.target.value)} placeholder="Notes (optional)" className={inpCls(meta.accentRing)} />
                </>
              )}
              {activeLayer === "goods" && (
                <>
                  <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name *" className={inpCls(meta.accentRing)} required />
                  <div className="grid grid-cols-5 gap-2">
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="৳ Price *" className={`col-span-3 ${inpCls(meta.accentRing)}`} required min="0" step="0.5" />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className={`col-span-2 ${inpCls(meta.accentRing)}`}>
                      <option value="kg">per kg</option><option value="piece">per pc</option><option value="dozen">per dz</option><option value="liter">per L</option>
                    </select>
                  </div>
                  <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop / market name *" className={inpCls(meta.accentRing)} required />
                </>
              )}
              {activeLayer === "violence" && (
                <>
                  <input type="text" value={violenceTitle} onChange={(e) => setViolenceTitle(e.target.value)} placeholder="Incident title *" className={inpCls(meta.accentRing)} required />
                  <input type="text" value={violenceDesc} onChange={(e) => setViolenceDesc(e.target.value)} placeholder="What happened? (optional)" className={inpCls(meta.accentRing)} />
                  <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)} className={inpCls(meta.accentRing)}>
                    <option>Theft</option><option>Assault</option><option>Harassment</option><option>Vandalism</option><option>Robbery</option><option>Eve Teasing</option><option>Other</option>
                  </select>
                </>
              )}

              <button
                type="submit"
                disabled={loading || !isValid()}
                className={`w-full ${meta.ctaClass} py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center justify-center gap-2 hover-lift min-h-[48px]`}
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : success ? (
                  <><Check size={18} className="animate-bounce-in" /> Done!</>
                ) : (
                  `${meta.addLabel} ${meta.emoji}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const inpCls = (ring: string) => `w-full px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${ring} text-sm bg-white placeholder:text-slate-400 transition-all focus:shadow-md focus:border-transparent`;
const pillCls = "w-full px-3 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95 text-center hover:shadow-sm min-h-[44px]";
