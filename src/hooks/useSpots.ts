"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type Spot = {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  score?: number;
  verified?: boolean;
};

async function fetchSpots(bbox?: [number, number, number, number], verifiedOnly?: boolean): Promise<Spot[]> {
  // If Supabase is not configured, return a small mocked dataset for local dev preview
  if (!supabase) {
    return Promise.resolve([
      { id: "1", title: "Biriyani at Park", description: "Open to all", lat: 23.815, lng: 90.412, score: 3, verified: true },
      { id: "2", title: "Water point", description: "Bottled water", lat: 23.812, lng: 90.42, score: -6, verified: false },
    ].filter(s => (verifiedOnly ? s.verified : true)));
  }

  // If bbox provided, query by bounding box
  let query = supabase.from('spots').select('id,title,description,lat,lng,score,verified').order('created_at', { ascending: false }).limit(500);
  if (verifiedOnly) query = query.eq('verified', true);
  if (bbox && bbox.length === 4) {
    const [minLat, minLng, maxLat, maxLng] = bbox;
    query = query.gte('lat', minLat).lte('lat', maxLat).gte('lng', minLng).lte('lng', maxLng);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Spot[];
}

export function useSpots(bbox?: [number, number, number, number], verifiedOnly?: boolean) {
  return useQuery({
    queryKey: ['spots', bbox, verifiedOnly],
    queryFn: () => fetchSpots(bbox, verifiedOnly),
    staleTime: 5 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
