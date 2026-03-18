"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { isAdmin } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  BarChart3, Users, MapPin, ShoppingBasket, AlertTriangle, Droplets,
  UtensilsCrossed, Trash2, Eye, EyeOff, Search, LogOut, ArrowLeft,
  RefreshCw, Shield
} from "lucide-react";

type LayerKey = "spots" | "toilets" | "goods_prices" | "violence_reports";
type LayerStats = { total: number; visible: number; hidden: number };

const LAYERS: { key: LayerKey; label: string; emoji: string; icon: React.ReactNode; color: string }[] = [
  { key: "spots", label: "Biriyani Spots", emoji: "🍛", icon: <UtensilsCrossed size={20} />, color: "from-amber-400 to-amber-600" },
  { key: "toilets", label: "Toilets", emoji: "🚻", icon: <Droplets size={20} />, color: "from-blue-400 to-blue-600" },
  { key: "goods_prices", label: "Price Reports", emoji: "🥬", icon: <ShoppingBasket size={20} />, color: "from-emerald-400 to-emerald-600" },
  { key: "violence_reports", label: "Safety Reports", emoji: "🛡️", icon: <AlertTriangle size={20} />, color: "from-red-400 to-red-600" },
];

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Record<LayerKey, LayerStats>>({
    spots: { total: 0, visible: 0, hidden: 0 },
    toilets: { total: 0, visible: 0, hidden: 0 },
    goods_prices: { total: 0, visible: 0, hidden: 0 },
    violence_reports: { total: 0, visible: 0, hidden: 0 },
  });
  const [activeTab, setActiveTab] = useState<LayerKey>("spots");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [itemsLoading, setItemsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isAuthorized = !authLoading && user && isAdmin(user.email);

  // Fetch stats for all layers
  const fetchStats = useCallback(async () => {
    if (!supabase) return;
    setRefreshing(true);
    try {
      const results = await Promise.all(
        LAYERS.map(async (layer) => {
          const { count: total } = await supabase.from(layer.key).select("*", { count: "exact", head: true });
          const { count: visible } = await supabase.from(layer.key).select("*", { count: "exact", head: true }).eq("is_visible", true);
          return {
            key: layer.key,
            stats: {
              total: total ?? 0,
              visible: visible ?? 0,
              hidden: (total ?? 0) - (visible ?? 0),
            },
          };
        })
      );
      const newStats: Record<string, LayerStats> = {};
      results.forEach((r) => { newStats[r.key] = r.stats; });
      setStats(newStats as Record<LayerKey, LayerStats>);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch items for active tab
  const fetchItems = useCallback(async () => {
    if (!supabase) return;
    setItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from(activeTab)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setItemsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
    }
  }, [isAuthorized, fetchStats]);

  useEffect(() => {
    if (isAuthorized) {
      fetchItems();
    }
  }, [isAuthorized, activeTab, fetchItems]);

  // Auth guard
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="animate-pulse font-semibold text-slate-400">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <Shield size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Admin Access Required</h2>
          <p className="text-slate-400 mb-4">Please sign in with an admin account.</p>
          <a href="/login" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition inline-block">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <Shield size={48} className="text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">Your account ({user.email}) is not an admin.</p>
          <a href="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition inline-block">
            Back to Map
          </a>
        </div>
      </div>
    );
  }

  async function handleToggleVisibility(id: string, currentlyVisible: boolean) {
    if (!supabase) return;
    await supabase.from(activeTab).update({ is_visible: !currentlyVisible }).eq("id", id);
    fetchItems();
    fetchStats();
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    if (!confirm("Permanently delete this item?")) return;
    await supabase.from(activeTab).delete().eq("id", id);
    fetchItems();
    fetchStats();
  }

  const getItemTitle = (item: Record<string, unknown>): string => {
    return (item.title || item.name || item.product_name || "Untitled") as string;
  };

  const filteredItems = searchQ
    ? items.filter((item) => getItemTitle(item).toLowerCase().includes(searchQ.toLowerCase()))
    : items;

  const totalAll = Object.values(stats).reduce((s, v) => s + v.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-xl transition" title="Back to map">
              <ArrowLeft size={18} className="text-slate-600" />
            </a>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-xs font-black">U</div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchStats(); fetchItems(); }} className={`p-2 hover:bg-slate-100 rounded-xl transition ${refreshing ? "animate-spin" : ""}`}>
              <RefreshCw size={16} className="text-slate-500" />
            </button>
            <button onClick={async () => { await signOut(); router.push("/"); }} className="p-2 hover:bg-red-50 rounded-xl transition text-slate-500 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {LAYERS.map((layer) => (
            <button
              key={layer.key}
              onClick={() => setActiveTab(layer.key)}
              className={`p-4 rounded-2xl border transition-all hover:shadow-lg group ${activeTab === layer.key ? "bg-white shadow-md border-slate-300 ring-2 ring-slate-200" : "bg-white/70 border-slate-200/50 hover:bg-white"}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center text-white shadow-md mb-3`}>
                {layer.icon}
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-800">{stats[layer.key].total}</p>
                <p className="text-xs text-slate-400 font-medium">{layer.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-green-600 font-semibold">{stats[layer.key].visible} visible</span>
                  {stats[layer.key].hidden > 0 && (
                    <span className="text-[10px] text-red-400 font-semibold">{stats[layer.key].hidden} hidden</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Total stats bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 mb-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} />
            <div>
              <p className="text-xs text-slate-400">Total Items Across All Layers</p>
              <p className="text-2xl font-bold">{totalAll}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Admin Panel</span>
          </div>
        </div>

        {/* Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-100 overflow-x-auto">
            {LAYERS.map((layer) => (
              <button
                key={layer.key}
                onClick={() => setActiveTab(layer.key)}
                className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition ${activeTab === layer.key ? "border-slate-800 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                {layer.emoji} {layer.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
            {itemsLoading ? (
              <div className="p-8 text-center text-sm text-slate-400 animate-pulse">Loading items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No items found</div>
            ) : filteredItems.map((item) => {
              const isVisible = item.is_visible as boolean;
              return (
                <div key={item.id as string} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition group">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isVisible ? "bg-green-400" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{getItemTitle(item)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">
                        <MapPin size={8} className="inline mr-0.5" />
                        {(item.lat as number)?.toFixed(4)}, {(item.lng as number)?.toFixed(4)}
                      </span>
                      <span className="text-[10px] text-slate-400">Score: {item.score as number}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleToggleVisibility(item.id as string, isVisible)}
                      className={`p-2 rounded-lg transition text-xs font-bold ${isVisible ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"}`}
                      title={isVisible ? "Hide" : "Show"}
                    >
                      {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id as string)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
