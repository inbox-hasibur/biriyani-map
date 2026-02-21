"use client";

import React, { useState } from "react";
import { Map, PlusCircle, Filter, User, Menu } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop / Tablet Dock - hidden on small screens */}
      <div className="hidden md:fixed md:left-4 md:top-4 md:bottom-4 md:w-16 md:flex md:flex-col md:items-center z-[1000] pointer-events-none">
          <div className="ui-card bg-white/95 rounded-2xl flex flex-col items-center py-5 gap-5 pointer-events-auto h-full max-h-[90vh] px-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white shadow cursor-pointer hover:scale-105 transition active:scale-95">
              <Menu size={18} />
            </div>

            <div className="flex flex-col gap-4 mt-3 w-full items-center flex-1">
              <NavIcon icon={<Map size={20} />} label="Map" active />
              <NavIcon icon={<PlusCircle size={20} />} label="Add Spot" />
              <NavIcon icon={<Filter size={20} />} label="Filter" />
            </div>

            <div className="mt-auto mb-2 w-full flex flex-col items-center gap-3">
              <button className="w-full cta-yellow py-2 rounded-xl text-sm font-semibold">Track Near Me</button>
              <NavIcon icon={<User size={18} />} label="Profile" />
            </div>
          </div>
      </div>

      {/* Mobile bottom bar - visible on small screens */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setOpen((s) => !s)}
            className="p-3 ui-card flex items-center justify-center rounded-xl shadow-lg"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <button className="p-3 rounded-full cta-yellow shadow-lg flex items-center justify-center w-14 h-14">
            <Map size={20} />
          </button>

          <button className="p-3 ui-card flex items-center justify-center rounded-xl shadow-lg">
            <User size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

function NavIcon({ icon, active, label }: { icon: React.ReactNode; active?: boolean; label: string }) {
  return (
    <div className="group relative flex items-center justify-center">
      <div
        className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
          active
            ? "bg-orange-100 text-orange-600 shadow-sm"
            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        }`}
      >
        {icon}
      </div>
      
      {/* Tooltip on Hover */}
      <span className="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}