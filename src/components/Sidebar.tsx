"use client";

import React, { useState } from "react";
import { MapIcon, PlusCircle, Filter, User, Menu } from "lucide-react";

type NavId = "map" | "add" | "filter" | "profile";

export default function Sidebar() {
  const [active, setActive] = useState<NavId>("map");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop / Tablet Dock ── */}
      <div className="hidden md:fixed md:left-4 md:top-4 md:bottom-4 md:w-14 md:flex md:flex-col md:items-center z-[1000] pointer-events-none">
        <div className="sidebar-card pointer-events-auto flex flex-col items-center py-4 gap-2 h-full max-h-[90vh] px-2">
          {/* Brand dot */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-md mb-2">
            B
          </div>

          {/* Nav icons */}
          <div className="flex flex-col gap-1 w-full items-center flex-1">
            <NavIcon id="map" icon={<MapIcon size={18} />} label="Map" active={active} setActive={setActive} />
            <NavIcon id="add" icon={<PlusCircle size={18} />} label="Add Spot" active={active} setActive={setActive} />
            <NavIcon id="filter" icon={<Filter size={18} />} label="Filter" active={active} setActive={setActive} />
          </div>

          {/* Bottom */}
          <div className="mt-auto mb-1 w-full flex flex-col items-center gap-2">
            <NavIcon id="profile" icon={<User size={16} />} label="Profile" active={active} setActive={setActive} />
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ── */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="p-3 sidebar-card flex items-center justify-center rounded-xl shadow-lg"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <button className="p-3 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-lg flex items-center justify-center w-12 h-12">
            <MapIcon size={18} />
          </button>

          <button className="p-3 sidebar-card flex items-center justify-center rounded-xl shadow-lg">
            <User size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function NavIcon({
  id,
  icon,
  active,
  setActive,
  label,
}: {
  id: NavId;
  icon: React.ReactNode;
  active: NavId;
  setActive: (id: NavId) => void;
  label: string;
}) {
  const isActive = active === id;

  return (
    <div className="group relative flex items-center justify-center w-full">
      <button
        onClick={() => setActive(id)}
        className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full flex items-center justify-center ${isActive
          ? "bg-slate-900 text-white shadow-md"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        aria-label={label}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
        {label}
      </span>
    </div>
  );
}
