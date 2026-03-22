"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { UtensilsCrossed, PlusCircle, Locate, ShoppingBasket, AlertTriangle, Droplets, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Navigation, X, Clock, LogIn, LogOut, Shield, MapPin, Settings } from "lucide-react";
import { useMapContext, LAYER_META, LAYER_ORDER, MapLayer } from "./MapContext";
import { useMapItems, MapItem } from "@/hooks/useMapItems";
import { useAuth } from "@/lib/AuthProvider";
import { isAdmin } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";

/* ── Portal-based profile dropdown (avoids overflow-hidden clipping) ── */
function ProfileDropdown({
  anchorRef,
  open,
  onClose,
  displayName,
  displayEmail,
  showAdminLink,
  visibleCount,
  onLogout,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  displayName: string;
  displayEmail: string;
  showAdminLink: boolean;
  visibleCount: number;
  onLogout: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position from anchor button
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setStyle({
      position: "fixed",
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      zIndex: 9999,
      width: 256,
    });
  }, [open, anchorRef]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const initial = displayName.charAt(0).toUpperCase();

  return createPortal(
    <div ref={dropdownRef} style={style} className="profile-dropdown rounded-xl overflow-hidden animate-fade-up">
      {/* Gradient header */}
      <div className="p-3.5 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-lg font-bold shadow-md">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-white/70 truncate">{displayEmail}</p>
          </div>
        </div>
        {/* Mini stats row */}
        <div className="flex items-center gap-0 mt-3 bg-white/10 rounded-lg overflow-hidden">
          <div className="flex-1 py-2 text-center border-r border-white/20">
            <p className="text-base font-bold text-white">{visibleCount}</p>
            <p className="text-[9px] text-white/60 uppercase tracking-wider">Visible</p>
          </div>
          <div className="flex-1 py-2 text-center border-r border-white/20">
            <p className="text-base font-bold text-white">{LAYER_ORDER.length}</p>
            <p className="text-[9px] text-white/60 uppercase tracking-wider">Layers</p>
          </div>
          <div className="flex-1 py-2 text-center">
            <p className="text-base font-bold text-white">🌍</p>
            <p className="text-[9px] text-white/60 uppercase tracking-wider">UniMap</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white py-1">
        <a href="/" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">
          <MapPin size={14} className="text-blue-500 shrink-0" />
          Go to Map
        </a>
        {showAdminLink && (
          <a href="/admin" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium">
            <Shield size={14} className="text-amber-500 shrink-0" />
            Admin Dashboard
          </a>
        )}
        <div className="mx-3.5 h-px bg-slate-100 my-1" />
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition w-full text-left font-medium"
        >
          <LogOut size={14} className="shrink-0" />
          Log Out
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function Sidebar() {
  const { mode, setMode, activeLayer, setActiveLayer, map, selectItem } = useMapContext();
  const [collapsed, setCollapsed] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const meta = LAYER_META[activeLayer];
  const { user, isLocalAdmin, signOut, adminSignOut } = useAuth();

  const isLoggedIn = !!user || isLocalAdmin;
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || (isLocalAdmin ? "Admin" : "");
  const displayEmail = user?.email || (isLocalAdmin ? "admin@local" : "");
  const showAdminLink = isAdmin(user?.email) || isLocalAdmin;

  const itemsQuery = useMapItems(activeLayer, undefined);
  const items = itemsQuery.data ?? [];

  // Ref for the profile trigger button (desktop)
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);

  function handleLocate() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 16, { animate: true }),
      () => alert("Could not get your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const layerIcons: Record<MapLayer, React.ReactNode> = {
    biriyani: <UtensilsCrossed size={16} />,
    toilet: <Droplets size={16} />,
    goods: <ShoppingBasket size={16} />,
    violence: <AlertTriangle size={16} />,
  };

  function handleItemClick(item: MapItem) {
    selectItem(item);
    setListOpen(false);
    if (map && item.lat && item.lng) {
      map.setView([item.lat, item.lng], 17, { animate: true });
    }
  }

  async function handleLogout() {
    setProfileOpen(false);
    setMobileProfileOpen(false);
    if (isLocalAdmin) adminSignOut();
    await signOut();
  }

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <>
      {/* ── Portal dropdown (outside overflow containers) ── */}
      <ProfileDropdown
        anchorRef={profileBtnRef}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        displayName={displayName}
        displayEmail={displayEmail}
        showAdminLink={showAdminLink}
        visibleCount={items.length}
        onLogout={handleLogout}
      />

      {/* ── Desktop Sidebar ── */}
      <div
        className={`hidden md:fixed md:left-3 md:top-3 md:bottom-3 md:flex md:flex-col md:items-center z-[1000] pointer-events-none transition-all duration-300 ${collapsed ? "md:w-14" : "md:w-[170px]"}`}
      >
        {/* Sidebar card — NO overflow:hidden so dropdown can escape */}
        <div className="sidebar-card pointer-events-auto flex flex-col py-3 h-full max-h-[90vh]">
          {/* Logo Header */}
          <div className={`flex items-center gap-2 px-3 mb-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">U</div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-up">
                <div className="text-xs font-bold text-slate-800 leading-tight">UniMap</div>
                <div className="text-[9px] text-slate-400 font-medium">Universal Map</div>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded-md hover:bg-slate-100 text-slate-400 transition hidden md:flex shrink-0">
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </div>

          {!collapsed && <div className="px-3 mb-1.5"><span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Layers</span></div>}

          {/* Layers — scrollable */}
          <div className="flex flex-col gap-0.5 px-1.5 overflow-y-auto flex-1">
            {LAYER_ORDER.map((layerId) => {
              const lm = LAYER_META[layerId];
              const isActive = activeLayer === layerId;
              return (
                <button
                  key={layerId}
                  onClick={() => setActiveLayer(layerId)}
                  className={`stagger-item group relative flex items-center gap-2 rounded-lg cursor-pointer transition-all duration-200 hover-lift ${collapsed ? "p-2 justify-center" : "px-2.5 py-1.5"} ${isActive ? `${lm.accentBg} text-white shadow-md` : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                  aria-label={lm.label}
                >
                  <span className="shrink-0">{layerIcons[layerId]}</span>
                  {!collapsed && <span className="text-xs font-medium truncate">{lm.label}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                      {lm.label}
                    </span>
                  )}
                </button>
              );
            })}

            <div className={`${collapsed ? "mx-1.5" : "mx-1"} h-px bg-slate-200/60 my-1.5`} />

            {/* Add Spot */}
            <button
              onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`group relative flex items-center gap-2 rounded-lg cursor-pointer transition-all duration-200 hover-lift ${collapsed ? "p-2 justify-center" : "px-2.5 py-1.5"} ${mode === "addSpot" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
              aria-label={meta.addLabel}
            >
              <PlusCircle size={14} className={`shrink-0 transition-transform duration-300 ${mode === "addSpot" ? "rotate-45" : ""}`} />
              {!collapsed && <span className="text-xs font-medium">{meta.addLabel}</span>}
            </button>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col gap-0.5 px-1.5 pt-2 border-t border-slate-100 mt-1.5">
            <button
              onClick={handleLocate}
              className={`group relative flex items-center gap-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ${collapsed ? "p-2 justify-center" : "px-2.5 py-1.5"}`}
              aria-label="My Location"
            >
              <Locate size={14} className="shrink-0" />
              {!collapsed && <span className="text-xs font-medium">My Location</span>}
            </button>

            {/* Profile or Login */}
            {isLoggedIn ? (
              <button
                ref={profileBtnRef}
                onClick={() => setProfileOpen((o) => !o)}
                className={`group relative flex items-center gap-2 rounded-lg transition-all duration-200 w-full ${collapsed ? "p-2 justify-center" : "px-2.5 py-1.5"} ${profileOpen ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-800"}`}
                aria-label="User Profile"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {initial}
                </div>
                {!collapsed && <span className="text-xs font-medium truncate max-w-[90px]">{displayName}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    {displayName}
                  </span>
                )}
              </button>
            ) : (
              <a
                href="/login"
                className={`group relative flex items-center gap-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 ${collapsed ? "p-2 justify-center" : "px-2.5 py-1.5"}`}
                aria-label="Login"
              >
                <LogIn size={14} className="shrink-0" />
                {!collapsed && <span className="text-xs font-medium">Login</span>}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* ── Mobile Bottom Nav ── */}
      {/* ═══════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] pointer-events-none">

        {/* ── Nearby List Panel ── */}
        {listOpen && (
          <div className="pointer-events-auto animate-slide-up">
            <div className="nearby-panel mx-2 mb-1 rounded-2xl overflow-hidden max-h-[50vh] flex flex-col">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{meta.emoji}</span>
                  <span className="text-xs font-bold text-slate-800">Nearby {meta.statLabel}</span>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <button onClick={() => setListOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">No {meta.statLabel.toLowerCase()} found nearby</p>
                    <p className="text-[10px] text-slate-300 mt-1">Be the first to add one!</p>
                  </div>
                ) : items.map((item) => (
                  <NearbyListItem key={item.id} item={item} layer={activeLayer} onClick={() => handleItemClick(item)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Action Row ── */}
        <div className="pointer-events-auto bg-gradient-to-t from-white via-white/90 to-transparent pt-2">
          <div className="flex items-center justify-center gap-2 px-3 mb-1.5">
            <button
              onClick={handleLocate}
              className="px-3.5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold min-h-[44px]"
            >
              <Locate size={16} className="text-blue-500" />
              <span>Near Me</span>
            </button>

            <button
              onClick={() => setMode(mode === "addSpot" ? "browse" : "addSpot")}
              className={`px-4 py-2.5 rounded-xl shadow-md font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all min-h-[44px] ${mode === "addSpot" ? "bg-slate-900 text-white" : meta.ctaClass}`}
            >
              <PlusCircle size={16} className={`transition-transform duration-300 ${mode === "addSpot" ? "rotate-45" : ""}`} />
              <span>{mode === "addSpot" ? "Cancel" : meta.addLabel}</span>
            </button>

            <button
              onClick={() => setListOpen(!listOpen)}
              className={`px-3.5 py-2.5 rounded-xl shadow-sm border border-slate-100 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold min-h-[44px] ${listOpen ? `${meta.accentBg} text-white border-transparent` : "bg-white text-slate-600"}`}
            >
              {listOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              <span>List</span>
            </button>

            {/* Mobile: User/Login */}
            {isLoggedIn ? (
              <button
                onClick={() => setMobileProfileOpen(true)}
                className="px-2.5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-95 transition-all min-h-[44px]"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {initial}
                </div>
              </button>
            ) : (
              <a
                href="/login"
                className="px-3.5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold min-h-[44px]"
              >
                <LogIn size={16} className="text-slate-500" />
              </a>
            )}
          </div>

          {/* Layer Pill Slider */}
          <MobileLayerSlider activeLayer={activeLayer} onLayerChange={(l) => { setActiveLayer(l); setListOpen(false); }} />
        </div>

        {/* Mobile Profile Sheet */}
        {mobileProfileOpen && isLoggedIn && (
          <div className="pointer-events-auto fixed inset-0 z-[2000]" onClick={() => setMobileProfileOpen(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white mx-2 mb-2 rounded-2xl overflow-hidden shadow-2xl">
                {/* Sheet handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-slate-200" />
                </div>
                {/* Gradient header */}
                <div className="px-4 pt-3 pb-4 bg-gradient-to-br from-blue-600 to-purple-700">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-white truncate">{displayName}</p>
                      <p className="text-sm text-white/70 truncate">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0 mt-3 bg-white/10 rounded-lg overflow-hidden">
                    <div className="flex-1 py-2 text-center border-r border-white/20">
                      <p className="text-lg font-bold text-white">{items.length}</p>
                      <p className="text-[9px] text-white/60 uppercase tracking-wider">Visible</p>
                    </div>
                    <div className="flex-1 py-2 text-center border-r border-white/20">
                      <p className="text-lg font-bold text-white">{LAYER_ORDER.length}</p>
                      <p className="text-[9px] text-white/60 uppercase tracking-wider">Layers</p>
                    </div>
                    <div className="flex-1 py-2 text-center">
                      <p className="text-lg font-bold text-white">🌍</p>
                      <p className="text-[9px] text-white/60 uppercase tracking-wider">UniMap</p>
                    </div>
                  </div>
                </div>
                {/* Menu */}
                <div className="py-1">
                  {showAdminLink && (
                    <a href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                      <Shield size={18} className="text-amber-500" />
                      Admin Dashboard
                    </a>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition w-full text-left">
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Animated Mobile Layer Slider ── */
function MobileLayerSlider({ activeLayer, onLayerChange }: { activeLayer: MapLayer; onLayerChange: (l: MapLayer) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const activeBtn = pillRefs.current[activeLayer];
    const track = trackRef.current;
    if (!activeBtn || !track) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicatorStyle({
      left: btnRect.left - trackRect.left,
      width: btnRect.width,
      height: btnRect.height,
      transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }, [activeLayer]);

  const activeMeta = LAYER_META[activeLayer];

  return (
    <div className="flex justify-center bg-white/98 border-t border-slate-100 px-3 py-1.5 pb-safe">
      <div ref={trackRef} className="layer-slider-track relative">
        <div className={`absolute top-[3px] ${activeMeta.accentBg} rounded-[11px] shadow-md z-0`} style={indicatorStyle} />
        {LAYER_ORDER.map((layerId) => {
          const lm = LAYER_META[layerId];
          const isActive = activeLayer === layerId;
          return (
            <button
              key={layerId}
              ref={(el) => { pillRefs.current[layerId] = el; }}
              onClick={() => onLayerChange(layerId)}
              className={`layer-pill-lg ${isActive ? "active" : ""}`}
            >
              <span className="text-sm">{lm.emoji}</span>
              <span>{lm.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Nearby List Item ── */
function NearbyListItem({ item, layer, onClick }: { item: MapItem; layer: MapLayer; onClick: () => void }) {
  const meta = LAYER_META[layer];

  const getTitle = () => {
    if ("title" in item && item.title) return item.title;
    if ("name" in item && item.name) return item.name;
    if ("product_name" in item && item.product_name) return item.product_name;
    return "Unknown";
  };

  const getSubtitle = () => {
    switch (layer) {
      case "biriyani": return ("food_type" in item ? item.food_type : "") || "Food spot";
      case "toilet": return ("notes" in item ? item.notes : "") || "Public toilet";
      case "goods": return ("shop_name" in item ? `${item.shop_name}` : "Shop");
      case "violence": return ("incident_type" in item ? item.incident_type : "") || "Incident";
    }
  };

  const getTime = (): string => {
    if ("created_at" in item && item.created_at) {
      try { return formatDistanceToNow(new Date(item.created_at as string), { addSuffix: true }); }
      catch { return ""; }
    }
    return "";
  };

  const getBadges = (): React.ReactNode[] => {
    const badges: React.ReactNode[] = [];
    if (layer === "toilet") {
      const t = item as { is_paid?: boolean; has_water?: boolean };
      badges.push(
        <span key="paid" className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.is_paid ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {t.is_paid ? "Paid" : "Free"}
        </span>
      );
    }
    if (layer === "goods") {
      const g = item as { price?: number; unit?: string };
      if (g.price) badges.push(
        <span key="price" className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">৳{g.price}/{g.unit}</span>
      );
    }
    return badges;
  };

  const timeStr = getTime();

  return (
    <button onClick={onClick} className="stagger-item w-full text-left px-3 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2.5 min-h-[52px]">
      <div className={`w-8 h-8 rounded-lg ${meta.accentBg}/10 flex items-center justify-center text-sm shrink-0`}>
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">{getTitle()}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[11px] text-slate-400 truncate">{getSubtitle()}</span>
          {getBadges()}
          {timeStr && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-400">
              <Clock size={8} />{timeStr}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className={`text-[11px] font-bold ${item.score >= 5 ? "text-green-600" : item.score >= 0 ? "text-slate-500" : "text-red-500"}`}>
          {item.score > 0 ? `+${item.score}` : item.score}
        </span>
        <Navigation size={11} className="text-slate-300" />
      </div>
    </button>
  );
}
