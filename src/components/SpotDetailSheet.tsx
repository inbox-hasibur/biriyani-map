"use client";

import { X, Navigation, Clock, UtensilsCrossed, Droplets, Star, ShoppingBasket, AlertTriangle } from "lucide-react";
import { useMapContext, MapLayer } from "./MapContext";
import type { BiriyaniSpot, ToiletSpot, GoodsPrice, ViolenceReport } from "@/hooks/useMapItems";
import { getTrustMeta } from "@/lib/trustLevel";
import VotingUI from "./VotingUI";

export default function SpotDetailSheet() {
    const { selectedItem, selectItem, activeLayer } = useMapContext();

    if (!selectedItem) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[900] bg-black/10 md:bg-transparent"
                onClick={() => selectItem(null)}
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
                            {activeLayer === "biriyani" && <BiriyaniDetail item={selectedItem as BiriyaniSpot} />}
                            {activeLayer === "toilet" && <ToiletDetail item={selectedItem as ToiletSpot} />}
                            {activeLayer === "goods" && <GoodsDetail item={selectedItem as GoodsPrice} />}
                            {activeLayer === "violence" && <ViolenceDetail item={selectedItem as ViolenceReport} />}
                        </div>

                        <button
                            onClick={() => selectItem(null)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition shrink-0 ml-3"
                            aria-label="Close"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Coordinates Chip */}
                    <div className="px-5 mt-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                            <Navigation size={12} />
                            {selectedItem.lat.toFixed(4)}, {selectedItem.lng.toFixed(4)}
                        </div>
                    </div>

                    {/* Score + Voting */}
                    <div className="px-5 mt-3">
                        <VotingUI
                            spotId={selectedItem.id}
                            initialScore={selectedItem.score}
                            layer={activeLayer}
                        />
                    </div>

                    {/* Bottom safe area padding */}
                    <div className="h-6" />
                </div>
            </div>
        </>
    );
}

/* ── Layer-Specific Detail Views ── */

function BiriyaniDetail({ item }: { item: BiriyaniSpot }) {
    const trust = getTrustMeta(item.score);
    return (
        <>
            <span className="trust-badge mb-2 inline-block" style={{ background: trust.fill }}>
                {trust.label}
            </span>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.title}</h2>
            {item.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
                {item.food_type && (
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                        <UtensilsCrossed size={12} />
                        {item.food_type}
                    </div>
                )}
                {item.time && (
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                        <Clock size={12} />
                        {new Date(item.time).toLocaleString("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                )}
            </div>
        </>
    );
}

function ToiletDetail({ item }: { item: ToiletSpot }) {
    return (
        <>
            <div className="flex gap-2 mb-2">
                <span className={`trust-badge inline-block ${item.is_paid ? "bg-amber-500" : "bg-green-500"}`}>
                    {item.is_paid ? "💰 Paid" : "✅ Free"}
                </span>
                <span className={`trust-badge inline-block ${item.has_water ? "bg-blue-500" : "bg-slate-400"}`}>
                    {item.has_water ? "💧 Water" : "🚫 No Water"}
                </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.name}</h2>
            {item.notes && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.notes}</p>}
            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            size={14}
                            className={s <= Math.round(item.rating_avg) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
                        />
                    ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">{item.rating_avg.toFixed(1)} ({item.rating_count} reviews)</span>
            </div>
        </>
    );
}

function GoodsDetail({ item }: { item: GoodsPrice }) {
    return (
        <>
            <span className="trust-badge mb-2 inline-block bg-emerald-500">
                <ShoppingBasket size={10} className="inline mr-1" />
                Price Report
            </span>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.product_name}</h2>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">৳{item.price}</span>
                <span className="text-sm text-slate-500 font-medium">/ {item.unit}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
                    🏪 {item.shop_name}
                </div>
                {item.created_at && (
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                        <Clock size={12} />
                        {new Date(item.created_at).toLocaleString("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                )}
            </div>
        </>
    );
}

function ViolenceDetail({ item }: { item: ViolenceReport }) {
    const severity = item.score >= 10 ? "High" : item.score >= 5 ? "Medium" : "Low";
    const severityColor = item.score >= 10 ? "bg-red-600" : item.score >= 5 ? "bg-orange-500" : "bg-yellow-500";

    return (
        <>
            <div className="flex gap-2 mb-2">
                <span className={`trust-badge inline-block ${severityColor}`}>
                    {severity} Severity
                </span>
                <span className="trust-badge inline-block bg-red-100 !text-red-700">
                    <AlertTriangle size={10} className="inline mr-1" />
                    {item.incident_type}
                </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.title}</h2>
            {item.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>}
            {item.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                    <Clock size={12} />
                    {new Date(item.created_at).toLocaleString("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
            )}
        </>
    );
}
