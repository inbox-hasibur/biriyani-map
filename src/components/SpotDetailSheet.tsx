"use client";

import { X, Navigation, Clock, UtensilsCrossed, Star, ShoppingBasket, AlertTriangle, ExternalLink } from "lucide-react";
import { useMapContext, LAYER_META } from "./MapContext";
import type { BiriyaniSpot, ToiletSpot, GoodsPrice, ViolenceReport } from "@/hooks/useMapItems";
import { getTrustMeta } from "@/lib/trustLevel";
import VotingUI from "./VotingUI";

export default function SpotDetailSheet() {
    const { selectedItem, selectItem, activeLayer } = useMapContext();
    if (!selectedItem) return null;
    const meta = LAYER_META[activeLayer];

    return (
        <>
            <div className="fixed inset-0 z-[900] bg-black/10 md:bg-transparent" onClick={() => selectItem(null)} />

            <div className="fixed bottom-0 left-0 right-0 z-[1000] md:left-[80px] animate-slide-up">
                <div className="detail-sheet mx-auto max-w-2xl">
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-slate-300" />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => selectItem(null)}
                        className="absolute top-3 right-4 p-2 hover:bg-slate-100 rounded-xl transition"
                        aria-label="Close"
                    >
                        <X size={18} className="text-slate-400" />
                    </button>

                    {/* Content */}
                    <div className="px-5 pb-2">
                        {activeLayer === "biriyani" && <BiriyaniDetail item={selectedItem as BiriyaniSpot} />}
                        {activeLayer === "toilet" && <ToiletDetail item={selectedItem as ToiletSpot} />}
                        {activeLayer === "goods" && <GoodsDetail item={selectedItem as GoodsPrice} />}
                        {activeLayer === "violence" && <ViolenceDetail item={selectedItem as ViolenceReport} />}
                    </div>

                    {/* Coordinates + Actions */}
                    <div className="px-5 mt-2 flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg">
                            <Navigation size={10} />
                            {selectedItem.lat.toFixed(4)}, {selectedItem.lng.toFixed(4)}
                        </div>
                        <a
                            href={`https://www.google.com/maps?q=${selectedItem.lat},${selectedItem.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                            <ExternalLink size={10} />
                            Google Maps
                        </a>
                    </div>

                    {/* Voting */}
                    <div className="px-5 mt-3">
                        <VotingUI spotId={selectedItem.id} initialScore={selectedItem.score} layer={activeLayer} />
                    </div>

                    <div className="h-6" />
                </div>
            </div>
        </>
    );
}

/* ── Detail sub-views ── */

function BiriyaniDetail({ item }: { item: BiriyaniSpot }) {
    const trust = getTrustMeta(item.score);
    return (
        <>
            <span className="trust-badge mb-2 inline-block" style={{ background: trust.fill }}>{trust.label}</span>
            <h2 className="text-lg font-bold text-slate-800 leading-tight pr-8">{item.title}</h2>
            {item.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>}
            <div className="flex flex-wrap gap-2 mt-2.5">
                {item.food_type && (
                    <Chip icon={<UtensilsCrossed size={11} />} bg="bg-amber-50 text-amber-700">{item.food_type}</Chip>
                )}
                {item.time && (
                    <Chip icon={<Clock size={11} />} bg="bg-blue-50 text-blue-700">
                        {new Date(item.time).toLocaleString("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </Chip>
                )}
            </div>
        </>
    );
}

function ToiletDetail({ item }: { item: ToiletSpot }) {
    return (
        <>
            <div className="flex gap-2 mb-2">
                <span className={`trust-badge ${item.is_paid ? "bg-amber-500" : "bg-green-500"}`}>
                    {item.is_paid ? "💰 Paid" : "✅ Free"}
                </span>
                <span className={`trust-badge ${item.has_water ? "bg-blue-500" : "bg-slate-400"}`}>
                    {item.has_water ? "💧 Water" : "🚫 No Water"}
                </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight pr-8">{item.name}</h2>
            {item.notes && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.notes}</p>}
            <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= Math.round(item.rating_avg) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                    ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                    {item.rating_avg.toFixed(1)} · {item.rating_count} {item.rating_count === 1 ? "review" : "reviews"}
                </span>
            </div>
        </>
    );
}

function GoodsDetail({ item }: { item: GoodsPrice }) {
    return (
        <>
            <Chip icon={<ShoppingBasket size={11} />} bg="bg-emerald-50 text-emerald-700">Price Report</Chip>
            <h2 className="text-lg font-bold text-slate-800 leading-tight mt-2 pr-8">{item.product_name}</h2>
            <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-3xl font-black text-emerald-600">৳{item.price}</span>
                <span className="text-sm text-slate-400 font-medium">/ {item.unit}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
                <Chip bg="bg-emerald-50 text-emerald-700">🏪 {item.shop_name}</Chip>
                {item.created_at && (
                    <Chip icon={<Clock size={11} />} bg="bg-slate-100 text-slate-600">
                        {new Date(item.created_at).toLocaleString("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </Chip>
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
            <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`trust-badge ${severityColor}`}>🔴 {severity} Severity</span>
                <span className="trust-badge bg-red-100 !text-red-700">
                    <AlertTriangle size={10} className="inline mr-1 -mt-0.5" />{item.incident_type}
                </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight pr-8">{item.title}</h2>
            {item.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>}
            {item.created_at && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                    <Clock size={11} />
                    Reported {new Date(item.created_at).toLocaleString("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
            )}
        </>
    );
}

/* ── Shared Chip ── */
function Chip({ icon, bg, children }: { icon?: React.ReactNode; bg: string; children: React.ReactNode }) {
    return (
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg ${bg}`}>
            {icon}
            {children}
        </div>
    );
}
