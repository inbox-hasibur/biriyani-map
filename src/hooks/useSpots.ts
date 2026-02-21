"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type Spot = {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  food_type?: string;
  time?: string;
  score: number;
};

async function fetchSpots(bbox?: [number, number, number, number]): Promise<Spot[]> {
  // Mock fallback when Supabase is not configured
  if (!supabase) {
    return [
      { id: "1", title: "Biriyani at Park", description: "Open to all", lat: 23.815, lng: 90.412, food_type: "Biriyani", score: 12 },
      { id: "2", title: "Water Distribution", description: "Bottled water", lat: 23.812, lng: 90.42, food_type: "Water", score: 7 },
      { id: "3", title: "Tehari Event", description: "Mosque courtyard", lat: 23.808, lng: 90.415, food_type: "Tehari", score: 2 },
    ];
  }

  let query = supabase
    .from("spots")
    .select("id, title, description, lat, lng, food_type, time, score")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(500);

  if (bbox && bbox.length === 4) {
    const [minLat, minLng, maxLat, maxLng] = bbox;
    query = query.gte("lat", minLat).lte("lat", maxLat).gte("lng", minLng).lte("lng", maxLng);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Spot[];
}

export function useSpots(bbox?: [number, number, number, number]) {
  return useQuery({
    queryKey: ["spots", bbox],
    queryFn: () => fetchSpots(bbox),
    staleTime: 5 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
