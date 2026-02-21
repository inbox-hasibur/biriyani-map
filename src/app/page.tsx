"use client";

import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import SpotDetailSheet from "@/components/SpotDetailSheet";
import { MapProvider } from "@/components/MapContext";

// Lazy load Map to avoid SSR "window is not defined" error
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-400">
      <span className="animate-pulse font-semibold">Loading Map...</span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapProvider>
        {/* Floating UI (high z-index) */}
        <Sidebar />
        <TopBar />

        {/* Map layer */}
        <div className="absolute inset-0 z-0">
          <Map />
        </div>

        {/* Bottom detail sheet (Google Maps style) */}
        <SpotDetailSheet />
      </MapProvider>
    </main>
  );
}