"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { MapLayer } from "@/components/MapContext";

/* ──────────────── Type Definitions ──────────────── */

export type BiriyaniSpot = {
    _layer: "biriyani";
    id: string;
    title: string;
    description?: string;
    lat: number;
    lng: number;
    food_type?: string;
    time?: string;
    score: number;
    created_at?: string;
};

export type ToiletSpot = {
    _layer: "toilet";
    id: string;
    name: string;
    lat: number;
    lng: number;
    is_paid: boolean;
    has_water: boolean;
    rating_avg: number;
    rating_count: number;
    notes?: string;
    score: number;
    created_at?: string;
};

export type GoodsPrice = {
    _layer: "goods";
    id: string;
    product_name: string;
    price: number;
    unit: string;
    shop_name: string;
    lat: number;
    lng: number;
    score: number;
    created_at?: string;
};

export type ViolenceReport = {
    _layer: "violence";
    id: string;
    title: string;
    description?: string;
    incident_type: string;
    lat: number;
    lng: number;
    upvotes: number;
    downvotes: number;
    created_at?: string;
    score: number;
};

export type MapItem = BiriyaniSpot | ToiletSpot | GoodsPrice | ViolenceReport;

/* ──────────────── Mock Data ──────────────── */

const MOCK_BIRIYANI: BiriyaniSpot[] = [
    { _layer: "biriyani", id: "b1", title: "Biriyani at Park", description: "Open to all", lat: 23.815, lng: 90.412, food_type: "Biriyani", score: 12 },
    { _layer: "biriyani", id: "b2", title: "Water Distribution", description: "Bottled water", lat: 23.812, lng: 90.42, food_type: "Water", score: 7 },
    { _layer: "biriyani", id: "b3", title: "Tehari Event", description: "Mosque courtyard", lat: 23.808, lng: 90.415, food_type: "Tehari", score: 2 },
];

const MOCK_TOILETS: ToiletSpot[] = [
    { _layer: "toilet", id: "t1", name: "City Center Public Toilet", lat: 23.811, lng: 90.407, is_paid: false, has_water: true, rating_avg: 3.5, rating_count: 12, notes: "Clean, ground floor", score: 8 },
    { _layer: "toilet", id: "t2", name: "Market Toilet", lat: 23.818, lng: 90.418, is_paid: true, has_water: true, rating_avg: 4.2, rating_count: 24, notes: "₹5 entry", score: 15 },
    { _layer: "toilet", id: "t3", name: "Bus Station Restroom", lat: 23.806, lng: 90.422, is_paid: false, has_water: false, rating_avg: 1.8, rating_count: 6, score: -2 },
];

const MOCK_GOODS: GoodsPrice[] = [
    { _layer: "goods", id: "g1", product_name: "Tomatoes", price: 80, unit: "kg", shop_name: "Bazar Fresh", lat: 23.813, lng: 90.409, score: 10, created_at: "2026-03-06T10:00:00Z" },
    { _layer: "goods", id: "g2", product_name: "Onions", price: 45, unit: "kg", shop_name: "Kawran Bazar", lat: 23.817, lng: 90.414, score: 6, created_at: "2026-03-06T12:00:00Z" },
    { _layer: "goods", id: "g3", product_name: "Potatoes", price: 30, unit: "kg", shop_name: "Local Shop", lat: 23.81, lng: 90.419, score: 3, created_at: "2026-03-07T08:00:00Z" },
];

const MOCK_VIOLENCE: ViolenceReport[] = [
    { _layer: "violence", id: "v1", title: "Theft near ATM", description: "Phone snatched at night", incident_type: "Theft", lat: 23.816, lng: 90.41, upvotes: 14, downvotes: 1, score: 13, created_at: "2026-03-05T22:30:00Z" },
    { _layer: "violence", id: "v2", title: "Harassment at bus stop", description: "Group harassing passengers", incident_type: "Harassment", lat: 23.809, lng: 90.413, upvotes: 8, downvotes: 2, score: 6, created_at: "2026-03-06T18:00:00Z" },
    { _layer: "violence", id: "v3", title: "Vandalism of shopfront", description: "Shop window broken overnight", incident_type: "Vandalism", lat: 23.814, lng: 90.424, upvotes: 3, downvotes: 0, score: 3, created_at: "2026-03-07T06:00:00Z" },
];

/* ──────────────── Fetch Functions ──────────────── */

async function fetchBiriyani(bbox?: [number, number, number, number]): Promise<BiriyaniSpot[]> {
    if (!supabase) return MOCK_BIRIYANI;

    let query = supabase
        .from("spots")
        .select("id, title, description, lat, lng, food_type, time, score, created_at")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(500);

    if (bbox?.length === 4) {
        const [minLat, minLng, maxLat, maxLng] = bbox;
        query = query.gte("lat", minLat).lte("lat", maxLat).gte("lng", minLng).lte("lng", maxLng);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as Omit<BiriyaniSpot, "_layer">[]).map((d) => ({ ...d, _layer: "biriyani" as const }));
}

async function fetchToilets(bbox?: [number, number, number, number]): Promise<ToiletSpot[]> {
    if (!supabase) return MOCK_TOILETS;

    let query = supabase
        .from("toilets")
        .select("id, name, lat, lng, is_paid, has_water, rating_avg, rating_count, notes, score, created_at")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(500);

    if (bbox?.length === 4) {
        const [minLat, minLng, maxLat, maxLng] = bbox;
        query = query.gte("lat", minLat).lte("lat", maxLat).gte("lng", minLng).lte("lng", maxLng);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as Omit<ToiletSpot, "_layer">[]).map((d) => ({ ...d, _layer: "toilet" as const }));
}

async function fetchGoods(bbox?: [number, number, number, number]): Promise<GoodsPrice[]> {
    if (!supabase) return MOCK_GOODS;

    let query = supabase
        .from("goods_prices")
        .select("id, product_name, price, unit, shop_name, lat, lng, score, created_at")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(500);

    if (bbox?.length === 4) {
        const [minLat, minLng, maxLat, maxLng] = bbox;
        query = query.gte("lat", minLat).lte("lat", maxLat).gte("lng", minLng).lte("lng", maxLng);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as Omit<GoodsPrice, "_layer">[]).map((d) => ({ ...d, _layer: "goods" as const }));
}

async function fetchViolence(bbox?: [number, number, number, number]): Promise<ViolenceReport[]> {
    if (!supabase) return MOCK_VIOLENCE;

    let query = supabase
        .from("violence_reports")
        .select("id, title, description, incident_type, lat, lng, upvotes, downvotes, score, created_at")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(500);

    if (bbox?.length === 4) {
        const [minLat, minLng, maxLat, maxLng] = bbox;
        query = query.gte("lat", minLat).lte("lat", maxLat).gte("lng", minLng).lte("lng", maxLng);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as Omit<ViolenceReport, "_layer">[]).map((d) => ({ ...d, _layer: "violence" as const }));
}

/* ──────────────── Main Hook ──────────────── */

const FETCHERS: Record<MapLayer, (bbox?: [number, number, number, number]) => Promise<MapItem[]>> = {
    biriyani: fetchBiriyani,
    toilet: fetchToilets,
    goods: fetchGoods,
    violence: fetchViolence,
};

export function useMapItems(layer: MapLayer, bbox?: [number, number, number, number], refetchTrigger?: number) {
    return useQuery({
        queryKey: ["mapItems", layer, bbox, refetchTrigger],
        queryFn: () => FETCHERS[layer](bbox),
        staleTime: 5 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
