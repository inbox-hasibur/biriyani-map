"use client";

import { X, Navigation, Clock, UtensilsCrossed } from "lucide-react";
import { useMapContext } from "./MapContext";
import { getTrustMeta } from "@/lib/markerIcon";
import VotingUI from "./VotingUI";

export default function SpotDetailSheet() {
    const { selectedSpot, selectSpot } = useMapContext();

    if (!selectedSpot) return null;

    const trust = getTrustMeta(selectedSpot.score);

    return (
        <>
            {/* Backdrop — click to close on desktop */}
            <div
                className="fixed inset-0 z-[900] bg-black/10 md:bg-transparent"
                onClick={() => selectSpot(null)}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-[1000] md:left-[80px] animate-slide-up">
                <div className="detail-sheet mx-auto max-w-2xl">
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-slate-300" />
                    </div>

                    {/* Header Row */}
                    <div className="px-5 pb-2 flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            {/* Trust Badge */}
                            <span
                                className="trust-badge mb-2 inline-block"
                                style={{ background: trust.fill }}
                            >
                                {trust.label}
                            </span>

                            <h2 className="text-lg font-bold text-slate-800 leading-tight">
                                {selectedSpot.title}
                            </h2>

                            {selectedSpot.description && (
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                    {selectedSpot.description}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => selectSpot(null)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition shrink-0 ml-3"
                            aria-label="Close"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Info Chips */}
                    <div className="px-5 flex flex-wrap gap-2 mt-1">
                        {selectedSpot.food_type && (
                            <div className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                                <UtensilsCrossed size={12} />
                                {selectedSpot.food_type}
                            </div>
                        )}
                        {selectedSpot.time && (
                            <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                                <Clock size={12} />
                                {new Date(selectedSpot.time).toLocaleString("en-BD", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                            <Navigation size={12} />
                            {selectedSpot.lat.toFixed(4)}, {selectedSpot.lng.toFixed(4)}
                        </div>
                    </div>

                    {/* Score + Voting */}
                    <div className="px-5 mt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-400 font-medium">Community Score</span>
                            <span className="text-sm font-bold" style={{ color: trust.fill }}>
                                {selectedSpot.score > 0 ? "+" : ""}
                                {selectedSpot.score}
                            </span>
                        </div>
                        <VotingUI spotId={selectedSpot.id} initialScore={selectedSpot.score} />
                    </div>

                    {/* Bottom safe area padding for mobile */}
                    <div className="h-6" />
                </div>
            </div>
        </>
    );
}
