// Pure score-threshold logic — no Leaflet, safe to import in SSR components.

export type TrustLevel = "unconfirmed" | "almost" | "confirmed";

export function getTrustLevel(score: number): TrustLevel {
    if (score >= 10) return "confirmed";
    if (score >= 5) return "almost";
    return "unconfirmed";
}

export const TRUST_META: Record<TrustLevel, { fill: string; glow: string; label: string }> = {
    confirmed: { fill: "#16a34a", glow: "rgba(22,163,74,0.35)", label: "Confirmed" },
    almost: { fill: "#eab308", glow: "rgba(234,179,8,0.30)", label: "Almost Confirmed" },
    unconfirmed: { fill: "#94a3b8", glow: "rgba(148,163,184,0.25)", label: "Unconfirmed" },
};

export function getTrustMeta(score: number) {
    return TRUST_META[getTrustLevel(score)];
}
