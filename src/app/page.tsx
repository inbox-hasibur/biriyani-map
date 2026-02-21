"use client";

import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { MapProvider } from "@/components/MapContext";

// Lazy load the Map component to avoid "window is not defined" error
const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-400">
      <span className="animate-pulse font-semibold">Loading Map...</span>
    </div>
  )
});

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapProvider>
        {/* Floating UI Elements (Z-Index High) */}
        <Sidebar />
        <TopBar />

        {/* The Map Layer (Z-Index Low) */}
        <div className="absolute inset-0 z-0">
          <Map />
        </div>
      </MapProvider>
    </main>
  );
}