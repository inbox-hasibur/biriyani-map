"use client";

import { useState, useEffect } from "react";
import { X, Navigation, Clock, UtensilsCrossed, Star, ShoppingBasket, AlertTriangle, ExternalLink, Heart, Trash2 } from "lucide-react";
import { useMapContext, LAYER_META } from "./MapContext";
import type { BiriyaniSpot, ToiletSpot, GoodsPrice, ViolenceReport } from "@/hooks/useMapItems";
import { getTrustMeta } from "@/lib/trustLevel";
import VotingUI from "./VotingUI";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

/* ── Helpers ── */
function relativeTime(dateStr?: string): string {
    if (!dateStr) return "";
    try {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
        return "";
    }
}

function absoluteTime(dateStr?: string): string {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleString("en-BD", {
            year: "numeric", month: "short", day: "numeric",
            hour: "numeric", minute: "2-digit",
        });
    } catch {
        return "";
    }
}

/* ── Table mapping for delete ── */
const TABLE_MAP: Record<string, string> = {
    biriyani: "spots",
    toilet: "toilets",
    goods: "goods_prices",
    violence: "violence_reports",
};

/* ── Interested Button (localStorage) ── */
function useInterested(spotId: string) {
    const key = `interested-${spotId}`;
    const [isInterested, setIsInterested] = useState(false);

    useEffect(() => {
        setIsInterested(localStorage.getItem(key) === "true");
    }, [key]);

    function toggle() {
        const next = !isInterested;
        setIsInterested(next);
        if (next) {
            localStorage.setItem(key, "true");
        } else {
            localStorage.removeItem(key);
        }
    }

    return { isInterested, toggle };
}

