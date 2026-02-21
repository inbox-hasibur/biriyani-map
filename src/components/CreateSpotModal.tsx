"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SpotFormData, lat: number, lng: number) => Promise<void>;
  lat: number;
  lng: number;
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
      setTitle("");
      setDescription("");
      setFoodType("Biriyani");
      setTime("");
      onClose();
    } catch (err) {
      console.error("submit error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="ui-card rounded-t-2xl md:rounded-2xl w-full md:w-96 p-6 relative shadow-2xl max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">Create New Spot</h2>
        <p className="text-xs text-slate-500 mb-4">Location: {lat.toFixed(3)}, {lng.toFixed(3)}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biriyani Distribution at Park"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Food Type *</label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option>Biriyani</option>
              <option>Tehari</option>
              <option>Water</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Event Time</label>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cta-yellow py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Spot"}
          </button>
        </form>
      </div>
    </div>
  );
}
