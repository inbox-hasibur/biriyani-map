"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { MapLayer } from "@/components/MapContext";

const VOTE_LABELS: Record<MapLayer, { up: string; down: string }> = {
  biriyani: { up: "Helpful", down: "Fake" },
  toilet: { up: "Accurate", down: "Wrong" },
  goods: { up: "Correct", down: "Wrong" },
  violence: { up: "Confirm", down: "Doubt" },
};

const TABLE_MAP: Record<MapLayer, string> = {
  biriyani: "spot_votes",
  toilet: "toilet_votes",
  goods: "goods_votes",
  violence: "violence_votes",
};

const ID_FIELD: Record<MapLayer, string> = {
  biriyani: "spot_id",
  toilet: "toilet_id",
  goods: "goods_id",
  violence: "report_id",
};

export default function VotingUI({ spotId, initialScore = 0, layer = "biriyani" }: {
  spotId: string; initialScore?: number; layer?: MapLayer;
}) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);
  const labels = VOTE_LABELS[layer];

  async function handleVote(value: 1 | -1) {
    setLoading(true);
    try {
      if (!supabase) {
        // Dev mock
        if (userVote === value) { setScore((s) => s - value); setUserVote(null); }
        else { setScore((s) => s + (userVote ? value - userVote : value)); setUserVote(value); }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Please log in to vote."); return; }

      const table = TABLE_MAP[layer];
      const field = ID_FIELD[layer];

      if (userVote === value) {
        const { error } = await supabase.from(table).delete().eq(field, spotId).eq("user_id", user.id);
        if (!error) { setScore((s) => s - value); setUserVote(null); }
      } else {
        const { error } = await supabase.from(table).upsert({ [field]: spotId, user_id: user.id, value }, { onConflict: `${field},user_id` });
        if (!error) { setScore((s) => s + (userVote ? value - userVote : value)); setUserVote(value); }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-95 ${userVote === 1
            ? "bg-green-100 text-green-700 shadow-sm"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        aria-label="Upvote"
      >
        <ThumbsUp size={14} />
        {labels.up}
      </button>

      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-95 ${userVote === -1
            ? "bg-red-100 text-red-700 shadow-sm"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        aria-label="Downvote"
      >
        <ThumbsDown size={14} />
        {labels.down}
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span className={`text-sm font-bold ${score > 0 ? "text-green-600" : score < 0 ? "text-red-500" : "text-slate-400"}`}>
          {score > 0 ? "+" : ""}{score}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">score</span>
      </div>
    </div>
  );
}