export default function SpotDetailSheet() {
    const { selectedItem, selectItem, activeLayer, triggerRefetch } = useMapContext();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    if (!selectedItem) return null;
    const meta = LAYER_META[activeLayer];

    async function handleDelete() {
        if (!selectedItem) return;
        setDeleting(true);
        setDeleteError(null);

        try {
            if (!supabase) {
                // Dev mock — simulate delete
                console.log(`[dev mock] Delete ${activeLayer}:`, selectedItem.id);
                await new Promise((r) => setTimeout(r, 300));
            } else {
                const table = TABLE_MAP[activeLayer];
                const { error } = await supabase.from(table).delete().eq("id", selectedItem.id);
                if (error) throw new Error(error.message);
            }

            setShowDeleteConfirm(false);
            selectItem(null);
            triggerRefetch();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-[900] bg-black/10 md:bg-transparent" onClick={() => selectItem(null)} />

            <div className="fixed bottom-0 left-0 right-0 z-[1000] md:left-[80px] animate-slide-up">
                <div className="detail-sheet mx-auto max-w-2xl gradient-border">
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => selectItem(null)}
                        className="absolute top-3 right-4 p-2 hover:bg-slate-100 rounded-xl transition-all hover:rotate-90 duration-200"
                        aria-label="Close"
                    >
                        <X size={18} className="text-slate-400" />
                    </button>

                    {/* Content */}
                    <div className="px-5 pb-2 animate-fade-up">
                        {activeLayer === "biriyani" && <BiriyaniDetail item={selectedItem as BiriyaniSpot} />}
                        {activeLayer === "toilet" && <ToiletDetail item={selectedItem as ToiletSpot} />}
                        {activeLayer === "goods" && <GoodsDetail item={selectedItem as GoodsPrice} />}
                        {activeLayer === "violence" && <ViolenceDetail item={selectedItem as ViolenceReport} />}
                    </div>

                    {/* Timestamp + Coordinates + Actions */}
                    <div className="px-5 mt-2 flex items-center gap-2 flex-wrap">
                        {"created_at" in selectedItem && selectedItem.created_at && (
                            <div
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-purple-50 text-purple-600 px-2.5 py-1.5 rounded-lg timestamp cursor-help"
                                title={absoluteTime(selectedItem.created_at as string)}
                            >
                                <Clock size={10} />
                                {relativeTime(selectedItem.created_at as string)}
                            </div>
                        )}
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg">
                            <Navigation size={10} />
                            {selectedItem.lat.toFixed(4)}, {selectedItem.lng.toFixed(4)}
                        </div>
                        <a
                            href={`https://www.google.com/maps?q=${selectedItem.lat},${selectedItem.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition hover-lift"
                        >
                            <ExternalLink size={10} />
                            Google Maps
                        </a>
                    </div>

                    {/* Interested + Voting + Delete */}
                    <div className="px-5 mt-3 flex items-center gap-2">
                        <InterestedButton spotId={selectedItem.id} />
                        <div className="flex-1">
                            <VotingUI spotId={selectedItem.id} initialScore={selectedItem.score} layer={activeLayer} />
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all active:scale-90 hover-lift"
                            aria-label="Delete"
                        >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>

                    <div className="h-6" />
                </div>
            </div>

            {/* ── Delete Confirmation Dialog ── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 delete-dialog-overlay animate-fade-up" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="delete-dialog p-6 max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <Trash2 size={20} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Delete this {meta.label.toLowerCase()}?</h3>
                                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
                            </div>
                        </div>

                        {deleteError && (
                            <div className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg animate-fade-up">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 shadow-md shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {deleting ? (
                                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
                                ) : (
                                    <><Trash2 size={12} /> Delete</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Interested Button Component ── */
function InterestedButton({ spotId }: { spotId: string }) {
    const { isInterested, toggle } = useInterested(spotId);

    return (
        <button
            onClick={toggle}
            className={`interested-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-90 ${isInterested
                ? "bg-pink-500 text-white shadow-lg shadow-pink-200 active"
                : "bg-pink-50 text-pink-500 border border-pink-200 hover:bg-pink-100"
                }`}
        >
            <Heart size={14} className={isInterested ? "fill-white" : ""} />
            {isInterested ? "Interested!" : "Interested?"}
        </button>
    );
}

/* ── Detail sub-views ── */

function BiriyaniDetail({ item }: { item: BiriyaniSpot }) {
    const trust = getTrustMeta(item.score);
    return (
        <>
            <span className="trust-badge mb-2 inline-block animate-scale-in" style={{ background: trust.fill }}>{trust.label}</span>
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
                <span className={`trust-badge animate-scale-in ${item.is_paid ? "bg-amber-500" : "bg-green-500"}`}>
                    {item.is_paid ? "💰 Paid" : "✅ Free"}
                </span>
                <span className={`trust-badge animate-scale-in ${item.has_water ? "bg-blue-500" : "bg-slate-400"}`}>
                    {item.has_water ? "💧 Water" : "🚫 No Water"}
                </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight pr-8">{item.name}</h2>
            {item.notes && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.notes}</p>}
            <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={`transition-colors ${s <= Math.round(item.rating_avg) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
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
                        {relativeTime(item.created_at)}
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
                <span className={`trust-badge animate-scale-in ${severityColor}`}>🔴 {severity} Severity</span>
                <span className="trust-badge bg-red-100 !text-red-700 animate-scale-in">
                    <AlertTriangle size={10} className="inline mr-1 -mt-0.5" />{item.incident_type}
                </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight pr-8">{item.title}</h2>
            {item.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>}
            {item.created_at && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 timestamp" title={absoluteTime(item.created_at)}>
                    <Clock size={11} />
                    Reported {relativeTime(item.created_at)}
                </div>
            )}
        </>
    );
}

/* ── Shared Chip ── */
function Chip({ icon, bg, children }: { icon?: React.ReactNode; bg: string; children: React.ReactNode }) {
    return (
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg ${bg} animate-fade-up`}>
            {icon}
            {children}
        </div>
    );
}
