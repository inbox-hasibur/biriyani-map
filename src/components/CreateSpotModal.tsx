"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

export type SpotFormData = {
  title: string;
  description?: string;
  foodType: string;
  time?: string;
};

export default function CreateSpotModal({
  isOpen,
  onClose,
  onSubmit,
  lat,
  lng,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SpotFormData, lat: number, lng: number) => Promise<void>;
  lat: number;
  lng: number;
  error?: string | null;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState("Biriyani");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await onSubmit({ title, description, foodType, time }, lat, lng);
      // Reset only on success (parent closes modal)
      setTitle("");
      setDescription("");
      setFoodType("Biriyani");
      setTime("");
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="ui-card rounded-t-2xl md:rounded-2xl w-full md:w-96 p-6 relative shadow-2xl max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-1">Drop a Spot 📍</h2>
        <p className="text-xs text-slate-500 mb-4">
          Location: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>

        {/* Supabase error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4 text-xs">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biriyani Distribution at Park"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-20 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Food Type *</label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            >
              <option>Biriyani</option>
              <option>Tehari</option>
              <option>Water</option>
              <option>Iftar Pack</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Event Time</label>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !title}
            className="w-full cta-yellow py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Drop Spot 🍛"}
          </button>
        </form>
      </div>
    </div>
  );
}
